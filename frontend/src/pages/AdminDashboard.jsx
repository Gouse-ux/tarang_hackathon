import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, Activity, BarChart2, Bell, Shield, Zap, Home, TrendingUp, AlertTriangle, Users, BookOpen, Menu, X, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Low, Medium, High
const RESOURCE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [riskData, setRiskData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [riskRes, alertsRes, resRes] = await Promise.all([
        api.get('/admin/risk-summary'),
        api.get('/admin/alerts'),
        api.get('/admin/resource-usage')
      ]);
      setRiskData(riskRes.data);
      setAlerts(alertsRes.data);
      setResources(resRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlertStatus = async (id, newAction, newStatus) => {
    try {
      await api.put(`/admin/alerts/${id}`, { action: newAction, status: newStatus });
      fetchDashboardData(); // refresh data
    } catch (err) {
      alert('Failed to update alert');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const riskChartData = riskData ? [
    { name: 'Low Risk', value: riskData.lowRisk },
    { name: 'Medium Risk', value: riskData.mediumRisk },
    { name: 'High Risk', value: riskData.highRisk },
  ] : [];

  const navItems = [
    { id: 'overview', label: 'Intelligence Hash', icon: <Activity size={18}/> },
    { id: 'interventions', label: 'Alerts & Actions', icon: <Bell size={18}/> },
    { id: 'resources', label: 'Resource Optio', icon: <BarChart2 size={18}/> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans selection:bg-primary-100 selection:text-primary-900 overflow-hidden">
      
      {/* Mobile Topbar */}
      <div className="md:hidden bg-slate-900 text-white border-b border-slate-800 p-4 flex justify-between items-center z-20 sticky top-0">
        <div className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
          <div className="bg-gradient-to-br from-primary-500 to-accent-500 text-white p-1 rounded-lg">
            <Shield size={20} strokeWidth={2.5}/>
          </div>
          <span>Admin<span className="text-slate-400">Console</span></span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Desktop */}
      <aside className={`w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex-col z-10 transition-transform duration-300 md:relative absolute h-full ${mobileMenuOpen ? 'flex translate-x-0' : 'hidden md:flex -translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800 hidden md:flex items-center gap-2">
          <div className="bg-gradient-to-br from-primary-500 to-accent-500 text-white p-1 rounded-lg">
            <Shield size={20} strokeWidth={2.5}/>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Admin Console</h2>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Workspace</p>
          {navItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} 
              className={`p-3 rounded-lg font-medium cursor-pointer flex items-center gap-3 transition-colors ${activeTab === item.id ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}
            >
              <div className={`${activeTab === item.id ? 'text-primary-500' : 'text-slate-500'}`}>{item.icon}</div>
              <span className="flex-1">{item.label}</span>
              {item.id === 'interventions' && alerts.filter(a => a.status === 'Pending').length > 0 && (
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                  {alerts.filter(a => a.status === 'Pending').length}
                </span>
              )}
            </div>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800 pb-20 md:pb-4">
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-slate-400 font-medium w-full p-2.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors border border-transparent hover:border-slate-700 text-sm">
            <LogOut size={16} /> Secure Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full h-full relative">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
             <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
             <p className="font-medium animate-pulse">Running Intelligence Models...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Campus Overview</h1>
                <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Real-time well-being indicators and resource allocation intelligence.</p>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <span className="font-semibold text-slate-700">Predictive AI Active</span>
              </div>
            </header>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* SaaS 4 Cards Grid - Analytics Top */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <div className="card-container border-t-4 border-t-red-500">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-500 text-sm font-semibold">High Risk Students</p>
                        <AlertTriangle size={18} className="text-red-400" />
                      </div>
                      <h4 className="text-3xl font-extrabold text-slate-900">{riskData?.highRisk || 0}</h4>
                      <p className="text-xs text-red-600 mt-2 font-medium bg-red-50 px-2 py-1 rounded inline-flex items-center gap-1"><TrendingUp size={12}/> Needs Action</p>
                    </div>

                    <div className="card-container border-t-4 border-t-amber-500">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-500 text-sm font-semibold">Medium Risk Segment</p>
                        <Users size={18} className="text-amber-400" />
                      </div>
                      <h4 className="text-3xl font-extrabold text-slate-900">{riskData?.mediumRisk || 0}</h4>
                      <p className="text-xs text-slate-500 mt-2 font-medium bg-slate-100 px-2 py-1 rounded inline-block">Monitor Closely</p>
                    </div>

                    <div className="card-container border-t-4 border-t-emerald-500">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-500 text-sm font-semibold">Low Risk Population</p>
                        <Shield size={18} className="text-emerald-400" />
                      </div>
                      <h4 className="text-3xl font-extrabold text-slate-900">{riskData?.lowRisk || 0}</h4>
                      <p className="text-xs text-slate-500 mt-2 font-medium bg-slate-100 px-2 py-1 rounded inline-block">Stable Baseline</p>
                    </div>

                    <div className="card-container border-t-4 border-t-primary-500 bg-gradient-to-b from-white to-primary-50/30">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-500 text-sm font-semibold">Pending Interventions</p>
                        <Bell size={18} className="text-primary-400" />
                      </div>
                      <h4 className="text-3xl font-extrabold text-slate-900">{alerts.filter(a => a.status === 'Pending').length}</h4>
                      <button onClick={() => setActiveTab('interventions')} className="text-xs text-primary-600 mt-2 font-bold hover:text-primary-800 transition-colors flex items-center gap-1">Review Queue <ArrowUpRight size={14}/></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 min-h-[400px]">
                    <div className="lg:col-span-2 card-container flex flex-col">
                      <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                        <BarChart2 size={18} className="text-slate-400"/>
                        Well-Being Distribution Risk Analytics
                      </h3>
                      <div className="flex-1 w-full min-h-[250px] -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={riskChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dx={-10} />
                            <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600 }}/>
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                              {riskChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Quick Resources overview card side component */}
                    <div className="card-container bg-slate-900 border-slate-800 text-white flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-32 bg-primary-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
                      <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2 relative z-10"><Zap size={18} className="text-primary-400"/> Campus Pulse</h3>
                      
                      <div className="flex-1 flex flex-col justify-center gap-6 relative z-10">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-slate-400 text-sm font-medium">Hostel Occupancy</span>
                            <span className="font-bold text-white text-sm">{resources?.metrics.hostelOccupancyRate}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${resources?.metrics.hostelOccupancyRate}%` }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-slate-400 text-sm font-medium">Study Room Density</span>
                            <span className="font-bold text-white text-sm">{resources?.metrics.studyRoomUsage}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-accent-500 h-2 rounded-full" style={{ width: `${resources?.metrics.studyRoomUsage}%` }}></div>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-5 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                          <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Campus Power Draw (24h)</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-extrabold text-white">{resources?.metrics.electricityUsage}</p>
                            <span className="text-sm text-slate-400 font-medium">kWh</span>
                          </div>
                          <button onClick={() => setActiveTab('resources')} className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-700">View Resource AI</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'interventions' && (
                <motion.div 
                  key="interventions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="card-container min-h-[600px] p-0 overflow-hidden flex flex-col"
                >
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Bell className="text-red-500" size={20}/> Early Intervention AI Queue</h3>
                    <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
                      {alerts.length} Total Records
                    </div>
                  </div>
                  
                  {alerts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-slate-50/50">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                        <Shield size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No active alerts</h3>
                      <p className="text-slate-500 font-medium max-w-sm">Campus well-being metrics are stable. The AI has detected no critical distress signals needing intervention.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto flex-1 bg-white">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 font-bold">
                            <th className="py-4 px-6 w-1/4">Student Identifier</th>
                            <th className="py-4 px-6 w-[120px]">Risk Level</th>
                            <th className="py-4 px-6 w-1/3">AI Diagnosis / Recommendation</th>
                            <th className="py-4 px-6">Required Action</th>
                            <th className="py-4 px-6 w-[140px]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {alerts.map((alert) => (
                            <tr key={alert._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">{alert.name.charAt(0)}</div>
                                  <div>
                                    <p className="font-bold text-slate-900 leading-tight">{alert.name}</p>
                                    <p className="text-xs font-medium text-slate-500 mt-0.5">{alert.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${alert.riskLevel === 'High Risk' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {alert.riskLevel === 'High Risk' ? <TrendingUp size={12} className="mr-1"/> : <Activity size={12} className="mr-1"/>}
                                  {alert.riskLevel}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-slate-600 font-medium leading-relaxed max-w-xs truncate group-hover:whitespace-normal group-hover:break-words transition-all duration-300">
                                {alert.recommendation}
                              </td>
                              <td className="py-4 px-6">
                                <div className="relative">
                                  <select 
                                    className="input-field py-2 px-3 text-sm font-semibold appearance-none pr-8 cursor-pointer focus:ring-primary-500/20"
                                    value={alert.action}
                                    onChange={(e) => handleUpdateAlertStatus(alert._id, e.target.value, alert.status)}
                                  >
                                    <option value="Action Required">Action Required</option>
                                    <option value="Assign Counsellor">Assign Counsellor</option>
                                    <option value="Schedule Meeting">Schedule Meeting</option>
                                    <option value="Mentorship Suggested">Mentorship Suggested</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="relative">
                                  <select 
                                    className={`input-field py-2 px-3 text-sm font-bold appearance-none pr-8 cursor-pointer border-2 ${alert.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 focus:ring-emerald-500/20 focus:border-emerald-500' : alert.status === 'In Progress' ? 'bg-primary-50 text-primary-700 border-primary-200/60 focus:ring-primary-500/20 focus:border-primary-500' : 'bg-slate-100 text-slate-700 border-slate-200 shadow-inner focus:ring-slate-500/20 focus:border-slate-500'}`}
                                    value={alert.status}
                                    onChange={(e) => handleUpdateAlertStatus(alert._id, alert.action, e.target.value)}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                  <div className={`absolute inset-y-0 right-3 flex items-center pointer-events-none ${alert.status === 'Completed' ? 'text-emerald-500' : alert.status === 'In Progress' ? 'text-primary-500' : 'text-slate-400'}`}>
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'resources' && (
                <motion.div 
                  key="resources"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 xl:grid-cols-5 gap-6 md:gap-8"
                >
                  <div className="xl:col-span-3 card-container min-h-[400px] flex flex-col p-8">
                    <h3 className="text-lg font-bold mb-2 text-slate-900 flex items-center gap-2">
                       <Zap size={20} className="text-primary-500" />
                       Artificial Intelligence Optimization
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-lg">Based on historical density and real-time usage data, the CampusGuardian model suggests the following macro-allocations.</p>
                    
                    <div className="space-y-4 flex-1">
                      {resources?.aiInsights.map((insight, idx) => (
                        <div key={idx} className="bg-white border text-left border-slate-200 p-6 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-saas transition-shadow group cursor-pointer relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="h-12 w-12 shrink-0 bg-primary-50/50 text-primary-600 rounded-xl flex items-center justify-center border border-primary-100/50 group-hover:scale-110 transition-transform duration-300">
                            <Home size={22} />
                          </div>
                          <div>
                            <p className="text-slate-800 font-semibold leading-relaxed mb-2 pr-8">{insight}</p>
                            <button className="text-sm font-bold text-primary-600 group-hover:text-primary-800 transition-colors flex items-center gap-1">Review Implementation Plan <ArrowRight size={14}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="xl:col-span-2 card-container min-h-[400px] flex flex-col p-8">
                    <h3 className="text-lg font-bold mb-2 text-slate-900 text-center">Hostel Density Map</h3>
                    <p className="text-sm font-medium text-slate-500 mb-6 text-center">Current block allocations</p>
                    
                    <div className="flex-1 w-full min-h-[250px] relative flex flex-col items-center justify-center">
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={resources?.hostelBlocks || []}
                            cx="50%" cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="occupancy"
                            stroke="none"
                            label={({name, occupancy}) => `${name} (${occupancy}%)`}
                            labelLine={false}
                          >
                            {(resources?.hostelBlocks || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={RESOURCE_COLORS[index % RESOURCE_COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip cursor={false} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600 }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

// Helper component missing from imports but used above: ArrowRight
const ArrowRight = ({size, className}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default AdminDashboard;
