
import React from 'react';
import { ClockIcon } from './icons';

interface HeaderProps {
    currentTime: Date;
}

const Header: React.FC<HeaderProps> = ({ currentTime }) => {
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <header className="text-center p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
            <h1 className="text-4xl sm:text-5xl font-bold font-orbitron text-cyan-400 tracking-wider">
                FocusFlow
            </h1>
            <p className="text-cyan-200 mt-2">Your Daily Discipline Partner</p>
            <div className="mt-4 inline-flex items-center justify-center bg-gray-900 text-2xl sm:text-3xl font-orbitron text-green-400 p-3 rounded-md border border-green-500/30 shadow-md">
                <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-green-400" />
                <span>{formatTime(currentTime)}</span>
            </div>
        </header>
    );
};

export default Header;
