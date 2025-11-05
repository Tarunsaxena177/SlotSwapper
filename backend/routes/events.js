import express from 'express';
import auth from '../middleware/auth.js';
import Event from '../models/Event.js';


const router = express.Router();


// Create a new event
router.post('/', auth, async (req, res) => {
const { title, startTime, endTime } = req.body;
try {
const event = new Event({ title, startTime, endTime, owner: req.user._id });
await event.save();
res.json(event);
} catch (err) {
console.error(err);
res.status(500).send('Server error');
}
});


// Get all events for logged-in user
router.get('/', auth, async (req, res) => {
try {
const events = await Event.find({ owner: req.user._id });
res.json(events);
} catch (err) {
console.error(err);
res.status(500).send('Server error');
}
});


// Update event (e.g. make swappable)
router.put('/:id', auth, async (req, res) => {
const { title, startTime, endTime, status } = req.body;
try {
const event = await Event.findById(req.params.id);
if (!event || event.owner.toString() !== req.user._id.toString()) {
return res.status(404).json({ msg: 'Event not found or unauthorized' });
}
if (title) event.title = title;
if (startTime) event.startTime = startTime;
if (endTime) event.endTime = endTime;
if (status) event.status = status;
await event.save();
res.json(event);
} catch (err) {
console.error(err);
res.status(500).send('Server error');
}
});


// Delete event
router.delete('/:id', auth, async (req, res) => {
try {
const event = await Event.findById(req.params.id);
if (!event || event.owner.toString() !== req.user._id.toString()) {
return res.status(404).json({ msg: 'Event not found or unauthorized' });
}
await event.deleteOne();
res.json({ msg: 'Event deleted' });
} catch (err) {
console.error(err);
res.status(500).send('Server error');
}
});


export default router;