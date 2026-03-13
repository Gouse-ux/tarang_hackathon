import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, Activity, Moon, BookOpen, Users, Smile, AlertTriangle, MessageSquare, Send, Menu, X, BrainCircuit, HeartPulse, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, LineChart } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Low, Medium, High

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    stressLevel: 0.5,
    sleepQuality: 0.5,
    academicWorkload: 0.5,
    socialActivity: 0.5,
    mood: 0.5,
    attendancePercentage: 100,
    academicPerformance: 85
  });

  // Chat State
  const [chatHistory, setChatHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  useEffect(() => {
    fetchAssessments();
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const { data } = await api.get('/chat');
      setChatHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    
    setSendingChat(true);
    try {
      const { data } = await api.post('/chat', { message: currentMessage });
      setChatHistory(prev => [...prev, data]);
      setCurrentMessage('');
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSendingChat(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      const { data } = await api.get('/assessment/me');
      setAssessments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const submitAssessment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assessment', formData);
      fetchAssessments();
      setActiveTab('dashboard');
      window.scrollTo(0, 0);
    } catch (err) {
      alert('Failed to submit assessment.');
    }
  };

  const latestAssessment = assessments[0];
  const safeRiskScore = latestAssessment ? (Number(latestAssessment.riskScore) || 0) : 0;
  const chartData = latestAssessment ? [
    { name: 'Risk Level', value: safeRiskScore * 100 },
    { name: 'Safe Margin', value: 100 - (safeRiskScore * 100) }
  ] : [];

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: <Activity size={18}/> },
    { id: 'assessment', label: 'Evaluation', icon: <BookOpen size={18}/> },
    { id: 'chat', label: 'AI Support', icon: <MessageSquare size={18}/> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans selection:bg-primary-100 selection:text-primary-900 overflow-hidden">
      
      {/* Mobile Topbar */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center z-20 sticky top-0">
        <div className="flex items-center gap-2 text-primary-600 font-extrabold text-xl tracking-tight">
          <div className="bg-gradient-to-br from-primary-500 to-accent-500 text-white p-1 rounded-lg">
            <Activity size={20} strokeWidth={2.5}/>
          </div>
          <span>Student<span className="text-slate-900">Portal</span></span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Desktop */}
      <aside className={`w-64 bg-white border-r border-slate-200 flex-col z-10 transition-transform duration-300 md:relative absolute h-full ${mobileMenuOpen ? 'flex translate-x-0' : 'hidden md:flex -translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-200 hidden md:flex items-center gap-2">
          <div className="bg-gradient-to-br from-primary-500 to-accent-500 text-white p-1 rounded-lg">
            <Activity size={20} strokeWidth={2.5}/>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Student Portal</h2>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Intelligence</p>
          {navItems.map(item => (
            <div 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} 
              className={`p-3 rounded-lg font-semibold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === item.id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <div className={`${activeTab === item.id ? 'text-primary-600' : 'text-slate-400'}`}>{item.icon}</div>
              {item.label}
            </div>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-200 pb-20 md:pb-4">
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-slate-600 font-medium w-full p-2.5 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-200">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full h-full relative">
        <header className="mb-8 max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Here is your real-time wellness and intelligence overview.</p>
        </header>

        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 md:space-y-8"
              >
                {/* SaaS 4 Cards Grid */}
                {latestAssessment ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="card-container border-t-4 border-t-primary-500">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-500 text-sm font-semibold">Well-being Score</p>
                        <HeartPulse size={18} className="text-primary-400" />
                      </div>
                      <h4 className="text-3xl font-extrabold text-slate-900">{((1 - safeRiskScore) * 100).toFixed(0)}<span className="text-lg text-slate-400 font-semibold">/100</span></h4>
                      <p className="text-xs text-slate-500 mt-2 font-medium bg-slate-100 px-2 py-1 rounded inline-block">Based on last assessment</p>
                    </div>

                    <div className="card-container border-t-4 border-t-amber-500">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-500 text-sm font-semibold">Stress Level</p>
                        <Activity size={18} className="text-amber-400" />
                      </div>
                      <h4 className="text-3xl font-extrabold text-slate-900">{(latestAssessment.stressLevel * 100).toFixed(0)}<span className="text-lg text-slate-400 font-semibold">%</span></h4>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${latestAssessment.stressLevel * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="card-container border-t-4 border-t-[#ec4899]">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-500 text-sm font-semibold">Risk Prediction</p>
                        <BrainCircuit size={18} className="text-[#ec4899]" />
                      </div>
                      <h4 className={`text-2xl font-extrabold mt-1 tracking-tight ${latestAssessment.riskLevel === 'High Risk' ? 'text-red-600' : latestAssessment.riskLevel === 'Medium Risk' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {latestAssessment.riskLevel}
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 font-medium bg-slate-100 px-2 py-1 rounded inline-block">AI Analyzed</p>
                    </div>

                    <div className="card-container border-t-4 border-t-accent-500 sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-slate-500 text-sm font-semibold">Recommendation</p>
                          <Smile size={18} className="text-accent-400" />
                        </div>
                        <p className="text-sm text-slate-800 font-medium leading-relaxed line-clamp-3 md:line-clamp-4">
                          {latestAssessment.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card-container flex items-center justify-center p-12 mb-8 bg-white border-dashed border-2">
                     <div className="text-center max-w-sm">
                        <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-100">
                          <BookOpen size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Data Available</h3>
                        <p className="text-slate-500 font-medium mb-6">Complete your initial mental health evaluation to unlock insights.</p>
                        <button onClick={() => setActiveTab('assessment')} className="btn-primary w-full shadow-lg shadow-primary-500/20">Begin Evaluation</button>
                     </div>
                  </div>
                )}

                {latestAssessment && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card-container flex flex-col min-h-[350px]">
                      <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                        <LineChart size={18} className="text-slate-400"/>
                        Risk Analytics Breakdown
                      </h3>
                      <div className="flex-1 flex items-center justify-center mb-4 relative min-h-[250px]">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%" cy="50%"
                              innerRadius={70} outerRadius={90}
                              paddingAngle={4} dataKey="value"
                              stroke="none"
                            >
                              <Cell fill={latestAssessment.riskLevel === 'Low Risk' ? COLORS[0] : latestAssessment.riskLevel === 'Medium Risk' ? COLORS[1] : COLORS[2]} />
                              <Cell fill="#f1f5f9" />
                            </Pie>
                            <RechartsTooltip cursor={false} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}/>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{(safeRiskScore * 100).toFixed(0)}</span>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Risk Score</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-container min-h-[350px] flex flex-col">
                      <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-slate-400"/>
                        AI Guidance History
                      </h3>
                      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {assessments.slice(0,4).map((record) => (
                           <div key={record._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors flex gap-4 items-start">
                              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${record.riskLevel === 'High Risk' ? 'bg-red-500' : record.riskLevel === 'Medium Risk' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 mb-1">{new Date(record.createdAt).toLocaleDateString()} &middot; {record.riskLevel}</p>
                                <p className="text-sm font-medium text-slate-800 line-clamp-2">{record.recommendation}</p>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'assessment' && (
              <motion.div 
                key="assessment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="card-container shadow-lg">
                  <div className="mb-8 border-b border-slate-100 pb-6 text-center">
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary-100">
                      <BookOpen size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Behavioral & Academic Audit</h2>
                    <p className="text-slate-500 font-medium text-sm mt-2">Our AI uses this data to map resource optimization and provide well-being guidance.</p>
                  </div>
                  
                  <form onSubmit={submitAssessment} className="space-y-7">
                    
                    {/* Range Inputs mapping */}
                    {[
                      { label: "Stress Level", desc: "0 = Low, 1 = Overwhelming", state: formData.stressLevel, key: 'stressLevel', icon: <Activity size={16}/> },
                      { label: "Sleep Quality", desc: "0 = Refreshed, 1 = Deprived", state: formData.sleepQuality, key: 'sleepQuality', icon: <Moon size={16}/> },
                      { label: "Academic Workload", desc: "0 = Manageable, 1 = Excessive", state: formData.academicWorkload, key: 'academicWorkload', icon: <BookOpen size={16}/> },
                      { label: "Social Interactions", desc: "0 = Active, 1 = Isolated", state: formData.socialActivity, key: 'socialActivity', icon: <Users size={16}/> },
                      { label: "General Mood", desc: "0 = Positive, 1 = Depressed", state: formData.mood, key: 'mood', icon: <Smile size={16}/> },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                          <label className="flex items-center gap-2 font-semibold text-slate-800 text-sm">{item.icon} {item.label}</label>
                          <span className="text-xs font-bold bg-white px-2 py-1 rounded text-primary-600 border border-slate-200">{item.state.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mb-3">{item.desc}</p>
                        <input 
                          type="range" min="0" max="1" step="0.1" 
                          className="w-full xl:w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40" 
                          value={item.state} 
                          onChange={e => setFormData({...formData, [item.key]: parseFloat(e.target.value)})} 
                        />
                      </div>
                    ))}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Class Attendance (%)</label>
                        <input type="number" className="input-field shadow-sm" min="0" max="100" value={formData.attendancePercentage} onChange={e => setFormData({...formData, attendancePercentage: parseInt(e.target.value)})} required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Current GPA/Grade (%)</label>
                        <input type="number" className="input-field shadow-sm" min="0" max="100" value={formData.academicPerformance} onChange={e => setFormData({...formData, academicPerformance: parseInt(e.target.value)})} required />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button type="submit" className="w-full btn-primary text-base py-3.5 shadow-lg shadow-primary-500/20">Analyze Profile & Generate Intelligence</button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto h-[75vh] md:h-[80vh] flex flex-col"
              >
                <div className="card-container flex-1 flex flex-col shadow-lg border-slate-200/60 p-0 overflow-hidden">
                  
                  {/* Chat header */}
                  <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-sm">
                        <BrainCircuit size={20} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">CampusAI Assistant</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="flex-1 bg-[#f8fafc] p-4 md:p-6 overflow-y-auto flex flex-col gap-5">
                    {chatHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm text-slate-400">
                          <MessageSquare size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">How are you feeling today?</h3>
                        <p className="text-sm font-medium text-slate-500 max-w-sm">This is a safe space. Send a message below to start a supportive conversation with your AI wellness companion.</p>
                      </div>
                    ) : (
                      chatHistory.map((chat, idx) => (
                        <div key={idx} className="flex flex-col gap-4">
                          <div className="self-end bg-primary-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%] sm:max-w-[75%] shadow-sm text-[15px] font-medium leading-relaxed">
                            {chat.message}
                          </div>
                          <div className="self-start bg-white border border-slate-200 text-slate-700 px-5 py-3.5 rounded-2xl rounded-tl-sm max-w-[90%] sm:max-w-[80%] shadow-sm text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
                            {chat.response}
                          </div>
                        </div>
                      ))
                    )}
                    {sendingChat && (
                      <div className="self-start bg-white border border-slate-200 text-slate-400 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                         <div className="flex gap-1 items-center h-4">
                           <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                           <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                           <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Input Box */}
                  <div className="bg-white p-4 border-t border-slate-100 shrink-0">
                    <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                      <input 
                        type="text" 
                        className="w-full pl-5 pr-14 py-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400" 
                        placeholder="Message CampusAI Assistant..."
                        value={currentMessage}
                        onChange={e => setCurrentMessage(e.target.value)}
                        disabled={sendingChat}
                      />
                      <button disabled={sendingChat || !currentMessage.trim()} type="submit" className="absolute right-2 top-2  bottom-2 w-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50">
                        <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
                      </button>
                    </form>
                    <p className="text-[10px] text-center text-slate-400 font-medium mt-3 uppercase tracking-wider">AI responses are not medical advice</p>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
