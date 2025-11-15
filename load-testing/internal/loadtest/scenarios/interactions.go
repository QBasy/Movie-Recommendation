package scenarios

import (
	"time"

	"github.com/brianvoe/gofakeit/v6"
	"load-test/internal/loadtest/client"
	"load-test/internal/models"
)

type InteractionRequest struct {
	MovieID string `json:"movieId"`
	Type    string `json:"type"`
	Rating  *int   `json:"rating,omitempty"`
}

func RecordView(httpClient *client.HTTPClient, movieID string, metricsChan chan<- models.Metric) error {
	reqBody := InteractionRequest{
		MovieID: movieID,
		Type:    "view",
	}

	resp, duration, err := httpClient.Post("/interactions", reqBody)

	success := err == nil && resp != nil && (resp.StatusCode == 200 || resp.StatusCode == 201)
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "interactions",
		Endpoint:   "/interactions",
		Method:     "POST",
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

func LikeMovie(httpClient *client.HTTPClient, movieID string, metricsChan chan<- models.Metric) error {
	reqBody := InteractionRequest{
		MovieID: movieID,
		Type:    "like",
	}

	resp, duration, err := httpClient.Post("/interactions", reqBody)

	success := err == nil && resp != nil && (resp.StatusCode == 200 || resp.StatusCode == 201)
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "interactions",
		Endpoint:   "/interactions",
		Method:     "POST",
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

func RateMovie(httpClient *client.HTTPClient, movieID string, metricsChan chan<- models.Metric) error {
	rating := gofakeit.Number(1, 10)
	reqBody := InteractionRequest{
		MovieID: movieID,
		Type:    "rating",
		Rating:  &rating,
	}

	resp, duration, err := httpClient.Post("/interactions", reqBody)

	success := err == nil && resp != nil && (resp.StatusCode == 200 || resp.StatusCode == 201)
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "interactions",
		Endpoint:   "/interactions",
		Method:     "POST",
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

func AddToWatchlist(httpClient *client.HTTPClient, movieID string, metricsChan chan<- models.Metric) error {
	reqBody := InteractionRequest{
		MovieID: movieID,
		Type:    "watchlist",
	}

	resp, duration, err := httpClient.Post("/interactions", reqBody)

	success := err == nil && resp != nil && (resp.StatusCode == 200 || resp.StatusCode == 201)
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "interactions",
		Endpoint:   "/interactions",
		Method:     "POST",
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

func PurchaseMovie(httpClient *client.HTTPClient, movieID string, metricsChan chan<- models.Metric) error {
	reqBody := InteractionRequest{
		MovieID: movieID,
		Type:    "purchase",
	}

	resp, duration, err := httpClient.Post("/interactions", reqBody)

	success := err == nil && resp != nil && (resp.StatusCode == 200 || resp.StatusCode == 201)
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "interactions",
		Endpoint:   "/interactions",
		Method:     "POST",
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

func GetUserInteractions(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) error {
	resp, duration, err := httpClient.Get("/interactions")

	success := err == nil && resp != nil && resp.StatusCode == 200
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "interactions",
		Endpoint:   "/interactions",
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

func GetWatchlist(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) error {
	resp, duration, err := httpClient.Get("/watchlist")

	success := err == nil && resp != nil && resp.StatusCode == 200
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "interactions",
		Endpoint:   "/watchlist",
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

func GetPurchases(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) error {
	resp, duration, err := httpClient.Get("/purchases")

	success := err == nil && resp != nil && resp.StatusCode == 200
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "interactions",
		Endpoint:   "/purchases",
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
