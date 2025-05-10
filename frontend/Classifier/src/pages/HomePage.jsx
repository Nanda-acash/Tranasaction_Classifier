import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WelcomeSection from '../components/WelcomeSection';

function HomePage() {
  const navigate = useNavigate();
  const username = localStorage.getItem('walletwise_user') || 'User';
  
  const handleLogout = () => {
    localStorage.removeItem('walletwise_user');
    navigate('/login');
  };
  
  return (
    <div className="app">
      <Navbar onLogout={handleLogout} />
      <div className="main-content">
        <WelcomeSection />
      </div>
    </div>
  );
}

export default HomePage;
