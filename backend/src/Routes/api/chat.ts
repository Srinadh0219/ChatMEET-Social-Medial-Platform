import express from 'express';
import protect from '../../middleware/auth';
import accessChat from '../../Controllers/chat/accessChat';
import fetchChats from '../../Controllers/chat/fetchChat';
import createGroup from '../../Controllers/chat/createGroup';
import renameGroup from '../../Controllers/chat/renameGroup';
import addToGroup from '../../Controllers/chat/addToGroup';
import removeFromGroup from '../../Controllers/chat/removeFromGroup';

const router = express.Router();

router.route("/").post(accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroup);
router.route("/rename").put(protect, renameGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/groupremove").put(protect, removeFromGroup);

export default router;
