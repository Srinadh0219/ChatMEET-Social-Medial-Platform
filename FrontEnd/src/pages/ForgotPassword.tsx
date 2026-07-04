import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import PulseLoader from 'react-spinners/PulseLoader';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4001'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      toast.success('Reset email sent', { position: 'top-left', autoClose: 2000 });
      navigate('/reset-password', { replace: true, state: { email } });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send reset email', { position: 'top-left' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-white text-black font-['Outfit',sans-serif] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle lines background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e90a_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e90a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-sky-400/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-sky-300/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-sky-100 rounded-3xl p-8 shadow-xl shadow-sky-500/5 relative z-10">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-black text-sm font-semibold transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        <h2 className="text-2xl font-black uppercase tracking-tight text-center mb-6 text-black">
          Forgot Password
        </h2>
        <p className="text-sm text-neutral-500 text-center font-medium mb-6">
          Enter your registered email below to receive a password reset code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full bg-slate-50/50 border border-sky-100 focus:border-sky-500 rounded-xl py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-sm placeholder-neutral-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-black text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center text-sm tracking-wide uppercase h-12 shadow-lg shadow-black/10"
          >
            {loading ? <PulseLoader color="#ffffff" size={8} /> : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
