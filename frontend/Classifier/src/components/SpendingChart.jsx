import React, { useState, useEffect } from 'react';
import { transactionsApi } from '../utils/api';
import './SpendingChart.css';

const SpendingChart = ({ initialData = null, year: initialYear = new Date().getFullYear() }) => {
  const [summaryData, setSummaryData] = useState(initialData || {});
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [viewType, setViewType] = useState('bar'); // 'bar' or 'pie'

  useEffect(() => {
    // If initialData is provided and matches the current year, use it
    if (initialData && year === initialYear) {
      setSummaryData(initialData);
      setLoading(false);
    } else {
      fetchSummaryData();
    }
  }, [year, month, initialData, initialYear]);

  const fetchSummaryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsApi.getMonthlySummary(year, month);
      setSummaryData(data);
    } catch (err) {
      console.error('Error fetching spending summary:', err);
      setError('Failed to load spending summary');
    } finally {
      setLoading(false);
    }
  };

  const renderBarChart = (data) => {
    if (!data || Object.keys(data).length === 0) {
      return <div className="no-data">No spending data available for this period</div>;
    }

    // Get the month's data based on the selected month
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const selectedMonthName = monthNames[month - 1];
    
    // Find the month in the data (case insensitive)
    const monthKey = Object.keys(data).find(key => 
      key.toLowerCase() === selectedMonthName.toLowerCase()
    );
    
    if (!monthKey) {
      return <div className="no-data">No spending data available for {selectedMonthName}</div>;
    }
    
    const categories = data[monthKey];
    
    if (!categories || Object.keys(categories).length === 0) {
      return <div className="no-data">No spending data available for {selectedMonthName}</div>;
    }

    // Find the maximum amount for scaling
    const maxAmount = Math.max(...Object.values(categories));
    
    return (
      <div className="bar-chart">
        <h3>{selectedMonthName} {year} Spending</h3>
        <div className="chart-container">
          {Object.entries(categories).map(([category, amount]) => (
            <div key={category} className="bar-item">
              <div className="bar-label">{category}</div>
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{ 
                    width: `${(amount / maxAmount) * 100}%`,
                    backgroundColor: getCategoryColor(category)
                  }}
                ></div>
                <span className="bar-value">${amount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = (data) => {
    if (!data || Object.keys(data).length === 0) {
      return <div className="no-data">No spending data available for this period</div>;
    }

    // Get the month's data based on the selected month
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const selectedMonthName = monthNames[month - 1];
    
    // Find the month in the data (case insensitive)
    const monthKey = Object.keys(data).find(key => 
      key.toLowerCase() === selectedMonthName.toLowerCase()
    );
    
    if (!monthKey) {
      return <div className="no-data">No spending data available for {selectedMonthName}</div>;
    }
    
    const categories = data[monthKey];
    
    if (!categories || Object.keys(categories).length === 0) {
      return <div className="no-data">No spending data available for {selectedMonthName}</div>;
    }

    const totalSpending = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
    let currentAngle = 0;

    return (
      <div className="pie-chart-container">
        <h3>{selectedMonthName} {year} Spending</h3>
        <div className="pie-chart">
          <svg viewBox="0 0 100 100">
            {Object.entries(categories).map(([category, amount]) => {
              const percentage = (amount / totalSpending) * 100;
              const angle = (percentage / 100) * 360;
              
              // Calculate the SVG arc path
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle = endAngle;
              
              const startX = 50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
              const startY = 50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
              const endX = 50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180);
              const endY = 50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 50 50`,
                `L ${startX} ${startY}`,
                `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `Z`
              ].join(' ');
              
              return (
                <path 
                  key={category} 
                  d={pathData} 
                  fill={getCategoryColor(category)}
                  stroke="#fff"
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>
        </div>
        <div className="pie-legend">
          {Object.entries(categories).map(([category, amount]) => (
            <div key={category} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: getCategoryColor(category) }}
              ></div>
              <div className="legend-label">{category}</div>
              <div className="legend-value">${amount.toFixed(2)} ({((amount / totalSpending) * 100).toFixed(1)}%)</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getCategoryColor = (category) => {
    // Simple hash function to generate consistent colors for categories
    const hash = Array.from(category).reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0);
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
  };

  const toggleChartType = () => {
    setViewType(viewType === 'bar' ? 'pie' : 'bar');
  };

  return (
    <div className="spending-chart">
      <div className="chart-controls">
        <div className="chart-filters">
          <div className="filter-group">
            <label htmlFor="year-select">Year:</label>
            <select id="year-select" value={year} onChange={handleYearChange}>
              {Array.from({ length: 5 }, (_, i) => year - 2 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="month-select">Month:</label>
            <select id="month-select" value={month} onChange={handleMonthChange}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="chart-type-toggle" onClick={toggleChartType}>
          Switch to {viewType === 'bar' ? 'Pie' : 'Bar'} Chart
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading spending data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        viewType === 'bar' ? renderBarChart(summaryData) : renderPieChart(summaryData)
      )}
    </div>
  );
};

export default SpendingChart;
