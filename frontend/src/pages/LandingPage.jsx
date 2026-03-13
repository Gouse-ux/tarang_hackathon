import { Link } from 'react-router-dom';
import { ShieldAlert, Brain, LineChart, MessageSquare, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-2xl shadow-saas hover:shadow-saas-hover border border-slate-100 flex flex-col items-center text-center w-full transition-all"
  >
    <div className="h-16 w-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center text-primary-600 mb-6 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed font-medium">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-primary-100 selection:text-primary-900 relative">
      
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-50/80 via-white to-transparent -z-10 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="w-full bg-white/70 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-primary-600 font-extrabold text-2xl tracking-tight">
            <div className="bg-gradient-to-br from-primary-500 to-accent-500 text-white p-1.5 rounded-xl shadow-sm">
              <ShieldAlert size={24} strokeWidth={2.5}/>
            </div>
            <span>Campus<span className="text-slate-900">Guardian</span></span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-slate-600 hover:text-slate-900 font-semibold px-4 py-2 transition-colors">Log in</Link>
            <Link to="/register" className="btn-primary">
              Get Started <ArrowRight size={18} />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 overflow-hidden absolute w-full z-40 top-20 shadow-lg"
          >
            <Link to="/login" className="btn-secondary w-full justify-center">Log in</Link>
            <Link to="/register" className="btn-primary w-full justify-center">Get Started</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold text-sm mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            Campus Intelligence Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Detect distress early. <br className="hidden md:block"/> Configure <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">smarter campuses</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            AI-powered platform to proactively detect student distress and optimize campus resource allocation in real-time. Designed for universities.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-lg transition-transform hover:-translate-y-0.5 shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2">
              Start for free <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-lg transition-all shadow-sm">
              Admin Console
            </Link>
          </div>
        </motion.div>

        {/* Features Row */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full pb-20">
          <FeatureCard 
            icon={<Brain size={32} strokeWidth={2} />}
            title="AI Risk Prediction"
            description="Analyzes behavioral and academic indicators to predict distress and dropout risk before it escalates."
            delay={0.1}
          />
          <FeatureCard 
            icon={<MessageSquare size={32} strokeWidth={2} />}
            title="Mental Health AI Chatbot"
            description="Empathetic 24/7 AI companion offering emotional support and healthy habit recommendations."
            delay={0.2}
          />
          <FeatureCard 
            icon={<LineChart size={32} strokeWidth={2} />}
            title="Campus Resource Optimization"
            description="Monitors hostel occupancy, study rooms, and campus energy usage with actionable insights."
            delay={0.3}
          />
        </div>
      </main>

    </div>
  );
};

export default LandingPage;
