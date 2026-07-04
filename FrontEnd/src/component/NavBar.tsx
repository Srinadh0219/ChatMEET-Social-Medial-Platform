import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { Rocket, Search, LogOut, Send, User } from 'lucide-react';
import auth from '../auth/auth-help';
import { read, searchuser } from '../api/api-post';
import PulseLoader from "react-spinners/PulseLoader";

interface UserDecoded {
  id: string;
  name: string;
  email: string;
}

const NavBar: React.FC = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<any>({});
  
  const nav = useNavigate();
  const jwt = auth.isAuthenticated();
  const user1 = jwt ? (jwtDecode(jwt.token) as UserDecoded) : null;

  useEffect(() => {
    if (!user1 || !jwt) return;

    if (search !== "") {
      setLoading(true);
      searchuser(
        { userId: user1.id },
        { t: jwt.token },
        { search: search }
      ).then((data) => {
        setSearchResult(
          (data || []).filter((u: any) => (u.id || u._id) !== user1.id)
        );
        setLoading(false);
      });
    } else {
      setSearchResult([]);
    }
  }, [search]);

  useEffect(() => {
    const checkLike = (likes: string[] = []) => {
      return user1 ? likes.indexOf(user1.id) !== -1 : false;
    };
    const fetchUser = async () => {
      if (!user1 || !jwt) return;
      try {
        const data = await read({ userId: user1.id }, { t: jwt.token });
        setValues({
          id: data.id || data._id,
          name: data.name,
          email: data.email,
          image: data.image,
          about: data.about,
          update: data.updated,
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUser();
  }, [user1, jwt]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo1");
    nav('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-neutral-100 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => nav('/s')}>
          <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-sky-500/20">
            <Rocket className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-black uppercase hidden sm:block">
            ChatMEET
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md mx-2 sm:mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              className="w-full bg-slate-50 border border-sky-100 focus:border-sky-500 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-black placeholder-neutral-400"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <PulseLoader color="#0284c7" size={4} />
              </div>
            )}
          </div>

          {/* Search Dropdown */}
          {open && searchResult.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-sky-100 rounded-2xl shadow-xl overflow-hidden z-50">
              {searchResult.map((result) => (
                <div 
                  key={result.id || result._id}
                  onClick={() => {
                    const targetId = result.id ?? result._id;
                    nav("/user/" + targetId);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                >
                  <img src={result.image} alt={result.name} className="w-8 h-8 rounded-full object-cover border border-sky-100" />
                  <span className="text-sm font-semibold text-black">{result.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={() => nav('/chat/join')}
            className="p-2 text-neutral-500 hover:text-black transition-colors"
            title="Messages"
          >
            <Send className="w-5.5 h-5.5" />
          </button>
          
          <div 
            onClick={() => {
              if (user1?.id) {
                nav('/user/' + user1.id);
              } else {
                nav('/');
              }
            }}
            className="cursor-pointer group"
          >
            {values.image ? (
              <img
                src={values.image}
                alt="profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 group-hover:border-sky-500 transition-all shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 group-hover:border-sky-500 transition-all">
                <User className="w-5 h-5 text-neutral-400" />
              </div>
            )}
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 text-red-500 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5.5 h-5.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
