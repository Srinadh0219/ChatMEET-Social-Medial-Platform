import express from 'express';
import protect from '../../middleware/auth';
import allMessage from '../../Controllers/chat/allMessage';
import sendMessage from '../../Controllers/chat/sendMessage';

const router = express.Router();

router.route("/:chatId").get(protect, allMessage);
router.route("/").post(protect, sendMessage);

export default router;
