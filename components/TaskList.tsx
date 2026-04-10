
import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface TaskListProps {
  tasks: Task[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, selectedDate, setSelectedDate, onToggle, onDelete, onUpdate }) => {
  const sortedTasks = [...tasks].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const changeDate = (amount: number) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + amount);
      setSelectedDate(newDate);
  }

  const setToday = () => {
    setSelectedDate(new Date());
  }

  const formattedDate = selectedDate.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const isToday = new Date().toDateString() === selectedDate.toDateString();

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-200" id="schedule-heading">Schedule</h2>
        <div className="flex items-center gap-2">
            <button onClick={() => changeDate(-1)} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500" aria-label="Previous day">
                <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button onClick={setToday} className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${isToday ? 'bg-cyan-600 text-white cursor-default' : 'bg-gray-700 hover:bg-gray-600'}`}>Today</button>
            <button onClick={() => changeDate(1)} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500" aria-label="Next day">
                <ChevronRightIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
      <div className="p-3 bg-gray-800/30 rounded-md text-center mb-4 border-b-2 border-cyan-500">
        <h3 className="font-semibold text-lg text-cyan-300">{formattedDate}</h3>
      </div>
      {sortedTasks.length > 0 ? (
        <ul className="space-y-3" aria-labelledby="schedule-heading">
          {sortedTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 px-4 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
            <p className="text-gray-400">No tasks scheduled for this day.</p>
            <p className="text-gray-500 text-sm">Add a task above to start planning!</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
