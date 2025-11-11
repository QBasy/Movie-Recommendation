package report

import (
	"encoding/csv"
	"fmt"
	"os"
	"strconv"
	"time"

	"load-test/internal/models"
)

func LoadMetricsFromCSV(filename string) ([]models.Metric, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	if len(records) < 2 {
		return nil, fmt.Errorf("CSV file is empty or has only headers")
	}

	metrics := make([]models.Metric, 0, len(records)-1)

	for i, record := range records {
		if i == 0 {
			continue
		}

		timestamp, _ := time.Parse(time.RFC3339, record[0])
		statusCode, _ := strconv.Atoi(record[4])
		durationMs, _ := strconv.ParseFloat(record[5], 64)
		success, _ := strconv.ParseBool(record[6])

		metric := models.Metric{
			Timestamp:  timestamp,
			Scenario:   record[1],
			Endpoint:   record[2],
			Method:     record[3],
			StatusCode: statusCode,
			Duration:   time.Duration(durationMs) * time.Millisecond,
			Success:    success,
			Error:      record[7],
		}

		metrics = append(metrics, metric)
	}

	return metrics, nil
}

type TimeSeriesData struct {
	Timestamps      []string
	RequestsPerSec  []float64
	AvgResponseTime []float64
	ErrorRate       []float64
}

func GenerateTimeSeries(metrics []models.Metric, bucketSize time.Duration) TimeSeriesData {
	if len(metrics) == 0 {
		return TimeSeriesData{}
	}

	minTime := metrics[0].Timestamp
	maxTime := metrics[0].Timestamp

	for _, m := range metrics {
		if m.Timestamp.Before(minTime) {
			minTime = m.Timestamp
		}
		if m.Timestamp.After(maxTime) {
			maxTime = m.Timestamp
		}
	}

	buckets := make(map[int64]*bucket)

	for _, m := range metrics {
		bucketKey := m.Timestamp.Unix() / int64(bucketSize.Seconds())

		if _, exists := buckets[bucketKey]; !exists {
			buckets[bucketKey] = &bucket{
				timestamp: time.Unix(bucketKey*int64(bucketSize.Seconds()), 0),
				requests:  0,
				durations: []float64{},
				errors:    0,
			}
		}

		b := buckets[bucketKey]
		b.requests++
		b.durations = append(b.durations, m.Duration.Seconds()*1000)
		if !m.Success {
			b.errors++
		}
	}

	var timestamps []string
	var requestsPerSec []float64
	var avgResponseTime []float64
	var errorRate []float64

	currentTime := time.Unix(minTime.Unix()/int64(bucketSize.Seconds())*int64(bucketSize.Seconds()), 0)
	endTime := time.Unix(maxTime.Unix()/int64(bucketSize.Seconds())*int64(bucketSize.Seconds()), 0).Add(bucketSize)

	for currentTime.Before(endTime) || currentTime.Equal(endTime) {
		bucketKey := currentTime.Unix() / int64(bucketSize.Seconds())

		timestamps = append(timestamps, currentTime.Format("15:04:05"))

		if b, exists := buckets[bucketKey]; exists {
			requestsPerSec = append(requestsPerSec, float64(b.requests)/bucketSize.Seconds())

			if len(b.durations) > 0 {
				sum := 0.0
				for _, d := range b.durations {
					sum += d
				}
				avgResponseTime = append(avgResponseTime, sum/float64(len(b.durations)))
			} else {
				avgResponseTime = append(avgResponseTime, 0)
			}

			errorRate = append(errorRate, float64(b.errors)/float64(b.requests)*100)
		} else {
			requestsPerSec = append(requestsPerSec, 0)
			avgResponseTime = append(avgResponseTime, 0)
			errorRate = append(errorRate, 0)
		}

		currentTime = currentTime.Add(bucketSize)
	}

	return TimeSeriesData{
		Timestamps:      timestamps,
		RequestsPerSec:  requestsPerSec,
		AvgResponseTime: avgResponseTime,
		ErrorRate:       errorRate,
	}
}

type bucket struct {
	timestamp time.Time
	requests  int
	durations []float64
	errors    int
}
