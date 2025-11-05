import React, { useState, useEffect } from 'react';
import API from '../api.js';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ title: '', startTime: '', endTime: '' });
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    API.get('/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));

    API.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(err => console.error('Failed to load user:', err));
  }, []);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/events', form);
      setEvents([...events, res.data]);
      setForm({ title: '', startTime: '', endTime: '' });
      setShowForm(false); // Close modal after submission
    } catch (err) {
      console.error(err.response?.data || err);
      alert('Failed to create event');
    }
  };

  const makeSwappable = async (id) => {
    try {
      const event = events.find(ev => ev._id === id);
      const newStatus = event.status === 'SWAPPABLE' ? 'BUSY' : 'SWAPPABLE';
      const res = await API.put(`/events/${id}`, { status: newStatus });
      setEvents(events.map(ev => ev._id === id ? res.data : ev));
    } catch (err) {
      console.error(err);
      alert('Failed to update event');
    }
  };

  const onDelete = async (id) => {
    try {
      await API.delete(`/events/${id}`);
      setEvents(events.filter(ev => ev._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete event');
    }
  };

  const startEdit = (id, currentTitle) => {
    setEditingId(id);
    setEditedTitle(currentTitle);
  };

  const saveTitle = async (id) => {
    try {
      const res = await API.put(`/events/${id}`, { title: editedTitle });
      setEvents(events.map(ev => ev._id === id ? res.data : ev));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update title');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          📅 Welcome{user ? `, ${user.name}` : ''}
        </h2>
        <p className="text-gray-500">Manage your personal schedule and make slots swappable.</p>
      </div>

      {/* Add Event Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
        >
          ➕ Add New Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(ev => (
          <div key={ev._id} className="bg-white shadow-lg rounded-xl p-5 border hover:shadow-xl transition">
            {editingId === ev._id ? (
              <div className="flex items-center space-x-2 mb-3">
                <input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="border rounded p-2 flex-grow"
                  placeholder="Edit title"
                />
                <button
                  onClick={() => saveTitle(ev._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-gray-700">{ev.title}</h3>
                <button
                  onClick={() => startEdit(ev._id, ev.title)}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
            <p className="text-gray-600 text-sm mb-1">
              🕒 {new Date(ev.startTime).toLocaleString()} → {new Date(ev.endTime).toLocaleString()}
            </p>
            <p className="mb-4">
              Status:{' '}
              <span className={`font-medium ${ev.status === 'SWAPPABLE' ? 'text-green-600' : 'text-gray-700'}`}>
                {ev.status}
              </span>
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => makeSwappable(ev._id)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded"
              >
                {ev.status === 'SWAPPABLE' ? 'Cancel Swap' : 'Make Swappable'}
              </button>
              <button
                onClick={() => onDelete(ev._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Popup for Add Event */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl border w-full max-w-md relative">
            <button
              className="absolute top-2 right-3 text-gray-600 hover:text-black text-xl"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">➕ Add New Event</h3>
            <form onSubmit={onSubmit} className="flex flex-col space-y-4">
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="Event Title"
                required
                className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                name="startTime"
                type="datetime-local"
                value={form.startTime}
                onChange={onChange}
                required
                className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                name="endTime"
                type="datetime-local"
                value={form.endTime}
                onChange={onChange}
                required
                className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded shadow"
              >
                Create Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
