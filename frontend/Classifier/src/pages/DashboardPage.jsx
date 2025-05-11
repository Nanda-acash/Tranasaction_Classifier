import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { transactionsApi, categoriesApi } from '../utils/api';
import MonthlyComparison from '../components/MonthlyComparison';
import './DashboardPage.css';

// Function to generate a color based on a string (category name)
function generateColorFromString(str) {
  // Simple hash function to generate a number from a string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert the hash to a color
  const colors = [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#FF9800', // Orange
    '#F44336', // Red
    '#009688', // Teal
    '#673AB7', // Deep Purple
    '#3F51B5', // Indigo
    '#CDDC39', // Lime
    '#FFC107', // Amber
    '#795548', // Brown
    '#607D8B'  // Blue Grey
  ];
  
  // Use the hash to select a color from the predefined list
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

function DashboardPage() {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12 for Jan-Dec
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Load transaction summary data from API on component mount
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare date filters based on selected month and year
        const filters = {
          // Specifically request debit transactions (expenses) for spending summary
          transaction_type: 'debit'
        };
        
        // Only apply date filters if a specific month is selected
        if (currentMonth > 0) {
          // Get the first and last day of the selected month
          const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
          // Last day of month: set date to 0 of next month to get last day of current month
          const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
          
          filters.start_date = firstDayOfMonth.toISOString().split('T')[0];
          filters.end_date = lastDayOfMonth.toISOString().split('T')[0];
        }
        
        // Fetch transaction summary by category for expenses only
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
  }, [currentMonth, currentYear]);
  
  const handleLogout = () => {
    localStorage.removeItem('walletwise_token');
    localStorage.removeItem('walletwise_username');
    navigate('/login');
  };
  
  // Calculate total spending from expense transactions
  // Since we're now specifically fetching expense transactions, we can simply sum all amounts
  const totalSpending = summaryData
    .reduce((total, item) => {
      // Sum all expense amounts (they should all be positive since we store absolute values)
      return total + Math.abs(item.total_amount);
    }, 0);
  
  return (
    <div className="app">
      <Navbar onLogout={handleLogout} activePage="dashboard" />
      <div className="main-content">
        <div className="dashboard-container">
          <h1>Spending Summary</h1>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="dashboard-controls">
            <div className="filter-selectors">
              <div className="month-selector">
                <label htmlFor="month-select">Month:</label>
                <select 
                  id="month-select" 
                  value={currentMonth} 
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                >
                  <option value="0">All Months</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              
              <div className="year-selector">
                <label htmlFor="year-select">Year:</label>
                <select 
                  id="year-select" 
                  value={currentYear} 
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
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
                <h3 className="section-subtitle">Spending by Category</h3>
                <div className="chart-container">
                  {/* Compact bar chart visualization */}
                  <div className="chart-header">
                    <div className="chart-legend">
                      <span className="legend-label">Category</span>
                      <span className="legend-value">$</span>
                      <span className="legend-percentage">%</span>
                    </div>
                  </div>
                  <div className="chart-body">
                    {summaryData
                      .sort((a, b) => Math.abs(b.total_amount) - Math.abs(a.total_amount)) // Sort by amount (largest first)
                      .map(category => {
                        const percentage = (Math.abs(category.total_amount) / totalSpending) * 100;
                        // Generate a color based on category name if none is provided
                        const categoryColor = category.color || generateColorFromString(category.category_name);
                        return (
                          <div key={category.category_id} className="chart-bar">
                            <div className="bar-details">
                              <div className="bar-color-indicator" style={{ backgroundColor: categoryColor }}></div>
                              <div className="bar-label">
                                <span className="category-name">{category.category_name}</span>
                                <span className="category-amount">${Math.abs(category.total_amount).toFixed(2)}</span>
                                <span className="bar-percentage">{percentage.toFixed(1)}%</span>
                              </div>
                            </div>
                            <div className="bar-container">
                              <div 
                                className="bar" 
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: categoryColor
                                }}
                                title={`${category.category_name}: $${Math.abs(category.total_amount).toFixed(2)} (${percentage.toFixed(1)}%)`}
                              >
                                {percentage > 20 && (
                                  <span className="bar-label-inside">${Math.abs(category.total_amount).toFixed(0)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
                <div className="chart-summary">
                  <div className="chart-total">
                    <span>Total Expenses: </span>
                    <span className="total-value">${totalSpending.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="transaction-count">
                <h4 className="section-subtitle">Transaction Count</h4>
                <div className="chart-container">
                  <table className="count-table">
                    <thead>
                      <tr>
                        <th className="category-column">Category</th>
                        <th className="count-column">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData
                        .sort((a, b) => b.transaction_count - a.transaction_count)
                        .map(category => (
                          <tr key={category.category_id} className="count-row">
                            <td className="category-cell">{category.category_name}</td>
                            <td className="count-cell">{category.transaction_count}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="monthly-comparison-section">
                <h3 className="section-subtitle">Monthly Spending Comparison</h3>
                {isMonthlyLoading ? (
                  <div className="loading-message">Loading monthly data...</div>
                ) : Object.keys(monthlySummary).length > 0 ? (
                  <MonthlyComparison year={currentYear} />
                ) : (
                  <div className="no-data-message">No monthly comparison data available</div>
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
