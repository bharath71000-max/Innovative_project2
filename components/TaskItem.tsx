
import React, { useState } from 'react';
import { Task } from '../types';
import { TrashIcon, CheckCircleIcon, CircleIcon } from './icons';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onUpdate }) => {
  const [notes, setNotes] = useState(task.notes || '');

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hour, 10));
    time.setMinutes(parseInt(minute, 10));
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleNotesBlur = () => {
    if (notes !== task.notes) {
      onUpdate(task.id, { notes });
    }
  };

  const formattedStartTime = formatTime(task.startTime);
  const formattedEndTime = formatTime(task.endTime);

  return (
    <li className={`flex flex-col md:grid md:grid-cols-12 gap-4 p-4 rounded-lg transition-all duration-300 ${task.completed ? 'bg-green-800/20 border-l-4 border-green-500' : 'bg-gray-800/70 border-l-4 border-cyan-500'}`}>
      
      {/* Task Info Column */}
      <div className="md:col-span-6 flex items-center min-w-0 w-full">
        <button onClick={() => onToggle(task.id)} className="mr-4 flex-shrink-0 focus:outline-none" aria-label={`Mark task ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`}>
          {task.completed ? (
            <CheckCircleIcon className="w-7 h-7 text-green-400" />
          ) : (
            <CircleIcon className="w-7 h-7 text-gray-500 hover:text-cyan-400 transition-colors" />
          )}
        </button>
        <div className="min-w-0 flex-grow">
          <span className={`font-mono text-sm block ${task.completed ? 'text-gray-400' : 'text-cyan-300'}`}>{formattedStartTime} - {formattedEndTime}</span>
          <p className={`text-lg font-medium truncate ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>{task.text}</p>
        </div>
      </div>

      {/* Notes Column */}
      <div className="md:col-span-5 w-full">
         <textarea 
            value={notes}
            onChange={handleNotesChange}
            onBlur={handleNotesBlur}
            placeholder="Notes, hints, keys..."
            rows={2}
            className={`w-full text-sm rounded p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none transition-colors scrollbar-thin ${
                task.completed 
                ? 'bg-green-900/30 text-gray-400 placeholder-gray-500 border border-green-800/30' 
                : 'bg-gray-900/50 text-gray-300 placeholder-gray-600 border border-gray-700/50'
            }`}
            aria-label={`Notes for ${task.text}`}
         />
      </div>

      {/* Action Column */}
      <div className="md:col-span-1 flex justify-end items-center">
        <button
            onClick={() => onDelete(task.id)}
            className="text-gray-500 hover:text-red-500 p-2 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            aria-label={`Delete task ${task.text}`}
        >
            <TrashIcon className="w-5 h-5" />
        </button>
      </div>

    </li>
  );
};

export default TaskItem;
