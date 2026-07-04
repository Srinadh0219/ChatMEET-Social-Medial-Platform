import express from 'express';
import { createPost } from '../../Controllers/Posts/Posts';
import protect from '../../middleware/auth';
import list from '../../Controllers/Posts/listNewsFeed';
import allPosts from '../../Controllers/Posts/allPosts';
import postById from '../../Controllers/Posts/postById';
import userById from '../../Controllers/users/userById';
import { likePost, unlike } from '../../Controllers/Posts/likePost';
import commentPost from '../../Controllers/Posts/commentPost';
import listUser from '../../Controllers/users/listUser';
import uncomment from '../../Controllers/Posts/uncomment';
import remove from '../../Controllers/Posts/remove';

const router = express.Router();

// ── Specific static routes FIRST (must come before wildcard /:userId) ──────────
router.route('/all').get(allPosts);

router.route('/like').put(protect, likePost);
router.route('/unlike').put(protect, unlike);

router.route('/comment').put(protect, commentPost);
router.route('/uncomment').put(protect, uncomment);

// ── Routes with params ─────────────────────────────────────────────────────────
router.route('/feed/:userId').get(protect, list);
router.route('/feedUser/:userId').get(protect, listUser);

// ── Wildcard routes LAST ───────────────────────────────────────────────────────
router.route('/:userId')
  .get(listUser)
  .post(protect, createPost);

router.route('/:postId').delete(protect, remove);

// ── Param middleware ───────────────────────────────────────────────────────────
router.param('userId', userById);
router.param('postId', postById);

export default router;
