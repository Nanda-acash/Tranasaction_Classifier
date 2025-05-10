import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('walletwise_user');
    navigate('/login');
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      
      // Simulating file upload and processing
      setTimeout(() => {
        // In a real application, you would parse the CSV file here
        // and update the transactions state with the parsed data
        setIsUploading(false);
        
        // For demonstration, we'll add some mock transactions
        setTransactions([
          { id: 1, date: '2025-05-01', description: 'Grocery Store', amount: -120.50, category: 'Groceries' },
          { id: 2, date: '2025-05-03', description: 'Monthly Salary', amount: 3000.00, category: 'Income' },
          { id: 3, date: '2025-05-05', description: 'Coffee Shop', amount: -4.75, category: 'Dining' },
          { id: 4, date: '2025-05-07', description: 'Gas Station', amount: -45.00, category: 'Transportation' },
          { id: 5, date: '2025-05-10', description: 'Online Subscription', amount: -15.99, category: 'Entertainment' }
        ]);
      }, 1500);
    }
  };
  
  const clearTransactions = () => {
    setTransactions([]);
  };
  
  return (
    <div className="app">
      <Navbar onLogout={handleLogout} activePage="transactions" />
      <div className="main-content">
        <div className="transactions-container">
          <h1>Transactions</h1>
          
          <div className="transactions-actions">
            <div className="upload-section">
              <label htmlFor="transaction-file" className="upload-button">
                Upload Transactions CSV
                <input 
                  type="file" 
                  id="transaction-file" 
                  accept=".csv" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
              {isUploading && <span className="upload-status">Processing file...</span>}
            </div>
            
            {transactions.length > 0 && (
              <button onClick={clearTransactions} className="clear-button">
                Clear Transactions
              </button>
            )}
          </div>
          
          {transactions.length > 0 ? (
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.date}</td>
                      <td>{transaction.description}</td>
                      <td className={transaction.amount >= 0 ? 'amount-positive' : 'amount-negative'}>
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </td>
                      <td>{transaction.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data-message">
              <p>No transactions available</p>
              <p>Upload a CSV file to view your transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;
