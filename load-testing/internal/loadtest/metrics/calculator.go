package metrics

import (
	"sort"
	"time"

	"github.com/montanaflynn/stats"
	"load-test/internal/models"
)

func CalculateStats(metrics []models.Metric) models.TestStats {
	if len(metrics) == 0 {
		return models.TestStats{}
	}

	var durations []float64
	successCount := 0
	scenarioMetrics := make(map[string][]models.Metric)
	endpointMetrics := make(map[string][]models.Metric)
	errorCounts := make(map[string]int)

	var minTime, maxTime time.Time

	for i, m := range metrics {
		durationMs := m.Duration.Seconds() * 1000
		durations = append(durations, durationMs)

		if m.Success {
			successCount++
		} else if m.Error != "" {
			errorCounts[m.Error]++
		}

		scenarioMetrics[m.Scenario] = append(scenarioMetrics[m.Scenario], m)
		endpointMetrics[m.Endpoint] = append(endpointMetrics[m.Endpoint], m)

		if i == 0 {
			minTime = m.Timestamp
			maxTime = m.Timestamp
		} else {
			if m.Timestamp.Before(minTime) {
				minTime = m.Timestamp
			}
			if m.Timestamp.After(maxTime) {
				maxTime = m.Timestamp
			}
		}
	}

	sort.Float64s(durations)

	totalRequests := len(metrics)
	failureCount := totalRequests - successCount

	mean, _ := stats.Mean(durations)
	median, _ := stats.Median(durations)
	p95, _ := stats.Percentile(durations, 95)
	p99, _ := stats.Percentile(durations, 99)

	testDuration := maxTime.Sub(minTime).Seconds()
	if testDuration == 0 {
		testDuration = 1
	}
	requestsPerSecond := float64(totalRequests) / testDuration

	byScenario := make(map[string]models.ScenarioStats)
	for scenario, scenMetrics := range scenarioMetrics {
		var scenDurations []float64
		scenSuccess := 0

		for _, m := range scenMetrics {
			scenDurations = append(scenDurations, m.Duration.Seconds()*1000)
			if m.Success {
				scenSuccess++
			}
		}

		sort.Float64s(scenDurations)
		avgDuration, _ := stats.Mean(scenDurations)

		byScenario[scenario] = models.ScenarioStats{
			Count:       len(scenMetrics),
			SuccessRate: float64(scenSuccess) / float64(len(scenMetrics)) * 100,
			AvgDuration: avgDuration,
			MinDuration: scenDurations[0],
			MaxDuration: scenDurations[len(scenDurations)-1],
		}
	}

	byEndpoint := make(map[string]models.EndpointStats)
	for endpoint, epMetrics := range endpointMetrics {
		var epDurations []float64
		epSuccess := 0

		for _, m := range epMetrics {
			epDurations = append(epDurations, m.Duration.Seconds()*1000)
			if m.Success {
				epSuccess++
			}
		}

		sort.Float64s(epDurations)
		avgDuration, _ := stats.Mean(epDurations)
		p95Duration, _ := stats.Percentile(epDurations, 95)

		byEndpoint[endpoint] = models.EndpointStats{
			Count:       len(epMetrics),
			SuccessRate: float64(epSuccess) / float64(len(epMetrics)) * 100,
			AvgDuration: avgDuration,
			P95Duration: p95Duration,
		}
	}

	return models.TestStats{
		TotalRequests:     totalRequests,
		SuccessCount:      successCount,
		FailureCount:      failureCount,
		SuccessRate:       float64(successCount) / float64(totalRequests) * 100,
		FailureRate:       float64(failureCount) / float64(totalRequests) * 100,
		RequestsPerSecond: requestsPerSecond,
		MinDuration:       durations[0],
		MaxDuration:       durations[len(durations)-1],
		MeanDuration:      mean,
		MedianDuration:    median,
		P95Duration:       p95,
		P99Duration:       p99,
		ByScenario:        byScenario,
		ByEndpoint:        byEndpoint,
		Errors:            errorCounts,
	}
}
