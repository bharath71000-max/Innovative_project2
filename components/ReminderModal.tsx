import React from 'react';
import { Task } from '../types';
import { BellIcon } from './icons';

interface ReminderModalProps {
  task: Task;
  onClose: () => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ task, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md text-center border-2 border-yellow-500 animate-pulse-border" role="alertdialog" aria-modal="true" aria-labelledby="reminder-title" aria-describedby="reminder-desc">
        <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-full animate-ping-slow">
                <BellIcon className="w-12 h-12 text-yellow-400" />
            </div>
        </div>
        <h2 id="reminder-title" className="text-2xl font-bold text-yellow-300 mb-2">Time for your task!</h2>
        <div id="reminder-desc">
          <p className="text-gray-400 mb-4">It's {task.startTime}. Let's get this done:</p>
          <p className="text-xl font-semibold text-white bg-gray-900 p-4 rounded-md">{task.text}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300"
        >
          Got it!
        </button>
      </div>
       <style>{`
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(234, 179, 8, 0.7); box-shadow: 0 0 10px rgba(234, 179, 8, 0.3); }
          50% { border-color: rgba(252, 211, 77, 1); box-shadow: 0 0 20px rgba(252, 211, 77, 0.6); }
        }
        .animate-pulse-border {
            animation: pulse-border 2s infinite;
        }
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default ReminderModal;
