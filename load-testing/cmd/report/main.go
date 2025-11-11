package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"load-test/internal/config"
	"load-test/internal/report"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	inputFlag := flag.String("input", "", "Input CSV file (default: latest in results/)")
	outputFlag := flag.String("output", cfg.Output.ReportOutput, "Output HTML file")
	flag.Parse()

	inputFile := *inputFlag
	if inputFile == "" {
		inputFile, err = findLatestCSV(cfg.Output.ResultsDir)
		if err != nil {
			log.Fatalf("Failed to find input CSV: %v", err)
		}
	}

	outputFile := filepath.Join(cfg.Output.ResultsDir, *outputFlag)

	fmt.Printf("\n📊 Generating Performance Report\n")
	fmt.Printf("═══════════════════════════════════════════════════════\n")
	fmt.Printf("  Input:  %s\n", inputFile)
	fmt.Printf("  Output: %s\n", outputFile)
	fmt.Printf("═══════════════════════════════════════════════════════\n\n")

	fmt.Printf("⏳ Loading metrics from CSV...\n")
	metrics, err := report.LoadMetricsFromCSV(inputFile)
	if err != nil {
		log.Fatalf("Failed to load metrics: %v", err)
	}
	fmt.Printf("✅ Loaded %d metrics\n\n", len(metrics))

	fmt.Printf("📈 Analyzing performance data...\n")
	fmt.Printf("⚙️  Generating charts and tables...\n")

	if err := report.GenerateHTMLReport(metrics, outputFile); err != nil {
		log.Fatalf("Failed to generate report: %v", err)
	}

	fmt.Printf("\n✅ Report generated successfully!\n")
	fmt.Printf("\n📄 Report saved to: %s\n", outputFile)
	fmt.Printf("\n💡 Open the report:\n")
	fmt.Printf("   - Linux:   xdg-open %s\n", outputFile)
	fmt.Printf("   - macOS:   open %s\n", outputFile)
	fmt.Printf("   - Windows: start %s\n", outputFile)
	fmt.Printf("\n")
}

func findLatestCSV(resultsDir string) (string, error) {
	files, err := os.ReadDir(resultsDir)
	if err != nil {
		return "", fmt.Errorf("failed to read results directory: %w", err)
	}

	var latestFile string
	var latestTime int64

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		if filepath.Ext(file.Name()) != ".csv" {
			continue
		}

		info, err := file.Info()
		if err != nil {
			continue
		}

		if info.ModTime().Unix() > latestTime {
			latestTime = info.ModTime().Unix()
			latestFile = filepath.Join(resultsDir, file.Name())
		}
	}

	if latestFile == "" {
		return "", fmt.Errorf("no CSV files found in %s", resultsDir)
	}

	return latestFile, nil
}
