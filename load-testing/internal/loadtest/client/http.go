package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type HTTPClient struct {
	baseURL    string
	httpClient *http.Client
	token      string
}

func NewHTTPClient(baseURL string) *HTTPClient {
	return &HTTPClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *HTTPClient) SetToken(token string) {
	c.token = token
}

func (c *HTTPClient) Request(method, endpoint string, body interface{}) (*http.Response, time.Duration, error) {
	var reqBody io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, 0, err
		}
		reqBody = bytes.NewBuffer(jsonData)
	}

	url := c.baseURL + endpoint
	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("Content-Type", "application/json")
	if c.token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.token))
	}

	start := time.Now()
	resp, err := c.httpClient.Do(req)
	duration := time.Since(start)

	if err != nil {
		return nil, duration, err
	}

	return resp, duration, nil
}

func (c *HTTPClient) Get(endpoint string) (*http.Response, time.Duration, error) {
	return c.Request("GET", endpoint, nil)
}

func (c *HTTPClient) Post(endpoint string, body interface{}) (*http.Response, time.Duration, error) {
	return c.Request("POST", endpoint, body)
}

func (c *HTTPClient) Put(endpoint string, body interface{}) (*http.Response, time.Duration, error) {
	return c.Request("PUT", endpoint, body)
}

func (c *HTTPClient) Delete(endpoint string) (*http.Response, time.Duration, error) {
	return c.Request("DELETE", endpoint, nil)
}