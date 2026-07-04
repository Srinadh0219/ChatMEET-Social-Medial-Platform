import React, { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import PulseLoader from "react-spinners/PulseLoader";
import { Eye, EyeOff, ArrowLeft, Rocket } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const Login: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userInfo1")) {
      nav('/s');
    }
  }, [nav]);

  const [data, setData] = useState<{ name: string; password: string }>({
    name: '',
    password: ''
  });

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLoading(true);
    if (!data.name || !data.password) {
      toast.warning('Please Fill all the Fields', { position: "top-left" });
      setLoading(false);
      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';
      const response = await fetch(`${API_URL}/api/users/login`, requestOptions);
      const Data = await response.json();

      if (Data.success) {
        localStorage.setItem("userInfo1", JSON.stringify(Data));
        toast.success('Successful Login', { position: "top-left", autoClose: 1000 });
        setLoading(false);
        setData({ name: '', password: '' });
        nav('/s');
      } else {
        throw Data;
      }
    } catch (error: any) {
      toast.warning(error.errors || 'Login Failed', { position: "top-left", autoClose: 1000 });
      setLoading(false);
    }
  };

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setData((pre) => ({
      ...pre,
      [name]: value,
    }));
  }

  return (
    <div className="min-h-screen bg-white text-black font-['Outfit',sans-serif] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-8 shadow-xl shadow-neutral-200/50 relative z-10">
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
          <h1 className="text-2xl font-black uppercase tracking-tight mb-2 text-black">Welcome Back</h1>
          <p className="text-sm text-neutral-500 font-medium">Login to your ChatMEET account</p>
        </div>

        <form autoComplete="off" className="space-y-5">
          <input type="text" name="fake_user" style={{ display: 'none' }} tabIndex={-1} autoComplete="username" />
          <input type="password" name="fake_pass" style={{ display: 'none' }} tabIndex={-1} autoComplete="current-password" />

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">Display Name</label>
            <input 
              onChange={handleChange} 
              type="text" 
              name="name" 
              value={data.name}
              autoComplete="nope"
              className="w-full bg-slate-50/50 border border-sky-100 focus:border-sky-500 rounded-xl py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-sm placeholder-neutral-400"
              placeholder="Registered name"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">Password</label>
            <div className="relative">
              <input 
                onChange={handleChange} 
                type={showPassword ? "text" : "password"}
                name="password" 
                value={data.password}
                autoComplete="new-password"
                className="w-full bg-slate-50/50 border border-sky-100 focus:border-sky-500 rounded-xl py-3 px-4 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-sm placeholder-neutral-400"
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
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-sky-600 hover:text-sky-700 font-semibold transition-colors">Forgot Password?</Link>
          </div>

          <button 
            onClick={handleClick} 
            disabled={loading}
            className="w-full bg-black hover:bg-black text-white py-3.5 rounded-xl font-bold transition-all flex justify-center items-center h-12 text-sm tracking-wide uppercase shadow-lg shadow-black/10"
          >
            {loading ? <PulseLoader color="#ffffff" size={8} /> : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500 font-medium">
          Don't have an account? <Link to="/register" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
