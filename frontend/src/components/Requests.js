import React, { useState, useEffect } from 'react';
import API from '../api.js';

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/swaps/requests');
      setIncoming(res.data.incoming);
      setOutgoing(res.data.outgoing);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const respond = async (reqId, accepted) => {
    try {
      await API.post(`/swaps/response/${reqId}`, { accepted });
      fetchRequests();
      alert(`Request ${accepted ? 'accepted' : 'rejected'}`);
    } catch (err) {
      console.error(err);
      alert('Failed to respond');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">🔁 Swap Requests</h2>

      <section className="mb-10">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">📥 Incoming Requests</h3>
        {incoming.length === 0 ? (
          <p className="text-gray-500">No incoming requests.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {incoming.map(req => (
              <div
                key={req._id}
                className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-lg transition"
              >
                <p className="text-gray-800 mb-1">
                  <strong>{req.mySlot.title}</strong> offered by <span className="text-blue-600 font-medium">{req.requestedBy.name}</span>
                </p>
                <p className="text-gray-600 mb-3">
                  In exchange for your <strong>{req.theirSlot.title}</strong>
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => respond(req._id, true)}
                    className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respond(req._id, false)}
                    className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">📤 Outgoing Requests</h3>
        {outgoing.length === 0 ? (
          <p className="text-gray-500">No outgoing requests.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {outgoing.map(req => (
              <div
                key={req._id}
                className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-lg transition"
              >
                <p className="text-gray-800 mb-1">
                  You offered <strong>{req.mySlot.title}</strong> to{' '}
                  <span className="text-blue-600 font-medium">{req.theirSlot.owner.name}</span>
                </p>
                <p className="text-gray-600 mb-1">
                  For <strong>{req.theirSlot.title}</strong>
                </p>
                <p className="mt-2 text-sm">
                  Status:{' '}
                  <span
                    className={`font-medium ${
                      req.status === 'ACCEPTED'
                        ? 'text-green-600'
                        : req.status === 'REJECTED'
                        ? 'text-red-500'
                        : 'text-yellow-600'
                    }`}
                  >
                    {req.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
