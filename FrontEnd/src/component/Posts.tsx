import React, { useState, useEffect, useCallback, KeyboardEvent } from 'react';
import auth from './../auth/auth-help';
import { jwtDecode } from 'jwt-decode';
import { Like, unlike, comment as commentApi, remove, read } from '../api/api-post';
import Comment from './Comment';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Trash2, Send, Clock, User as UserIcon, Bookmark, Share2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

interface UserDecoded {
  id: string;
  name: string;
  email: string;
}

interface PostsProps {
  post: any;
  updatePosts: (post: any) => void;
}

/* ── Relative time helper ──────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'just now';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

const Posts: React.FC<PostsProps> = ({ post, updatePosts }) => {
  const nav = useNavigate();
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [caption, setCaption] = useState(post.caption ? post.caption.substr(0, 300) : "");
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);

  const jwt = auth.isAuthenticated();
  const user1 = jwt ? (jwtDecode(jwt.token) as UserDecoded) : null;

  const checkLike = (likes: any[] = []) => {
    if (!user1) return false;
    return likes.some((l: any) => {
      // likes array can be UUID strings or objects with id/_id
      if (typeof l === 'string') return l === user1!.id;
      return (l?.id || l?._id) === user1!.id;
    });
  };

  const [values, setValues] = useState({
    like: checkLike(post.likes),
    likes: Array.isArray(post.likes) ? post.likes.length : (post.likes || 0),
    comments: post.comments || [],
  });

  const [showMenu, setShowMenu] = useState(false);

  const authorId = post.author_id || post.author?.id || post.author?._id || post.user_details?.id;

  const [text, setText] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!user1 || !jwt) return;
    read({ userId: user1.id }, { t: jwt.token }).then((res) => {
      if (res && res.name) {
        setImage(res.image);
        setName(res.name);
      }
    });
  }, [user1?.id]);

  const clickLike = () => {
    if (!user1 || !jwt) return;
    const callApi = values.like ? unlike : Like;
    const postId = post.id || post._id;

    // Optimistic update
    const optimisticLike = !values.like;
    setValues(prev => ({ ...prev, like: optimisticLike, likes: prev.likes + (optimisticLike ? 1 : -1) }));

    callApi({ userId: user1.id }, { t: jwt.token }, postId)
      .then((data) => {
        if (data && data.error) {
          // Revert on error
          setValues(prev => ({ ...prev, like: !optimisticLike, likes: prev.likes + (optimisticLike ? -1 : 1) }));
          return;
        }
        if (data && Array.isArray(data.likes)) {
          // Server returned fresh likes array
          setValues(prev => ({
            ...prev,
            like: checkLike(data.likes),
            likes: data.likes.length,
          }));
        }
      })
      .catch(() => {
        // Revert optimistic update on network error
        setValues(prev => ({ ...prev, like: !optimisticLike, likes: prev.likes + (optimisticLike ? -1 : 1) }));
      });
  };

  const handleDoubleTap = useCallback(() => {
    if (!user1 || !jwt) return;
    if (!values.like) {
      const postId = post.id || post._id;
      // Optimistic update
      setValues(prev => ({ ...prev, like: true, likes: prev.likes + 1 }));
      Like({ userId: user1.id }, { t: jwt.token }, postId)
        .then((data) => {
          if (data && Array.isArray(data.likes)) {
            setValues(prev => ({
              ...prev,
              like: checkLike(data.likes),
              likes: data.likes.length,
            }));
          }
        })
        .catch(() => {
          // Revert on error
          setValues(prev => ({ ...prev, like: false, likes: prev.likes - 1 }));
        });
    }
    setShowDoubleTapHeart(true);
    setTimeout(() => setShowDoubleTapHeart(false), 800);
  }, [user1, jwt, values, post.id, post._id]);

  const addComment = () => {
    if (!user1 || !jwt || !text) return;

    commentApi({ userId: user1.id }, { t: jwt.token }, post.id || post._id, text).then((data) => {
      if (data && !data.error) {
        setText('');
        setShowComments(true);
        if (data.comments) {
          setValues({ ...values, comments: data.comments });
        } else {
          const newComment = {
            _id: data.id || data._id,
            text: data.text,
            commentedBy: {
              _id: user1.id,
              name: data.commenter?.name || user1.name,
              image: data.commenter?.image || image,
            },
          };
          setValues({ ...values, comments: [...values.comments, newComment] });
        }
      }
    }).catch(console.error);
  };

  const deletePost = () => {
    if (!jwt) return;
    remove({ postId: post.id || post._id }, { t: jwt.token }).then((data) => {
      updatePosts(data);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      addComment();
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/user/${post.author?.id || post.author?._id || post.user_details?.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Check out this post!', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!', { position: 'top-right', autoClose: 1500 });
      }
    } catch {
      navigator.clipboard.writeText(url).catch(() => {});
      toast.success('Link copied!', { position: 'top-right', autoClose: 1500 });
    }
  };

  if (!user1) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-sm shadow-sky-500/5"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="cursor-pointer"
            onClick={() => nav('/user/' + (post.author?.id || post.author?._id || (post.user_details && post.user_details.id)))}
          >
            {post.author?.image ? (
              <img
                src={post.author.image}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-sky-100 shadow-sm"
              />
            ) : post.user_details?.image ? (
              <img
                src={post.user_details.image}
                alt={post.user_details.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-sky-100 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-sky-100">
                <UserIcon className="w-6 h-6 text-neutral-400" />
              </div>
            )}
          </div>
          <div>
            <h4 
              className="font-bold text-black hover:text-sky-600 transition-colors cursor-pointer"
              onClick={() => nav('/user/' + (post.author?.id || post.author?._id || (post.user_details && post.user_details.id)))}
            >
              {post.author?.name || (post.user_details && post.user_details.name)}
            </h4>
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-semibold">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{timeAgo(post.created || post.createdAt || post.created_at || '')}</span>
            </div>
          </div>
        </div>

        {authorId === user1.id && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-neutral-400 hover:text-black hover:bg-slate-50 rounded-full transition-all"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-1 w-36 bg-white border border-sky-100 rounded-2xl shadow-xl shadow-sky-500/10 py-2 z-50"
                >
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      deletePost();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        {caption && (
          <p className="text-neutral-700 leading-relaxed text-sm font-medium">
            {showFullCaption ? post.caption : caption}
            {post.caption && post.caption.length > 300 && !showFullCaption && (
              <button 
                onClick={() => setShowFullCaption(true)}
                className="text-sky-600 hover:text-sky-700 ml-2 text-sm font-bold"
              >
                ...show more
              </button>
            )}
          </p>
        )}
      </div>

      {/* Photo with double-tap */}
      {(post.photo || post.pic || post.image) && (
        <div className="px-6 pb-6 relative" onDoubleClick={handleDoubleTap}>
          <img 
            src={post.photo || post.pic || post.image} 
            alt="Post content" 
            className="w-full rounded-2xl border border-sky-100 object-cover max-h-[500px]"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          
          {/* Double-tap heart animation */}
          <AnimatePresence>
            {showDoubleTapHeart && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t border-sky-50/50 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={clickLike}
            className={`flex items-center gap-2 transition-all font-bold text-sm ${values.like ? 'text-sky-500' : 'text-neutral-500 hover:text-black'}`}
          >
            <Heart className={`w-5.5 h-5.5 transition-transform hover:scale-110 ${values.like ? 'fill-sky-500' : ''}`} />
            <span>{values.likes}</span>
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-neutral-500 hover:text-black transition-all font-bold text-sm"
          >
            <MessageSquare className="w-5.5 h-5.5 hover:scale-110 transition-transform" />
            <span>{values.comments.length}</span>
          </button>

          <button
            onClick={handleShare}
            className="text-neutral-500 hover:text-black transition-all"
            title="Share"
          >
            <Share2 className="w-5 h-5 hover:scale-110 transition-transform" />
          </button>
        </div>

        <button
          onClick={() => {
            setBookmarked(!bookmarked);
            toast.success(bookmarked ? 'Removed from saved' : 'Post saved!', { position: 'top-right', autoClose: 1000 });
          }}
          className={`transition-all ${bookmarked ? 'text-indigo-500' : 'text-neutral-500 hover:text-black'}`}
          title="Save"
        >
          <Bookmark className={`w-5 h-5 hover:scale-110 transition-transform ${bookmarked ? 'fill-indigo-500' : ''}`} />
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-sky-50/50 bg-slate-50/50"
          >
            <Comment 
              updateComments={(newComments: any) => setValues({ ...values, comments: newComments })} 
              postId={post.id || post._id} 
              comments={values.comments} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Input */}
      <div className="px-6 py-4 border-t border-sky-50/50 flex items-center gap-4 bg-white">
        <input 
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          className="flex-1 bg-slate-50 border border-sky-100 focus:border-sky-500 rounded-full py-2 px-4 text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all font-medium"
        />
        <button 
          onClick={addComment}
          className="p-2 text-sky-600 hover:text-sky-700 disabled:text-neutral-300 transition-colors"
          disabled={!text}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default Posts;
