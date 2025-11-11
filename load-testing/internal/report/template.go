package report

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report - Movie Recommendation System</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            padding: 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            color: #667eea;
            margin-bottom: 10px;
        }

        .header .subtitle {
            color: #666;
            font-size: 1.1em;
        }

        .header .timestamp {
            color: #999;
            font-size: 0.9em;
            margin-top: 10px;
        }

        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .card-title {
            font-size: 0.9em;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .card-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }

        .card-subtitle {
            font-size: 0.9em;
            color: #999;
        }

        .card.success .card-value {
            color: #10b981;
        }

        .card.warning .card-value {
            color: #f59e0b;
        }

        .card.danger .card-value {
            color: #ef4444;
        }

        .chart-container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }

        .chart-title {
            font-size: 1.5em;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
        }

        .chart-wrapper {
            position: relative;
            height: 400px;
        }

        .table-container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #f8f9fa;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #e9ecef;
        }

        td {
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
        }

        tr:hover {
            background: #f8f9fa;
        }

        .badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }

        .badge-success {
            background: #d1fae5;
            color: #065f46;
        }

        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }

        .badge-danger {
            background: #fee2e2;
            color: #991b1b;
        }

        .metric-bar {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .metric-bar-fill {
            flex: 1;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }

        .metric-bar-value {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            border-radius: 4px;
            transition: width 0.3s ease;
        }

        .metric-bar-label {
            min-width: 60px;
            text-align: right;
            font-weight: 600;
            color: #667eea;
        }

        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 8px;
        }

        .status-indicator.success {
            background: #10b981;
        }

        .status-indicator.warning {
            background: #f59e0b;
        }

        .status-indicator.danger {
            background: #ef4444;
        }

        .footer {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: center;
            color: #666;
            margin-top: 30px;
        }

        .performance-grade {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }

        .grade {
            font-size: 5em;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .grade.A { color: #10b981; }
        .grade.B { color: #3b82f6; }
        .grade.C { color: #f59e0b; }
        .grade.D { color: #ef4444; }

        @media (max-width: 768px) {
            .summary-cards {
                grid-template-columns: 1fr;
            }

            .header h1 {
                font-size: 1.8em;
            }

            .chart-wrapper {
                height: 300px;
            }
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .card, .chart-container, .table-container {
                box-shadow: none;
                border: 1px solid #e9ecef;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Movie Recommendation System</h1>
            <div class="subtitle">Performance Test Report</div>
            <div class="timestamp">Generated: {{.GeneratedAt}}</div>
        </div>

        <div class="performance-grade">
            <div class="grade {{if ge .Stats.SuccessRate 99.0}}{{if lt .Stats.P95Duration 200.0}}A{{else}}B{{end}}{{else if ge .Stats.SuccessRate 95.0}}C{{else}}D{{end}}">
                {{if ge .Stats.SuccessRate 99.0}}{{if lt .Stats.P95Duration 200.0}}A{{else}}B{{end}}{{else if ge .Stats.SuccessRate 95.0}}C{{else}}D{{end}}
            </div>
            <div style="font-size: 1.2em; color: #666;">
                {{if ge .Stats.SuccessRate 99.0}}{{if lt .Stats.P95Duration 200.0}}Excellent Performance{{else}}Good Performance{{end}}{{else if ge .Stats.SuccessRate 95.0}}Acceptable Performance{{else}}Needs Improvement{{end}}
            </div>
        </div>

        <div class="summary-cards">
            <div class="card">
                <div class="card-title">Total Requests</div>
                <div class="card-value">{{.Stats.TotalRequests}}</div>
                <div class="card-subtitle">Total API calls</div>
            </div>

            <div class="card success">
                <div class="card-title">Success Rate</div>
                <div class="card-value">{{printf "%.2f" .Stats.SuccessRate}}%</div>
                <div class="card-subtitle">{{.Stats.SuccessCount}} successful</div>
            </div>

            <div class="card {{if gt .Stats.FailureRate 5.0}}danger{{else if gt .Stats.FailureRate 1.0}}warning{{end}}">
                <div class="card-title">Failure Rate</div>
                <div class="card-value">{{printf "%.2f" .Stats.FailureRate}}%</div>
                <div class="card-subtitle">{{.Stats.FailureCount}} failed</div>
            </div>

            <div class="card">
                <div class="card-title">Throughput</div>
                <div class="card-value">{{printf "%.1f" .Stats.RequestsPerSecond}}</div>
                <div class="card-subtitle">requests/sec</div>
            </div>

            <div class="card {{if lt .Stats.MeanDuration 200.0}}success{{else if lt .Stats.MeanDuration 500.0}}warning{{else}}danger{{end}}">
                <div class="card-title">Avg Response Time</div>
                <div class="card-value">{{printf "%.0f" .Stats.MeanDuration}}</div>
                <div class="card-subtitle">milliseconds</div>
            </div>

            <div class="card {{if lt .Stats.P95Duration 200.0}}success{{else if lt .Stats.P95Duration 500.0}}warning{{else}}danger{{end}}">
                <div class="card-title">P95 Response Time</div>
                <div class="card-value">{{printf "%.0f" .Stats.P95Duration}}</div>
                <div class="card-subtitle">milliseconds</div>
            </div>

            <div class="card {{if lt .Stats.P99Duration 500.0}}success{{else if lt .Stats.P99Duration 1000.0}}warning{{else}}danger{{end}}">
                <div class="card-title">P99 Response Time</div>
                <div class="card-value">{{printf "%.0f" .Stats.P99Duration}}</div>
                <div class="card-subtitle">milliseconds</div>
            </div>

            <div class="card">
                <div class="card-title">Max Response Time</div>
                <div class="card-value">{{printf "%.0f" .Stats.MaxDuration}}</div>
                <div class="card-subtitle">milliseconds</div>
            </div>
        </div>

        <div class="chart-container">
            <div class="chart-title">📈 Requests Per Second Over Time</div>
            <div class="chart-wrapper">
                <canvas id="throughputChart"></canvas>
            </div>
        </div>

        <div class="chart-container">
            <div class="chart-title">⏱️ Response Time Over Time</div>
            <div class="chart-wrapper">
                <canvas id="responseTimeChart"></canvas>
            </div>
        </div>

        <div class="chart-container">
            <div class="chart-title">📊 Response Time Distribution</div>
            <div class="chart-wrapper">
                <canvas id="percentileChart"></canvas>
            </div>
        </div>

        <div class="table-container">
            <div class="chart-title">🎯 Performance by Scenario</div>
            <table>
                <thead>
                    <tr>
                        <th>Scenario</th>
                        <th>Requests</th>
                        <th>Success Rate</th>
                        <th>Avg Response (ms)</th>
                        <th>Min/Max (ms)</th>
                        <th>Performance</th>
                    </tr>
                </thead>
                <tbody>
                    {{range .ScenarioList}}
                    <tr>
                        <td><strong>{{.Name}}</strong></td>
                        <td>{{.Count}}</td>
                        <td>
                            <span class="badge {{if ge .SuccessRate 99.0}}badge-success{{else if ge .SuccessRate 95.0}}badge-warning{{else}}badge-danger{{end}}">
                                {{printf "%.2f" .SuccessRate}}%
                            </span>
                        </td>
                        <td>{{printf "%.2f" .AvgDuration}}</td>
                        <td>{{printf "%.0f" .MinDuration}} / {{printf "%.0f" .MaxDuration}}</td>
                        <td>
                            <div class="metric-bar">
                                <div class="metric-bar-fill" style="width: 150px;">
                                    <div class="metric-bar-value" style="width: {{if lt .AvgDuration 200.0}}20{{else if lt .AvgDuration 500.0}}50{{else}}100{{end}}%;"></div>
                                </div>
                                <span class="status-indicator {{if lt .AvgDuration 200.0}}success{{else if lt .AvgDuration 500.0}}warning{{else}}danger{{end}}"></span>
                            </div>
                        </td>
                    </tr>
                    {{end}}
                </tbody>
            </table>
        </div>

        <div class="table-container">
            <div class="chart-title">🔗 Performance by Endpoint</div>
            <table>
                <thead>
                    <tr>
                        <th>Endpoint</th>
                        <th>Requests</th>
                        <th>Success Rate</th>
                        <th>Avg Response (ms)</th>
                        <th>P95 (ms)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {{range .EndpointList}}
                    <tr>
                        <td><code>{{.Endpoint}}</code></td>
                        <td>{{.Count}}</td>
                        <td>
                            <span class="badge {{if ge .SuccessRate 99.0}}badge-success{{else if ge .SuccessRate 95.0}}badge-warning{{else}}badge-danger{{end}}">
                                {{printf "%.2f" .SuccessRate}}%
                            </span>
                        </td>
                        <td>{{printf "%.2f" .AvgDuration}}</td>
                        <td>{{printf "%.2f" .P95Duration}}</td>
                        <td>
                            <span class="status-indicator {{if lt .P95Duration 200.0}}success{{else if lt .P95Duration 500.0}}warning{{else}}danger{{end}}"></span>
                            {{if lt .P95Duration 200.0}}Excellent{{else if lt .P95Duration 500.0}}Good{{else}}Slow{{end}}
                        </td>
                    </tr>
                    {{end}}
                </tbody>
            </table>
        </div>

        {{if .ErrorList}}
        <div class="table-container">
            <div class="chart-title">⚠️ Error Analysis</div>
            <table>
                <thead>
                    <tr>
                        <th>Error Message</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    {{range .ErrorList}}
                    <tr>
                        <td>{{.Message}}</td>
                        <td>{{.Count}}</td>
                        <td>
                            <span class="badge badge-danger">
                                {{printf "%.2f" (mulf (divf (float64 .Count) (float64 $.Stats.TotalRequests)) 100.0)}}%
                            </span>
                        </td>
                    </tr>
                    {{end}}
                </tbody>
            </table>
        </div>
        {{end}}

        <div class="footer">
            <p>Generated by Movie Recommendation Performance Testing Suite</p>
            <p style="margin-top: 10px; color: #999;">
                Report generated on {{.GeneratedAt}}
            </p>
        </div>
    </div>

    <script>
        const chartColors = {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            grid: '#e9ecef'
        };

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: chartColors.grid
                    }
                },
                x: {
                    grid: {
                        color: chartColors.grid
                    }
                }
            }
        };

        new Chart(document.getElementById('throughputChart'), {
            type: 'line',
            data: {
                labels: {{toJSON .TimeSeries.Timestamps}},
                datasets: [{
                    label: 'Requests/sec',
                    data: {{toJSON .TimeSeries.RequestsPerSec}},
                    borderColor: chartColors.primary,
                    backgroundColor: chartColors.primary + '20',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: commonOptions
        });

        new Chart(document.getElementById('responseTimeChart'), {
            type: 'line',
            data: {
                labels: {{toJSON .TimeSeries.Timestamps}},
                datasets: [{
                    label: 'Avg Response Time (ms)',
                    data: {{toJSON .TimeSeries.AvgResponseTime}},
                    borderColor: chartColors.secondary,
                    backgroundColor: chartColors.secondary + '20',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: commonOptions
        });

        new Chart(document.getElementById('percentileChart'), {
            type: 'bar',
            data: {
                labels: {{toJSON .PercentileData.Labels}},
                datasets: [{
                    label: 'Response Time (ms)',
                    data: {{toJSON .PercentileData.Values}},
                    backgroundColor: [
                        chartColors.success,
                        chartColors.primary,
                        chartColors.warning,
                        chartColors.danger,
                        chartColors.danger
                    ]
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    </script>
</body>
</html>
`
