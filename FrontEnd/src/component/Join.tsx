import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import auth from "./../auth/auth-help";
import { jwtDecode } from "jwt-decode";
import { io, Socket } from "socket.io-client";
import { 
  searchuser, 
  getChat, 
  setMessage as setMessageApi, 
  fetchChats, 
  getMessage,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup
} from "../api/api-post";
import {
  isSameSenderMargin,
  isSameUser,
  getSender,
  getSenderFull
} from "../config/chatLogic";
import { Edit3, UserPlus, UserMinus, Grid, Users, UserCheck, User as UserIcon, MessageSquare, ArrowLeft, Search, Smile, Paperclip, Send, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PulseLoader from "react-spinners/PulseLoader";

interface UserDecoded {
  id: string;
  name: string;
  email: string;
}

let socket: Socket;
let selectedChatCompare: any;

const Join: React.FC = () => {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notification, setNotification] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [typing, setTyping] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  
  // Group States
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [groupSearch, setGroupSearch] = useState("");
  const [groupSearchResult, setGroupSearchResult] = useState<any[]>([]);
  
  // Group Details / Manage States
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [addMemberSearch, setAddMemberSearch] = useState("");
  const [addMemberSearchResult, setAddMemberSearchResult] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiList = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','😯','😪','😫','😴','😤','😡','😠','🤬','😈','👿','💀','☠️','🤠','🤡','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🐝','🐛','🦋','🐞','🐜','🪰','🪱','🐢','🐍','🦎','🦂','🦀','🦞','🐙','🦑','🦐'];

  const addEmoji = (e: string) => {
    setNewMessage(prev => prev + e);
  };

  /** Detect image content in a message and render as <img> or text */
  const renderMessageContent = (content: string) => {
    if (!content) return null;

    // Match markdown image syntax: ![alt](url_or_base64)
    const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const match = mdImageRegex.exec(content);
    if (match) {
      const beforeImg = content.slice(0, match.index).trim();
      const afterImg = content.slice(match.index + match[0].length).trim();
      return (
        <>
          {beforeImg && <p>{beforeImg}</p>}
          <img src={match[2]} alt={match[1] || 'image'} className="max-w-full max-h-64 rounded-xl object-contain" />
          {afterImg && <p>{afterImg}</p>}
        </>
      );
    }

    // Match raw base64 data URI
    if (content.startsWith('data:image/')) {
      return <img src={content} alt="image" className="max-w-full max-h-64 rounded-xl object-contain" />;
    }

    return content;
  };

  /** Summarize message content for sidebar preview */
  const previewContent = (content: string) => {
    if (!content) return '';
    if (/!\[[^\]]*\]\([^)]+\)/.test(content) || content.startsWith('data:image/')) {
      return '📷 Image';
    }
    return content;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (!file.type.startsWith('image/')) {
      alert('Only image files are supported.');
      return;
    }

    // Just store the file — do NOT upload yet. Upload happens on Send.
    setSelectedFile(file);
  };
  const [isTyping, setIsTyping] = useState(false);
  const [fetchAgain, setFetchAgain] = useState(false);

  const jwt = auth.isAuthenticated();
  const user1 = jwt ? (jwtDecode(jwt.token) as UserDecoded) : null;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user1) return;
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:4001");
    socket.emit("setup", user1);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    socket.on("message recieved", (newMessageRecieved) => {
      if (!selectedChatCompare || (selectedChatCompare.id || selectedChatCompare._id) !== (newMessageRecieved.chat.id || newMessageRecieved.chat._id)) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
        }
      } else {
        setMessages(prev => [...prev, newMessageRecieved]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!user1 || !jwt) return;
    setLoadingChats(true);
    fetchChats({ userId: user1.id }, { t: jwt.token })
      .then((data) => {
        if (Array.isArray(data)) {
          setChats(data);
        } else {
          console.error('Unexpected chat data:', data);
          setChats([]);
        }
        setLoadingChats(false);
      })
      .catch((err) => {
        console.error(err);
        setChats([]);
        setLoadingChats(false);
      });
  }, [fetchAgain]);

  useEffect(() => {
    if (search !== "" && user1 && jwt) {
      searchuser({ userId: user1.id }, { t: jwt.token }, { search }).then((data) => {
        setSearchResult(
          (data || []).filter((u: any) => (u.id || u._id) !== user1.id)
        );
      });
    } else {
      setSearchResult([]);
    }
  }, [search]);

  // Group search triggers
  useEffect(() => {
    if (groupSearch !== "" && user1 && jwt) {
      searchuser({ userId: user1.id }, { t: jwt.token }, { search: groupSearch }).then((data) => {
        setGroupSearchResult(
          (data || []).filter((u: any) => (u.id || u._id) !== user1.id)
        );
      });
    } else {
      setGroupSearchResult([]);
    }
  }, [groupSearch]);

  useEffect(() => {
    if (addMemberSearch !== "" && user1 && jwt) {
      searchuser({ userId: user1.id }, { t: jwt.token }, { search: addMemberSearch }).then((data) => {
        setAddMemberSearchResult(
          (data || []).filter((u: any) => (u.id || u._id) !== user1.id)
        );
      });
    } else {
      setAddMemberSearchResult([]);
    }
  }, [addMemberSearch]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const fetchMessages = async (chat: any) => {
    if (!chat || !user1 || !jwt) return;
    try {
      const data = await getMessage({ userId: user1.id }, { t: jwt.token }, chat.id || chat._id);
      setMessages(data);
      socket.emit("join chat", chat.id || chat._id);
    } catch (error) {
      console.error(error);
    }
  };

  const selectChatHandler = async (chat: any) => {
    setSelectedChat(chat);
    selectedChatCompare = chat;
    fetchMessages(chat);
  };

  const createChatHandler = async (user: any) => {
    if (!user1 || !jwt) return;
    setOpenSearch(false);
    setSearch("");
    const data = await getChat({ userId: user1.id }, { t: jwt.token }, user.id || user._id);
    if (data) {
      selectChatHandler(data);
      setFetchAgain(prev => !prev);
    }
  };

  // Group Handlers
  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0 || !user1 || !jwt) return;
    try {
      const userIds = selectedUsers.map(u => u.id || u._id);
      const data = await createGroupChat(
        { name: groupName, users: userIds },
        { t: jwt.token }
      );
      if (data) {
        setIsGroupModalOpen(false);
        setGroupName("");
        setSelectedUsers([]);
        setGroupSearch("");
        selectChatHandler(data);
        setFetchAgain(prev => !prev);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameGroup = async () => {
    if (!newGroupName || !selectedChat || !jwt) return;
    try {
      const data = await renameGroup(
        { chatId: selectedChat.id || selectedChat._id, chatName: newGroupName },
        { t: jwt.token }
      );
      if (data) {
        setSelectedChat(data);
        setNewGroupName("");
        setFetchAgain(prev => !prev);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (user: any) => {
    if (!selectedChat || !jwt) return;
    if (selectedChat.users.some((u: any) => (u.id || u._id) === (user.id || user._id))) {
      alert("User is already in the group.");
      return;
    }
    try {
      const data = await addToGroup(
        { chatId: selectedChat.id || selectedChat._id, userId: user.id || user._id },
        { t: jwt.token }
      );
      if (data) {
        setSelectedChat(data);
        setAddMemberSearch("");
        setFetchAgain(prev => !prev);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedChat || !jwt || !user1) return;
    try {
      const data = await removeFromGroup(
        { chatId: selectedChat.id || selectedChat._id, userId },
        { t: jwt.token }
      );
      if (data) {
        if (userId === user1.id) {
          setSelectedChat(null);
          selectedChatCompare = null;
          setIsDetailsModalOpen(false);
        } else {
          setSelectedChat(data);
        }
        setFetchAgain(prev => !prev);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectUserForGroup = (user: any) => {
    if (selectedUsers.some(u => (u.id || u._id) === (user.id || user._id))) return;
    setSelectedUsers([...selectedUsers, user]);
    setGroupSearch("");
  };

  const handleDeselectUserForGroup = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => (u.id || u._id) !== userId));
  };

  const postMessage = async () => {
    if (!selectedChat || !user1 || !jwt) return;
    if (!newMessage && !selectedFile) return;

    let messageToSend = newMessage;

    // If there's a pending image file, upload it first then send
    if (selectedFile) {
      setImageUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('upload_preset', 'chat-app');
        formData.append('cloud_name', 'dwjy0lwss');

        const res = await fetch('https://api.cloudinary.com/v1_1/dwjy0lwss/image/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!data.url) throw new Error('Upload failed');

        messageToSend = `![img](${data.url})`;
        setSelectedFile(null);
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('Image upload failed. Please try again.');
        setImageUploading(false);
        return;
      } finally {
        setImageUploading(false);
      }
    }

    setNewMessage('');
    socket.emit('stop typing', selectedChat.id || selectedChat._id);

    try {
      const data = await setMessageApi(
        { id: user1.id, chatId: selectedChat.id || selectedChat._id, content: messageToSend },
        { t: jwt.token }
      );
      socket.emit('new message', data);
      setMessages([...messages, data]);
      setFetchAgain(prev => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socketConnected || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat.id || selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat.id || selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      postMessage();
    }
  };

  if (!user1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-neutral-950 font-bold">
        Please log in
      </div>
    );
  }

  return (
    <div className="h-screen bg-white text-black flex overflow-hidden font-['Outfit',sans-serif] relative">

      {/* Sidebar — hidden on mobile when a chat is selected */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-shrink-0 border-r border-neutral-100 flex-col bg-white relative z-10`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-sky-50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">Chats</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsGroupModalOpen(true)}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-neutral-600 hover:text-black rounded-xl transition-all border border-sky-100 flex items-center gap-1.5 text-xs font-bold"
                title="Create Group Chat"
              >
                <Plus className="w-4 h-4 text-sky-600" />
                <span>Group</span>
              </button>
              <div className="relative">
                {notification.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
                    {notification.length}
                  </div>
                )}
                <MessageSquare className="w-6 h-6 text-neutral-400" />
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search people..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenSearch(true);
              }}
              className="w-full bg-slate-50 border border-sky-100 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 text-black placeholder-neutral-400 font-semibold"
            />
            
            {/* Search Results Dropdown */}
            <AnimatePresence>
              {openSearch && searchResult.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 w-full mt-2 bg-white border border-sky-100 rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  {searchResult.map((result) => (
                    <div 
                      key={result.id || result._id}
                      onClick={() => createChatHandler(result)}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                    >
                      <img src={result.image} alt={result.name} className="w-8 h-8 rounded-full object-cover border border-sky-100" />
                      <span className="text-sm font-semibold text-black">{result.name}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loadingChats ? (
            <div className="flex justify-center py-10">
              <PulseLoader color="#0284c7" size={8} />
            </div>
          ) : (
            (Array.isArray(chats) ? chats.map((chat) => {
              const isGroup = chat.isGroupChat || chat.is_group_chat;
              const otherUser = !isGroup ? getSenderFull(user1, chat.users) : null;
              if (!isGroup && !otherUser) return null;
              
              const isSelected = (selectedChat?.id || selectedChat?._id) === (chat.id || chat._id);
              const chatTitle = isGroup ? chat.chatName : getSender(user1, chat.users);
              
              return (
                <div 
                  key={chat.id || chat._id}
                  onClick={() => selectChatHandler(chat)}
                  className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all ${isSelected ? 'bg-sky-50 border border-sky-100 shadow-sm text-sky-600' : 'hover:bg-slate-50 text-black'}`}
                >
                  <div className="relative">
                    {isGroup ? (
                      <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center font-bold text-sm text-white border-2 border-white shadow-md">
                        {chatTitle ? chatTitle.substring(0, 2).toUpperCase() : 'GP'}
                      </div>
                    ) : (
                      <img src={otherUser?.image} alt={otherUser?.name} className="w-12 h-12 rounded-full object-cover border-2 border-sky-100 shadow-sm" />
                    )}
                    {!isGroup && socketConnected && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-sky-600' : 'text-black'}`}>{chatTitle}</h4>
                      {chat.latestMessage && (
                        <span className={`text-[10px] font-semibold ${isSelected ? 'text-sky-600/70' : 'text-neutral-400'}`}>
                          {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {chat.latestMessage && (
                      <p className={`text-xs truncate font-medium ${isSelected ? 'text-sky-600/70' : 'text-neutral-400'}`}>
                        {previewContent(chat.latestMessage.content)}
                      </p>
                    )}
                  </div>
                </div>
              );
            }) : null)
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative bg-slate-50/30">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-sky-100 flex items-center justify-between bg-white/50 backdrop-blur-xl">
              <div className="flex items-center">
                <button onClick={() => setSelectedChat(null)} className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-xl transition-all mr-2" title="Back to chats">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4">
                  {selectedChat.isGroupChat || selectedChat.is_group_chat ? (
                    <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center font-bold text-xs text-white border border-sky-100 shadow-sm">
                      {selectedChat.chatName ? selectedChat.chatName.substring(0, 2).toUpperCase() : 'GP'}
                    </div>
                  ) : (
                    <img 
                      src={getSenderFull(user1, selectedChat.users)?.image} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover border border-sky-100 shadow-sm" 
                    />
                  )}
                  <div>
                    <h3 className="font-extrabold text-black">
                      {selectedChat.isGroupChat || selectedChat.is_group_chat ? selectedChat.chatName : getSender(user1, selectedChat.users)}
                    </h3>
                    <p className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">
                      {selectedChat.isGroupChat || selectedChat.is_group_chat ? `${selectedChat.users.length} members` : 'Online'}
                    </p>
                  </div>
                </div>
              </div>

              {(selectedChat.isGroupChat || selectedChat.is_group_chat) && (
                <button 
                  onClick={() => {
                    setNewGroupName(selectedChat.chatName || "");
                    setIsDetailsModalOpen(true);
                  }}
                  className="p-2 bg-white hover:bg-slate-50 text-neutral-500 hover:text-black rounded-xl transition-all border border-sky-100 shadow-sm"
                >
                  <Grid className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.map((m, i) => {
                const isMe = (m.sender.id || m.sender._id) === user1.id;
                return (
                  <div 
                    key={m.id || m._id} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[75%] flex flex-col gap-1">
                      {selectedChat.isGroupChat && !isMe && (
                        <span className="text-[10px] text-neutral-400 ml-2 font-bold">{m.sender.name}</span>
                      )}
                      <div 
                        className={`px-4 py-2.5 rounded-2xl text-sm font-medium ${
                          isMe 
                          ? 'bg-black text-white rounded-tr-none shadow-md shadow-black/10' 
                          : 'bg-white border border-sky-100 text-black rounded-tl-none shadow-sm'
                        }`}
                      >
                        {renderMessageContent(m.content)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-sky-100 px-4 py-3 rounded-2xl rounded-tl-none">
                    <PulseLoader color="#0284c7" size={4} margin={2} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-sky-100 bg-white/70 backdrop-blur-xl">

              {/* Selected image file badge */}
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="max-w-[150px] sm:max-w-[200px] truncate">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="ml-1 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">Click Send ➤ to send</span>
                </div>
              )}

              <div className="flex items-center gap-4 relative">
                 <button className="p-2 text-neutral-400 hover:text-black transition-colors" onClick={() => setShowEmoji(!showEmoji)}>
                   <Smile className="w-6 h-6" />
                 </button>
                 {showEmoji && (
                   <div className="absolute bottom-12 left-0 bg-white border border-sky-100 rounded-2xl p-2 grid grid-cols-6 gap-2 max-h-48 overflow-y-auto shadow-xl z-50">
                     {emojiList.map((e, i) => (
                       <button key={i} type="button" className="text-xl hover:scale-125 transition-transform" onClick={() => addEmoji(e)}>{e}</button>
                     ))}
                   </div>
                 )}
                 <button
                   className="p-2 text-neutral-400 hover:text-black transition-colors relative"
                   onClick={() => fileInputRef.current?.click()}
                   disabled={imageUploading}
                   title="Attach image"
                 >
                   {imageUploading ? (
                     <PulseLoader color="#0284c7" size={4} margin={2} />
                   ) : (
                     <Paperclip className="w-6 h-6" />
                   )}
                 </button>
                 <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={typingHandler}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedFile ? `Caption for ${selectedFile.name} (optional)...` : 'Type a message...'}
                    className="w-full bg-slate-50 border border-sky-100 text-black placeholder-neutral-400 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold"
                  />
                  <button 
                    onClick={postMessage}
                    disabled={!newMessage && !selectedFile}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black hover:bg-black disabled:opacity-30 text-white rounded-xl shadow-md transition-all"
                  >
                    {imageUploading ? <PulseLoader color="#fff" size={4} margin={2} /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col bg-slate-50/30">
            <div className="p-4 border-b border-sky-100">
              <button
                onClick={() => nav('/')}
                className="flex items-center gap-2 p-2 text-neutral-400 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-semibold">Back to Home</span>
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-24 h-24 bg-white border border-sky-100 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm shadow-sky-500/5">
                <MessageSquare className="w-10 h-10 text-sky-600" />
              </div>
              <h2 className="text-2xl font-black text-black mb-2">Welcome back, {user1.name}</h2>
              <p className="text-neutral-500 max-w-xs font-medium">Select a conversation from the sidebar or start a new one to begin messaging.</p>
            </div>
          </div>
        )}
      </div>

      {/* --- CREATE GROUP CHAT MODAL --- */}
      <AnimatePresence>
        {isGroupModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-sky-100 w-full max-w-md rounded-3xl p-6 shadow-xl relative"
            >
              <button 
                onClick={() => setIsGroupModalOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-black p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black mb-6 text-black uppercase tracking-tight">Create Group Chat</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-500 font-bold uppercase mb-2 block">Group Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter group name..." 
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-slate-50 border border-sky-100 text-black rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-500 font-bold uppercase mb-2 block">Add Members</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={groupSearch}
                      onChange={(e) => setGroupSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-sky-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 font-semibold"
                    />
                  </div>

                  {/* Dropdown Results */}
                  {groupSearchResult.length > 0 && (
                    <div className="mt-2 bg-white border border-sky-100 rounded-xl max-h-36 overflow-y-auto custom-scrollbar shadow-md">
                      {groupSearchResult.map((u) => (
                        <div 
                          key={u.id || u._id}
                          onClick={() => handleSelectUserForGroup(u)}
                          className="flex items-center gap-3 p-2 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                        >
                          <img src={u.image} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-sky-100" />
                          <span className="text-sm font-semibold text-black">{u.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected User Badges */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedUsers.map((u) => (
                      <div 
                        key={u.id || u._id}
                        className="flex items-center gap-1.5 bg-sky-50 border border-sky-100 text-sky-600 text-xs font-bold py-1 pl-3 pr-1.5 rounded-full"
                      >
                        <span>{u.name}</span>
                        <button 
                          onClick={() => handleDeselectUserForGroup(u.id || u._id)}
                          className="hover:bg-sky-500/20 p-0.5 rounded-full text-sky-600 hover:text-sky-800 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  onClick={handleCreateGroup}
                  disabled={!groupName || selectedUsers.length === 0}
                  className="w-full mt-6 bg-black hover:bg-black disabled:opacity-30 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-black/10 text-sm uppercase tracking-wide"
                >
                  Create Group
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- GROUP DETAILS / MANAGE MEMBERS MODAL --- */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedChat && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-sky-100 w-full max-w-md rounded-3xl p-6 shadow-xl relative"
            >
              <button 
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setAddMemberSearch("");
                }}
                className="absolute top-4 right-4 text-neutral-400 hover:text-black p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black mb-6 text-black uppercase tracking-tight">Group Details</h3>

              <div className="space-y-4">
                {/* Group Rename Section */}
                <div>
                  <label className="text-xs text-neutral-500 font-bold uppercase mb-2 block">Rename Group</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter new group name..." 
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="flex-1 bg-slate-50 border border-sky-100 text-black rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 font-semibold"
                    />
                    <button 
                      onClick={handleRenameGroup}
                      disabled={!newGroupName || newGroupName === selectedChat.chatName}
                      className="px-4 bg-black hover:bg-black disabled:opacity-30 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Add New Members Section */}
                <div>
                  <label className="text-xs text-neutral-500 font-bold uppercase mb-2 block">Add New Members</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="text" 
                      placeholder="Search users to add..." 
                      value={addMemberSearch}
                      onChange={(e) => setAddMemberSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-sky-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 font-semibold"
                    />
                  </div>

                  {/* Add Members Results Dropdown */}
                  {addMemberSearchResult.length > 0 && (
                    <div className="mt-2 bg-white border border-sky-100 rounded-xl max-h-36 overflow-y-auto custom-scrollbar shadow-md">
                      {addMemberSearchResult.map((u) => (
                        <div 
                          key={u.id || u._id}
                          onClick={() => handleAddMember(u)}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <img src={u.image} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-sky-100" />
                            <span className="text-sm font-semibold text-black">{u.name}</span>
                          </div>
                          <button className="text-xs text-sky-600 font-bold hover:underline">Add</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Members List */}
                <div>
                  <label className="text-xs text-neutral-500 font-bold uppercase mb-2 block">Group Members ({selectedChat.users.length})</label>
                  <div className="bg-slate-50 border border-sky-100 rounded-2xl p-2.5 max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                    {selectedChat.users.map((member: any) => {
                      const isAdmin = member._id === selectedChat.groupAdmin || member.id === selectedChat.groupAdmin;
                      const isMe = member._id === user1.id || member.id === user1.id;
                      const isCurrentUserAdmin = selectedChat.groupAdmin === user1.id;
                      
                      return (
                        <div 
                          key={member.id || member._id}
                          className="flex items-center justify-between p-1.5 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-sky-100"
                        >
                          <div className="flex items-center gap-3">
                            <img src={member.image} alt={member.name} className="w-8 h-8 rounded-full object-cover border border-sky-100" />
                            <span className="text-sm font-semibold text-black">{member.name} {isMe && "(You)"}</span>
                            {isAdmin && (
                              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 font-bold uppercase px-1.5 py-0.5 rounded-full">Admin</span>
                            )}
                          </div>
                          
                          {/* Admin can remove others, users can remove themselves (Leave Group) */}
                          {isCurrentUserAdmin && !isMe ? (
                            <button 
                              onClick={() => handleRemoveMember(member.id || member._id)}
                              className="text-red-500 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove member"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Leave Group Action */}
                <button 
                  onClick={() => handleRemoveMember(user1.id)}
                  className="w-full mt-4 bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white text-red-600 font-bold py-3 rounded-xl transition-all text-sm uppercase tracking-wide shadow-sm"
                >
                  Leave Group
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Join;
