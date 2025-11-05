import express from 'express';
import auth from '../middleware/auth.js';
import Event from '../models/Event.js';
import SwapRequest from '../models/SwapRequest.js';

const router = express.Router();

// Get swappable slots from other users
router.get('/swappable-slots', auth, async (req, res) => {
  try {
    const slots = await Event.find({ owner: { $ne: req.user._id }, status: 'SWAPPABLE' })
      .populate('owner', 'name');
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create swap request
router.post('/request', auth, async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  try {
    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);
    if (!mySlot || !theirSlot) return res.status(404).json({ msg: 'Slot not found' });
    if (mySlot.owner.toString() !== req.user._id.toString()) return res.status(403).json({ msg: 'Unauthorized' });
    if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
      return res.status(400).json({ msg: 'Slots must be swappable' });
    }

    const swapReq = new SwapRequest({
      mySlot: mySlotId,
      theirSlot: theirSlotId,
      requestedBy: req.user._id,
      requestedTo: theirSlot.owner
    });
    await swapReq.save();

    mySlot.status = 'SWAP_PENDING';
    theirSlot.status = 'SWAP_PENDING';
    await mySlot.save();
    await theirSlot.save();

    // 🔔 Emit socket notification to requestedTo
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const socketId = connectedUsers.get(theirSlot.owner.toString());

    // // ✅ Debug logs
    // console.log("theirSlot.owner:", theirSlot.owner);
    // console.log("connectedUsers map:", connectedUsers);
    // console.log("Resolved socketId:", socketId);



    if (socketId) {
      io.to(socketId).emit('notification', {
        type: 'new-request',
        message: `You received a new swap request from ${req.user.name || 'someone'} for "${theirSlot.title}"`,
        timestamp: new Date(),
      });
    }

    res.json({ msg: 'Swap request created', swapRequest: swapReq });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Respond to swap request
router.post('/response/:requestId', auth, async (req, res) => {
  const { accepted } = req.body;
  try {
    const request = await SwapRequest.findById(req.params.requestId)
      .populate('mySlot')
      .populate('theirSlot')
      .populate('requestedBy', 'name');

    if (!request || request.requestedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Unauthorized or invalid request' });
    }

    const mySlot = request.mySlot;
    const theirSlot = request.theirSlot;

    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const requesterSocketId = connectedUsers.get(request.requestedBy._id.toString());

    if (accepted) {
      const tempStart = mySlot.startTime;
      const tempEnd = mySlot.endTime;

      mySlot.startTime = theirSlot.startTime;
      mySlot.endTime = theirSlot.endTime;
      theirSlot.startTime = tempStart;
      theirSlot.endTime = tempEnd;

      mySlot.status = 'BUSY';
      theirSlot.status = 'BUSY';
      request.status = 'ACCEPTED';

      await mySlot.save();
      await theirSlot.save();
      await request.save();

      if (requesterSocketId) {
        io.to(requesterSocketId).emit('notification', {
          type: 'request-accepted',
          message: `${req.user.name || 'User'} accepted your swap request.`,
          timestamp: new Date(),
        });
      }

      return res.json({ msg: 'Swap accepted and times updated', status: 'ACCEPTED' });
    } else {
      request.status = 'REJECTED';
      mySlot.status = 'SWAPPABLE';
      theirSlot.status = 'SWAPPABLE';
      await mySlot.save();
      await theirSlot.save();
      await request.save();

      if (requesterSocketId) {
        io.to(requesterSocketId).emit('notification', {
          type: 'request-rejected',
          message: `${req.user.name || 'User'} rejected your swap request.`,
          timestamp: new Date(),
        });
      }

      return res.json({ msg: 'Swap request rejected', status: 'REJECTED' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get all swap requests for the user
router.get('/requests', auth, async (req, res) => {
  try {
    const incoming = await SwapRequest.find({ requestedTo: req.user._id, status: 'PENDING' })
      .populate('mySlot')
      .populate('theirSlot')
      .populate('requestedBy', 'name');

    const outgoing = await SwapRequest.find({ requestedBy: req.user._id, status: 'PENDING' })
      .populate('mySlot')
      .populate('theirSlot')
      .populate('requestedTo', 'name');

    res.json({ incoming, outgoing });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;
