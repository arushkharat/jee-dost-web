import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if someone is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for login/logout changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) alert(error.message);
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading JEE-Dost...</div>;

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{color: '#2c3e50'}}>🚀 JEE-Dost AI</h1>
      <p>Solve JEE questions in seconds.</p>
      
      {!user ? (
        <div style={{marginTop: '40px'}}>
          <button 
            onClick={loginWithGoogle} 
            style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer', background: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
          >
            Sign in with Google to Start
          </button>
        </div>
      ) : (
        <div style={{marginTop: '40px', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'inline-block'}}>
          <h3>Welcome, {user.email}</h3>
          <p style={{color: '#27ae60', fontWeight: 'bold'}}>Status: Account Active ✅</p>
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{marginTop: '20px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', textDecoration: 'underline'}}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
export default App;
