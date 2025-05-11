import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { transactionsApi, categoriesApi } from '../utils/api';
import './TransactionsPage.css';

function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  // Edit mode removed
  const [currentTransaction, setCurrentTransaction] = useState({
    id: null,
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    transaction_type: 'debit',
    category_id: ''
  });

  // Load transactions and categories from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch categories first
        const categoriesData = await categoriesApi.getCategories();
        setCategories(categoriesData);
        
        // Then fetch transactions
        const transactionsData = await transactionsApi.getTransactions();
        setTransactions(transactionsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('walletwise_token');
    localStorage.removeItem('walletwise_username');
    navigate('/login');
  };
  
  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await transactionsApi.uploadCsv(formData);
      
      // Update transactions list with newly uploaded transactions
      setTransactions(result);
      setSuccessMessage(`Successfully uploaded ${file.name}. ${result.length} transactions imported.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(`Failed to upload file: ${err.message}`);
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = null;
    }
  };
  
  // Toggle transaction selection
  const handleTransactionSelect = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };
  
  // Save selected transactions to user account
  const handleSaveTransactions = async () => {
    if (selectedTransactions.length === 0) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      await transactionsApi.saveToUser(selectedTransactions);
      
      // Update transactions to reflect they're now saved
      const updatedTransactions = await transactionsApi.getTransactions();
      setTransactions(updatedTransactions);
      
      // Clear selection
      setSelectedTransactions([]);
      
      setSuccessMessage(`Successfully saved ${selectedTransactions.length} transactions.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error saving transactions:', err);
      setError(`Failed to save transactions: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle category change for a transaction
  const handleCategoryChange = async (transactionId, categoryId) => {
    try {
      setError(null);
      
      // Update the transaction with the new category
      await transactionsApi.updateTransaction(transactionId, { category_id: categoryId });
      
      // Update the local state
      setTransactions(transactions.map(t => 
        t.id === transactionId ? { ...t, category_id: categoryId } : t
      ));
    } catch (err) {
      console.error('Error updating category:', err);
      setError(`Failed to update category: ${err.message}`);
    }
  };
  
  // Reset transaction form to default values
  const resetTransactionForm = () => {
    setCurrentTransaction({
      id: null,
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      transaction_type: 'debit',
      category_id: ''
    });
    setShowTransactionModal(false);
  };
  
  // No edit transaction functionality
  
  // Handle transaction deletion
  const handleDeleteTransaction = async (transactionId) => {
    try {
      setIsDeleting(true);
      setDeletingId(transactionId);
      setError(null);
      
      console.log(`Deleting transaction with ID: ${transactionId}`);
      
      // Call the API to delete the transaction
      await transactionsApi.deleteTransaction(transactionId);
      
      // Update the local state to remove the deleted transaction
      setTransactions(transactions.filter(t => t.id !== transactionId));
      setSuccessMessage('Transaction deleted successfully.');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(`Failed to delete transaction: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };
  
  // Handle transaction form submission (create only)
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsCreating(true);
      setError(null);
      
      console.log('Submitting transaction:', currentTransaction);
      
      // Validate the amount is a valid number
      const amount = parseFloat(currentTransaction.amount);
      if (isNaN(amount)) {
        throw new Error('Please enter a valid amount');
      }
      
      // Format the transaction data for submission
      const transactionData = {
        date: currentTransaction.date,
        description: currentTransaction.description,
        transaction_type: currentTransaction.transaction_type,
        category_id: currentTransaction.category_id === '' ? null : currentTransaction.category_id,
        // Convert amount to positive or negative based on transaction type
        amount: currentTransaction.transaction_type === 'debit' 
          ? -Math.abs(amount) 
          : Math.abs(amount)
      };
      
      console.log('Formatted transaction data:', transactionData);
      
      // Create new transaction
      await transactionsApi.createTransaction(transactionData);
      setSuccessMessage('Transaction created successfully.');
      
      // Close the modal
      setShowTransactionModal(false);
      
      // Refresh the transactions list
      const newTransactions = await transactionsApi.getTransactions();
      setTransactions(newTransactions);
      
      // Reset form
      resetTransactionForm();
      
      // Close modal
      setShowTransactionModal(false);
      
      // Refresh transactions
      const updatedTransactions = await transactionsApi.getTransactions();
      setTransactions(updatedTransactions);
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} transaction:`, err);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} transaction: ${err.message}`);
    } finally {
      setIsCreating(false);
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };
  
  // Handle input change for transaction form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="app">
      <Navbar onLogout={handleLogout} activePage="transactions" />
      <div className="main-content">
        <div className="transactions-container">
          <div className="transactions-header">
            <h2>Transactions</h2>
            <div className="action-buttons">
              <div className="upload-section">
                <input 
                  type="file" 
                  id="csv-upload" 
                  accept=".csv" 
                  onChange={handleFileUpload} 
                  disabled={isUploading} 
                />
                <label htmlFor="csv-upload" className={`upload-button ${isUploading ? 'disabled' : ''}`}>
                  {isUploading ? 'Uploading...' : 'Upload Transactions CSV'}
                </label>
              </div>
              <button 
                className={`save-button ${isSaving ? 'disabled' : ''}`}
                onClick={handleSaveTransactions}
                disabled={isSaving || selectedTransactions.length === 0}
              >
                {isSaving ? 'Saving...' : 'Save Selected Transactions'}
              </button>
              <button 
                className="add-button"
                onClick={() => {
                  setCurrentTransaction({
                    id: null,
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    amount: '',
                    transaction_type: 'debit',
                    category_id: ''
                  });
                  setShowTransactionModal(true);
                }}
              >
                Add Transaction
              </button>
            </div>
          </div>
          <div className="transactions-table-container">
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            {isLoading ? (
              <div className="loading">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="no-transactions">No transactions found. Upload a CSV file to get started.</div>
            ) : (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className={transaction.user_id ? 'saved-transaction' : ''}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedTransactions.includes(transaction.id)}
                          onChange={() => handleTransactionSelect(transaction.id)}
                          disabled={transaction.user_id}
                        />
                      </td>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.description}</td>
                      <td className={transaction.transaction_type === 'credit' ? 'amount-credit' : 'amount-debit'}>
                        {transaction.transaction_type === 'credit' ? '+' : '-'}
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </td>
                      <td>{transaction.transaction_type === 'credit' ? 'Income' : 'Expense'}</td>
                      <td>
                        <select 
                          value={transaction.category_id || ''} 
                          onChange={(e) => handleCategoryChange(transaction.id, e.target.value ? parseInt(e.target.value) : null)}
                        >
                          <option value="">Uncategorized</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="actions-cell">
                        {transaction.user_id && (
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting && transaction.id === deletingId ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Transaction Modal */}
          {showTransactionModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Add New Transaction</h3>
                <form onSubmit={handleTransactionSubmit}>
                  <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={currentTransaction.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={currentTransaction.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="amount">Amount</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      step="0.01"
                      value={currentTransaction.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="transaction_type">Type</label>
                    <select
                      id="transaction_type"
                      name="transaction_type"
                      value={currentTransaction.transaction_type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="debit">Expense</option>
                      <option value="credit">Income</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="category_id">Category</label>
                    <select
                      id="category_id"
                      name="category_id"
                      value={currentTransaction.category_id || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Uncategorized</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => setShowTransactionModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create Transaction'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;
