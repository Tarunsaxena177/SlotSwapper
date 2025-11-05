// src/components/NotificationBell.js
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { BellIcon } from '@heroicons/react/24/solid';

export default function NotificationBell({ socket }) {
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      console.log('🔔 Notification received:', data);
      setNotifications(prev => [{ ...data, read: false }, ...prev]);
      toast.info(data.message || 'New notification');
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button onClick={() => setDropdownOpen(!dropdownOpen)} className="relative p-2">
        <BellIcon className="h-6 w-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 rounded-full w-5 h-5 text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto border">
          <div className="p-2 text-sm text-right">
            <button onClick={markAllRead} className="text-blue-600 hover:underline">Mark all as read</button>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className={`px-4 py-3 border-t ${n.read ? 'bg-white' : 'bg-blue-50 font-medium'}`}>
                <p>{n.title || 'Notification'}</p>
                <p className="text-xs text-gray-500">{n.message || n.body}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
