import React, { useState } from 'react';
import { uncomment } from '../api/api-post';
import auth from './../auth/auth-help';
import { jwtDecode } from 'jwt-decode';
import { Trash2, User as UserIcon } from 'lucide-react';

interface UserDecoded {
  id: string;
  name: string;
  email: string;
}

interface CommentProps {
  comments: any[];
  postId: string;
  updateComments: (comments: any[]) => void;
}

const Comment: React.FC<CommentProps> = ({ comments, postId, updateComments }) => {
  const [limit, setLimit] = useState(2);
  const jwt = auth.isAuthenticated();
  const user1 = jwt ? (jwtDecode(jwt.token) as UserDecoded) : null;

  const deleteComment = (comment: any) => () => {
    if (!user1 || !jwt) return;
    uncomment(
      { userId: user1.id },
      { t: jwt.token },
      postId,
      comment
    ).then((data) => {
      if (data && data.comments) {
        updateComments(data.comments);
      }
    });
  };

  if (!user1) return null;

  return (
    <div className="px-6 py-4 space-y-4">
      {comments.slice(0, limit).map((item, idx) => (
        <div key={item._id || idx} className="flex gap-3 items-start group">
          <div className="flex-shrink-0">
            {item.commentedBy.image ? (
              <img 
                src={item.commentedBy.image} 
                alt={item.commentedBy.name} 
                className="w-8 h-8 rounded-full object-cover border border-sky-100" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-sky-100">
                <UserIcon className="w-4 h-4 text-neutral-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 bg-slate-50 border border-sky-100/50 rounded-2xl px-4 py-2.5 relative">
            <div className="flex justify-between items-start">
              <h5 className="text-xs font-bold text-black">{item.commentedBy.name}</h5>
              {item.commentedBy._id === user1.id && (
                <button 
                  onClick={deleteComment(item)}
                  className="p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-sm text-neutral-600 mt-1 font-medium">{item.text}</p>
          </div>
        </div>
      ))}

      {comments.length > limit && (
        <button 
          onClick={() => setLimit(limit + 4)}
          className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors ml-11"
        >
          View more comments
        </button>
      )}
    </div>
  );
};

export default Comment;
