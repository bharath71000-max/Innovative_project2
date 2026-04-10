
import React, { useState, useEffect, useCallback } from 'react';
import { Task } from './types';
import Header from './components/Header';
import AddTaskForm from './components/AddTaskForm';
import TaskList from './components/TaskList';
import QuoteDisplay from './components/QuoteDisplay';
import ReminderModal from './components/ReminderModal';
import GiftBoxModal from './components/GiftBoxModal';
import StudyTimer from './components/StudyTimer';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dueTask, setDueTask] = useState<Task | null>(null);
  const [completedTask, setCompletedTask] = useState<Task | null>(null);
  const [alarmAudio] = useState(new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3'));

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Load tasks from localStorage on initial render, with error handling for new data structure
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        // Basic validation for the new task structure
        if (parsedTasks.length === 0 || parsedTasks[0].hasOwnProperty('startTime')) {
          setTasks(parsedTasks);
        } else {
          console.warn("Old task format detected. Clearing localStorage.");
          localStorage.removeItem('tasks');
        }
      }
    } catch (error) {
      console.error("Failed to load or parse tasks from localStorage. Clearing it.", error);
      localStorage.removeItem('tasks');
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  }, [tasks]);
  
  // Clock effect
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  // Reminder check effect
  useEffect(() => {
    const checkDueTasks = () => {
      const todayStr = formatDate(new Date());
      const currentHHMM = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
      
      const taskToRemind = tasks.find(task => 
        task.date === todayStr && 
        task.startTime === currentHHMM && 
        !task.completed
      );
      
      if (taskToRemind && (!dueTask || dueTask.id !== taskToRemind.id)) {
        setDueTask(taskToRemind);
        alarmAudio.play().catch(e => console.error("Audio playback failed:", e));
      }
    };
    checkDueTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, tasks]);


  const addTask = (text: string, date: string, startTime: string, endTime: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      date,
      startTime,
      endTime,
      completed: false,
      notes: ''
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === id) {
          const updatedTask = { ...task, completed: !task.completed };
          if (updatedTask.completed) {
            setCompletedTask(updatedTask);
          }
          return updatedTask;
        }
        return task;
      })
    );
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };
  
  const closeReminder = () => {
    if(dueTask) {
        // Mark as completed to avoid re-triggering immediately
        toggleTaskCompletion(dueTask.id);
    }
    setDueTask(null);
  }

  const displayedTasks = tasks.filter(task => task.date === formatDate(selectedDate));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl mx-auto">
        <Header currentTime={currentTime} />
        <main className="mt-8">
          <QuoteDisplay />
          <StudyTimer />
          <AddTaskForm onAddTask={addTask} selectedDate={selectedDate} />
          <TaskList 
            tasks={displayedTasks}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onToggle={toggleTaskCompletion} 
            onDelete={deleteTask}
            onUpdate={updateTask}
          />
        </main>
      </div>

      {dueTask && (
        <ReminderModal task={dueTask} onClose={closeReminder} />
      )}

      {completedTask && (
        <GiftBoxModal
          task={completedTask}
          onClose={() => setCompletedTask(null)}
        />
      )}
    </div>
  );
};

export default App;
