package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoDB   MongoDBConfig
	API       APIConfig
	LoadTest  LoadTestConfig
	Generator GeneratorConfig
	Output    OutputConfig
}

type MongoDBConfig struct {
	URI string
}

type APIConfig struct {
	URL      string
	BasePath string
	FullURL  string
}

type LoadTestConfig struct {
	ConcurrentUsers int
	Duration        time.Duration
	RampUp          time.Duration
	Scenario        string
}

type GeneratorConfig struct {
	Users        int
	Movies       int
	Interactions int
	ClearData    bool
}

type OutputConfig struct {
	ResultsDir   string
	CSVOutput    string
	ReportOutput string
}

func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Warning: .env file not found, using default values")
	}

	config := &Config{
		MongoDB: MongoDBConfig{
			URI: getEnv("MONGO_URI", "mongodb://admin:password123@localhost:27017/movie_recommendation?authSource=admin"),
		},
		API: APIConfig{
			URL:      getEnv("API_URL", "http://localhost:3000"),
			BasePath: getEnv("API_BASE_PATH", "/api"),
		},
		LoadTest: LoadTestConfig{
			ConcurrentUsers: getEnvAsInt("CONCURRENT_USERS", 10),
			Duration:        getEnvAsDuration("TEST_DURATION", 60*time.Second),
			RampUp:          getEnvAsDuration("RAMP_UP_DURATION", 10*time.Second),
			Scenario:        getEnv("SCENARIO", "all"),
		},
		Generator: GeneratorConfig{
			Users:        getEnvAsInt("GEN_USERS", 1000),
			Movies:       getEnvAsInt("GEN_MOVIES", 1000),
			Interactions: getEnvAsInt("GEN_INTERACTIONS", 10000),
			ClearData:    getEnvAsBool("CLEAR_DATA", true),
		},
		Output: OutputConfig{
			ResultsDir:   getEnv("RESULTS_DIR", "./results"),
			CSVOutput:    getEnv("CSV_OUTPUT", "performance_test.csv"),
			ReportOutput: getEnv("REPORT_OUTPUT", "performance_report.html"),
		},
	}

	config.API.FullURL = config.API.URL + config.API.BasePath

	return config, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	valueStr := getEnv(key, "")
	if value, err := strconv.ParseBool(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	valueStr := getEnv(key, "")
	if value, err := time.ParseDuration(valueStr); err == nil {
		return value
	}
	return defaultValue
}
