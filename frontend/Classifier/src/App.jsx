import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import TransactionsPage from './pages/TransactionsPage';
import DashboardPage from './pages/DashboardPage';
import { RequireAuth } from './utils/auth';
import { ThemeProvider } from './utils/ThemeContext';
import './App.css';

// Main App component with routing
function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          } />
          <Route path="/transactions" element={
            <RequireAuth>
              <TransactionsPage />
            </RequireAuth>
          } />
          <Route path="/dashboard" element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
