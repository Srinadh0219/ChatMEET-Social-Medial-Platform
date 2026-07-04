import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, MessageSquare, Shield, Users, Layers, Cpu, Send, Zap, Globe } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

const Home: React.FC = () => {
  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userInfo1")) {
      nav('/s');
    }
  }, [nav]);

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feedback'>('feedback');

  const openFeedback = (e: React.MouseEvent, type: 'bug' | 'feedback') => {
    e.preventDefault();
    setFeedbackType(type);
    setIsFeedbackOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-black font-['Outfit',sans-serif] overflow-x-hidden relative flex flex-col justify-between">

      {/* Navbar */}
      <nav className="w-full z-50 bg-white border-b border-neutral-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-sky-500/20">
              <Rocket className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-black uppercase">
              ChatMEET
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="px-5 py-2.5 text-neutral-700 hover:text-black font-semibold text-sm transition-all border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-neutral-50">
              Login
            </Link>
            <Link to="/register" className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-sky-500/20">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex items-center px-4 md:px-8 max-w-7xl mx-auto w-full py-10 md:py-20 z-10">
        <div className="grid lg:grid-cols-12 gap-10 md:gap-16 items-center w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-7"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 border border-sky-100 rounded-full text-sky-600 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              Next-Gen Social Network
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.05] text-black tracking-tight">
              Connect. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Share. Inspire.</span>
            </h1>
            <p className="text-base md:text-lg text-neutral-500 max-w-lg leading-relaxed">
              Experience a vibrant platform for real-time messaging, media sharing, and community hubs. Built with premium design standards for absolute clarity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto">
              <Link to="/register" className="w-full sm:w-auto text-center px-8 py-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold rounded-xl hover:from-sky-600 hover:to-indigo-700 transition-all text-sm tracking-wide shadow-lg shadow-sky-500/20">
                Get Started Free
              </Link>
              <Link to="/login" className="w-full sm:w-auto text-center px-8 py-4 bg-white border-2 border-neutral-200 text-neutral-700 font-bold rounded-xl hover:border-neutral-300 hover:bg-neutral-50 transition-all text-sm tracking-wide">
                Sign In
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold">
                <Zap className="w-4 h-4 text-indigo-500" />
                Real-time
              </div>
              <div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold">
                <Shield className="w-4 h-4 text-sky-500" />
                Secure
              </div>
              <div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold">
                <Globe className="w-4 h-4 text-sky-500" />
                Global
              </div>
            </div>
          </motion.div>

          {/* Hero illustration - pure CSS based, no image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 flex justify-center items-center relative mt-10 lg:mt-0"
          >
            <div className="w-full max-w-md relative">
              {/* Background decorative gradient blob */}
              <div className="absolute -inset-4 bg-gradient-to-br from-sky-100/60 via-indigo-50/40 to-sky-50/30 rounded-[2.5rem] blur-sm" />
              
              {/* Main card */}
              <div className="relative bg-white rounded-3xl border border-neutral-100 shadow-xl shadow-neutral-200/50 p-6 space-y-4">
                {/* Chat header */}
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">C</div>
                  <div>
                    <p className="font-bold text-sm text-black">ChatMEET Community</p>
                    <p className="text-xs text-sky-500 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 bg-sky-500 rounded-full" /> 128 online</p>
                  </div>
                </div>

                {/* Chat messages */}
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">A</div>
                  <div className="bg-neutral-50 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm text-neutral-700">Hey everyone! Just joined 🎉</p>
                    <p className="text-[10px] text-neutral-400 mt-1">2 min ago</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="flex items-start gap-3 justify-end"
                >
                  <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm text-white">Welcome aboard! Happy to have you here 👋</p>
                    <p className="text-[10px] text-sky-200 mt-1">Just now</p>
                  </div>
                  <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-xs flex-shrink-0">S</div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">R</div>
                  <div className="bg-neutral-50 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm text-neutral-700">This platform looks amazing! 🚀</p>
                    <p className="text-[10px] text-neutral-400 mt-1">Just now</p>
                  </div>
                </motion.div>

                {/* Typing indicator */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="flex items-center gap-2 pl-11 text-neutral-400"
                >
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] font-medium">Someone is typing...</span>
                </motion.div>

                {/* Message input */}
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  <div className="flex-1 bg-neutral-50 rounded-full py-2.5 px-4 text-sm text-neutral-400 border border-neutral-100">
                    Type a message...
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-md shadow-sky-500/20 cursor-pointer hover:shadow-lg transition-shadow">
                    <Send className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Floating notification card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl border border-neutral-100 shadow-lg shadow-neutral-200/50 p-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center">
                  <Users className="w-4.5 h-4.5 text-sky-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-black">+24 new members</p>
                  <p className="text-[10px] text-neutral-400">joined today</p>
                </div>
              </motion.div>

              {/* Floating likes card */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl border border-neutral-100 shadow-lg shadow-neutral-200/50 p-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center">
                  <span className="text-lg">❤️</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-black">1.2K likes</p>
                  <p className="text-[10px] text-neutral-400">this week</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Feature Highlights Grid */}
      <section className="bg-neutral-50/80 border-y border-neutral-100 py-12 md:py-20 z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-black mb-3">Why ChatMEET?</h2>
            <p className="text-neutral-500 text-sm max-w-md mx-auto">Everything you need for a modern social networking experience, all in one place.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-7 bg-white rounded-2xl border border-neutral-100 hover:border-sky-200 hover:scale-[1.03] hover:shadow-xl hover:shadow-sky-500/5 cursor-pointer transition-all duration-300 group">
              <div className="w-12 h-12 bg-sky-50 group-hover:bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 mb-5 transition-colors">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-black mb-2">Real-Time Messaging</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Ultra-fast message delivery and typing indicators powered by WebSockets for an instantaneous chat experience.
              </p>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-neutral-100 hover:border-indigo-200 hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-5 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-black mb-2">Community Hubs</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Join, create, and manage community channels based on specific categories, sharing posts with matching audiences.
              </p>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-neutral-100 hover:border-sky-200 hover:scale-[1.03] hover:shadow-xl hover:shadow-sky-500/5 cursor-pointer transition-all duration-300 group">
              <div className="w-12 h-12 bg-sky-50 group-hover:bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 mb-5 transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-black mb-2">Secure Authentication</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Safe registration and user login guarded by secure OTP email verification and modern token-based auth structures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Extended Multi-Column Footer */}
      <footer className="w-full bg-black text-white border-t border-black pt-12 md:pt-16 pb-8 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-12">
          {/* Brand/About Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Rocket className="text-white w-4.5 h-4.5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white uppercase">
                ChatMEET
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              ChatMEET is a next-generation real-time social networking platform. Built on modern web technologies, it offers high-speed communication, community hub creations, interactive media feeds, and clean, clutter-free layouts.
            </p>
            <p className="text-xs text-neutral-500">
              Designed with user privacy and premium aesthetics at its core.
            </p>
          </div>

          {/* Product Links Column */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">User Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Join Channels</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Feeds & News</Link></li>
            </ul>
          </div>

          {/* Tech Stack Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              Core Tech Stack
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                React 18 & Vite (TypeScript)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                TailwindCSS & Framer Motion
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                Node.js & Express API
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                PostgreSQL & Socket.io WebSockets
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Specs</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-black mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p className="text-center md:text-left">&copy; {new Date().getFullYear()} ChatMEET. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <a href="#" onClick={(e) => openFeedback(e, 'bug')} className="hover:text-white transition-colors">Report Bug</a>
            <a href="#" onClick={(e) => openFeedback(e, 'feedback')} className="hover:text-white transition-colors">Feedback</a>
            <a href="https://github.com/Srinadh0219" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        defaultType={feedbackType} 
      />
    </div>
  );
}

export default Home;
