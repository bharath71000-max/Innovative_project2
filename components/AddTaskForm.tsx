import React, { useState, useEffect } from 'react';
import { PlusIcon } from './icons';

interface AddTaskFormProps {
  onAddTask: (text: string, date: string, startTime: string, endTime: string) => void;
  selectedDate: Date;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask, selectedDate }) => {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    setDate(selectedDate.toISOString().split('T')[0]);
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && date && startTime && endTime) {
      if (endTime <= startTime) {
        alert("End time must be after start time.");
        return;
      }
      onAddTask(text.trim(), date, startTime, endTime);
      setText('');
      setStartTime('');
      setEndTime('');
    }
  };

  return (
    <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-gray-200 mb-4">Add New Task</h2>
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                 <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What's your next focus?"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                    required
                    aria-label="Task description"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                 <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                    required
                    aria-label="Task date"
                />
                 <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                    required
                    aria-label="Start time"
                />
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                    required
                    aria-label="End time"
                />
            </div>
            <button
                type="submit"
                className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Task
            </button>
        </form>
    </div>
  );
};

export default AddTaskForm;
