package metrics

import (
	"encoding/csv"
	"fmt"
	"os"
	"time"

	"load-test/internal/models"
)

type Collector struct {
	metrics []models.Metric
}

func NewCollector() *Collector {
	return &Collector{
		metrics: make([]models.Metric, 0),
	}
}

func (c *Collector) Add(metric models.Metric) {
	c.metrics = append(c.metrics, metric)
}

func (c *Collector) GetMetrics() []models.Metric {
	return c.metrics
}

func (c *Collector) SaveToCSV(filename string) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	header := []string{
		"timestamp",
		"scenario",
		"endpoint",
		"method",
		"status_code",
		"duration_ms",
		"success",
		"error",
	}

	if err := writer.Write(header); err != nil {
		return err
	}

	for _, m := range c.metrics {
		record := []string{
			m.Timestamp.Format(time.RFC3339),
			m.Scenario,
			m.Endpoint,
			m.Method,
			fmt.Sprintf("%d", m.StatusCode),
			fmt.Sprintf("%.2f", m.Duration.Seconds()*1000),
			fmt.Sprintf("%t", m.Success),
			m.Error,
		}

		if err := writer.Write(record); err != nil {
			return err
		}
	}

	return nil
}

func (c *Collector) Count() int {
	return len(c.metrics)
}

func (c *Collector) SuccessCount() int {
	count := 0
	for _, m := range c.metrics {
		if m.Success {
			count++
		}
	}
	return count
}

func (c *Collector) FailureCount() int {
	return c.Count() - c.SuccessCount()
}
