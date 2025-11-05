import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login.js';
import Signup from './components/Signup.js';
import Dashboard from './components/Dashboard.js';
import Marketplace from './components/Marketplace.js';
import Requests from './components/Requests.js';
import NotificationBell from './components/NotificationBell.js';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Fetch logged-in user's info
      fetch('https://slotswapper-g46h.onrender.com/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setUser(data);
          const newSocket = io('https://slotswapper-g46h.onrender.com', {
            auth: { token },
            transports: ['websocket'],
          });
          setSocket(newSocket);

          // Register socket after connection
          newSocket.on('connect', () => {
            newSocket.emit('register', data._id);
          });
        })
        .catch(err => {
          console.error('Failed to fetch user', err);
          localStorage.removeItem('token');
          setToken(null);
          navigate('/login');
        });

      return () => {
        socket?.disconnect();
      };
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    socket?.disconnect();
    setSocket(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 text-gray-800 font-sans">
      <nav className="bg-white/80 backdrop-blur shadow-md px-6 py-4 sticky top-0 z-50">
        <div className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2">
            <span>🌀</span> SlotSwapper
          </h1>

          {token && (
            <ul className="flex flex-col sm:flex-row mt-4 sm:mt-0 gap-4 text-[15px] font-medium text-gray-700 items-center">
              <li>
                <Link to="/dashboard" className="hover:text-blue-600 hover:underline transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-blue-600 hover:underline transition">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-blue-600 hover:underline transition">
                  Requests
                </Link>
              </li>
              <li className="relative">
                <NotificationBell socket={socket} />
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-1.5 rounded-lg shadow-sm transition"
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </nav>

      <main className="px-4 py-10 max-w-7xl mx-auto">
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/signup" element={<Signup setToken={setToken} />} />
          <Route path="/dashboard" element={<ProtectedRoute token={token}><Dashboard /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute token={token}><Marketplace /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute token={token}><Requests /></ProtectedRoute>} />
          <Route path="/" element={token ? <Dashboard /> : <Login setToken={setToken} />} />
        </Routes>
      </main>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

function ProtectedRoute({ children, token }) {
  if (!token) {
    window.location.href = '/login';
    return null;
  }
  return children;
}

export default App;
