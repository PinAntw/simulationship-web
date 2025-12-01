// src/components/setup/StepHeader.jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';

const StepHeader = ({ step }) => {
  return (
    <div className="mb-3 flex items-center justify-between px-1">
      <div className="flex items-center gap-3 text-[10px] text-pink-100">
        <div className="flex items-center gap-1">
          <span
            className={`px-2 py-1 rounded border ${
              step === 1
                ? 'bg-pink-600 border-pink-300 text-white'
                : 'bg-[#3a253f] border-pink-300/50 text-pink-100/70'
            }`}
          >
            1. Create Characters
          </span>
          <ArrowRight size={10} className="opacity-80" />
          <span
            className={`px-2 py-1 rounded border ${
              step === 2
                ? 'bg-pink-600 border-pink-300 text-white'
                : 'bg-[#3a253f] border-pink-300/50 text-pink-100/70'
            }`}
          >
            2. Matchmaking
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-pink-200">
        <span className="nes-badge is-splited">
          <span className="is-dark">Day 1</span>
          <span className="is-warning">Lobby</span>
        </span>
      </div>
    </div>
  );
};

export default StepHeader;
