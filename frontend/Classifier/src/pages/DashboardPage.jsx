import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { transactionsApi, categoriesApi } from '../utils/api';
import SpendingChart from '../components/SpendingChart';
import './DashboardPage.css';

function DashboardPage() {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'month', 'week'
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Load transaction summary data from API on component mount
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare date filters based on selected time range
        const filters = {};
        if (timeRange === 'month') {
          // Get the first and last day of the previous month
          const today = new Date();
          const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          
          filters.start_date = previousMonth.toISOString().split('T')[0];
          filters.end_date = lastDayOfPreviousMonth.toISOString().split('T')[0];
        } else if (timeRange === 'week') {
          const today = new Date();
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(today.getDate() - 7);
          filters.start_date = oneWeekAgo.toISOString().split('T')[0];
          filters.end_date = today.toISOString().split('T')[0];
        }
        
        // Fetch transaction summary by category
        const summaryByCategory = await transactionsApi.getSummaryByCategory(filters);
        setSummaryData(summaryByCategory);
      } catch (err) {
        console.error('Error fetching summary data:', err);
        setError('Failed to load summary data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchMonthlySummary = async () => {
      try {
        setIsMonthlyLoading(true);
        const data = await transactionsApi.getMonthlySummary(currentYear);
        setMonthlySummary(data);
      } catch (err) {
        console.error('Error fetching monthly summary:', err);
        // Don't set the main error state for this
      } finally {
        setIsMonthlyLoading(false);
      }
    };
    
    fetchSummaryData();
    fetchMonthlySummary();
  }, [timeRange, currentYear]);
  
  const handleLogout = () => {
    localStorage.removeItem('walletwise_token');
    localStorage.removeItem('walletwise_username');
    navigate('/login');
  };
  
  // Calculate total spending
  const totalSpending = summaryData
    .reduce((total, item) => {
      // Include all transactions, not just negative ones
      // For expenses (negative amounts), we add their absolute value
      // For income (positive amounts), we don't include them in spending
      return total + (item.total_amount < 0 ? Math.abs(item.total_amount) : 0);
    }, 0);
  
  return (
    <div className="app">
      <Navbar onLogout={handleLogout} activePage="dashboard" />
      <div className="main-content">
        <div className="dashboard-container">
          <h1>Spending Summary</h1>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="dashboard-controls">
            <div className="time-range-selector">
              <button 
                className={timeRange === 'all' ? 'active' : ''}
                onClick={() => setTimeRange('all')}
              >
                All Time
              </button>
              <button 
                className={timeRange === 'month' ? 'active' : ''}
                onClick={() => setTimeRange('month')}
              >
                Last Month
              </button>
              <button 
                className={timeRange === 'week' ? 'active' : ''}
                onClick={() => setTimeRange('week')}
              >
                Last Week
              </button>
            </div>
            
            <div className="year-selector">
              <label htmlFor="year-select">Year:</label>
              <select 
                id="year-select" 
                value={currentYear} 
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading-message">Loading summary data...</div>
          ) : summaryData.length > 0 ? (
            <div className="summary-content">
              <div className="total-spending">
                <h2>Total Spending</h2>
                <p className="total-amount">${totalSpending.toFixed(2)}</p>
              </div>
              
              <div className="category-breakdown">
                <h2>Spending by Category</h2>
                <div className="chart-container">
                  {/* Simple bar chart visualization */}
                  {summaryData
                    .filter(item => item.total_amount < 0) // Only show expenses
                    .sort((a, b) => Math.abs(b.total_amount) - Math.abs(a.total_amount)) // Sort by amount (largest first)
                    .map(category => {
                      const percentage = (Math.abs(category.total_amount) / totalSpending) * 100;
                      return (
                        <div key={category.category_id} className="chart-bar">
                          <div className="bar-label">
                            <span className="category-name">{category.category_name}</span>
                            <span className="category-amount">${Math.abs(category.total_amount).toFixed(2)}</span>
                          </div>
                          <div className="bar-container">
                            <div 
                              className="bar" 
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: category.color || '#808080'
                              }}
                            ></div>
                          </div>
                          <div className="bar-percentage">{percentage.toFixed(1)}%</div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
              
              <div className="transaction-count">
                <h2>Transaction Count by Category</h2>
                <div className="count-list">
                  {summaryData
                    .sort((a, b) => b.transaction_count - a.transaction_count)
                    .map(category => (
                      <div key={category.category_id} className="count-item">
                        <span className="category-name">{category.category_name}</span>
                        <span className="transaction-count">{category.transaction_count}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              <div className="monthly-spending-section">
                <h2>Monthly Spending Trends</h2>
                {isMonthlyLoading ? (
                  <div className="loading-message">Loading monthly data...</div>
                ) : Object.keys(monthlySummary).length > 0 ? (
                  <SpendingChart initialData={monthlySummary} year={currentYear} />
                ) : (
                  <div className="no-data-message">No monthly spending data available</div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-data-message">
              <p>No transaction data available</p>
              <p>Upload transactions to see your spending summary</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
