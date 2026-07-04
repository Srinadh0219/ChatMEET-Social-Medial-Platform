import React, { useState, useEffect } from 'react';
import auth from './../auth/auth-help';
import { jwtDecode } from 'jwt-decode';
import { findPeople, follow } from '../api/api-post';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserPlus, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserDecoded {
  id: string;
  name: string;
  email: string;
}

const FindPeople: React.FC = () => {
  const nav = useNavigate();
  const [users, setUsers] = useState<any[]>([]);

  const jwt = auth.isAuthenticated();
  const user1 = jwt ? (jwtDecode(jwt.token) as UserDecoded) : null;

  useEffect(() => {
    if (!user1 || !jwt) return;
    findPeople({ userId: user1.id }, { t: jwt.token })
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('FindPeople failed:', err);
        }
      });
  }, [user1, jwt]);

  const clickFollow = (user: any, index: number) => {
    if (!user1 || !jwt) return;

    follow(
      { userId: user1.id },
      { t: jwt.token },
      user.id || user._id
    ).then((data) => {
      if (data) {
        const updatedUsers = [...users];
        updatedUsers.splice(index, 1);
        setUsers(updatedUsers);
        toast.success(`Following ${user.name}!`, { position: "top-right", autoClose: 1000 });
      }
    });
  };

  if (!user1) return null;

  return (
    <div className="space-y-4">
      <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {users.map((user, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            key={user.id || user._id} 
            className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors group border-b border-slate-50 last:border-0"
          >
            <div 
              className="relative cursor-pointer" 
              onClick={() => nav('/user/' + (user.id || user._id))}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-sky-100"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-sky-100">
                  <UserIcon className="w-5 h-5 text-neutral-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h6 
                onClick={() => nav('/user/' + (user.id || user._id))} 
                className="text-sm font-bold text-black truncate cursor-pointer hover:text-sky-600 transition-colors"
              >
                {user.name}
              </h6>
              <p className="text-xs text-neutral-400 truncate font-medium">Suggested for you</p>
            </div>

            <button 
              onClick={() => clickFollow(user, idx)}
              className="p-2 text-sky-600 hover:bg-sky-500 hover:text-white bg-sky-50 rounded-xl transition-all"
              title="Follow"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </motion.div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-neutral-400 font-semibold">No suggestions right now</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPeople;
