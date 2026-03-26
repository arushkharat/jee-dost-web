import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabase';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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
      if (session) window.history.replaceState({}, document.title, "/");
    });
    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) console.error(error.message);
  };

  const solveQuestion = async () => {
    if (!question.trim()) return alert("Pehle question toh dalo! (Paste a question first!)");
    setIsSolving(true);
    setAnswer('');
    
    try {
      const response = await genAI.models.generateContent({ 
        model: "gemini-3.1-pro-preview",
        contents: question,
        config: {
          systemInstruction: `You are JEE-Dost, a friendly and expert AI tutor for IIT-JEE aspirants. 
          Your goal is to solve Physics, Chemistry, and Math problems with a "Desi" touch.
          
          Rules for your response:
          1. Use LaTeX for all mathematical equations (wrap in $ for inline and $$ for block).
          2. Mix Hindi/Hinglish naturally in your explanation (e.g., "Sabse pehle hum formula apply karenge...", "Dhyan se dekho yahan logic kya hai...").
          3. Structure your response using Markdown:
             - ### 🧠 Concept Involved
             - ### 📝 Step-by-Step Solution
             - ### ✅ Final Answer
             - ### 💡 Samjha Kya?
               Explain the concept in very simple, easy-to-understand Hindi (Hinglish) using a unique, real-life, or funny example that makes the concept stick in the student's mind.`
        }
      });

      setAnswer(response.text || "Arre yaar, solution generate nahi ho paya. Try again?");
    } catch (error) {
      console.error(error);
      setAnswer("Error: AI thoda thak gaya hai. Please try again later.");
    } finally {
      setIsSolving(false);
    }
  };

  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white', fontFamily: 'Inter, sans-serif'}}>Loading JEE-Dost...</div>;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top right, #1e293b, #020617)', 
      color: '#f8fafc', 
      fontFamily: '"Inter", sans-serif', 
      padding: '60px 20px' 
    }}>
      
      {!user ? (
        /* PRETTIER LOGIN */
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh',
          background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)', borderRadius: '32px', 
          border: '1px solid rgba(255, 255, 255, 0.05)', maxWidth: '400px', margin: '0 auto', padding: '50px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>Taiyari Jeet Ki</div>
          <h1 style={{ fontSize: '3.5rem', margin: '0 0 15px 0', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '900', letterSpacing: '-2px' }}>JEE-Dost</h1>
          <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '40px', lineHeight: '1.6', fontSize: '15px' }}>Your AI companion that speaks your language. Crack IIT-JEE with a smile. 😊</p>
          <button onClick={loginWithGoogle} style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer', background: 'white', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: '0.3s', fontSize: '16px', boxShadow: '0 10px 20px rgba(255,255,255,0.1)' }}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="google" />
            Start Solving Now
          </button>
        </div>
      ) : (
        /* PRETTIER DASHBOARD */
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#38bdf8', margin: 0, letterSpacing: '-1px' }}>JEE-Dost <span style={{color: 'white', fontWeight: '300'}}>AI</span></h2>
              <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#64748b' }}>Logged in as <span style={{color: '#94a3b8'}}>{user.email}</span></p>
            </div>
            <button onClick={() => supabase.auth.signOut()} style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '10px 20px', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: '0.3s' }}>Logout</button>
          </header>

          <div style={{ 
            background: 'rgba(30, 41, 59, 0.4)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', 
            padding: '40px', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6)', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: '#38bdf8', filter: 'blur(100px)', opacity: '0.1' }}></div>
            
            <h3 style={{ fontSize: '1.4rem', marginBottom: '25px', fontWeight: '700' }}>Kaunsa sawal solve karein? 🤔</h3>
            <textarea 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Paste your question here... (Physics, Chemistry, or Maths)"
              style={{ width: '100%', height: '200px', borderRadius: '20px', padding: '25px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '17px', marginBottom: '25px', outline: 'none', transition: '0.3s', resize: 'none', lineHeight: '1.6' }}
            />
            <button 
              onClick={solveQuestion}
              disabled={isSolving}
              style={{ width: '100%', padding: '20px', borderRadius: '18px', border: 'none', background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)', color: 'white', fontWeight: '900', fontSize: '18px', cursor: 'pointer', boxShadow: '0 15px 25px -5px rgba(37, 99, 235, 0.4)', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              {isSolving ? 'AI Dimag Laga Raha Hai...' : 'Solve with AI ✨'}
            </button>
          </div>

          {answer && (
            <div style={{ marginTop: '50px', animation: 'fadeIn 0.5s ease-out' }}>
              <div style={{ padding: '40px', background: 'rgba(15, 23, 42, 0.9)', borderRadius: '32px', border: '1px solid rgba(56, 189, 248, 0.3)', lineHeight: '1.8', color: '#cbd5e1', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '30px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Solution</div>
                <div className="markdown-body" style={{ fontSize: '16px' }}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {answer}
                  </ReactMarkdown>
                </div>
              </div>
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .markdown-body h3 {
                  color: #38bdf8;
                  margin-top: 30px;
                  margin-bottom: 15px;
                  font-size: 1.2rem;
                  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
                  padding-bottom: 8px;
                }
                .markdown-body p {
                  margin-bottom: 15px;
                }
                .markdown-body strong {
                  color: #818cf8;
                }
              `}</style>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default App;
