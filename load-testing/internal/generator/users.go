package generator

import (
	"context"
	"fmt"
	"time"

	"github.com/brianvoe/gofakeit/v6"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	"load-test/internal/models"
)

var Genres = []string{
	"Action", "Comedy", "Drama", "Horror", "Sci-Fi",
	"Romance", "Thriller", "Documentary", "Animation",
	"Fantasy", "Crime", "Adventure", "Mystery", "Biography",
}

func GenerateUsers(ctx context.Context, collection *mongo.Collection, count int) ([]models.User, error) {
	fmt.Printf("\n👥 Generating %d users...\n", count)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), 10)
	if err != nil {
		return nil, err
	}

	users := make([]models.User, count)
	batch := make([]interface{}, 0, 1000)

	for i := 0; i < count; i++ {
		firstName := gofakeit.FirstName()
		lastName := gofakeit.LastName()

		favoriteGenres := make([]string, 0)
		genreCount := gofakeit.Number(1, 4)
		for j := 0; j < genreCount; j++ {
			genre := Genres[gofakeit.Number(0, len(Genres)-1)]
			if !contains(favoriteGenres, genre) {
				favoriteGenres = append(favoriteGenres, genre)
			}
		}

		user := models.User{
			ID:        primitive.NewObjectID(),
			Email:     gofakeit.Email(),
			Password:  string(hashedPassword),
			Username:  gofakeit.Username(),
			FirstName: firstName,
			LastName:  lastName,
			Preferences: models.Preferences{
				FavoriteGenres: favoriteGenres,
				DislikedGenres: []string{},
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		users[i] = user
		batch = append(batch, user)

		if len(batch) == 1000 || i == count-1 {
			if _, err := collection.InsertMany(ctx, batch); err != nil {
				return nil, err
			}
			batch = batch[:0]
		}

		if (i+1)%100 == 0 {
			fmt.Printf("\r   Progress: %d/%d", i+1, count)
		}
	}

	fmt.Printf("\n✅ Created %d users\n", count)
	return users, nil
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
