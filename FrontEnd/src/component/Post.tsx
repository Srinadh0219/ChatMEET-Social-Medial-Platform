import React, { useState, ChangeEvent, MouseEvent } from 'react';
import auth from './../auth/auth-help';
import { jwtDecode } from 'jwt-decode';
import { create } from "../api/api-post";
import { toast } from 'react-toastify';
import PulseLoader from "react-spinners/PulseLoader";
import { Camera, Image as ImageIcon } from 'lucide-react';

interface UserDecoded {
  id: string;
  name: string;
  email: string;
}

interface PostProps {
  onAdd1: (data: any) => void;
}

const Post: React.FC<PostProps> = ({ onAdd1 }) => {
  const [text, setText] = useState('');
  const [pic, setPic] = useState<string | undefined>();
  const [image, setImage] = useState<File | undefined>();
  const [picLoading, setPicLoading] = useState(false);
  const [picLoading1, setPicLoading1] = useState(false);

  const jwt = auth.isAuthenticated();
  const user = jwt ? (jwtDecode(jwt.token) as UserDecoded) : null;

  const submitHandler = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!user || !jwt) return;

    setPicLoading(true);

    if (!text && !pic) {
      toast.warning('Please type something', { position: "top-left", autoClose: 1000 });
      setPicLoading(false);
      return;
    }

    try {
      const postData = {
        Text: text,
        pic: pic,
        user: { id: user.id, name: user.name },
        community: null,
      };

      create(
        { userId: user.id },
        { t: jwt.token },
        postData
      ).then((d) => {
        setPic(undefined);
        setText('');
        setImage(undefined);
        onAdd1(d);
      });

    } catch (error) {
      console.error(error);
      toast.error('Something went wrong', { position: "top-left", autoClose: 1000 });
    } finally {
      setPicLoading(false);
    }
  };

  const imageHandler = (pics: File) => {
    if (!pics) return;
    setPicLoading1(true);

    if (pics.type === "image/jpeg" || pics.type === "image/png" || pics.type === "image/jpg") {
      setImage(pics);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPic(reader.result as string);
        setPicLoading1(false);
      };
      reader.readAsDataURL(pics);
    } else {
      toast.error('Photo is invalid', { position: "top-left", autoClose: 1000 });
      setPicLoading1(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-sky-100 rounded-2xl p-4 text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 transition-all resize-none text-sm"
            placeholder={`What's on your mind, Ramesh?`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="cursor-pointer group flex items-center gap-2 text-neutral-500 hover:text-sky-600 transition-colors">
            <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-sky-100 transition-colors">
              <Camera className="w-5 h-5 text-neutral-600 group-hover:text-sky-600" />
            </div>
            <span className="text-sm font-semibold">Photo</span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => e.target.files && imageHandler(e.target.files[0])}
            />
          </label>
          
          {picLoading1 && <PulseLoader color="#0284c7" size={6} />}
          {image && !picLoading1 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 rounded-full">
              <ImageIcon className="w-3 h-3 text-sky-600" />
              <span className="text-xs text-sky-600 font-bold truncate max-w-[100px]">{image.name}</span>
            </div>
          )}
        </div>

        <button
          onClick={submitHandler}
          disabled={picLoading || picLoading1}
          className="bg-black hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed px-8 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-md shadow-black/10 flex items-center gap-2"
        >
          {picLoading ? <PulseLoader color="#ffffff" size={6} /> : "Post"}
        </button>
      </div>
    </div>
  );
};

export default Post;
