package generator

import (
	"context"
	"fmt"
	"time"

	"github.com/brianvoe/gofakeit/v6"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"load-test/internal/models"
)

var Directors = []string{
	"Christopher Nolan", "Quentin Tarantino", "Martin Scorsese",
	"Steven Spielberg", "Ridley Scott", "Denis Villeneuve",
	"Greta Gerwig", "Jordan Peele", "Wes Anderson", "Sofia Coppola",
	"James Cameron", "Peter Jackson", "Francis Ford Coppola",
}

var Actors = []string{
	"Leonardo DiCaprio", "Meryl Streep", "Tom Hanks", "Scarlett Johansson",
	"Robert De Niro", "Cate Blanchett", "Denzel Washington", "Emma Stone",
	"Brad Pitt", "Viola Davis", "Christian Bale", "Margot Robbie",
	"Morgan Freeman", "Jennifer Lawrence", "Matt Damon", "Natalie Portman",
}

func GenerateMovies(ctx context.Context, collection *mongo.Collection, count int) ([]models.Movie, error) {
	fmt.Printf("\n🎬 Generating %d movies...\n", count)

	movies := make([]models.Movie, count)
	batch := make([]interface{}, 0, 1000)

	for i := 0; i < count; i++ {
		genreCount := gofakeit.Number(1, 3)
		genres := make([]string, genreCount)
		for j := 0; j < genreCount; j++ {
			genres[j] = Genres[gofakeit.Number(0, len(Genres)-1)]
		}

		castCount := gofakeit.Number(3, 8)
		cast := make([]string, castCount)
		for j := 0; j < castCount; j++ {
			cast[j] = Actors[gofakeit.Number(0, len(Actors)-1)]
		}

		movie := models.Movie{
			ID:          primitive.NewObjectID(),
			Title:       generateMovieTitle(),
			Description: gofakeit.Paragraph(2, 3, 10, " "),
			Genres:      genres,
			Director:    Directors[gofakeit.Number(0, len(Directors)-1)],
			Cast:        cast,
			ReleaseYear: gofakeit.Number(1990, 2024),
			Duration:    gofakeit.Number(80, 180),
			Rating:      float64(gofakeit.Number(50, 100)) / 10.0,
			PosterURL:   gofakeit.ImageURL(300, 450),
			TrailerURL:  fmt.Sprintf("https://youtube.com/watch?v=%s", gofakeit.LetterN(11)),
			Price:       float64(gofakeit.Number(499, 1999)) / 100.0,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		movies[i] = movie
		batch = append(batch, movie)

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

	fmt.Printf("\n✅ Created %d movies\n", count)
	return movies, nil
}

func generateMovieTitle() string {
	templates := []func() string{
		func() string { return fmt.Sprintf("The %s %s", gofakeit.AdjectiveDescriptive(), gofakeit.Noun()) },
		func() string { return fmt.Sprintf("%s %s", gofakeit.AdjectiveDescriptive(), gofakeit.Noun()) },
		func() string { return fmt.Sprintf("%s's %s", gofakeit.LastName(), gofakeit.Noun()) },
		func() string { return fmt.Sprintf("The %s of %s", gofakeit.Noun(), gofakeit.City()) },
		func() string { return fmt.Sprintf("%d %ss", gofakeit.Number(1, 100), gofakeit.Noun()) },
	}

	template := templates[gofakeit.Number(0, len(templates)-1)]
	return template()
}
