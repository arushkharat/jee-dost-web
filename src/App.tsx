import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Camera, Loader2, Sparkles, ChevronRight, 
  RefreshCcw, BookOpen, Lightbulb, CheckCircle2, 
  History, Trash2, Share2, Copy, Check, Info,
  BrainCircuit, Zap, Target, Send
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { solveQuestion, solveFollowUp } from './services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SavedSolution {
  id: string;
  image: string;
  solution: string;
  subject: string;
  timestamp: number;
}

const SUBJECTS = [
  { id: 'Physics', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'Math', icon: BrainCircuit, icon2: Target, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
  { id: 'Chemistry', icon: Sparkles, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
  { id: 'General', icon: Info, color: 'text-slate-400', bg: 'bg-slate-400/10' },
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState('General');
  const [history, setHistory] = useState<SavedSolution[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [quote, setQuote] = useState('');
  const [showWeightage, setShowWeightage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const QUOTES = [
    "The only way to learn mathematics is to do mathematics. - Paul Halmos",
    "Success is the sum of small efforts, repeated day in and day out. - Robert Collier",
    "Believe in yourself and all that you are. - Christian D. Larson",
    "Don't let what you cannot do interfere with what you can do. - John Wooden",
    "The expert in anything was once a beginner. - Helen Hayes",
    "Padhai karo, baaki sab moh maya hai!",
    "IIT is not just a college, it's a dream.",
    "Consistency is the key to JEE success.",
    "Hard work beats talent when talent doesn't work hard.",
    "Your future is created by what you do today, not tomorrow."
  ];

  const WEIGHTAGE = {
    Physics: [
      { topic: "Mechanics", weight: "20%" },
      { topic: "Electrodynamics", weight: "20%" },
      { topic: "Modern Physics", weight: "15%" },
      { topic: "Heat & Thermo", weight: "10%" },
      { topic: "Optics", weight: "10%" }
    ],
    Chemistry: [
      { topic: "Organic Chemistry", weight: "35%" },
      { topic: "Inorganic Chemistry", weight: "30%" },
      { topic: "Physical Chemistry", weight: "35%" }
    ],
    Math: [
      { topic: "Calculus", weight: "25%" },
      { topic: "Algebra", weight: "25%" },
      { topic: "Coordinate Geometry", weight: "15%" },
      { topic: "Vectors & 3D", weight: "15%" },
      { topic: "Trigonometry", weight: "10%" }
    ],
    General: [
      { topic: "Physics", weight: "33%" },
      { topic: "Chemistry", weight: "33%" },
      { topic: "Math", weight: "34%" }
    ]
  };

  const QUICK_START = {
    Physics: ["Rotational Dynamics", "EMI & AC", "Modern Physics", "Projectile Motion"],
    Chemistry: ["Organic Mechanisms", "Chemical Bonding", "Thermodynamics", "Periodic Trends"],
    Math: ["Calculus Integration", "Probability", "Vectors & 3D", "Complex Numbers"],
    General: ["Time Management", "Best JEE Books", "Exam Strategy", "Formula Revision"]
  };

  const [liveAspirants, setLiveAspirants] = useState(1240);

  // Load history from localStorage
  useEffect(() => {
    // Simulate live aspirants
    const interval = setInterval(() => {
      setLiveAspirants(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const saved = localStorage.getItem('jee_dost_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    return () => clearInterval(interval);
  }, []);

  // Save history to localStorage
  const saveToHistory = (newSolution: string, img: string | null, sub: string) => {
    const entry: SavedSolution = {
      id: Date.now().toString(),
      image: img || '',
      solution: newSolution,
      subject: sub,
      timestamp: Date.now(),
    };
    const updated = [entry, ...history].slice(0, 10); // Keep last 10
    setHistory(updated);
    localStorage.setItem('jee_dost_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('jee_dost_history');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setSolution(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!image && !textQuery.trim()) {
      setError("Please upload an image or type a question.");
      return;
    }
    setLoading(true);
    setError(null);
    setFollowUpQuery('');
    try {
      const mimeType = image ? image.split(';')[0].split(':')[1] : null;
      let streamedText = "";
      const result = await solveQuestion(image, mimeType, textQuery, subject, false, (chunk) => {
        streamedText += chunk;
        setSolution(streamedText);
      });
      if (result) {
        saveToHistory(result, image, subject);
      } else {
        setError("I couldn't generate a solution. Please try a clearer photo or question.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (solution) {
      navigator.clipboard.writeText(solution);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFollowUp = async () => {
    if (!followUpQuery.trim() || !solution) return;
    
    setFollowUpLoading(true);
    try {
      let streamedText = "";
      const currentSolution = solution;
      const result = await solveFollowUp(textQuery || "Image Question", currentSolution, followUpQuery, subject, (chunk) => {
        streamedText += chunk;
        setSolution(`${currentSolution}\n\n---\n\n${streamedText}`);
        
        // Scroll to bottom of solution content
        const content = document.querySelector('.solution-content');
        if (content) {
          content.scrollTo({ top: content.scrollHeight, behavior: 'smooth' });
        }
      });
      if (result) {
        setFollowUpQuery('');
      }
    } catch (err) {
      console.error(err);
      setError("Failed to clear doubt. Try again!");
    } finally {
      setFollowUpLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setTextQuery('');
    setSolution(null);
    setError(null);
  };

  const loadFromHistory = (item: SavedSolution) => {
    setImage(item.image || null);
    setSolution(item.solution);
    setSubject(item.subject);
    setShowHistory(false);
    setError(null);
  };

  return (
    <div className="h-screen w-screen tech-grid p-1 md:p-2 flex flex-col items-center overflow-hidden">
      {/* Background Glows */}
      <div className={cn(
        "fixed top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000",
        subject === 'Physics' ? "bg-blue-400/10" : 
        subject === 'Math' ? "bg-brand-purple/10" : 
        subject === 'Chemistry' ? "bg-brand-teal/10" : "bg-brand-purple/10"
      )} />
      <div className={cn(
        "fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000",
        subject === 'Physics' ? "bg-blue-600/10" : 
        subject === 'Math' ? "bg-brand-purple/10" : 
        subject === 'Chemistry' ? "bg-brand-teal/10" : "bg-brand-teal/10"
      )} />

      {/* Navigation / Top Bar */}
      <nav className="w-full max-w-[98%] flex justify-between items-center mb-2 z-10 shrink-0 py-2">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={reset}>
          <div className="p-1.5 bg-brand-purple rounded-lg shadow-lg shadow-brand-purple/20 group-hover:scale-110 transition-transform">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tighter text-white">JEE Dost</h1>
            <p className="text-[8px] text-brand-teal font-bold uppercase tracking-widest leading-none">AI Mentor</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Live Aspirants Counter */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 glass-card rounded-full border border-brand-teal/20 animate-pulse-soft shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-xs font-black text-white tabular-nums tracking-tight">
              {liveAspirants.toLocaleString()} Aspirants Online
            </span>
          </div>

          <div className="hidden md:flex flex-col items-end">
            <p className="text-[10px] text-slate-400 italic font-medium max-w-[300px] text-right leading-tight">
              "{quote}"
            </p>
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-brand-teal/30 mt-1" />
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 glass-card rounded-lg hover:bg-white/10 transition-colors relative border border-white/5"
          >
            <History className="w-4 h-4 text-slate-300" />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-purple text-[9px] flex items-center justify-center rounded-full font-bold shadow-lg">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Motivational Thought */}
      <div className="w-full max-w-[98%] bg-white/5 backdrop-blur-sm border-y border-white/5 py-2 mb-2 shrink-0 flex items-center justify-center">
        <p className="text-[11px] font-medium text-slate-300 italic text-center px-4">
          "Success is the sum of small efforts, repeated day in and day out. Keep pushing, Aspirant!"
        </p>
      </div>

      <main className="w-full max-w-[98%] flex-1 min-h-0 flex flex-col md:flex-row gap-2 z-10 overflow-hidden">
        {/* Left Column: Input/History */}
        <div className={cn(
          "flex flex-col gap-4 transition-all duration-500",
          solution ? "w-full md:w-[6%]" : "w-full max-w-xl mx-auto"
        )}>
          {/* Subject Selector */}
          {!solution && !loading && !showHistory && (
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-wrap justify-center gap-1.5 shrink-0"
            >
              {SUBJECTS.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSubject(sub.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-sm",
                    subject === sub.id 
                      ? "bg-white text-slate-900 border-white glow-purple scale-105" 
                      : "glass-card text-slate-400 border-white/10 hover:border-white/30 hover:scale-105"
                  )}
                >
                  <sub.icon className={cn("w-3 h-3", subject === sub.id ? "text-slate-900" : sub.color)} />
                  {sub.id}
                </button>
              ))}
            </motion.div>
          )}

          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {showHistory ? (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card rounded-2xl p-4 flex flex-col h-full overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-3 shrink-0">
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <History className="w-3.5 h-3.5 text-brand-purple" />
                      Recent
                    </h2>
                    {history.length > 0 && (
                      <button onClick={clearHistory} className="text-[9px] text-red-400 hover:text-red-300 flex items-center gap-1">
                        <Trash2 className="w-2.5 h-2.5" /> Clear
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                    {history.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        <p>No history yet.</p>
                      </div>
                    ) : (
                      history.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => loadFromHistory(item)}
                          className="glass-card glass-card-hover p-2 rounded-lg flex items-center gap-2.5 cursor-pointer group"
                        >
                          {item.image ? (
                            <img src={item.image} className="w-8 h-8 rounded-md object-cover bg-slate-800" />
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-slate-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-200 truncate">{item.subject} Problem</p>
                            <p className="text-[8px] text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                          </div>
                          <ChevronRight className="w-2.5 h-2.5 text-slate-600 group-hover:text-brand-purple transition-colors" />
                        </div>
                      ))
                    )}
                  </div>
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="w-full py-2 mt-3 text-[10px] text-slate-400 hover:text-white transition-colors border-t border-white/5"
                  >
                    Back to Solver
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="solver"
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.98, opacity: 0 }}
                  className="flex flex-col h-full gap-3"
                >
                  {!solution && !loading && (
                    <div className="flex flex-col h-full gap-3">
                      {/* Image Upload Area */}
                      {!image ? (
                        <div
                          className="glass-card rounded-2xl p-4 text-center border-white/5 hover:border-brand-purple/30 transition-all cursor-pointer group relative overflow-hidden flex-1 flex flex-col items-center justify-center"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                            <Upload className="text-brand-purple w-5 h-5 animate-float" />
                          </div>
                          <h2 className="text-sm font-bold mb-0.5 text-white">Upload Image</h2>
                          <p className="text-slate-400 text-[9px] max-w-[150px] leading-tight">
                            Snap a photo of your question.
                          </p>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>
                      ) : (
                        <div className="glass-card rounded-xl overflow-hidden relative group shadow-lg flex-1 min-h-0">
                          <img src={image} alt="Question" className="w-full h-full object-contain bg-slate-900/80" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <button 
                              onClick={() => setImage(null)}
                              className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 hover:bg-red-500 text-white rounded-md backdrop-blur-md transition-all text-[10px] font-bold"
                            >
                              <RefreshCcw className="w-2.5 h-2.5" /> Remove
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Text Input Area */}
                      <div className="glass-card rounded-xl p-4 space-y-2 shrink-0 border border-white/5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-500 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <BookOpen className="w-3.5 h-3.5 text-brand-teal" />
                            Problem Analysis
                          </label>
                          <button 
                            onClick={() => setShowWeightage(!showWeightage)}
                            className="text-[10px] font-bold text-brand-teal hover:text-white transition-all flex items-center gap-1.5 bg-brand-teal/10 px-3 py-1 rounded-full border border-brand-teal/20 hover:bg-brand-teal/20 active:scale-95"
                          >
                            <Target className="w-3 h-3" />
                            Weightage
                          </button>
                        </div>

                        {showWeightage && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="bg-slate-900/50 rounded-lg p-2 overflow-hidden"
                          >
                            <h3 className="text-[9px] font-bold text-slate-300 mb-1.5 border-b border-white/5 pb-1 uppercase">JEE {subject} Weightage</h3>
                            <div className="space-y-1">
                              {(WEIGHTAGE[subject as keyof typeof WEIGHTAGE] || WEIGHTAGE.General).map((item, idx) => (
                                <div key={idx} className="flex justify-between text-[9px]">
                                  <span className="text-slate-400">{item.topic}</span>
                                  <span className="text-brand-teal font-bold">{item.weight}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        <textarea
                          value={textQuery}
                          onChange={(e) => setTextQuery(e.target.value)}
                          placeholder="Describe your doubt or paste the problem statement here. Aapki preparation se juda koi bhi sawal poochlo..."
                          className="w-full bg-slate-900/30 border border-white/5 rounded-lg p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-purple/50 transition-colors resize-none h-32 leading-relaxed"
                        />
                      </div>

                      <button 
                        onClick={handleSolve}
                        className="w-full bg-gradient-to-r from-brand-purple to-brand-teal text-white py-3.5 rounded-xl font-black text-sm shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-tighter shrink-0"
                      >
                        Analyze & Solve
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {solution && (
                    <div className="hidden md:flex flex-col h-full gap-3">
                      {image && (
                        <div className="glass-card rounded-xl overflow-hidden relative group shadow-xl flex-1 min-h-0">
                          <img src={image} alt="Question" className="w-full h-full object-contain bg-slate-900/80" />
                        </div>
                      )}
                      <button 
                        onClick={reset}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-wider shrink-0"
                      >
                        <RefreshCcw className="w-3 h-3" />
                        New Question
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Solution/Loading */}
        <div className={cn(
          "flex-1 min-h-0 overflow-hidden flex flex-col",
          !solution && !loading ? "hidden md:flex" : "flex"
        )}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-card rounded-xl flex-1 flex flex-col items-center justify-center space-y-4 text-center p-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-teal/20 blur-2xl animate-pulse rounded-full" />
                  <Loader2 className="w-10 h-10 text-brand-teal animate-spin relative z-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-black text-white tracking-tight">Processing...</p>
                  <p className="text-slate-400 text-xs animate-pulse">Consulting the JEE Archives</p>
                </div>
              </motion.div>
            ) : solution ? (
              <motion.div
                key="solution"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-xl flex-1 flex flex-col overflow-hidden shadow-2xl"
              >
                <div className="bg-gradient-to-r from-brand-purple/20 to-brand-teal/20 p-2 border-b border-white/5 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-brand-teal rounded-lg flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="text-white w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white leading-none">Solution</h2>
                      <p className="text-[8px] text-brand-teal font-bold uppercase mt-0.5">Verified</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCopy}
                      className="p-1.5 glass-card rounded-lg hover:bg-white/10 transition-colors text-slate-300"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button className="p-1.5 glass-card rounded-lg hover:bg-white/10 transition-colors text-slate-300">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-6 solution-content custom-scrollbar">
                  <div className="prose prose-invert max-w-none 
                    prose-h1:text-xl prose-h1:font-black prose-h1:mb-4 prose-h1:text-white
                    prose-h2:text-base prose-h2:font-bold prose-h2:mt-4 prose-h2:mb-2 prose-h2:text-brand-teal prose-h2:flex prose-h2:items-center prose-h2:gap-2
                    prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-sm
                    prose-strong:text-white prose-strong:font-bold
                    prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-brand-purple
                    prose-ul:space-y-2 prose-li:text-slate-300
                    prose-blockquote:border-l-4 prose-blockquote:border-brand-purple prose-blockquote:bg-brand-purple/5 prose-blockquote:p-3 prose-blockquote:rounded-r-xl
                    [&_h2:last-of-type]:text-brand-teal [&_h2:last-of-type]:text-lg [&_h2:last-of-type]:mt-10 [&_h2:last-of-type]:p-4 [&_h2:last-of-type]:bg-brand-teal/5 [&_h2:last-of-type]:border [&_h2:last-of-type]:border-brand-teal/20 [&_h2:last-of-type]:rounded-xl [&_h2:last-of-type]:shadow-[0_0_20px_rgba(45,212,191,0.1)] [&_h2:last-of-type]:relative
                    [&_h2:last-of-type]:after:content-['PRO_TIP'] [&_h2:last-of-type]:after:absolute [&_h2:last-of-type]:after:-top-2 [&_h2:last-of-type]:after:right-4 [&_h2:last-of-type]:after:bg-brand-teal [&_h2:last-of-type]:after:text-white [&_h2:last-of-type]:after:text-[8px] [&_h2:last-of-type]:after:px-2 [&_h2:last-of-type]:after:py-0.5 [&_h2:last-of-type]:after:rounded-full [&_h2:last-of-type]:after:font-black
                  ">
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {solution}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Follow-up Input Bar */}
                <div className="p-2 border-t border-white/5 bg-slate-900/90 backdrop-blur-md shrink-0">
                  <div className="relative flex items-center gap-2 max-w-full mx-auto w-full">
                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        value={followUpQuery}
                        onChange={(e) => setFollowUpQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                        placeholder="Kuch nahi samjha toh puch, tera bhai hai..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-purple/50 focus:bg-white/10 transition-all"
                      />
                    </div>
                    <button
                      onClick={handleFollowUp}
                      disabled={followUpLoading || !followUpQuery.trim()}
                      className="p-2 bg-brand-purple rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-purple/20"
                    >
                      {followUpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 border-t border-white/5 md:hidden">
                  <button 
                    onClick={reset}
                    className="w-full py-2.5 rounded-xl bg-brand-purple/10 text-brand-purple font-bold text-xs uppercase tracking-tight"
                  >
                    New Question
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="glass-card p-6 rounded-3xl flex-1 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <Zap className="text-blue-400 w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white">Instant Analysis</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">Advanced OCR detects handwritten and printed text instantly.</p>
                </div>
                <div className="glass-card p-6 rounded-3xl flex-1 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center">
                    <Target className="text-brand-purple w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white">JEE Focused</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">Solutions tailored for JEE Mains & Advanced difficulty levels.</p>
                </div>
                <div className="glass-card p-6 rounded-3xl flex-1 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
                    <Lightbulb className="text-brand-teal w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white">Smart Strategy</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">Get topper-recommended shortcuts and common trap warnings.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[98%] border-t border-white/5 py-2 flex justify-between items-center z-10 shrink-0 mt-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
          <span className="font-bold text-slate-400 text-[10px]">JEE Dost v2.1</span>
        </div>
        <p className="text-[10px] text-slate-500 hidden md:block">Built for the next generation of engineers.</p>
        <div className="flex gap-4 text-[10px] text-slate-500">
          <a href="#" className="hover:text-brand-teal transition-colors">Support</a>
          <a href="#" className="hover:text-brand-teal transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
