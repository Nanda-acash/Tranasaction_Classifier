// API service for interacting with the backend
const API_BASE_URL = 'http://localhost:8009/api';

// Authentication API
export const authApi = {
  // Register a new user
  signup: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to register');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  },
  
  // Login user
  login: async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to login');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }
};

// Transactions API
export const transactionsApi = {
  // Get all transactions with optional filtering
  getTransactions: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.category_id) queryParams.append('category_id', filters.category_id);
    if (filters.start_date) queryParams.append('start_date', filters.start_date);
    if (filters.end_date) queryParams.append('end_date', filters.end_date);
    if (filters.skip) queryParams.append('skip', filters.skip);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    try {
      // Get the authentication token
      const token = localStorage.getItem('walletwise_token');
      
      const response = await fetch(`${API_BASE_URL}/transactions${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch transactions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },
  
  // Create a new transaction
  createTransaction: async (transactionData) => {
    try {
      // Get the authentication token
      const token = localStorage.getItem('walletwise_token');
      
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create transaction');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },
  
  // Delete a transaction
  deleteTransaction: async (id) => {
    try {
      // Get the authentication token
      const token = localStorage.getItem('walletwise_token');
      
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete transaction');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },
  
  // Upload CSV file
  uploadCsv: async (formData) => {
    try {
      // Get the authentication token
      const token = localStorage.getItem('walletwise_token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await fetch(`${API_BASE_URL}/transactions/upload-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData // FormData object containing the file
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to upload CSV';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError);
          // Use status text if JSON parsing fails
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      try {
        return await response.json();
      } catch (jsonError) {
        console.error('Error parsing success response:', jsonError);
        // If we can't parse the response as JSON, return an empty array
        // This prevents the UI from breaking
        return [];
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      throw error;
    }
  },
  
  // Get transaction summary by category
  getSummaryByCategory: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.start_date) queryParams.append('start_date', filters.start_date);
    if (filters.end_date) queryParams.append('end_date', filters.end_date);
    if (filters.transaction_type) queryParams.append('transaction_type', filters.transaction_type);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    try {
      // Get the authentication token
      const token = localStorage.getItem('walletwise_token');
      
      const response = await fetch(`${API_BASE_URL}/transactions/summary/by-category${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch transaction summary');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      throw error;
    }
  },
  
  // Save transactions to the current user
  saveToUser: async (transactionIds) => {
    try {
      // Get the authentication token
      const token = localStorage.getItem('walletwise_token');
      
      const response = await fetch(`${API_BASE_URL}/transactions/save-to-user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionIds)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save transactions to user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving transactions to user:', error);
      throw error;
    }
  },
  
  // Get monthly spending summary
  getMonthlySummary: async (year, month = null) => {
    try {
      // Get the authentication token
      const token = localStorage.getItem('walletwise_token');
      
      const queryParams = new URLSearchParams();
      queryParams.append('year', year);
      if (month) queryParams.append('month', month);
      
      const response = await fetch(`${API_BASE_URL}/transactions/summary/monthly?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch monthly summary');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      throw error;
    }
  }
};

// Categories API
export const categoriesApi = {
  // Get all categories
  getCategories: async () => {
    try {
      // Get the authentication token
      const token = localStorage.getItem('walletwise_token');
      
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch categories');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  // Create a new category
  createCategory: async (categoryData) => {
    try {
      // Get the authentication token
      const token = localStorage.getItem('walletwise_token');
      
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create category');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },
  
  // Update a category
  updateCategory: async (id, categoryData) => {
    try {
      // Get the authentication token
      const token = localStorage.getItem('walletwise_token');
      
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update category');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },
  
  // Delete a category
  deleteCategory: async (id) => {
    try {
      // Get the authentication token
      const token = localStorage.getItem('walletwise_token');
      
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete category');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

// Categorization API
export const categorizationApi = {
  // Auto-categorize all uncategorized transactions
  autoCategorize: async () => {
    try {
      // Get the authentication token
      const token = localStorage.getItem('walletwise_token');
      
      const response = await fetch(`${API_BASE_URL}/categorization/auto-categorize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to auto-categorize transactions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error auto-categorizing transactions:', error);
      throw error;
    }
  }
};
