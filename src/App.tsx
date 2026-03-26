import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './services/supabase';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  Camera, 
  Send, 
  Sparkles, 
  BrainCircuit, 
  History, 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  Zap, 
  BookOpen, 
  Calculator, 
  FlaskConical,
  X,
  Flame,
  Menu,
  User,
  ChevronRight,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini
const getApiKey = () => {
  try {
    return (window as any).process?.env?.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  } catch {
    return '';
  }
};

const genAI = new GoogleGenAI({ apiKey: getApiKey() });

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const solveQuestion = async () => {
    if (!question.trim() && !imageFile) return;
    setIsSolving(true);
    setAnswer('');
    
    try {
      let contents: any = [];
      
      if (question.trim()) {
        contents.push({ text: question });
      }

      if (imageFile) {
        const base64Data = selectedImage?.split(',')[1];
        if (base64Data) {
          contents.push({
            inlineData: {
              data: base64Data,
              mimeType: imageFile.type,
            },
          });
        }
      }

      const response = await genAI.models.generateContent({ 
        model: "gemini-3.1-pro-preview",
        contents: { parts: contents },
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
               Explain the concept in very simple, easy-to-understand Hindi (Hinglish) using a unique, real-life, or funny example that makes the concept stick in the student's mind. This section should be very friendly and encouraging.`
        }
      });

      setAnswer(response.text || "Arre yaar, solution generate nahi ho paya. Try again?");
      
      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error(error);
      setAnswer("### ⚠️ Error\nAI thoda thak gaya hai. Please try again later.");
    } finally {
      setIsSolving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-500/20 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-xl flex flex-col items-center justify-center"
        >
          <div className="glass-card w-full p-8 sm:p-16 rounded-[48px] border border-white/10 shadow-[0_0_80px_rgba(37,99,235,0.15)] text-center flex flex-col items-center justify-center">
            <motion.div 
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] flex items-center justify-center mb-10 shadow-2xl shadow-blue-500/40"
            >
              <BrainCircuit className="w-14 h-14 text-white" />
            </motion.div>
            
            <div className="space-y-2 mb-10">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm font-black text-blue-400 uppercase tracking-[6px]"
              >
                Taiyari Jeet Ki
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-6xl sm:text-7xl font-black text-white tracking-tighter leading-none"
              >
                JEE-Dost
              </motion.h1>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-slate-400 mb-12 leading-relaxed text-xl max-w-md mx-auto"
            >
              Your AI companion that speaks your language. Crack IIT-JEE with a smile. 😊
            </motion.p>

            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={loginWithGoogle}
              className="w-full py-6 bg-white text-slate-950 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-white/10 group"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="28" alt="google" />
              Start Solving Now
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-slate-500"
            >
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 size={14} className="text-blue-500" />
                Expert AI
              </div>
              <div className="w-1 h-1 bg-slate-800 rounded-full hidden sm:block"></div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 size={14} className="text-blue-500" />
                Desi Style
              </div>
              <div className="w-1 h-1 bg-slate-800 rounded-full hidden sm:block"></div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 size={14} className="text-blue-500" />
                Free Access
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#020617] text-slate-200 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-[#020617] border-r border-white/5 flex flex-col z-30 relative"
      >
        <div className="p-6 flex items-center gap-4 overflow-hidden">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-black text-white tracking-tighter whitespace-nowrap"
              >
                JEE-Dost
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={!sidebarOpen} />
          <SidebarItem icon={<History size={20} />} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} collapsed={!sidebarOpen} />
          <SidebarItem icon={<Flame size={20} />} label="Streaks" active={activeTab === 'streaks'} onClick={() => setActiveTab('streaks')} collapsed={!sidebarOpen} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} collapsed={!sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-4 p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full"></div>
        </div>

        {/* Processing Overlay */}
        <AnimatePresence>
          {isSolving && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            >
              <div className="text-center space-y-8 p-10">
                <div className="relative w-32 h-32 mx-auto">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-blue-500/20 rounded-[40px]"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border-4 border-indigo-500/40 rounded-[32px]"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <BrainCircuit className="w-12 h-12 text-blue-400" />
                  </motion.div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-white tracking-tight">JEE-Dost is thinking...</h3>
                  <p className="text-blue-400 font-black uppercase tracking-[4px] text-xs animate-pulse">
                    Sabr rakho, solution aa raha hai!
                  </p>
                </div>

                <div className="flex gap-2 justify-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      className="w-3 h-3 bg-blue-500 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 z-20 border-b border-white/5 backdrop-blur-md bg-black/10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-white hidden sm:block">Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{user.email?.split('@')[0]}</p>
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">IIT-JEE Aspirant</p>
            </div>
            <div className="w-10 h-10 bg-slate-800 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
              <User className="w-6 h-6 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 z-10">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Hero Section */}
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Kaunsa sawal solve karein? 🤔</h1>
              <p className="text-slate-400 text-lg">Paste your question or upload a photo. JEE-Dost is ready!</p>
            </div>

            {/* Input Card */}
            <div className="glass-card rounded-[40px] p-8 border border-white/10 shadow-2xl relative">
              <div className="relative mb-6">
                <textarea 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  className="w-full h-48 bg-slate-900/40 rounded-3xl p-6 text-white text-lg border border-white/5 focus:border-blue-500/50 focus:ring-0 outline-none transition-all resize-none placeholder:text-slate-600 leading-relaxed"
                />
                
                {/* Image Preview */}
                <AnimatePresence>
                  {selectedImage && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute bottom-4 left-4"
                    >
                      <div className="relative group">
                        <img src={selectedImage} alt="preview" className="w-24 h-24 object-cover rounded-2xl border-2 border-blue-500 shadow-xl" />
                        <button 
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-2xl transition-all font-bold text-sm border border-white/5"
                  >
                    <Camera size={18} />
                    Upload Photo
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  
                  <div className="hidden sm:flex gap-2">
                    <Tag icon={<Calculator size={14} />} label="Math" color="blue" />
                    <Tag icon={<FlaskConical size={14} />} label="Chem" color="purple" />
                    <Tag icon={<Zap size={14} />} label="Phys" color="orange" />
                  </div>
                </div>

                <button 
                  onClick={solveQuestion}
                  disabled={isSolving || (!question.trim() && !imageFile)}
                  className={`
                    px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-3 transition-all
                    ${isSolving || (!question.trim() && !imageFile)
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:scale-105 hover:shadow-xl hover:shadow-blue-600/20 active:scale-95'}
                  `}
                >
                  {isSolving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Solving...
                    </>
                  ) : (
                    <>
                      Solve Now
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            <AnimatePresence>
              {answer && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  ref={resultRef}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-[40px] border border-blue-500/20 overflow-hidden shadow-2xl">
                    <div className="bg-blue-500/10 p-6 border-b border-blue-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Sparkles size={18} className="text-white" />
                        </div>
                        <span className="font-black text-blue-400 uppercase tracking-[2px] text-xs">AI Solution</span>
                      </div>
                      <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                      >
                        {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy Markdown'}
                      </button>
                    </div>
                    
                    <div className="p-10 markdown-body prose prose-invert prose-blue max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                      >
                        {answer}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State Features */}
            {!answer && !isSolving && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureBox icon={<BookOpen size={24} />} title="Step-by-Step" desc="Detailed derivations and logical flows for every problem." color="blue" />
                <FeatureBox icon={<Calculator size={24} />} title="Math Precision" desc="High-end LaTeX formatting for complex equations." color="purple" />
                <FeatureBox icon={<FlaskConical size={24} />} title="Chem Reactions" desc="Balanced equations and mechanism explanations." color="orange" />
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .glass-card {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(24px);
        }
        .glow-purple {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .markdown-body h3 {
          color: #38bdf8;
          margin-top: 40px;
          margin-bottom: 20px;
          font-size: 1.5rem;
          font-weight: 900;
          border-bottom: 1px solid rgba(56, 189, 248, 0.2);
          padding-bottom: 10px;
          letter-spacing: -0.5px;
        }
        .markdown-body p {
          margin-bottom: 20px;
          line-height: 1.8;
          color: #cbd5e1;
          font-size: 1.05rem;
        }
        .markdown-body strong {
          color: #818cf8;
          font-weight: 800;
        }
        .markdown-body ul {
          list-style-type: disc;
          padding-left: 20px;
          margin-bottom: 20px;
        }
        .markdown-body li {
          margin-bottom: 12px;
        }
        /* Style for Samjha Kya section specifically */
        .markdown-body h3:last-of-type {
          color: #fbbf24;
          border-color: rgba(251, 191, 36, 0.2);
        }
      `}</style>
    </div>
  );
}

const SidebarItem = ({ icon, label, active, onClick, collapsed }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 font-bold text-sm ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-slate-500 hover:text-white hover:bg-white/5'
    } ${collapsed ? 'justify-center' : ''}`}
  >
    {icon}
    {!collapsed && <span>{label}</span>}
  </button>
);

const Tag = ({ icon, label, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${colors[color]}`}>
      {icon}
      {label}
    </div>
  );
};

const FeatureBox = ({ icon, title, desc, color }: any) => {
  const colors: any = {
    blue: 'text-blue-400 bg-blue-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
  };
  return (
    <div className="glass-card p-8 rounded-[32px] border border-white/5 hover:border-white/10 transition-all group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${colors[color]}`}>
        {icon}
      </div>
      <h4 className="text-white font-black text-lg mb-2 tracking-tight">{title}</h4>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

export default App;
