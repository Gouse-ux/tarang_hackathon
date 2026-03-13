import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  ArrowLeft, Shield, BarChart3, PieChart as PieIcon, 
  Activity, Zap, LayoutDashboard, Database, RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import ResourceForm from '../components/ResourceForm';
import ResourceTable from '../components/ResourceTable';
import ResourceInsights from '../components/ResourceInsights';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#14b8a6'];

const ResourceDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'entry'

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/resources');
      setResources(data);
      if (data.length > 0 && !selectedResource) {
        setSelectedResource(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (resourceId) => {
    setAnalyzing(true);
    try {
      const { data } = await api.post('/resources/analyze', { resourceId });
      // Update local state
      setResources(prev => prev.map(r => r._id === resourceId ? { ...r, aiRecommendation: data.aiRecommendation } : r));
      if (selectedResource?._id === resourceId) {
        setSelectedResource(prev => ({ ...prev, aiRecommendation: data.aiRecommendation }));
      }
    } catch (err) {
      console.error(err);
      alert('AI analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources(prev => prev.filter(r => r._id !== id));
      if (selectedResource?._id === id) setSelectedResource(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = (resource) => {
    setSelectedResource(resource);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Chart Data Preparation
  const pieData = resources.map(r => ({ name: r.blockName, value: r.occupiedRooms }));
  const barData = resources.map(r => ({ name: r.blockName, electricity: r.electricityConsumption }));
  const lineData = [...resources].reverse().map(r => ({ 
    name: r.blockName, 
    usage: r.studyRoomUsage,
    date: new Date(r.createdAt).toLocaleDateString()
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      {/* Navigation Header */}
      <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-50 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-primary-500 p-1.5 rounded-lg">
                <Shield size={22} className="text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                Resource<span className="text-slate-400">Intelligence</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-bold text-white">{user?.name}</p>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-primary-400 shadow-inner">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Campus Resource Utilization</h2>
            <p className="text-slate-500 font-semibold mt-2 max-w-xl leading-relaxed">
              Analyze infrastructure density and energy consumption through the CampusGuardian predictive model.
            </p>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start md:self-auto">
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeView === 'dashboard' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-[1.02]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={18} /> Insights Dashboard
            </button>
            <button 
              onClick={() => setActiveView('entry')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeView === 'entry' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-[1.02]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <Database size={18} /> Resource Audit
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeView === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                {/* AI Insights Panel */}
                <div className="xl:col-span-2">
                  <ResourceInsights 
                    selectedResource={selectedResource} 
                    onAnalyze={handleAnalyze} 
                    analyzing={analyzing} 
                  />
                </div>

                {/* Visualization Charts */}
                <div className="xl:col-span-3 space-y-8">
                  <div className="card-container min-h-[400px]">
                    <h3 className="text-lg font-bold mb-8 text-slate-800 flex items-center gap-2">
                      <PieIcon size={18} className="text-slate-400" />
                      Hostel Occupancy Allocation
                    </h3>
                    <div className="h-[280px] w-full mt-4">
                      {resources.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%" cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={4}
                              dataKey="value"
                              stroke="none"
                              label={({name}) => name}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium italic">Insufficient data for visualization</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="card-container">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-8 flex items-center gap-2">
                        <Zap size={16} className="text-amber-500" />
                        Electricity Load (kWh)
                      </h3>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                            <YAxis hide />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            <Bar dataKey="electricity" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="card-container">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-8 flex items-center gap-2">
                        <Activity size={16} className="text-primary-500" />
                        Study Room Usage (%)
                      </h3>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            <Line type="monotone" dataKey="usage" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table always visible at bottom in insights view for easy switching */}
              <div className="mt-4">
                <ResourceTable 
                  resources={resources} 
                  onDelete={handleDelete} 
                  onAnalyze={handleAnalyze} 
                  onView={handleView}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="entry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <div className="lg:col-span-5 lg:sticky lg:top-24">
                <ResourceForm onSuccess={fetchResources} />
              </div>
              <div className="lg:col-span-7">
                <ResourceTable 
                  resources={resources} 
                  onDelete={handleDelete} 
                  onAnalyze={handleAnalyze} 
                  onView={handleView}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Refresh */}
      <button 
        onClick={fetchResources}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white border border-slate-200 shadow-2xl rounded-full flex items-center justify-center text-slate-500 hover:text-primary-600 transition-all hover:scale-110 active:scale-95 group z-40"
      >
        <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
      </button>
    </div>
  );
};

export default ResourceDashboard;
