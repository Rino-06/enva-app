import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24, background: '#071510', minHeight: '100vh',
          color: '#E8F5EE', fontFamily: 'monospace',
        }}>
          <div style={{ color: '#E05555', fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
            ❌ Uygulama Hatası
          </div>
          <div style={{
            background: '#112A1E', borderRadius: 10, padding: 16,
            border: '1px solid #1E4030', marginBottom: 12,
          }}>
            <div style={{ color: '#F0C040', fontWeight: 700, marginBottom: 6 }}>
              {this.state.error.name}: {this.state.error.message}
            </div>
            <pre style={{ color: '#5F9070', fontSize: 11, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
              {this.state.error.stack}
            </pre>
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              padding: '10px 20px', background: '#2E9B40', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 800,
            }}
          >
            Tekrar Dene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
