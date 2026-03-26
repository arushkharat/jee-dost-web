import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSolving, setIsSolving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Clear URL parameters after login
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

  const solveQuestion = async () => {
    if (!question) return alert("Paste a question first!");
    setIsSolving(true);
    setAnswer('');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: `Solve this JEE question step-by-step: ${question}` 
        })
      });
      
      if (!response.ok) throw new Error('Failed to get answer');
      
      const data = await response.json();
      setAnswer(data.text || "Sorry, I couldn't generate a solution.");
    } catch (error) {
      console.error(error);
      setAnswer("Error: AI is currently unavailable. Please try again later.");
    } finally {
      setIsSolving(false);
    }
  };

  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white'}}>Loading JEE-Dost...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif', padding: '20px' }}>
      
      {!user ? (
        /* LOGIN SCREEN */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>JEE-Dost</h1>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Your AI Partner for Cracking IIT-JEE</p>
          <button onClick={loginWithGoogle} style={{ padding: '15px 30px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: 'white', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="google" />
            Sign in to Start Solving
          </button>
        </div>
      ) : (
        /* ACTUAL DASHBOARD */
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <h2 style={{ margin: 0, color: '#38bdf8' }}>JEE-Dost AI</h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Logged in as: {user.email}</span>
            </div>
            <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
          </header>

          <main>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>Paste your Physics/Math/Chemistry question:</h3>
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. A ball is thrown upwards with a velocity of 20m/s..."
                style={{ width: '100%', height: '150px', borderRadius: '12px', padding: '15px', background: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '16px', marginBottom: '20px', resize: 'none' }}
              />
              <button 
                onClick={solveQuestion}
                disabled={isSolving}
                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: 'linear-gradient(to right, #38bdf8, #2563eb)', color: 'white', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', opacity: isSolving ? 0.7 : 1 }}
              >
                {isSolving ? 'AI is Thinking...' : 'Solve with AI ✨'}
              </button>
            </div>

            {answer && (
              <div style={{ marginTop: '30px', padding: '25px', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '20px', border: '1px solid #38bdf8', whiteSpace: 'pre-wrap' }}>
                <h4 style={{ marginTop: 0, color: '#38bdf8' }}>Solution:</h4>
                {answer}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
export default App;
