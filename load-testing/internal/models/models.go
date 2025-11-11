package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Email       string             `bson:"email"`
	Password    string             `bson:"password"`
	Username    string             `bson:"username"`
	FirstName   string             `bson:"firstName,omitempty"`
	LastName    string             `bson:"lastName,omitempty"`
	Preferences Preferences        `bson:"preferences"`
	CreatedAt   time.Time          `bson:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt"`
}

type Preferences struct {
	FavoriteGenres []string `bson:"favoriteGenres"`
	DislikedGenres []string `bson:"dislikedGenres"`
}

type Movie struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Title       string             `bson:"title"`
	Description string             `bson:"description"`
	Genres      []string           `bson:"genres"`
	Director    string             `bson:"director"`
	Cast        []string           `bson:"cast"`
	ReleaseYear int                `bson:"releaseYear"`
	Duration    int                `bson:"duration"`
	Rating      float64            `bson:"rating"`
	PosterURL   string             `bson:"posterUrl,omitempty"`
	TrailerURL  string             `bson:"trailerUrl,omitempty"`
	Price       float64            `bson:"price"`
	CreatedAt   time.Time          `bson:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt"`
}

type Interaction struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	UserID    primitive.ObjectID `bson:"userId"`
	MovieID   primitive.ObjectID `bson:"movieId"`
	Type      string             `bson:"type"`
	Rating    *int               `bson:"rating,omitempty"`
	Timestamp time.Time          `bson:"timestamp"`
}

type Metric struct {
	Timestamp  time.Time
	Scenario   string
	Endpoint   string
	Method     string
	StatusCode int
	Duration   time.Duration
	Success    bool
	Error      string
}

type TestStats struct {
	TotalRequests     int
	SuccessCount      int
	FailureCount      int
	SuccessRate       float64
	FailureRate       float64
	RequestsPerSecond float64
	MinDuration       float64
	MaxDuration       float64
	MeanDuration      float64
	MedianDuration    float64
	P95Duration       float64
	P99Duration       float64
	ByScenario        map[string]ScenarioStats
	ByEndpoint        map[string]EndpointStats
	Errors            map[string]int
}

type ScenarioStats struct {
	Count       int
	SuccessRate float64
	AvgDuration float64
	MinDuration float64
	MaxDuration float64
}

type EndpointStats struct {
	Count       int
	SuccessRate float64
	AvgDuration float64
	P95Duration float64
}
