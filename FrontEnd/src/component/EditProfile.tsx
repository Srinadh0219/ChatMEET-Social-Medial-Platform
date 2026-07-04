import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import auth from './../auth/auth-help';
import { jwtDecode } from 'jwt-decode';
import { read, update } from '../api/api-post';
import { toast } from 'react-toastify';
import PulseLoader from "react-spinners/PulseLoader";
import NavBar from './NavBar';
import { Camera, Home, Save, User as UserIcon } from 'lucide-react';

interface UserDecoded {
  id: string;
  name: string;
  email: string;
}

const EditProfile: React.FC = () => {
  const nav = useNavigate();
  const params = useParams<{ id: string }>();
  const [picLoading1, setPicLoading1] = useState(false);
  const [values, setValues] = useState<any>({
    name: '',
    about: '',
    email: '',
    password: '',
    image: '',
    update: ''
  });

  const jwt = auth.isAuthenticated();
  const user1 = jwt ? (jwtDecode(jwt.token) as UserDecoded) : null;

  useEffect(() => {
    if (!user1 || !jwt) return;

    read({ userId: user1.id }, { t: jwt.token }).then((data) => {
      if (data) {
        setValues({
          name: data.name || '',
          email: data.email || '',
          image: data.image || '',
          about: data.about || '',
          update: data.updated || ''
        });
      }
    });
  }, []);

  const imageHandler = (pics: File) => {
    if (!pics) return;
    setPicLoading1(true);

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dwjy0lwss");

      fetch("https://api.cloudinary.com/v1_1/dwjy0lwss/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setValues((prev: any) => ({ ...prev, image: data.url.toString() }));
          setPicLoading1(false);
        })
        .catch((err) => {
          console.error(err);
          toast.error('Image upload failed', { position: "top-left", autoClose: 1000 });
          setPicLoading1(false);
        });
    } else {
      toast.error('Photo is invalid', { position: "top-left", autoClose: 1000 });
      setPicLoading1(false);
    }
  };

  const clickSubmit = () => {
    if (!jwt || !params.id) return;
    const payload: any = {
      name: values.name,
      about: values.about,
      email: values.email,
      image: values.image,
    };
    if (values.password) {
      payload.password = values.password;
    }
    update({ userId: params.id }, { t: jwt.token }, payload)
      .then((data) => {
        if (data) {
          toast.success('Profile Updated', { position: "top-left", autoClose: 1000 });
          nav('/user/' + params.id, { replace: true });
        } else {
          toast.error('Failed to update profile', { position: "top-left", autoClose: 1000 });
        }
      })
      .catch(err => {
        console.error('Update error:', err);
        toast.error('Update failed', { position: "top-left", autoClose: 1000 });
      });
  };

  if (!user1) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-white text-black pt-24 pb-12 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-sky-400/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-sky-300/10 blur-[130px] rounded-full pointer-events-none" />

      <NavBar />
      
      <main className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => nav('/s')}
            className="p-2 bg-white border border-sky-100 rounded-xl hover:bg-slate-50 shadow-sm transition-all"
            title="Go to Home"
          >
            <Home className="w-5 h-5 text-neutral-600" />
          </button>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">Edit Profile</h1>
        </div>

        <div className="bg-white border border-sky-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm shadow-sky-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/10 blur-[100px] -z-10 rounded-full" />
          
          <div className="grid md:grid-cols-12 gap-12 items-start">
            {/* Image Upload */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="relative group">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden border-4 border-white shadow-md shadow-sky-500/5 transition-all bg-slate-50 group-hover:border-sky-300">
                  {values.image ? (
                    <img src={values.image} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                      <UserIcon className="w-20 h-20 text-neutral-300" />
                    </div>
                  )}
                </div>
                
                <label className="absolute bottom-4 right-4 p-3 bg-black hover:bg-black rounded-2xl shadow-lg cursor-pointer transition-all active:scale-90 z-20">
                  <Camera className="w-6 h-6 text-white" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => e.target.files && imageHandler(e.target.files[0])}
                  />
                </label>

                {picLoading1 && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
                    <PulseLoader color="#0284c7" size={10} />
                  </div>
                )}
              </div>
              <p className="mt-4 text-xs text-neutral-400 font-semibold">Click camera icon to change photo</p>
            </div>

            {/* Form Fields */}
            <div className="md:col-span-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-500 ml-2">Display Name</label>
                <input 
                  type="text" 
                  value={values.name}
                  onChange={(e) => setValues({ ...values, name: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-100 focus:border-sky-500 rounded-2xl py-3 px-5 focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-black placeholder-neutral-400 text-sm font-medium"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-500 ml-2">Bio / About</label>
                <textarea 
                  value={values.about}
                  onChange={(e) => setValues({ ...values, about: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 border border-sky-100 focus:border-sky-500 rounded-2xl py-3 px-5 focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-black placeholder-neutral-400 resize-none text-sm font-medium"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-2">Email Address</label>
                  <input 
                    type="email" 
                    value={values.email}
                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                    className="w-full bg-slate-50 border border-sky-100 focus:border-sky-500 rounded-2xl py-3 px-5 focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-black placeholder-neutral-400 text-sm font-medium"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-2">New Password</label>
                  <input 
                    type="password" 
                    value={values.password || ''}
                    onChange={(e) => setValues({ ...values, password: e.target.value })}
                    className="w-full bg-slate-50 border border-sky-100 focus:border-sky-500 rounded-2xl py-3 px-5 focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all text-black placeholder-neutral-400 text-sm font-medium"
                    placeholder="Leave empty to keep current"
                  />
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={clickSubmit}
                  className="flex-1 bg-black hover:bg-black py-4 rounded-2xl font-bold text-white shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
                <button 
                  onClick={() => nav('/s')}
                  className="flex-1 bg-white border border-sky-100 hover:bg-slate-50 py-4 rounded-2xl font-bold text-black transition-all shadow-sm text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
              </div>

              {values.update && (
                <p className="text-center text-xs text-neutral-400 font-semibold mt-4">
                  Last updated: {new Date(values.update).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
