import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('http://localhost:4000/api/me', {
          method: 'GET',
          credentials: 'include'
        });

        if (res.status === 401) {
          navigate('/', { replace: true });
          return;
        }

        const data = await res.json();
        setName(data.name);
      } catch (err) {
        console.error(err);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [navigate]);

  if (loading) return null;
  if (!name) return null;

  return (
    <div className="login-card welcome" role="main">
      <h2>Welcome {name}!</h2>
      <p className="small">If you delete your session cookie or it expires, you will be returned to the login page.</p>

      <div style={{ marginTop: 10 }}>
        <button onClick={async () => {
          await fetch('http://localhost:4000/api/logout', {
            method: 'POST',
            credentials: 'include'
          });
          navigate('/', { replace: true });
        }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
