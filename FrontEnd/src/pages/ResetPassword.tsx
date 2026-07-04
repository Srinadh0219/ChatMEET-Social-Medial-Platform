import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PulseLoader from 'react-spinners/PulseLoader';
import { ArrowLeft } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as any)?.email || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match', { position: 'top-left' });
      return;
    }
    if (!otp) {
      toast.error('OTP code is required', { position: 'top-left' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4001'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      toast.success('Password reset successful', { position: 'top-left', autoClose: 2000 });
      navigate('/login', { replace: true });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reset password', { position: 'top-left' });
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
          to="/forgot-password" 
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-black text-sm font-semibold transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <h2 className="text-2xl font-black uppercase tracking-tight text-center mb-6 text-black">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full bg-slate-50/50 border border-sky-100 rounded-xl py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-sm placeholder-neutral-400"
              value={email}
              readOnly
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">Verification OTP</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              className="w-full bg-slate-50/50 border border-sky-100 focus:border-sky-500 rounded-xl py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-sm placeholder-neutral-400 font-semibold tracking-wider text-center"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">New Password</label>
            <input
              type="password"
              required
              placeholder="New Password"
              className="w-full bg-slate-50/50 border border-sky-100 focus:border-sky-500 rounded-xl py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-sm placeholder-neutral-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="Confirm Password"
              className="w-full bg-slate-50/50 border border-sky-100 focus:border-sky-500 rounded-xl py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-sm placeholder-neutral-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-black text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center text-sm tracking-wide uppercase h-12 shadow-lg shadow-black/10"
          >
            {loading ? <PulseLoader color="#ffffff" size={8} /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
