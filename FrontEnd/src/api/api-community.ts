const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4001';

interface Credentials {
  t: string;
}

interface Params {
  userId?: string;
}

const createCommunity = async (credentials: Credentials, communityData: any) => {
  try {
    let response = await fetch(`${API_BASE}/api/community/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify(communityData)
    });
    return await response.json();
  } catch (err) {
    console.error("Create community failed:", err);
    throw err;
  }
};

const getCommunities = async (credentials: Credentials, query?: { search?: string; category?: string }) => {
  try {
    let url = `${API_BASE}/api/community/`;
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.category) params.append('category', query.category);
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    });
    return await response.json();
  } catch (err) {
    console.error("Get communities failed:", err);
    throw err;
  }
};

const getCommunity = async (credentials: Credentials, communityId: string) => {
  try {
    let response = await fetch(`${API_BASE}/api/community/${communityId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    });
    return await response.json();
  } catch (err) {
    console.error("Get community failed:", err);
    throw err;
  }
};

const joinCommunity = async (credentials: Credentials, communityId: string, userId: string) => {
  try {
    let response = await fetch(`${API_BASE}/api/community/${communityId}/join`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify({ userId })
    });
    return await response.json();
  } catch (err) {
    console.error("Join community failed:", err);
    throw err;
  }
};

const leaveCommunity = async (credentials: Credentials, communityId: string, userId: string) => {
  try {
    let response = await fetch(`${API_BASE}/api/community/${communityId}/leave`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      },
      body: JSON.stringify({ userId })
    });
    return await response.json();
  } catch (err) {
    console.error("Leave community failed:", err);
    throw err;
  }
};

const getCommunityPosts = async (credentials: Credentials, communityId: string) => {
  try {
    let response = await fetch(`${API_BASE}/api/community/${communityId}/posts`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    });
    return await response.json();
  } catch (err) {
    console.error("Get community posts failed:", err);
    throw err;
  }
};

const getMyCommunities = async (params: Params, credentials: Credentials) => {
  try {
    let response = await fetch(`${API_BASE}/api/community/my/${params.userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials.t
      }
    });
    return await response.json();
  } catch (err) {
    console.error("Get my communities failed:", err);
    throw err;
  }
};

export {
  createCommunity,
  getCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityPosts,
  getMyCommunities,
};
