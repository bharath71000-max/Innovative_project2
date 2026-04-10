
import React, { useEffect, useState } from 'react';
import { Task } from '../types';
import { GiftIcon, StarIcon } from './icons';

interface GiftBoxModalProps {
  task: Task;
  onClose: () => void;
}

const GiftBoxModal: React.FC<GiftBoxModalProps> = ({ task, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative text-center" onClick={(e) => e.stopPropagation()}>
        <div className={`gift-box ${isOpen ? 'open' : ''}`}>
          <div className="lid">
            <div className="bow">
              <div className="ribbon"></div>
              <div className="ribbon"></div>
            </div>
          </div>
          <div className="box">
            <div className="content">
              <h2 className="text-2xl font-bold text-gray-800">Great Work!</h2>
              <p className="text-gray-600">You completed:</p>
              <p className="font-semibold text-indigo-700">{task.text}</p>
            </div>
          </div>
        </div>

        <div className={`absolute -top-16 left-1/2 -translate-x-1/2 transition-all duration-500 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <h2 className="text-3xl font-bold text-white mb-2">Task Completed!</h2>
        </div>

        {/* Stars animation */}
        {isOpen && Array.from({ length: 10 }).map((_, i) => (
          <StarIcon key={i} className="absolute text-yellow-300 star" style={{'--i': i} as React.CSSProperties} />
        ))}
      </div>
      <style>{`
        .gift-box {
          position: relative;
          width: 200px;
          height: 150px;
          cursor: pointer;
        }
        .box {
          width: 100%;
          height: 100%;
          background: #f0f0f0;
          border-radius: 8px;
          position: absolute;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .box::before {
            content: '';
            position: absolute;
            width: 20px;
            height: 100%;
            background: #f44336;
            left: 50%;
            transform: translateX(-50%);
        }
        .lid {
          width: 220px;
          height: 40px;
          background: #e91e63;
          position: absolute;
          top: -20px;
          left: -10px;
          border-radius: 4px;
          z-index: 1;
          transition: transform 0.5s ease-in-out;
        }
        .gift-box.open .lid {
          transform: translateY(-120px) rotate(20deg);
        }
        .bow { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); }
        .ribbon { width: 40px; height: 50px; background: #f44336; border-radius: 50%; position: absolute; }
        .ribbon:first-child { transform: translateX(-15px) rotate(-45deg); }
        .ribbon:last-child { transform: translateX(15px) rotate(45deg); }

        .star {
          width: 24px;
          height: 24px;
          top: 50%;
          left: 50%;
          transform-origin: center;
          animation: star-burst 1s forwards;
          opacity: 0;
        }

        @keyframes star-burst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { 
            transform: translate(-50%, -50%) scale(1.5) rotate(calc(var(--i) * 36deg)) translateX(100px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default GiftBoxModal;
