package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"load-test/internal/config"
	"load-test/internal/loadtest/client"
	"load-test/internal/loadtest/metrics"
	"load-test/internal/loadtest/scenarios"
	"load-test/internal/models"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	usersFlag := flag.Int("users", cfg.LoadTest.ConcurrentUsers, "Number of concurrent users")
	durationFlag := flag.Duration("duration", cfg.LoadTest.Duration, "Test duration")
	rampUpFlag := flag.Duration("rampup", cfg.LoadTest.RampUp, "Ramp-up period")
	scenarioFlag := flag.String("scenario", cfg.LoadTest.Scenario, "Scenario to run (auth|movies|recommendations|interactions|all)")
	outputFlag := flag.String("output", cfg.Output.CSVOutput, "Output CSV file")
	flag.Parse()

	fmt.Printf("\n🚀 Starting Load Test\n")
	fmt.Printf("═══════════════════════════════════════════════════════\n")
	fmt.Printf("  API URL: %s\n", cfg.API.FullURL)
	fmt.Printf("  Concurrent Users: %d\n", *usersFlag)
	fmt.Printf("  Test Duration: %s\n", *durationFlag)
	fmt.Printf("  Ramp-up Period: %s\n", *rampUpFlag)
	fmt.Printf("  Scenario: %s\n", *scenarioFlag)
	fmt.Printf("═══════════════════════════════════════════════════════\n\n")

	collector := metrics.NewCollector()
	metricsChan := make(chan models.Metric, 10000)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		for metric := range metricsChan {
			collector.Add(metric)
		}
	}()

	startTime := time.Now()
	runLoadTest(ctx, cfg.API.FullURL, *usersFlag, *durationFlag, *rampUpFlag, *scenarioFlag, metricsChan)
	testDuration := time.Since(startTime)

	close(metricsChan)
	time.Sleep(100 * time.Millisecond)

	outputPath := cfg.Output.ResultsDir + "/" + *outputFlag
	if err := os.MkdirAll(cfg.Output.ResultsDir, 0755); err != nil {
		log.Fatalf("Failed to create results directory: %v", err)
	}

	if err := collector.SaveToCSV(outputPath); err != nil {
		log.Fatalf("Failed to save metrics: %v", err)
	}

	allMetrics := collector.GetMetrics()
	stats := metrics.CalculateStats(allMetrics)

	printSummary(stats, testDuration)

	fmt.Printf("\n✅ Results saved to: %s\n", outputPath)
	fmt.Printf("\n💡 Generate report: make report\n\n")
}

func runLoadTest(ctx context.Context, baseURL string, users int, duration, rampUp time.Duration, scenario string, metricsChan chan<- models.Metric) {
	var wg sync.WaitGroup
	stopChan := make(chan struct{})

	rampUpDelay := rampUp / time.Duration(users)

	fmt.Printf("⏳ Ramping up %d users over %s...\n\n", users, rampUp)

	for i := 0; i < users; i++ {
		wg.Add(1)
		time.Sleep(rampUpDelay)

		go func(userId int) {
			defer wg.Done()
			runUserScenario(baseURL, userId, scenario, metricsChan, stopChan)
		}(i)

		if (i+1)%10 == 0 || i == users-1 {
			fmt.Printf("\r  Started users: %d/%d", i+1, users)
		}
	}

	fmt.Printf("\n\n✅ All users started. Running test for %s...\n\n", duration)

	progressTicker := time.NewTicker(5 * time.Second)
	defer progressTicker.Stop()

	testTimer := time.NewTimer(duration)
	defer testTimer.Stop()

	startTime := time.Now()

	for {
		select {
		case <-testTimer.C:
			close(stopChan)
			wg.Wait()
			return
		case <-progressTicker.C:
			elapsed := time.Since(startTime)
			remaining := duration - elapsed
			progress := float64(elapsed) / float64(duration) * 100
			fmt.Printf("\r  Progress: %.1f%% | Elapsed: %s | Remaining: %s", progress, elapsed.Round(time.Second), remaining.Round(time.Second))
		}
	}
}

func runUserScenario(baseURL string, userId int, scenario string, metricsChan chan<- models.Metric, stopChan <-chan struct{}) {
	httpClient := client.NewHTTPClient(baseURL)

	token, email, err := scenarios.Register(httpClient, userId, metricsChan)
	if err != nil {
		return
	}

	httpClient.SetToken(token)

	movieIDs, _ := scenarios.GetAllMovies(httpClient, metricsChan)
	if len(movieIDs) > 0 {
		for _, movieID := range movieIDs[:min(5, len(movieIDs))] {
			scenarios.RecordView(httpClient, movieID, metricsChan)
		}
	}

	iterationDelay := time.Duration(100+userId*5) * time.Millisecond

	for {
		select {
		case <-stopChan:
			return
		default:
			switch scenario {
			case "auth":
				scenarios.RunAuthScenario(httpClient, email, metricsChan)
			case "movies":
				scenarios.RunMoviesScenario(httpClient, metricsChan)
			case "recommendations":
				scenarios.RunRecommendationsScenario(httpClient, metricsChan)
			case "interactions":
				scenarios.RunInteractionsScenario(httpClient, metricsChan)
			case "all":
				scenarios.RunAllScenarios(httpClient, email, metricsChan)
			}

			time.Sleep(iterationDelay)
		}
	}
}

func printSummary(stats models.TestStats, testDuration time.Duration) {
	fmt.Printf("\n\n📊 Performance Test Summary\n")
	fmt.Printf("═══════════════════════════════════════════════════════\n\n")

	fmt.Printf("Test Duration: %s\n\n", testDuration.Round(time.Second))

	fmt.Printf("Total Requests: %d\n", stats.TotalRequests)
	fmt.Printf("  ✅ Successful: %d (%.2f%%)\n", stats.SuccessCount, stats.SuccessRate)
	fmt.Printf("  ❌ Failed: %d (%.2f%%)\n", stats.FailureCount, stats.FailureRate)
	fmt.Printf("  📈 Throughput: %.2f req/sec\n\n", stats.RequestsPerSecond)

	fmt.Printf("Response Times (ms):\n")
	fmt.Printf("  Min:    %8.2f\n", stats.MinDuration)
	fmt.Printf("  Max:    %8.2f\n", stats.MaxDuration)
	fmt.Printf("  Mean:   %8.2f\n", stats.MeanDuration)
	fmt.Printf("  Median: %8.2f\n", stats.MedianDuration)
	fmt.Printf("  P95:    %8.2f\n", stats.P95Duration)
	fmt.Printf("  P99:    %8.2f\n\n", stats.P99Duration)

	fmt.Printf("By Scenario:\n")
	for scenario, scenarioStats := range stats.ByScenario {
		fmt.Printf("  📦 %s:\n", scenario)
		fmt.Printf("     Requests: %d\n", scenarioStats.Count)
		fmt.Printf("     Success Rate: %.2f%%\n", scenarioStats.SuccessRate)
		fmt.Printf("     Avg Duration: %.2f ms\n", scenarioStats.AvgDuration)
		fmt.Printf("     Min/Max: %.2f / %.2f ms\n", scenarioStats.MinDuration, scenarioStats.MaxDuration)
	}

	fmt.Printf("\nTop Endpoints by Volume:\n")
	type endpointInfo struct {
		endpoint string
		stats    models.EndpointStats
	}
	endpoints := make([]endpointInfo, 0, len(stats.ByEndpoint))
	for ep, epStats := range stats.ByEndpoint {
		endpoints = append(endpoints, endpointInfo{ep, epStats})
	}

	for i := 0; i < min(10, len(endpoints)); i++ {
		for j := i + 1; j < len(endpoints); j++ {
			if endpoints[j].stats.Count > endpoints[i].stats.Count {
				endpoints[i], endpoints[j] = endpoints[j], endpoints[i]
			}
		}
	}

	for i := 0; i < min(10, len(endpoints)); i++ {
		ep := endpoints[i]
		fmt.Printf("  🔗 %s:\n", ep.endpoint)
		fmt.Printf("     Count: %d | Success: %.1f%% | Avg: %.2f ms | P95: %.2f ms\n",
			ep.stats.Count, ep.stats.SuccessRate, ep.stats.AvgDuration, ep.stats.P95Duration)
	}

	if len(stats.Errors) > 0 {
		fmt.Printf("\n⚠️  Top Errors:\n")
		type errorInfo struct {
			message string
			count   int
		}
		errors := make([]errorInfo, 0, len(stats.Errors))
		for msg, count := range stats.Errors {
			errors = append(errors, errorInfo{msg, count})
		}

		for i := 0; i < min(5, len(errors)); i++ {
			for j := i + 1; j < len(errors); j++ {
				if errors[j].count > errors[i].count {
					errors[i], errors[j] = errors[j], errors[i]
				}
			}
		}

		for i := 0; i < min(5, len(errors)); i++ {
			fmt.Printf("  • %s: %d occurrences\n", errors[i].message, errors[i].count)
		}
	}

	fmt.Printf("\n═══════════════════════════════════════════════════════\n")

	if stats.SuccessRate >= 99 && stats.P95Duration < 200 {
		fmt.Printf("🎉 Excellent performance! All metrics within target.\n")
	} else if stats.SuccessRate >= 95 && stats.P95Duration < 500 {
		fmt.Printf("✅ Good performance. Some room for improvement.\n")
	} else {
		fmt.Printf("⚠️  Performance needs attention. Check errors and response times.\n")
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
