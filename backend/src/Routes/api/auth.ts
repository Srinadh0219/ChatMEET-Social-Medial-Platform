import express from 'express';
import RegisterControllers from '../../Controllers/auth/RegisterControllers';
import LoginController from '../../Controllers/auth/LoginController';
import { verifyOtp, resendOtp, initiateForgotPassword, resetPassword } from '../../Controllers/auth/AuthOtpController';

const router = express.Router();

router.post('/register', RegisterControllers);
router.post('/login', LoginController);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', initiateForgotPassword);
router.post('/reset-password', resetPassword);

export default router;
