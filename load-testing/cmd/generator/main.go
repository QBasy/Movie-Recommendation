package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"load-test/internal/config"
	"load-test/internal/generator"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	usersFlag := flag.Int("users", cfg.Generator.Users, "Number of users to generate")
	moviesFlag := flag.Int("movies", cfg.Generator.Movies, "Number of movies to generate")
	interactionsFlag := flag.Int("interactions", cfg.Generator.Interactions, "Number of interactions to generate")
	clearFlag := flag.Bool("clear", cfg.Generator.ClearData, "Clear existing data before generating")
	mongoURIFlag := flag.String("mongo", cfg.MongoDB.URI, "MongoDB URI")
	flag.Parse()

	fmt.Println("\n🚀 Starting Data Generation")
	fmt.Printf("   Configuration:\n")
	fmt.Printf("     Users: %d\n", *usersFlag)
	fmt.Printf("     Movies: %d\n", *moviesFlag)
	fmt.Printf("     Interactions: %d\n", *interactionsFlag)
	fmt.Printf("     Clear existing data: %t\n", *clearFlag)
	fmt.Printf("     MongoDB URI: %s\n\n", maskMongoURI(*mongoURIFlag))

	ctx := context.Background()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(*mongoURIFlag))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer client.Disconnect(ctx)

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}
	fmt.Println("✅ Connected to MongoDB")

	db := client.Database("movie_recommendation")

	if *clearFlag {
		fmt.Println("\n🗑️  Clearing existing data...")
		collections := []string{"users", "movies", "interactions"}
		for _, coll := range collections {
			if err := db.Collection(coll).Drop(ctx); err != nil {
				log.Printf("Warning: Failed to drop %s collection: %v", coll, err)
			}
		}
		fmt.Println("✅ Database cleared")
	}

	startTime := time.Now()

	users, err := generator.GenerateUsers(ctx, db.Collection("users"), *usersFlag)
	if err != nil {
		log.Fatalf("Failed to generate users: %v", err)
	}

	movies, err := generator.GenerateMovies(ctx, db.Collection("movies"), *moviesFlag)
	if err != nil {
		log.Fatalf("Failed to generate movies: %v", err)
	}

	if err := generator.GenerateInteractions(ctx, db.Collection("interactions"), users, movies, *interactionsFlag); err != nil {
		log.Fatalf("Failed to generate interactions: %v", err)
	}

	duration := time.Since(startTime)

	fmt.Printf("\n📊 Statistics:\n")
	fmt.Printf("   Total Users: %d\n", *usersFlag)
	fmt.Printf("   Total Movies: %d\n", *moviesFlag)
	fmt.Printf("   Total Interactions: %d\n", *interactionsFlag)
	fmt.Printf("   Avg Interactions per User: %.2f\n", float64(*interactionsFlag)/float64(*usersFlag))
	fmt.Printf("   Generation Time: %s\n", duration)

	fmt.Println("\n✨ Data generation completed successfully!\n")
}

func maskMongoURI(uri string) string {
	return "mongodb://***:***@localhost:27017/movie_recommendation"
}
