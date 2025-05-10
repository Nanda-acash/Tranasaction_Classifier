import { useState, useEffect } from 'react';

function WelcomeSection() {
  const [status, setStatus] = useState('');

  useEffect(() => {
    let timer;
    if (status) {
      timer = setTimeout(() => {
        setStatus('');
      }, 2000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status]);

  const handleCheckStatus = () => {
    setStatus('Dev in progress');
  };

  return (
    <div className="container">
      <h1>Welcome to WalletWise</h1>
      <button onClick={handleCheckStatus} className="check-status-btn">Check Status</button>
      {status && <div className="status">{status}</div>}
    </div>
  );
}

export default WelcomeSection;
