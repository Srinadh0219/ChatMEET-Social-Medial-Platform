import express from 'express';
import protect from '../../middleware/auth';
import createCommunity from '../../Controllers/community/createCommunity';
import getCommunities from '../../Controllers/community/getCommunities';
import getCommunity from '../../Controllers/community/getCommunity';
import joinCommunity from '../../Controllers/community/joinCommunity';
import leaveCommunity from '../../Controllers/community/leaveCommunity';
import getCommunityPosts from '../../Controllers/community/getCommunityPosts';
import getMyCommunities from '../../Controllers/community/getMyCommunities';
import userById from '../../Controllers/users/userById';

const router = express.Router();

router.post('/', protect, createCommunity);
router.get('/', protect, getCommunities);
router.get('/my/:userId', protect, getMyCommunities);
router.get('/:communityId', protect, getCommunity);
router.put('/:communityId/join', protect, joinCommunity);
router.put('/:communityId/leave', protect, leaveCommunity);
router.get('/:communityId/posts', protect, getCommunityPosts);

router.param('userId', userById);

export default router;
