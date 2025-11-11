package scenarios

import (
	"encoding/json"
	"fmt"
	"io"
	"time"

	"github.com/brianvoe/gofakeit/v6"
	"load-test/internal/loadtest/client"
	"load-test/internal/models"
)

type MoviesResponse struct {
	Movies []Movie `json:"movies"`
}

type MovieResponse struct {
	Movie Movie `json:"movie"`
}

type Movie struct {
	ID          string   `json:"_id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Genres      []string `json:"genres"`
	Director    string   `json:"director"`
	Cast        []string `json:"cast"`
	ReleaseYear int      `json:"releaseYear"`
	Duration    int      `json:"duration"`
	Rating      float64  `json:"rating"`
	Price       float64  `json:"price"`
}

var cachedMovieIDs []string

func GetAllMovies(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) ([]string, error) {
	limit := gofakeit.Number(20, 50)
	skip := gofakeit.Number(0, 100)
	endpoint := fmt.Sprintf("/movies?limit=%d&skip=%d", limit, skip)

	resp, duration, err := httpClient.Get(endpoint)

	success := err == nil && resp != nil && resp.StatusCode == 200
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "movies",
		Endpoint:   "/movies",
		Method:     "GET",
		StatusCode: getStatusCode(resp),
		Duration:   duration,
		Success:    success,
		Error:      errorMsg,
	}

	if !success {
		if resp != nil {
			resp.Body.Close()
		}
		return nil, fmt.Errorf("get movies failed")
	}

	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var moviesResp MoviesResponse
	if err := json.Unmarshal(body, &moviesResp); err != nil {
		return nil, err
	}

	movieIDs := make([]string, len(moviesResp.Movies))
	for i, movie := range moviesResp.Movies {
		movieIDs[i] = movie.ID
	}

	if len(movieIDs) > 0 {
		cachedMovieIDs = movieIDs
	}

	return movieIDs, nil
}

func GetMovieByID(httpClient *client.HTTPClient, movieID string, metricsChan chan<- models.Metric) error {
	endpoint := fmt.Sprintf("/movies/%s", movieID)

	resp, duration, err := httpClient.Get(endpoint)

	success := err == nil && resp != nil && resp.StatusCode == 200
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "movies",
		Endpoint:   "/movies/:id",
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

func SearchMovies(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) error {
	queries := []string{
		"action", "comedy", "drama", "the", "love", "dark", "war", "hero",
	}
	query := queries[gofakeit.Number(0, len(queries)-1)]
	endpoint := fmt.Sprintf("/movies/search?q=%s&limit=20", query)

	resp, duration, err := httpClient.Get(endpoint)

	success := err == nil && resp != nil && resp.StatusCode == 200
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "movies",
		Endpoint:   "/movies/search",
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

func GetMoviesByGenre(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) error {
	genres := []string{
		"Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller",
	}
	genre := genres[gofakeit.Number(0, len(genres)-1)]
	endpoint := fmt.Sprintf("/movies/genre/%s?limit=20", genre)

	resp, duration, err := httpClient.Get(endpoint)

	success := err == nil && resp != nil && resp.StatusCode == 200
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "movies",
		Endpoint:   "/movies/genre/:genre",
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
