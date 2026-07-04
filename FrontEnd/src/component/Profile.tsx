import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { read, unfollow, follow, checkFollow, getFeed, getFeedUser } from "../api/api-post";
import Posts from "./Posts";
import auth from "./../auth/auth-help";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import NavBar from "./NavBar";
import { Edit3, UserPlus, UserMinus, Grid, Users, UserCheck, User as UserIcon, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PulseLoader from "react-spinners/PulseLoader";

interface UserDecoded {
  id: string;
  name: string;
  email: string;
}

const Profile: React.FC = () => {
  const params = useParams<{ id: string }>();
  const nav = useNavigate();
  const location = useLocation();

  const [value, setValues] = useState<any>({
    user: { following: [], followers: [] },
    following: false,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  
  const jwt = auth.isAuthenticated();
  const user1 = jwt ? (jwtDecode(jwt.token) as UserDecoded) : null;

  const getUserImage = (image: string) => {
    return image && image !== "" ? image : "";
  };

  const loadUser = () => {
    if (!jwt || !params.id) return;
    setLoadingProfile(true);
    read({ userId: params.id }, { t: jwt.token })
      .then((res) => {
        if (res) {
          const userData = res.user ? res.user : res;
          const following = checkFollow(userData, user1?.id || "");
          const userWithName = {
            ...userData,
            name: userData.name || userData.username || "Unnamed User",
          };
          setValues((prev: any) => ({ ...prev, user: userWithName, following }));
          const uid = userWithName.id || userWithName._id;
          if (uid) loadPost(uid);
        }
      })
      .catch((err) => console.error('Error loading profile:', err))
      .finally(() => setLoadingProfile(false));
  };

  const loadPost = (userId: string) => {
    if (!jwt) return;
    getFeedUser({ userId }, { t: jwt.token })
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else if (data && Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else {
          setPosts([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load user posts:', err);
        setPosts([]);
      });
  };

  useEffect(() => {
    loadUser();
  }, [params.id, location.pathname, location.state]);

  const clickFollow = () => {
    if (!user1 || !jwt) return;
    let callApi = !value.following ? follow : unfollow;
    callApi({ userId: user1.id }, { t: jwt.token }, value.user.id || value.user._id).then((data) => {
      if (data) {
        if (!value.following) {
          toast.success(`Following ${value.user.name}!`, { position: "top-right", autoClose: 1000 });
        } else {
          toast.warn(`Unfollowing ${value.user.name}!`, { position: "top-right", autoClose: 1000 });
        }
        setValues({ ...value, following: !value.following });
        loadUser();
      }
    });
  };

  if (!user1) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50 text-black">Please log in</div>;
  }
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-black">
        <PulseLoader color="#0284c7" size={15} />
      </div>
    );
  }
  if (!value.user || !value.user.name) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-black">
        <p className="font-semibold text-neutral-500">User data not available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-white text-black pt-20 pb-10 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-sky-400/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-sky-300/10 blur-[130px] rounded-full pointer-events-none" />

      <NavBar />
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto flex items-center gap-4 p-4 relative z-10">
        <button onClick={() => nav(-1)} className="p-2 bg-white border border-sky-100 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">Profile</h1>
      </div>
      
      <main className="max-w-4xl mx-auto px-4 mt-4 relative z-10">
        {/* Profile Header */}
        <div className="bg-white border border-sky-100 rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-sm shadow-sky-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/10 blur-[100px] -z-10 rounded-full" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative">
              {value.user.image ? (
                <img
                  src={`${value.user.image}?${new Date().getTime()}`}
                  alt="profile"
                  className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover border-4 border-white shadow-md shadow-sky-500/5"
                />
              ) : (
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-slate-50 flex items-center justify-center border-4 border-white shadow-sm">
                  <UserIcon className="w-16 h-16 text-neutral-300" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black mb-4 text-black">
                {value.user.name}
              </h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8 text-sm text-neutral-500 font-semibold">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-xl font-black text-black">{posts.length}</span>
                  <span>Posts</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-xl font-black text-black">{value.user.followers?.length || 0}</span>
                  <span>Followers</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-xl font-black text-black">{value.user.following?.length || 0}</span>
                  <span>Following</span>
                </div>
              </div>

              <div className="flex justify-center md:justify-start">
                {user1.id === params.id ? (
                  <button
                    onClick={() => nav("/user/edit/" + user1.id)}
                    className="flex items-center gap-2 bg-black hover:bg-black text-white px-8 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-md shadow-black/10 text-sm uppercase tracking-wide"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <button 
                    onClick={clickFollow}
                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all active:scale-95 text-sm uppercase tracking-wide ${
                      !value.following 
                      ? "bg-black hover:bg-black text-white shadow-lg shadow-black/10" 
                      : "bg-white border border-sky-100 hover:bg-slate-50 text-black shadow-sm"
                    }`}
                  >
                    {!value.following ? <UserPlus className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                    {!value.following ? "Follow" : "Unfollow"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mt-12 mb-8">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-sky-100/50 flex flex-wrap justify-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'posts', label: 'Posts', icon: Grid },
              { id: 'followers', label: 'Followers', icon: Users },
              { id: 'following', label: 'Following', icon: UserCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === tab.id 
                  ? "bg-white text-black border border-sky-100 shadow-md" 
                  : "text-neutral-500 hover:text-black"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
              <motion.div 
                key="posts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {posts.map((post) => (
                  <Posts key={post.id || post._id} post={post} updatePosts={loadUser} />
                ))}
                {posts.length === 0 && (
                  <div className="text-center py-20 bg-white border border-sky-100 rounded-3xl">
                    <p className="text-neutral-400 font-semibold text-sm">No posts yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'followers' && (
              <motion.div 
                key="followers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {value.user.followers?.map((pers: any) => (
                  <div 
                    key={pers.id || pers._id} 
                    onClick={() => nav("/user/" + (pers.id || pers._id))} 
                    className="bg-white border border-sky-100 p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 shadow-sm transition-all cursor-pointer group"
                  >
                    {pers.image ? (
                      <img src={pers.image} alt={pers.name} className="w-12 h-12 rounded-full object-cover border border-sky-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-sky-100">
                        <UserIcon className="w-6 h-6 text-neutral-400" />
                      </div>
                    )}
                    <span className="font-bold text-black group-hover:text-sky-600 transition-colors">{pers.name}</span>
                  </div>
                ))}
                {value.user.followers?.length === 0 && (
                  <div className="col-span-full text-center py-20 text-neutral-400 font-semibold">No followers yet</div>
                )}
              </motion.div>
            )}

            {activeTab === 'following' && (
              <motion.div 
                key="following"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {value.user.following?.map((pers: any) => (
                  <div 
                    key={pers.id || pers._id} 
                    onClick={() => nav("/user/" + (pers.id || pers._id))} 
                    className="bg-white border border-sky-100 p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 shadow-sm transition-all cursor-pointer group"
                  >
                    {pers.image ? (
                      <img src={pers.image} alt={pers.name} className="w-12 h-12 rounded-full object-cover border border-sky-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-sky-100">
                        <UserIcon className="w-6 h-6 text-neutral-400" />
                      </div>
                    )}
                    <span className="font-bold text-black group-hover:text-sky-600 transition-colors">{pers.name}</span>
                  </div>
                ))}
                {value.user.following?.length === 0 && (
                  <div className="col-span-full text-center py-20 text-neutral-400 font-semibold">Not following anyone yet</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Profile;
