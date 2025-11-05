import express from 'express';
import auth from '../middleware/auth.js';
import Notification from '../models/Notification.js';
const router = express.Router();


router.get('/', auth, async (req, res) => {
const notes = await Notification.find({ user: req.user._id }).sort('-createdAt');
res.json(notes);
});


router.patch('/:id/read', auth, async (req, res) => {
await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
res.sendStatus(200);
});


export default router;