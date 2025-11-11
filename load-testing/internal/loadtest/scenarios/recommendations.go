package scenarios

import (
	"fmt"
	"time"

	"github.com/brianvoe/gofakeit/v6"
	"load-test/internal/loadtest/client"
	"load-test/internal/models"
)

type RecommendationsResponse struct {
	Recommendations []Movie `json:"recommendations"`
}

type SimilarMoviesResponse struct {
	Similar []Movie `json:"similar"`
}

func GetRecommendations(httpClient *client.HTTPClient, strategy string, metricsChan chan<- models.Metric) error {
	limit := gofakeit.Number(5, 20)
	endpoint := fmt.Sprintf("/recommendations?strategy=%s&limit=%d", strategy, limit)

	resp, duration, err := httpClient.Get(endpoint)

	success := err == nil && resp != nil && resp.StatusCode == 200
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "recommendations",
		Endpoint:   "/recommendations",
		Method:     "GET",
		StatusCode: getStatusCode(resp),
		Duration:   duration,
		Success:    success,
		Error:      errorMsg,
	}

	if resp != nil {
		resp.Body.Close()
	}

	return err
}

func GetUserBasedRecommendations(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) error {
	return GetRecommendations(httpClient, "user-based", metricsChan)
}

func GetItemBasedRecommendations(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) error {
	return GetRecommendations(httpClient, "item-based", metricsChan)
}

func GetHybridRecommendations(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) error {
	return GetRecommendations(httpClient, "hybrid", metricsChan)
}

func GetSimilarMovies(httpClient *client.HTTPClient, movieID string, metricsChan chan<- models.Metric) error {
	limit := gofakeit.Number(5, 15)
	endpoint := fmt.Sprintf("/recommendations/similar/%s?limit=%d", movieID, limit)

	resp, duration, err := httpClient.Get(endpoint)

	success := err == nil && resp != nil && resp.StatusCode == 200
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "recommendations",
		Endpoint:   "/recommendations/similar/:id",
		Method:     "GET",
		StatusCode: getStatusCode(resp),
		Duration:   duration,
		Success:    success,
		Error:      errorMsg,
	}

	if resp != nil {
		resp.Body.Close()
	}

	return err
}
