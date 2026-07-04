import React, { useState, useEffect } from 'react';
import PulseLoader from "react-spinners/PulseLoader";
import Post from './Post';
import Posts from './Posts';
import auth from './../auth/auth-help';
import { jwtDecode } from 'jwt-decode';
import { getFeed, getAllPosts, findPeople } from "../api/api-post";
import { getMyCommunities } from "../api/api-community";
import FindPeople from "./FindPeople";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import MoonLoader from 'react-spinners/MoonLoader';
import NavBar from './NavBar';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Compass, Sparkles, TrendingUp, User as UserIcon } from 'lucide-react';

interface UserDecoded {
  id: string;
  name: string;
  email: string;
}

/* ── Skeleton Card ─────────────────────────────────────────────── */
const SkeletonCard: React.FC = () => (
  <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-sm animate-pulse">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-full bg-slate-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 rounded-full w-32" />
        <div className="h-3 bg-slate-100 rounded-full w-24" />
      </div>
    </div>
    <div className="space-y-3 mb-6">
      <div className="h-4 bg-slate-100 rounded-full w-full" />
      <div className="h-4 bg-slate-100 rounded-full w-4/5" />
      <div className="h-4 bg-slate-100 rounded-full w-3/5" />
    </div>
    <div className="h-48 bg-slate-100 rounded-2xl" />
    <div className="flex gap-6 mt-6">
      <div className="h-6 w-16 bg-slate-100 rounded-full" />
      <div className="h-6 w-16 bg-slate-100 rounded-full" />
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const [posts, SetPosts] = useState<any[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'following' | 'explore'>('following');
  const [storyUsers, setStoryUsers] = useState<any[]>([]);
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const nav = useNavigate();

  const jwt = auth.isAuthenticated();
  let user1: UserDecoded | null = null;
  if (jwt && jwt.token) {
    try {
      user1 = jwtDecode(jwt.token) as UserDecoded;
    } catch (e) {
      console.error('Failed to decode JWT', e);
      user1 = null;
    }
  }

  /* ── Load Feed ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!user1 || !jwt) return;
    setLoading(true);

    if (activeTab === 'following') {
      getFeed({ userId: user1.id }, { t: jwt.token })
        .then((data) => {
          if (Array.isArray(data)) {
            SetPosts(data);
          } else if (data && Array.isArray(data.posts)) {
            SetPosts(data.posts);
          } else {
            SetPosts([]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch feed:', err);
          SetPosts([]);
          setLoading(false);
        });
    } else {
      getAllPosts({ t: jwt.token })
        .then((data) => {
          if (Array.isArray(data)) {
            SetPosts(data);
          } else if (data && Array.isArray(data.posts)) {
            SetPosts(data.posts);
          } else {
            SetPosts([]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch all posts:', err);
          SetPosts([]);
          setLoading(false);
        });
    }
  }, [activeTab]);

  /* ── Load Stories (people you follow) ────────────────────────── */
  useEffect(() => {
    if (!user1 || !jwt) return;
    const abortController = new AbortController();
    const signal = abortController.signal;
    findPeople({ userId: user1.id }, { t: jwt.token }, signal)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setStoryUsers(data.slice(0, 10));
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Find people for stories failed:', err);
        }
      });
    return () => abortController.abort();
  }, [user1, jwt]);

  /* ── Load My Communities for sidebar ─────────────────────────── */
  useEffect(() => {
    if (!user1 || !jwt) return;
    getMyCommunities({ userId: user1.id }, { t: jwt.token }).then((data) => {
      if (data && Array.isArray(data)) {
        setMyCommunities(data.slice(0, 5));
      }
    }).catch(() => {});
  }, []);

  function addOne(data1: any) {
    setIsNew(true);
    const updatedPosts = [data1, ...posts];
    
    setTimeout(() => {
      SetPosts(updatedPosts);
      setIsNew(false);
      toast.success('Post Uploaded', { position: "top-left", autoClose: 1500 });
      nav('/');
    }, 700);
  }

  const updatePosts = (post: any) => {
    const updated = posts.filter((item) => item._id !== post._id);
    toast.success('Post Deleted', { position: "top-left", autoClose: 1500 });
    SetPosts(updated);
  };

  if (!user1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-black">
        <PulseLoader color="#0284c7" size={15} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black pt-20 relative overflow-hidden">


      <NavBar />

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Main Feed Column ────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Stories Bar */}
            {storyUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-sky-100 rounded-3xl p-4 shadow-sm shadow-sky-500/5"
              >
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {storyUsers.map((user, idx) => (
                    <motion.div
                      key={user.id || user._id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => nav('/user/' + (user.id || user._id))}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group flex-shrink-0"
                    >
                      <div className="p-[3px] rounded-full bg-gradient-to-tr from-sky-400 to-sky-600 group-hover:from-sky-500 group-hover:to-sky-700 transition-all shadow-sm">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-14 h-14 rounded-full object-cover border-[3px] border-white"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-slate-50 border-[3px] border-white flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500 truncate max-w-[60px] group-hover:text-black font-semibold transition-colors">
                        {user.name?.split(' ')[0]}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
 
            {/* Feed Tabs */}
            <div className="bg-slate-100/80 border border-sky-100/50 rounded-2xl p-1.5 flex gap-1.5">
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'following'
                    ? 'bg-black text-white shadow-md'
                    : 'text-neutral-500 hover:text-black hover:bg-slate-200/50'
                }`}
              >
                <Users className="w-4 h-4" />
                Following
              </button>
              <button
                onClick={() => setActiveTab('explore')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'explore'
                    ? 'bg-black text-white shadow-md'
                    : 'text-neutral-500 hover:text-black hover:bg-slate-200/50'
                }`}
              >
                <Compass className="w-4 h-4" />
                Explore
              </button>
            </div>

            {/* Post Composer */}
            {activeTab === 'following' && (
              <div className="bg-white border border-sky-100 rounded-3xl p-4 sm:p-6 shadow-sm shadow-sky-500/5">
                <Post onAdd1={addOne} />
              </div>
            )}

            {isNew && (
              <div className="flex justify-center py-4">
                <MoonLoader color="#0284c7" size={40} />
              </div>
            )}

            {/* Feed Posts */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  <>
                    {posts.map((post, idx) => (
                      <Posts updatePosts={updatePosts} key={post._id || idx} post={post} />
                    ))}
                    {posts.length === 0 && !isNew && (
                      <div className="text-center py-20 bg-white border border-sky-100 rounded-3xl">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-50 flex items-center justify-center border border-sky-100">
                          {activeTab === 'following' ? (
                            <Users className="w-10 h-10 text-neutral-300" />
                          ) : (
                            <Sparkles className="w-10 h-10 text-neutral-300" />
                          )}
                        </div>
                        <p className="text-neutral-600 text-lg font-bold">
                          {activeTab === 'following' 
                            ? 'No posts from people you follow yet' 
                            : 'No posts to explore yet'}
                        </p>
                        <p className="text-neutral-400 text-sm mt-2 font-semibold">
                          {activeTab === 'following'
                            ? 'Start following people to see their posts here!'
                            : 'Be the first to share something!'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 mt-8 lg:mt-0">
            {/* People You Might Know */}
            <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-sm shadow-sky-500/5">
              <h3 className="text-lg font-black mb-6 text-black uppercase tracking-tight">
                People you might know
              </h3>
              <FindPeople />
            </div>

            {/* My Communities */}
            {myCommunities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-sky-100 rounded-3xl p-6 shadow-sm shadow-sky-500/5"
              >
                <h3 className="text-lg font-black mb-4 text-black uppercase tracking-tight">
                  My Communities
                </h3>
                <div className="space-y-3">
                  {myCommunities.map((c: any) => (
                    <div
                      key={c._id}
                      onClick={() => nav('/community/' + c._id)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                        {c.avatar ? (
                          <img src={c.avatar} alt={c.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Users className="w-5 h-5 text-sky-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="text-sm font-bold text-black truncate group-hover:text-sky-600 transition-colors">
                          {c.name}
                        </h6>
                        <p className="text-xs text-neutral-400 font-semibold">{c.members?.length || 0} members</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => nav('/communities')}
                  className="w-full mt-4 py-2 text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors"
                >
                  View All Communities →
                </button>
              </motion.div>
            )}

            {/* Trending Section */}
            <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-sm shadow-sky-500/5">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-black uppercase tracking-tight">
                <TrendingUp className="w-5 h-5 text-sky-600" />
                <span>Trending</span>
              </h3>
              <div className="space-y-3">
                {['#CreativeSpace', '#TechTalk', '#DigitalArt', '#Photography', '#DevLife'].map((tag, idx) => (
                  <div key={tag} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-black">{tag}</p>
                      <p className="text-xs text-neutral-400 font-semibold">{Math.floor(Math.random() * 500 + 100)} posts</p>
                    </div>
                    <span className="text-xs text-neutral-300 font-bold">#{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HomePage;
