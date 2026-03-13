import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (tokenResponse) => {
    console.log('Google Auth Success Callback:', tokenResponse);
    setLoading(true);
    try {
      const user = await googleLogin(tokenResponse.access_token);
      console.log('Backend Google Login Success:', user);
      navigate(user.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      console.error('Backend Google Login Error:', err.response?.data || err.message);
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (error) => {
      console.error('Google Auth SDK Error:', error);
      setError('Google Sign-In was unsuccessful.');
    },
    ux_mode: 'redirect', // Use redirect to avoid COOP issues
    flow: 'implicit',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative selection:bg-primary-100 selection:text-primary-900">
      
      {/* SaaS Logo Top */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-primary-600 font-extrabold text-xl tracking-tight hover:opacity-80 transition-opacity">
        <div className="bg-gradient-to-br from-primary-500 to-accent-500 text-white p-1 rounded-lg">
          <ShieldAlert size={20} strokeWidth={2.5}/>
        </div>
        <span>Campus<span className="text-slate-900">Guardian</span></span>
      </Link>

      <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-2xl shadow-saas border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 font-medium mt-1">Log in to your account</p>
        </div>

        {error && <div className="p-3 mb-6 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100/50">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" disabled={loading} className="w-full btn-primary text-base py-3 mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Signing in...' : 'Log in'}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">Or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button 
            type="button" 
            onClick={() => loginWithGoogle()} 
            disabled={loading}
            className="w-full btn-secondary text-base py-3 disabled:opacity-70"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
            </svg>
            {loading ? 'Processing...' : 'Continue with Google'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 font-medium mt-8">
          Don't have an account? <Link to="/register" className="text-primary-600 hover:text-primary-800 transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
