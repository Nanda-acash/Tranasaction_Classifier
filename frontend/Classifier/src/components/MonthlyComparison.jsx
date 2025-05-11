import React, { useState, useEffect } from 'react';
import { transactionsApi } from '../utils/api';
import './MonthlyComparison.css';

const MonthlyComparison = ({ year }) => {
  const [month1, setMonth1] = useState(new Date().getMonth()); // 0-11 for Jan-Dec
  const [month2, setMonth2] = useState(month1 > 0 ? month1 - 1 : 11); // Previous month by default
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchComparisonData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch data for both months
        const data = await transactionsApi.getMonthlySummary(year);
        
        // Process the data for comparison
        const month1Name = monthNames[month1];
        const month2Name = monthNames[month2];
        
        const month1Data = data[month1Name] || {};
        const month2Data = data[month2Name] || {};
        
        // Get all unique categories from both months
        const allCategories = [...new Set([
          ...Object.keys(month1Data),
          ...Object.keys(month2Data)
        ])];
        
        // Create comparison data structure
        const comparison = allCategories.map(category => {
          const month1Amount = Math.abs(month1Data[category] || 0);
          const month2Amount = Math.abs(month2Data[category] || 0);
          const difference = month1Amount - month2Amount;
          const percentChange = month2Amount === 0 
            ? (month1Amount > 0 ? 100 : 0) 
            : ((difference / month2Amount) * 100);
          
          return {
            category,
            month1Amount,
            month2Amount,
            difference,
            percentChange
          };
        });
        
        // Sort by absolute difference (largest first)
        comparison.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
        
        setComparisonData({
          month1Name,
          month2Name,
          comparison
        });
      } catch (err) {
        console.error('Error fetching comparison data:', err);
        setError('Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComparisonData();
  }, [month1, month2, year]);

  const handleMonth1Change = (e) => {
    const newMonth = parseInt(e.target.value);
    setMonth1(newMonth);
    // If both months are the same, change month2
    if (newMonth === month2) {
      setMonth2(newMonth === 0 ? 11 : newMonth - 1);
    }
  };

  const handleMonth2Change = (e) => {
    const newMonth = parseInt(e.target.value);
    setMonth2(newMonth);
    // If both months are the same, change month1
    if (newMonth === month1) {
      setMonth1(newMonth === 11 ? 0 : newMonth + 1);
    }
  };

  // Generate a color based on percent change
  const getChangeColor = (percentChange) => {
    if (percentChange > 0) {
      // Increased spending - red gradient
      const intensity = Math.min(100, Math.abs(percentChange)) / 100;
      return `rgba(255, 59, 48, ${0.3 + intensity * 0.7})`;
    } else if (percentChange < 0) {
      // Decreased spending - green gradient
      const intensity = Math.min(100, Math.abs(percentChange)) / 100;
      return `rgba(52, 199, 89, ${0.3 + intensity * 0.7})`;
    }
    return 'var(--text-color)';
  };

  return (
    <div className="monthly-comparison">
      <div className="comparison-controls">
        <div className="month-selector">
          <label htmlFor="month1-select">First Month:</label>
          <select 
            id="month1-select" 
            value={month1} 
            onChange={handleMonth1Change}
          >
            {monthNames.map((name, index) => (
              <option key={`m1-${index}`} value={index}>{name}</option>
            ))}
          </select>
        </div>
        <div className="month-selector">
          <label htmlFor="month2-select">Second Month:</label>
          <select 
            id="month2-select" 
            value={month2} 
            onChange={handleMonth2Change}
          >
            {monthNames.map((name, index) => (
              <option key={`m2-${index}`} value={index}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading comparison data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : comparisonData && comparisonData.comparison.length > 0 ? (
        <div className="comparison-table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="category-column">Category</th>
                <th className="amount-column">{comparisonData.month1Name}</th>
                <th className="amount-column">{comparisonData.month2Name}</th>
                <th className="change-column">Change</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.comparison.map((item, index) => (
                <tr key={index} className="comparison-row">
                  <td className="category-cell">{item.category}</td>
                  <td className="amount-cell">${item.month1Amount.toFixed(2)}</td>
                  <td className="amount-cell">${item.month2Amount.toFixed(2)}</td>
                  <td 
                    className="change-cell" 
                    style={{ color: getChangeColor(item.percentChange) }}
                  >
                    {item.difference > 0 ? '+' : ''}
                    ${item.difference.toFixed(2)}
                    <span className="percent-change">
                      ({item.percentChange > 0 ? '+' : ''}
                      {item.percentChange.toFixed(1)}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data-message">No comparison data available for the selected months</div>
      )}
    </div>
  );
};

export default MonthlyComparison;
