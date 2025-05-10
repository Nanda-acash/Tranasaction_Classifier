import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function DashboardPage() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('walletwise_user');
    navigate('/login');
  };
  
  return (
    <div className="app">
      <Navbar onLogout={handleLogout} activePage="dashboard" />
      <div className="main-content">
        <div className="dashboard-container">
          <h1>Dashboard</h1>
          <div className="dashboard-placeholder">
            <p>Dashboard content will be added here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
