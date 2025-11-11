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

var InteractionTypes = []string{"view", "like", "rating", "purchase", "watchlist"}

func GenerateInteractions(ctx context.Context, collection *mongo.Collection, users []models.User, movies []models.Movie, count int) error {
	fmt.Printf("\n🔄 Generating %d interactions...\n", count)

	batch := make([]interface{}, 0, 1000)

	for i := 0; i < count; i++ {
		user := users[gofakeit.Number(0, len(users)-1)]
		movie := movies[gofakeit.Number(0, len(movies)-1)]
		interactionType := InteractionTypes[gofakeit.Number(0, len(InteractionTypes)-1)]

		interaction := models.Interaction{
			ID:        primitive.NewObjectID(),
			UserID:    user.ID,
			MovieID:   movie.ID,
			Type:      interactionType,
			Timestamp: gofakeit.DateRange(time.Now().AddDate(0, -3, 0), time.Now()),
		}

		if interactionType == "rating" {
			rating := gofakeit.Number(1, 10)
			interaction.Rating = &rating
		}

		batch = append(batch, interaction)

		if len(batch) == 1000 || i == count-1 {
			if _, err := collection.InsertMany(ctx, batch); err != nil {
				return err
			}
			batch = batch[:0]
		}

		if (i+1)%1000 == 0 {
			fmt.Printf("\r   Progress: %d/%d", i+1, count)
		}
	}

	fmt.Printf("\n✅ Created %d interactions\n", count)
	return nil
}
