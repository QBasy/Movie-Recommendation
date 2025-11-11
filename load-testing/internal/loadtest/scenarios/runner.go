package scenarios

import (
	"github.com/brianvoe/gofakeit/v6"
	"load-test/internal/loadtest/client"
	"load-test/internal/models"
)

func RunAuthScenario(httpClient *client.HTTPClient, email string, metricsChan chan<- models.Metric) {
	actions := []func(){
		func() { GetProfile(httpClient, metricsChan) },
	}

	action := actions[gofakeit.Number(0, len(actions)-1)]
	action()
}

func RunMoviesScenario(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) {
	actions := []func(){
		func() {
			movieIDs, _ := GetAllMovies(httpClient, metricsChan)
			if len(movieIDs) > 0 {
				randomMovie := movieIDs[gofakeit.Number(0, len(movieIDs)-1)]
				GetMovieByID(httpClient, randomMovie, metricsChan)
			}
		},
		func() { SearchMovies(httpClient, metricsChan) },
		func() { GetMoviesByGenre(httpClient, metricsChan) },
		func() {
			if len(cachedMovieIDs) > 0 {
				randomMovie := cachedMovieIDs[gofakeit.Number(0, len(cachedMovieIDs)-1)]
				GetMovieByID(httpClient, randomMovie, metricsChan)
			} else {
				GetAllMovies(httpClient, metricsChan)
			}
		},
	}

	action := actions[gofakeit.Number(0, len(actions)-1)]
	action()
}

func RunInteractionsScenario(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) {
	var movieID string

	if len(cachedMovieIDs) > 0 {
		movieID = cachedMovieIDs[gofakeit.Number(0, len(cachedMovieIDs)-1)]
	} else {
		movieIDs, err := GetAllMovies(httpClient, metricsChan)
		if err != nil || len(movieIDs) == 0 {
			return
		}
		movieID = movieIDs[0]
	}

	actions := []func(){
		func() { RecordView(httpClient, movieID, metricsChan) },
		func() { LikeMovie(httpClient, movieID, metricsChan) },
		func() { RateMovie(httpClient, movieID, metricsChan) },
		func() { AddToWatchlist(httpClient, movieID, metricsChan) },
		func() { PurchaseMovie(httpClient, movieID, metricsChan) },
		func() { GetUserInteractions(httpClient, metricsChan) },
		func() { GetWatchlist(httpClient, metricsChan) },
		func() { GetPurchases(httpClient, metricsChan) },
	}

	action := actions[gofakeit.Number(0, len(actions)-1)]
	action()
}

func RunRecommendationsScenario(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) {
	var movieID string

	if len(cachedMovieIDs) > 0 {
		movieID = cachedMovieIDs[gofakeit.Number(0, len(cachedMovieIDs)-1)]
	}

	actions := []func(){
		func() { GetUserBasedRecommendations(httpClient, metricsChan) },
		func() { GetItemBasedRecommendations(httpClient, metricsChan) },
		func() { GetHybridRecommendations(httpClient, metricsChan) },
		func() {
			if movieID != "" {
				GetSimilarMovies(httpClient, movieID, metricsChan)
			} else {
				GetHybridRecommendations(httpClient, metricsChan)
			}
		},
	}

	action := actions[gofakeit.Number(0, len(actions)-1)]
	action()
}

func RunAllScenarios(httpClient *client.HTTPClient, email string, metricsChan chan<- models.Metric) {
	scenarioType := gofakeit.Number(0, 3)

	switch scenarioType {
	case 0:
		RunMoviesScenario(httpClient, metricsChan)
	case 1:
		RunInteractionsScenario(httpClient, metricsChan)
	case 2:
		RunRecommendationsScenario(httpClient, metricsChan)
	case 3:
		RunAuthScenario(httpClient, email, metricsChan)
	}
}
