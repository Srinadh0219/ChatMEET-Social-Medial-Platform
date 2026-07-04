import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./component/Home";
import Login from "./component/Login";
import NotFoundPage from "./component/NotFound";
import Register from "./component/Register";
import PrivateRoute from "./Routing/PrivateRoute";
import HomePage from "./component/HomePage";
import Profile from "./component/Profile";
import EditProfile from './component/EditProfile';
import Join from './component/Join';
import OTPVerification from "./pages/OTPVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<OTPVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<PrivateRoute />}> 
            <Route path="/s" element={<HomePage />} />
            <Route path="/user/:id" element={<Profile />} />
            <Route path="/user/edit/:id" element={<EditProfile />} />
            <Route path="/chat/join" element={<Join />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
