package scenarios

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/brianvoe/gofakeit/v6"
	"load-test/internal/loadtest/client"
	"load-test/internal/models"
)

type RegisterRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	Username  string `json:"username"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  struct {
		ID       string `json:"_id"`
		Email    string `json:"email"`
		Username string `json:"username"`
	} `json:"user"`
}

func Register(httpClient *client.HTTPClient, userID int, metricsChan chan<- models.Metric) (string, string, error) {
	firstName := gofakeit.FirstName()
	lastName := gofakeit.LastName()
	email := fmt.Sprintf("user%d_%s@test.com", userID, gofakeit.LetterN(5))
	username := fmt.Sprintf("user%d_%s", userID, gofakeit.LetterN(5))

	reqBody := RegisterRequest{
		Email:     email,
		Password:  "password123",
		Username:  username,
		FirstName: firstName,
		LastName:  lastName,
	}

	resp, duration, err := httpClient.Post("/auth/register", reqBody)

	success := err == nil && resp.StatusCode == 201
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "auth",
		Endpoint:   "/auth/register",
		Method:     "POST",
		StatusCode: getStatusCode(resp),
		Duration:   duration,
		Success:    success,
		Error:      errorMsg,
	}

	if !success {
		if resp != nil {
			resp.Body.Close()
		}
		return "", "", fmt.Errorf("registration failed")
	}

	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var authResp AuthResponse
	if err := json.Unmarshal(body, &authResp); err != nil {
		return "", "", err
	}

	return authResp.Token, email, nil
}

func Login(httpClient *client.HTTPClient, email string, metricsChan chan<- models.Metric) (string, error) {
	reqBody := LoginRequest{
		Email:    email,
		Password: "password123",
	}

	resp, duration, err := httpClient.Post("/auth/login", reqBody)

	success := err == nil && resp.StatusCode == 200
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "auth",
		Endpoint:   "/auth/login",
		Method:     "POST",
		StatusCode: getStatusCode(resp),
		Duration:   duration,
		Success:    success,
		Error:      errorMsg,
	}

	if !success {
		if resp != nil {
			resp.Body.Close()
		}
		return "", fmt.Errorf("login failed")
	}

	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var authResp AuthResponse
	if err := json.Unmarshal(body, &authResp); err != nil {
		return "", err
	}

	return authResp.Token, nil
}

func GetProfile(httpClient *client.HTTPClient, metricsChan chan<- models.Metric) error {
	resp, duration, err := httpClient.Get("/auth/me")

	success := err == nil && resp.StatusCode == 200
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	metricsChan <- models.Metric{
		Timestamp:  time.Now(),
		Scenario:   "auth",
		Endpoint:   "/auth/me",
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

func getStatusCode(resp *http.Response) int {
	if resp == nil {
		return 0
	}
	return resp.StatusCode
}
