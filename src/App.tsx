import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for the login "Handshake"
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // This part clears that long ugly URL after you're logged in
      if (session) window.history.replaceState({}, document.title, "/");
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) alert(error.message);
  };

  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white'}}>Loading JEE-Dost...</div>;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
      fontFamily: '"Inter", sans-serif', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: '#f8fafc'
    }}>
      {/* Glow Effect Background */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#38bdf8', filter: 'blur(150px)', opacity: '0.15', top: '10%', left: '20%', zIndex: 0 }}></div>

      <div style={{ 
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.05)', 
        backdropFilter: 'blur(10px)', 
        padding: '40px', 
        borderRadius: '24px', 
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
          JEE-Dost
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Your AI partner for Cracking IIT-JEE</p>
        
        {!user ? (
          <div>
            <button 
              onClick={loginWithGoogle} 
              style={{ 
                width: '100%',
                padding: '14px', 
                fontSize: '16px', 
                cursor: 'pointer', 
                background: 'white', 
                color: '#1e293b', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0px)')}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="google" />
              Continue with Google
            </button>
            <p style={{ marginTop: '20px', fontSize: '12px', color: '#64748b' }}>Secure login via Supabase Auth</p>
          </div>
        ) : (
          <div>
            <div style={{ padding: '20px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: '#38bdf8', margin: 0 }}>Welcome back,</p>
              <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '5px 0' }}>{user.email.split('@')[0]}</p>
            </div>
            
            <button 
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: 'linear-gradient(to right, #38bdf8, #2563eb)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: 'bold', 
                cursor: 'pointer' 
              }}
            >
              Go to Dashboard
            </button>
            
            <button 
              onClick={() => supabase.auth.signOut()}
              style={{ marginTop: '15px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
      
      <p style={{ marginTop: '30px', color: '#475569', fontSize: '14px' }}>Build with ❤️ for Future IITians</p>
    </div>
  );
}
export default App;
