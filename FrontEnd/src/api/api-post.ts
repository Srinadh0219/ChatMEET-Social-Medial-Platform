const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4001';

interface Credentials {
  t: string;
}

interface Params {
  userId?: string;
  postId?: string;
}

const create = async (params: Params, credentials: Credentials, post: any) => {
  try {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify(post)
    };
    let response = await fetch(`${API_BASE}/api/post/${params.userId}`, requestOptions);
    return await response.json();
  } catch (err) {
    console.error("Create post failed:", err);
    throw err;
  }
}

const getFeed = async (params: Params, credentials: Credentials, signal?: AbortSignal) => {
  try {
    const requestOptions = {
      method: 'GET',
      signal: signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    };
    let response = await fetch(`${API_BASE}/api/post/feed/${params.userId}`, requestOptions);
    return await response.json();
  } catch (err) {
    console.error("Get feed failed:", err);
    throw err;
  }
}

const getFeedUser = async (params: Params, credentials: Credentials, signal?: AbortSignal) => {
  try {
    const requestOptions = {
      method: 'GET',
      signal: signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    };
    let response = await fetch(`${API_BASE}/api/post/feedUser/${params.userId}`, requestOptions);
    return await response.json();
  } catch (err) {
    console.error("Get feed user failed:", err);
    return [];
  }
};

const findPeople = async (params: Params, credentials: Credentials, signal?: AbortSignal) => {
  try {
    let response = await fetch(`${API_BASE}/api/users/findpeople/${params.userId}`, {
      method: 'GET',
      signal: signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    });
    return await response.json();
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.error("Find people failed:", err);
    }
    throw err;
  }
}

const remove = async (params: Params, credentials: Credentials) => {
  try {
    let response = await fetch(`${API_BASE}/api/post/${params.postId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    });
    return await response.json();
  } catch (err) {
    console.error("Remove post failed:", err);
    throw err;
  }
}

const follow = async (params: Params, credentials: Credentials, followId: string) => {
  try {
    let response = await fetch(`${API_BASE}/api/users/follow/`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify({ userId: params.userId, followId })
    });
    return await response.json();
  } catch (err) {
    console.error("Follow user failed:", err);
    throw err;
  }
}

const unfollow = async (params: Params, credentials: Credentials, unfollowId: string) => {
  try {
    let response = await fetch(`${API_BASE}/api/users/unfollow/`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify({ userId: params.userId, unfollowId })
    });
    return await response.json();
  } catch (err) {
    console.error("Unfollow user failed:", err);
    throw err;
  }
}

const Like = async (params: Params, credentials: Credentials, postId: string) => {
  try {
    let response = await fetch(`${API_BASE}/api/post/like`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify({ userId: params.userId, postId })
    });
    return await response.json();
  } catch (err) {
    console.error("Like post failed:", err);
    throw err;
  }
}

const unlike = async (params: Params, credentials: Credentials, postId: string) => {
  try {
    let response = await fetch(`${API_BASE}/api/post/unlike`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify({ userId: params.userId, postId })
    });
    return await response.json();
  } catch (err) {
    console.error("Unlike post failed:", err);
    throw err;
  }
}

const comment = async (params: Params, credentials: Credentials, postId: string, commentText: any) => {
  try {
    let response = await fetch(`${API_BASE}/api/post/comment/`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify({ userId: params.userId, postId, comment: commentText })
    });
    return await response.json();
  } catch (err) {
    console.error("Comment failed:", err);
    throw err;
  }
}

const read = async (params: Params, credentials: Credentials, signal?: AbortSignal) => {
  try {
    let response = await fetch(`${API_BASE}/api/users/${params.userId}`, {
      method: 'GET',
      signal: signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    });
    return await response.json();
  } catch (err) {
    console.error("Read user failed:", err);
    throw err;
  }
}

const checkFollow = (user: any, jwt: string) => {
  return Array.isArray(user?.followers) ? user.followers.some((follower: any) => follower.id === jwt) : false;
};

const update = async (params: Params, credentials: Credentials, Values: any) => {
  try {
    let response = await fetch(`${API_BASE}/api/users/update/${params.userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify(Values)
    });
    return await response.json();
  } catch (err) {
    console.error("Update user failed:", err);
    throw err;
  }
}

const uncomment = async (params: Params, credentials: Credentials, postId: string, commentText: any) => {
  try {
    let response = await fetch(`${API_BASE}/api/post/uncomment/`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify({ userId: params.userId, postId, comment: commentText })
    });
    return await response.json();
  } catch (err) {
    console.error("Uncomment failed:", err);
    throw err;
  }
}

const searchuser = async (params: Params, credentials: Credentials, se: { search: string }) => {
  try {
    let response = await fetch(`${API_BASE}/api/users/?search=${se.search}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    });
    return await response.json();
  } catch (err) {
    console.error("Search user failed:", err);
    throw err;
  }
}

const getChat = async (params: Params, credentials: Credentials, se: string) => {
  try {
    let response = await fetch(`${API_BASE}/api/chat/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify({ userId: params.userId, id: se })
    });
    return await response.json();
  } catch (err) {
    console.error("Get chat failed:", err);
    throw err;
  }
}

const getMessage = async (params: Params, credentials: Credentials, se: string) => {
  try {
    let response = await fetch(`${API_BASE}/api/message/${se}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    });
    return await response.json();
  } catch (err) {
    console.error("Get message failed:", err);
    throw err;
  }
}

const setMessage = async (params: any, credentials: Credentials) => {
  try {
    let response = await fetch(`${API_BASE}/api/message/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify(params)
    });
    return await response.json();
  } catch (err) {
    console.error("Set message failed:", err);
    throw err;
  }
}

const fetchChats = async (params: Params, credentials: Credentials) => {
  try {
    const response = await fetch(`${API_BASE}/api/chat/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    });
    if (!response.ok) {
      const errData = await response.json();
      console.error('Fetch chats failed:', errData);
      throw new Error(errData.error || 'Failed to fetch chats');
    }
    return await response.json();
  } catch (err) {
    console.error('Fetch chats error:', err);
    throw err;
  }
};

const getAllPosts = async (credentials: Credentials, signal?: AbortSignal) => {
  try {
    const requestOptions = {
      method: 'GET',
      signal: signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    };
    let response = await fetch(`${API_BASE}/api/post/all`, requestOptions);
    return await response.json();
  } catch (err) {
    console.error("Get all posts failed:", err);
    throw err;
  }
}

const createGroupChat = async (params: any, credentials: Credentials) => {
  try {
    let response = await fetch(`${API_BASE}/api/chat/group`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify(params)
    });
    return await response.json();
  } catch (err) {
    console.error("Create group chat failed:", err);
    throw err;
  }
}

const renameGroup = async (params: { chatId: string; chatName: string }, credentials: Credentials) => {
  try {
    let response = await fetch(`${API_BASE}/api/chat/rename`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify(params)
    });
    return await response.json();
  } catch (err) {
    console.error("Rename group failed:", err);
    throw err;
  }
}

const addToGroup = async (params: { chatId: string; userId: string }, credentials: Credentials) => {
  try {
    let response = await fetch(`${API_BASE}/api/chat/groupadd`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify(params)
    });
    return await response.json();
  } catch (err) {
    console.error("Add to group failed:", err);
    throw err;
  }
}

const removeFromGroup = async (params: { chatId: string; userId: string }, credentials: Credentials) => {
  try {
    let response = await fetch(`${API_BASE}/api/chat/groupremove`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify(params)
    });
    return await response.json();
  } catch (err) {
    console.error("Remove from group failed:", err);
    throw err;
  }
}

export {
  searchuser,
  fetchChats,
  setMessage,
  getChat,
  getMessage,
  create,
  update,
  remove,
  getFeed,
  findPeople,
  follow,
  unfollow,
  Like,
  unlike,
  comment,
  uncomment,
  read,
  checkFollow,
  getFeedUser,
  getAllPosts,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup
};
