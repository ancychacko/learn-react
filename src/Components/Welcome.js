import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Welcome() {
  const location = useLocation();
  const navigate = useNavigate();

  
  const nameState = location.state && location.state.name;
  const nameSession = sessionStorage.getItem('authName');
  const name = nameState || nameSession;

  useEffect(() => {
    if (!name) {
      
      navigate('/', { replace: true });
    }
    
  }, [name, navigate]);

  if (!name) {
    
    return null;
  }

  return (
    <div className="login-card welcome" role="main">
      <h2>Welcome {name}!</h2>  
      <p className="small">Refresh Me!</p>

      <div style={{ marginTop: 10 }}>
        <button onClick={() => {
          // Sign out: clear session storage value and return to login.
          sessionStorage.removeItem('authName');
          navigate('/', { replace: true });
        }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
