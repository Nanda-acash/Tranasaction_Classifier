import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  
  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('walletwise_transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);
  
  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('walletwise_transactions', JSON.stringify(transactions));
  }, [transactions]);
  
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
        
        // Generate a unique ID base for this upload batch
        const idBase = Date.now();
        const uploadIndex = uploadCount + 1;
        
        // For demonstration, we'll add some mock transactions
        // Use the spread operator to append new transactions instead of replacing
        const newTransactions = [
          { id: `${idBase}-1`, date: `2025-05-${uploadIndex * 2}`, description: 'Grocery Store', amount: -120.50 - (uploadIndex * 5), category: 'Groceries' },
          { id: `${idBase}-2`, date: `2025-05-${uploadIndex * 2 + 2}`, description: 'Monthly Salary', amount: 3000.00, category: 'Income' },
          { id: `${idBase}-3`, date: `2025-05-${uploadIndex * 2 + 4}`, description: 'Coffee Shop', amount: -4.75 - (uploadIndex * 0.5), category: 'Dining' },
          { id: `${idBase}-4`, date: `2025-05-${uploadIndex * 2 + 6}`, description: 'Gas Station', amount: -45.00 - (uploadIndex * 2), category: 'Transportation' },
          { id: `${idBase}-5`, date: `2025-05-${uploadIndex * 2 + 8}`, description: 'Online Subscription', amount: -15.99, category: 'Entertainment' }
        ];
        
        setTransactions(prevTransactions => [...prevTransactions, ...newTransactions]);
        setUploadCount(prevCount => prevCount + 1);
        
        // Reset the file input to allow uploading the same file again
        event.target.value = null;
      }, 1500);
    }
  };
  
  const clearTransactions = () => {
    setTransactions([]);
    localStorage.removeItem('walletwise_transactions');
    setUploadCount(0);
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
