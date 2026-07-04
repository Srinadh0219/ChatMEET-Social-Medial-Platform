import express from 'express';
import RegisterControllers from '../../Controllers/auth/RegisterControllers';
import LoginControllers from '../../Controllers/auth/LoginController';
import addFollower from '../../Controllers/users/addFollower';
import addFollowing from '../../Controllers/users/addFollowing';
import protect from '../../middleware/auth';
import findpeople from '../../Controllers/users/findpeople';
import userById from '../../Controllers/users/userById';
import read from '../../Controllers/users/read';
import update from '../../Controllers/users/updateUser';
import check from '../../Controllers/auth/check';
import removeFollower from '../../Controllers/users/removeFollower';
import removeFollowing from '../../Controllers/users/removeFollowing';
import allUsers from '../../Controllers/users/allUsers';

const router = express.Router();

router.post('/register', RegisterControllers);
router.post('/login', LoginControllers);
router.put('/follow', protect, addFollower as any, addFollowing as any);
router.put('/unfollow', protect, removeFollower as any, removeFollowing as any);
router.get('/findpeople/:userId', protect, findpeople);
router.get('/:userId', read);
router.put('/update/:userId', protect, check, update);
router.get('/', protect, allUsers);

router.param("userId", userById);

export default router;
