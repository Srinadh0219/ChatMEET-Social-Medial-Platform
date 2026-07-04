const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4001';

// Verify OTP during registration flow
export const verifyOtp = async ({ userId, otp }: { userId: string; otp: string }) => {
  const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otp }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'OTP verification failed');
  }
  return response.json();
};

// Resend OTP request
export const resendOtp = async ({ userId }: { userId: string }) => {
  const response = await fetch(`${API_BASE}/api/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Resend OTP failed');
  }
  return response.json();
};

// Initiate forgot‑password flow (send reset email / OTP)
export const initiateForgotPassword = async (email: string) => {
  const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Forgot password request failed');
  }
  return response.json();
};

// Reset password using token/OTP (frontend will just POST to reset endpoint)
export const resetPassword = async ({ email, password }: { email: string; password: string }) => {
  const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Reset password failed');
  }
  return response.json();
};
