package report

import (
	"encoding/json"
	"fmt"
	"html/template"
	"os"
	"time"

	"load-test/internal/loadtest/metrics"
	"load-test/internal/models"
)

type ReportData struct {
	GeneratedAt    string
	Stats          models.TestStats
	TimeSeries     TimeSeriesData
	PercentileData PercentileData
	ScenarioList   []ScenarioData
	EndpointList   []EndpointData
	ErrorList      []ErrorData
}

type PercentileData struct {
	Labels []string
	Values []float64
}

type ScenarioData struct {
	Name        string
	Count       int
	SuccessRate float64
	AvgDuration float64
	MinDuration float64
	MaxDuration float64
}

type EndpointData struct {
	Endpoint    string
	Count       int
	SuccessRate float64
	AvgDuration float64
	P95Duration float64
}

type ErrorData struct {
	Message string
	Count   int
}

func GenerateHTMLReport(metricsData []models.Metric, outputPath string) error {
	stats := metrics.CalculateStats(metricsData)
	timeSeries := GenerateTimeSeries(metricsData, 5*time.Second)

	percentiles := []float64{stats.MinDuration, stats.MedianDuration, stats.P95Duration, stats.P99Duration, stats.MaxDuration}
	percentileData := PercentileData{
		Labels: []string{"Min", "Median", "P95", "P99", "Max"},
		Values: percentiles,
	}

	var scenarioList []ScenarioData
	for name, scenStats := range stats.ByScenario {
		scenarioList = append(scenarioList, ScenarioData{
			Name:        name,
			Count:       scenStats.Count,
			SuccessRate: scenStats.SuccessRate,
			AvgDuration: scenStats.AvgDuration,
			MinDuration: scenStats.MinDuration,
			MaxDuration: scenStats.MaxDuration,
		})
	}

	var endpointList []EndpointData
	for endpoint, epStats := range stats.ByEndpoint {
		endpointList = append(endpointList, EndpointData{
			Endpoint:    endpoint,
			Count:       epStats.Count,
			SuccessRate: epStats.SuccessRate,
			AvgDuration: epStats.AvgDuration,
			P95Duration: epStats.P95Duration,
		})
	}

	var errorList []ErrorData
	for msg, count := range stats.Errors {
		errorList = append(errorList, ErrorData{
			Message: msg,
			Count:   count,
		})
	}

	for i := 0; i < len(scenarioList); i++ {
		for j := i + 1; j < len(scenarioList); j++ {
			if scenarioList[j].Count > scenarioList[i].Count {
				scenarioList[i], scenarioList[j] = scenarioList[j], scenarioList[i]
			}
		}
	}

	for i := 0; i < len(endpointList); i++ {
		for j := i + 1; j < len(endpointList); j++ {
			if endpointList[j].Count > endpointList[i].Count {
				endpointList[i], endpointList[j] = endpointList[j], endpointList[i]
			}
		}
	}

	for i := 0; i < len(errorList); i++ {
		for j := i + 1; j < len(errorList); j++ {
			if errorList[j].Count > errorList[i].Count {
				errorList[i], errorList[j] = errorList[j], errorList[i]
			}
		}
	}

	reportData := ReportData{
		GeneratedAt:    time.Now().Format("2006-01-02 15:04:05"),
		Stats:          stats,
		TimeSeries:     timeSeries,
		PercentileData: percentileData,
		ScenarioList:   scenarioList,
		EndpointList:   endpointList,
		ErrorList:      errorList,
	}

	tmpl, err := template.New("report").Funcs(template.FuncMap{
		"toJSON": func(v interface{}) template.JS {
			b, _ := json.Marshal(v)
			return template.JS(b)
		},
		"mulf": func(a, b float64) float64 {
			return a * b
		},
		"divf": func(a, b float64) float64 {
			if b == 0 {
				return 0
			}
			return a / b
		},
		"float64": func(v interface{}) float64 {
			switch n := v.(type) {
			case int:
				return float64(n)
			case int64:
				return float64(n)
			case float32:
				return float64(n)
			case float64:
				return n
			default:
				return 0
			}
		},
	}).Parse(htmlTemplate)

	if err != nil {
		return fmt.Errorf("failed to parse template: %w", err)
	}

	file, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create output file: %w", err)
	}
	defer file.Close()

	if err := tmpl.Execute(file, reportData); err != nil {
		return fmt.Errorf("failed to execute template: %w", err)
	}

	return nil
}
