import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getChatHistory } from '../utils/api';

const Chatroom = ({ activity, user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Compute Socket server URL
  const getSocketUrl = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    if (apiBase && apiBase.startsWith('http')) {
      return apiBase.replace('/api', '');
    }
    return window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
  };

  useEffect(() => {
    // 1. Fetch Chat History
    const loadHistory = async () => {
      try {
        const response = await getChatHistory(activity.id);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();

    // 2. Initialize Socket Connection
    const socketUrl = getSocketUrl();
    console.log(`Connecting to Socket server: ${socketUrl}`);
    const socket = io(socketUrl);
    socketRef.current = socket;

    // Join room
    socket.emit('join_room', activity.id);

    // Listen for incoming messages
    socket.on('receive_message', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log('Cleaning up Socket connection...');
        socket.off('receive_message');
        socket.disconnect();
      }
    };
  }, [activity.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !socketRef.current) return;

    const messageData = {
      activityId: activity.id,
      senderEmail: user.email,
      senderRole: user.role,
      message: typedMessage.trim()
    };

    // Emit message to Socket server
    socketRef.current.emit('send_message', messageData);

    // Optimistically push message to local list (socket will also broadcast, but socket.io doesn't broadcast to sender if emit and broadcast are separate, wait! On the backend, we did `io.to(activityId).emit('receive_message')` which sends to EVERYONE including the sender. So to prevent double posting, we DO NOT push it locally here. We let the server event 'receive_message' handle it, OR if it's slow we can do it. Since socket.io transmits fast, letting server return it keeps messages perfectly in order).
    
    setTypedMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between shadow">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              💬 {activity.title} Team Chat
            </h3>
            <p className="text-white/80 text-xs">
              Real-time synchronization room • {user.role === 'organizer' ? 'Organizer Mode' : 'Volunteer Mode'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
          >
            ✕
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
              <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Connecting to secure server...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-6 italic">
              <span>👋 Welcome to the team! This is the start of your real-time chat history. Send a message to start coordinating!</span>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderEmail === user.email;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                      isMe
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}
                  >
                    {/* Sender Tag */}
                    {!isMe && (
                      <div className="text-[10px] font-bold text-indigo-600 mb-0.5 flex items-center gap-1">
                        <span>{msg.senderEmail}</span>
                        <span className={`px-1 rounded text-[8px] font-bold uppercase ${
                          msg.senderRole === 'organizer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {msg.senderRole}
                        </span>
                      </div>
                    )}
                    <p className="leading-relaxed break-words">{msg.message}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-100 p-4 bg-white flex gap-3 shadow-inner">
          <input
            type="text"
            placeholder="Type a coordinate details or ask team members..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-150"
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
          />
          <button
            type="submit"
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow hover:opacity-95 active:scale-95 transition"
          >
            🚀 Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatroom;
