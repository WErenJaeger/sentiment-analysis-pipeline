import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import sentimentData from './sentiment_data.json';
import './App.css';

const LAMBDA_URL = 'https://jeripihy7cjjrsqd4mrbeb5nl40imlqm.lambda-url.eu-north-1.on.aws/';

function App() {
  const [inputText, setInputText] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { weekly, anomalies, summary } = sentimentData;

  const chartData = weekly.map((w, idx) => ({
    ...w,
    idx,
    label: new Date(w.week_start).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }));

  const handlePredict = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError('Failed to reach the model. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sentimentColor = {
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: '#6b7280'
  };

  const tickInterval = Math.ceil(chartData.length / 12);

  // Sadece anomali olan noktalarda görünür bir daire çiz, diğerlerinde hiçbir şey render etme
  const renderDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload.is_anomaly) return null;
    return (
      <circle key={`anomaly-${payload.idx}`} cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
    );
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Sentiment Analysis & Anomaly Detection</h1>
        <p>Fine-tuned DistilBERT on Amazon Fine Food Reviews · Live model served via AWS Lambda</p>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{summary.total_reviews.toLocaleString()}</span>
          <span className="stat-label">Reviews Analyzed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{(summary.accuracy * 100).toFixed(0)}%</span>
          <span className="stat-label">Test Accuracy</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{summary.total_weeks}</span>
          <span className="stat-label">Weeks Analyzed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{summary.anomaly_count}</span>
          <span className="stat-label">Anomalies Detected</span>
        </div>
      </section>

      <section className="chart-section">
        <h2>Weekly Sentiment Trend</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              interval={tickInterval}
              angle={-35}
              textAnchor="end"
              height={50}
            />
            <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="avg_sentiment"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={renderDot}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="anomaly-section">
        <h2>Detected Anomalies</h2>
        <table className="anomaly-table">
          <thead>
            <tr><th>Week</th><th>Avg Sentiment</th><th>Review Count</th></tr>
          </thead>
          <tbody>
            {anomalies.map((a, i) => (
              <tr key={i}>
                <td>{new Date(a.week_start).toLocaleDateString()}</td>
                <td className={a.avg_sentiment < 0.5 ? 'negative-cell' : 'positive-cell'}>
                  {a.avg_sentiment.toFixed(3)}
                </td>
                <td>{a.review_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="predict-section">
        <h2>Try the Model Live</h2>
        <p className="predict-subtitle">Enter a product review and get a real-time sentiment prediction from the deployed Lambda function.</p>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. This product exceeded my expectations, highly recommend!"
          rows={3}
        />
        <button onClick={handlePredict} disabled={loading || !inputText.trim()}>
          {loading ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>

        {error && <p className="error-text">{error}</p>}

        {prediction && (
          <div className="prediction-result" style={{ borderColor: sentimentColor[prediction.sentiment] }}>
            <span className="prediction-label" style={{ color: sentimentColor[prediction.sentiment] }}>
              {prediction.sentiment.toUpperCase()}
            </span>
            <span className="prediction-confidence">{(prediction.confidence * 100).toFixed(1)}% confidence</span>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
