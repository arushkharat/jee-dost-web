import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSolve = async () => {
    if (!question) return alert("Please paste a JEE question first!");
    setLoading(true);
    
    // In a real app, you'd call an Edge Function here. 
    // For now, let's simulate the AI thinking:
    setTimeout(() => {
      setSolution("Step 1: Identify the formula... \nStep 2: Substitute values... \nFinal Answer: Option (C)");
      setLoading(false);
    }, 2000);
  };

  const loginWithGoogle = () => supabase.auth.signInWithOAuth({ 
    provider: 'google', 
    options: { redirectTo: window.location.origin } 
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '600px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ textAlign: 'center', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>JEE-Dost AI</h1>
        
        {!user ? (
          <button onClick={loginWithGoogle} style={{ width: '100%', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Sign in with Google</button>
        ) : (
          <div>
            <p style={{ color: '#94a3b8' }}>Logged in as: {user.email}</p>
            <textarea 
              placeholder="Paste your Physics, Chemistry, or Math question here..."
              value={question}
              onChange={(e) => setQuestion(e.currentTarget.value)}
              style={{ width: '100%', height: '150px', borderRadius: '12px', padding: '15px', background: '#1e293b', color: 'white', border: '1px solid #334155', marginTop: '20px' }}
            />
            <button 
              onClick={handleSolve}
              disabled={loading}
              style={{ width: '100%', padding: '15px', marginTop: '15px', borderRadius: '12px', background: '#38bdf8', color: '#0f172a', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              {loading ? "AI is solving..." : "Solve Question"}
            </button>

            {solution && (
              <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', border: '1px solid #38bdf8' }}>
                <h4 style={{ color: '#38bdf8', margin: '0 0 10px 0' }}>Solution:</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{solution}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default App;
