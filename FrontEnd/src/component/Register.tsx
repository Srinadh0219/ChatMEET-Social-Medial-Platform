import React, { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from "react-router-dom";
import PulseLoader from "react-spinners/PulseLoader";
import { Eye, EyeOff, Rocket, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const Register: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userInfo1")) {
      nav('/s');
    }
  }, [nav]);

  // Clear stale session data on mount
  useEffect(() => {
    sessionStorage.removeItem('registerData');
  }, []);

  const [data, setData] = useState<{ name: string; email: string; password: string; password2: string }>({
    name: '',
    email: '',
    password: '',
    password2: '',
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setData((pre) => ({
      ...pre,
      [name]: value,
    }));
  }

  // Derived validation states for real-time feedback
  const passwordsMatch = data.password && data.password2 && data.password === data.password2;
  const passwordLongEnough = data.password.length >= 6;

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // --- Frontend validation ---
    if (!data.name.trim() || !data.password || !data.email.trim() || !data.password2) {
      toast.warning('Please fill in all fields', { position: "top-left" });
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      toast.warning('Please enter a valid email address', { position: "top-left" });
      return;
    }

    if (data.password.length < 6) {
      toast.warning('Password must be at least 6 characters', { position: "top-left" });
      return;
    }

    if (data.password !== data.password2) {
      toast.warning('Passwords do not match', { position: "top-left" });
      return;
    }

    setLoading(true);

    // Only send required fields to backend
    const payload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      password2: data.password2,
    };

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';
      const response = await fetch(`${API_URL}/api/auth/register`, requestOptions);
      const Data = await response.json();

      if (response.ok && !Data.error) {
        toast.success('Account created! Check your email for the OTP.', { position: "top-left", autoClose: 2000 });
        setLoading(false);
        setData({ name: '', email: '', password: '', password2: '' });
        nav(`/otp?userId=${Data.userId}`);
      } else {
        const errorMessage = Data.message || Data.error || 'Registration failed';
        toast.warning(errorMessage, { position: "top-left", autoClose: 3000 });
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Register error:", error);
      toast.error('Could not connect to server. Please try again.', { position: "top-left" });
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black font-['Outfit',sans-serif] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-8 shadow-xl shadow-neutral-200/50 relative z-10 mt-10 mb-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-black text-sm font-medium transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-sky-500/20">
            <Rocket className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight mb-2 text-black">Create Account</h1>
          <p className="text-sm text-neutral-500 font-medium">Join the ChatMEET community today</p>
        </div>

        <form autoComplete="off" className="space-y-4">
          {/* Honeypot hidden fields to prevent browser autofill */}
          <input type="text" name="fake_user" style={{ display: 'none' }} tabIndex={-1} autoComplete="username" />
          <input type="password" name="fake_pass" style={{ display: 'none' }} tabIndex={-1} autoComplete="current-password" />

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">Full Name</label>
            <input
              onChange={handleChange}
              type="text"
              name="name"
              value={data.name}
              autoComplete="nope"
              className="w-full bg-slate-50/50 border border-sky-100 focus:border-sky-500 rounded-xl py-2.5 px-4 text-black focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-sm placeholder-neutral-400"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">Email Address</label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              value={data.email}
              autoComplete="nope"
              className="w-full bg-slate-50/50 border border-sky-100 focus:border-sky-500 rounded-xl py-2.5 px-4 text-black focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-sm placeholder-neutral-400"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">Password</label>
            <div className="relative">
              <input
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                name="password"
                value={data.password}
                autoComplete="new-password"
                className="w-full bg-slate-50/50 border border-sky-100 focus:border-sky-500 rounded-xl py-2.5 px-4 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-sm placeholder-neutral-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Password length hint */}
            {data.password.length > 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 font-semibold ${passwordLongEnough ? 'text-green-600' : 'text-red-500'}`}>
                {passwordLongEnough ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {passwordLongEnough ? 'Password is strong enough' : 'At least 6 characters required'}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">Confirm Password</label>
            <div className="relative">
              <input
                onChange={handleChange}
                type={showConfirm ? "text" : "password"}
                name="password2"
                value={data.password2}
                autoComplete="new-password"
                className="w-full bg-slate-50/50 border border-sky-100 focus:border-sky-500 rounded-xl py-2.5 px-4 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-sm placeholder-neutral-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Password match hint */}
            {data.password2.length > 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 font-semibold ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                {passwordsMatch ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          <button
            onClick={handleClick}
            disabled={loading}
            className="w-full bg-black hover:bg-black text-white py-3.5 rounded-xl font-bold transition-all flex justify-center items-center h-12 text-sm tracking-wide uppercase mt-4 shadow-lg shadow-black/10 disabled:opacity-60"
          >
            {loading ? <PulseLoader color="#ffffff" size={8} /> : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
