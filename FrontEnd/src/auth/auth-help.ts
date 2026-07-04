interface UserInfo {
  token: string;
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
}

const auth = {
  isAuthenticated(): UserInfo | false {
    if (typeof window === "undefined") return false;

    const userInfo = localStorage.getItem('userInfo1');
    if (userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch (e) {
        return false;
      }
    }
    return false;
  },
};

export default auth;
