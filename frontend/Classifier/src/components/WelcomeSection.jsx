import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeSection.css';

function WelcomeSection() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const username = localStorage.getItem('walletwise_username') || 'User';
  
  // Auto-rotate features every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: 'CSV Import',
      description: 'Easily upload your bank statements in CSV format and have them automatically categorized.',
      icon: '📊',
      color: '#4CAF50'
    },
    {
      title: 'Smart Categorization',
      description: 'Our AI-powered system automatically categorizes your transactions based on patterns and descriptions.',
      icon: '🧠',
      color: '#2196F3'
    },
    {
      title: 'Spending Insights',
      description: 'Get visual breakdowns of your spending habits across different categories and time periods.',
      icon: '📈',
      color: '#9C27B0'
    },
    {
      title: 'Secure Storage',
      description: 'Your financial data is securely stored and accessible only to you, with bank-level encryption.',
      icon: '🔒',
      color: '#FF9800'
    }
  ];

  return (
    <div className="welcome-section">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to <span className="brand-name">WalletWise</span>, {username}!</h1>
          <p className="tagline">Your personal finance assistant for smarter money management</p>
          
          <div className="cta-buttons">
            <button 
              className="primary-button"
              onClick={() => navigate('/transactions')}
            >
              Upload Transactions
            </button>
            <button 
              className="secondary-button"
              onClick={() => navigate('/dashboard')}
            >
              View Dashboard
            </button>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="preview-dot"></div>
              <div className="preview-dot"></div>
              <div className="preview-dot"></div>
            </div>
            <div className="preview-content">
              <div className="preview-chart"></div>
              <div className="preview-bars">
                <div className="preview-bar" style={{width: '80%'}}></div>
                <div className="preview-bar" style={{width: '60%'}}></div>
                <div className="preview-bar" style={{width: '40%'}}></div>
                <div className="preview-bar" style={{width: '70%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <h2>Powerful Features</h2>
        <div className="features-container">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-card ${index === activeFeature ? 'active' : ''}`}
              onClick={() => setActiveFeature(index)}
              style={{
                '--feature-color': feature.color,
                '--feature-shadow': `${feature.color}66`
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="getting-started-section">
        <h2>Getting Started</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload CSV</h3>
            <p>Go to the Transactions page and upload your bank statement CSV file.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Categorize</h3>
            <p>Review and adjust the automatic categorization of your transactions.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Save</h3>
            <p>Save your transactions to your account for future reference.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Analyze</h3>
            <p>View your spending insights on the Dashboard page.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
