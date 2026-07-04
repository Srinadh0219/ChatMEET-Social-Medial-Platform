import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, resendOtp } from "../api/api-auth";
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import PulseLoader from 'react-spinners/PulseLoader';

const OTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const userId = query.get('userId') || '';

  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  // Redirect to register if no userId in URL
  useEffect(() => {
    if (!userId) {
      navigate('/register', { replace: true });
    }
  }, [userId, navigate]);

  // Single countdown timer
  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setCanResend(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setError('');
    setVerifying(true);
    try {
      await verifyOtp({ userId, otp });
      toast.success('Email verified! You can now log in.', { position: 'top-left', autoClose: 2000 });
      navigate('/login', { replace: true });
    } catch (e: any) {
      setError(e.message || 'Verification failed. Please check your OTP and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResending(true);
    setError('');
    try {
      await resendOtp({ userId });
      setSeconds(120);
      setOtp('');
      toast.success('A new OTP has been sent to your email.', { position: 'top-left', autoClose: 3000 });
    } catch (e: any) {
      setError(e.message || 'Failed to resend OTP. Please try again.');
      setCanResend(true); // allow retry
    } finally {
      setResending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleVerify();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-white text-black font-['Outfit',sans-serif] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e90a_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e90a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-sky-400/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-sky-300/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-sky-100 rounded-3xl p-8 shadow-xl shadow-sky-500/5 relative z-10 text-center">
        {/* Back Button */}
        <button
          onClick={() => navigate('/register')}
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-black text-sm font-semibold transition-colors mb-6 absolute left-8 top-8"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Icon & Title */}
        <div className="text-center mb-8 mt-6">
          <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-sky-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight mb-2 text-black">Verify Your Email</h1>
          <p className="text-sm text-neutral-500 font-medium">Enter the 6-digit code sent to your email</p>
        </div>

        {/* OTP Input */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">OTP Code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="123456"
            className="w-full bg-slate-50/50 border border-sky-100 focus:border-sky-500 rounded-xl py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-center tracking-widest text-2xl font-black"
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm mb-4 font-semibold bg-red-50 border border-red-100 rounded-xl py-2 px-3">
            {error}
          </p>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={verifying || otp.length < 6}
          className="w-full bg-black hover:bg-black text-white py-3.5 rounded-xl font-bold transition-all mb-4 text-sm tracking-wide uppercase shadow-lg shadow-black/10 h-12 flex items-center justify-center disabled:opacity-60"
        >
          {verifying ? <PulseLoader color="#ffffff" size={8} /> : 'Verify & Continue'}
        </button>

        {/* Timer */}
        <p className="text-sm text-neutral-500 mb-4 font-semibold">
          {seconds > 0 ? (
            <>Expires in: <span className="text-sky-600 font-black">{formatTime(seconds)}</span></>
          ) : (
            <span className="text-red-500 font-semibold">OTP expired. Please resend.</span>
          )}
        </p>

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={!canResend || resending}
          className="w-full bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-bold text-black transition-all border border-sky-100 text-xs shadow-sm flex items-center justify-center gap-2 h-11"
        >
          {resending ? <PulseLoader color="#0284c7" size={6} /> : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;
