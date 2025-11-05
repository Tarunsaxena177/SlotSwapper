import React, { useState, useEffect } from 'react';
import API from '../api.js';

export default function Marketplace() {
  const [slots, setSlots] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [selectedTheirSlot, setSelectedTheirSlot] = useState(null);
  const [selectedMySlot, setSelectedMySlot] = useState(null);
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    API.get('/swaps/swappable-slots')
      .then(res => setSlots(res.data))
      .catch(err => console.error(err));

    API.get('/events').then(res => {
      const swappable = res.data.filter(ev => ev.status === 'SWAPPABLE');
      setMySlots(swappable);
    });
  }, []);

  const requestSwap = (theirSlot) => {
    if (mySlots.length === 0) {
      alert('No available slot to offer. Make one of your slots SWAPPABLE first.');
      return;
    }
    setSelectedTheirSlot(theirSlot);
    setShowOffer(true);
  };

  const submitSwapRequest = async () => {
    if (!selectedMySlot) return;
    try {
      await API.post('/swaps/request', {
        mySlotId: selectedMySlot._id,
        theirSlotId: selectedTheirSlot._id
      });
      alert('Swap request sent');
      setShowOffer(false);
    } catch (err) {
      console.error(err);
      alert('Failed to send request');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">🌐 Marketplace – Swappable Slots</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map(slot => (
          <div key={slot._id} className="bg-white shadow-lg rounded-xl p-5 border hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">{slot.title}</h3>
            <p className="text-gray-600 text-sm mb-1">By: <span className="font-medium">{slot.owner.name}</span></p>
            <p className="text-gray-600 text-sm mb-4">
              {new Date(slot.startTime).toLocaleString()} → {new Date(slot.endTime).toLocaleString()}
            </p>
            <button
              onClick={() => requestSwap(slot)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
            >
              Request Swap
            </button>
          </div>
        ))}
      </div>

      {showOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
            <h3 className="text-xl font-bold mb-4 text-center text-gray-800">📝 Offer Your Slot</h3>
            <ul className="space-y-3">
              {mySlots.map(slot => (
                <li key={slot._id} className="flex items-center">
                  <input
                    type="radio"
                    name="mySlot"
                    value={slot._id}
                    onChange={() => setSelectedMySlot(slot)}
                    className="accent-blue-600"
                  />
                  <label className="ml-3 text-gray-700 text-sm">
                    <strong>{slot.title}</strong> <br />
                    <span className="text-xs text-gray-500">
                      {new Date(slot.startTime).toLocaleString()} → {new Date(slot.endTime).toLocaleString()}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowOffer(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitSwapRequest}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition font-medium"
              >
                Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
