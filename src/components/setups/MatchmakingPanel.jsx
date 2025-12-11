// src/components/setups/MatchmakingPanel.jsx
import React from 'react';
import { Heart, XCircle, Play, ArrowLeft, Plus } from 'lucide-react';

const MatchmakingPanel = ({
  characters,
  pairs,
  pairForm,
  setPairForm,
  onAddPair,
  onRemovePair,
  onBack,
  onStart,
  loading,
  onSlotDrop,
}) => {
  const handleDrop = (e, slotKey) => {
    e.preventDefault();
    const name = e.dataTransfer.getData('text/plain');
    if (!name) return;
    onSlotDrop && onSlotDrop(slotKey, name);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23f472b6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 0.5rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1.2em 1.2em'
  };

  return (
    <div
      className="w-[46%] nes-container is-dark with-title flex flex-col relative"
      style={{ backgroundColor: '#3a253f', borderColor: '#f9a8d4' }}
    >
      <p className="title text-[10px] flex items-center gap-2">
        <Heart size={10} className="text-pink-400" />
        <span>Matchmaking</span>
      </p>

      {/* 配對欄位 */}
      <div className="mt-2 grid grid-cols-2 gap-3">
        {['a', 'b'].map((slot) => (
          <div
            key={slot}
            className="nes-container is-dark relative flex flex-col items-stretch justify-between transition-colors hover:border-pink-400"
            style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}
            onDrop={(e) => handleDrop(e, slot)}
            onDragOver={handleDragOver}
          >
            <p className="text-[10px] text-pink-200 mb-1 uppercase">Character {slot.toUpperCase()}</p>
            
            <div className={`flex-1 flex flex-col items-center justify-center text-[10px] min-h-[60px] rounded border-2 border-dashed transition-all ${pairForm[slot] ? 'border-pink-500 bg-pink-900/20' : 'border-pink-800/50 bg-black/20'}`}>
              {pairForm[slot] ? (
                <span className="px-2 py-1 rounded bg-pink-500 text-black font-bold animate-fade-in">
                  {pairForm[slot]}
                </span>
              ) : (
                <span className="opacity-50 text-center px-2 text-[9px] text-pink-300">
                  Drag Character <br /> or Select Below
                </span>
              )}
            </div>

            <div className="mt-2">
              <select
                value={pairForm[slot]}
                onChange={(e) =>
                  setPairForm((prev) => ({ ...prev, [slot]: e.target.value }))
                }
                className="w-full bg-slate-800 text-pink-100 border-2 border-pink-500/50 outline-none p-2 rounded-sm text-[10px] appearance-none cursor-pointer hover:border-pink-400 focus:border-pink-400 transition-colors"
                style={selectStyle}
              >
                <option value="" className="bg-slate-900 text-gray-400">Select {slot.toUpperCase()}</option>
                {characters.map((c) => (
                  <option key={c.id || c.name} value={c.name} className="bg-slate-900 text-pink-100">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Add Pair 按鈕 & 列表 */}
      <div className="mt-3 flex flex-col flex-1 min-h-0">
        <button
          type="button"
          onClick={onAddPair}
          className="w-full py-2 bg-pink-400 hover:bg-pink-300 text-black font-bold text-[10px] border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={12} />
          ADD PAIR TO LIST
        </button>

        <div className="mt-3 flex-1 overflow-y-auto custom-scrollbar border border-pink-900/30 bg-black/20 p-2 rounded">
          {pairs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <Heart size={24} className="mb-2 text-pink-500" />
              <p className="text-[10px] text-pink-200 text-center">
                List is empty.<br/>Add pairs to start simulation.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {pairs.map((p, idx) => (
                <li
                  key={`${p.a}-${p.b}-${idx}`}
                  className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded border-l-4 border-pink-500 shadow-sm"
                >
                  <span className="text-[10px] text-pink-100 font-bold tracking-wide">
                    {p.a} <span className="text-pink-500 mx-1">❤</span> {p.b}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemovePair(idx)}
                    className="text-pink-400 hover:text-red-400 transition-colors p-1"
                  >
                    <XCircle size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 底部按鈕區 */}
      <div className="mt-4 flex justify-between items-end pt-3 border-t border-pink-500/20">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-[10px] text-pink-400 hover:text-pink-200 hover:underline px-2 py-1 transition-all"
        >
          <ArrowLeft size={12} />
          Back to Setup
        </button>

        <button
          type="button"
          onClick={onStart}
          disabled={loading}
          className={`
            relative group overflow-hidden px-6 py-2 
            bg-[#f9a8d4] text-black font-black text-xs tracking-wider
            border-2 border-pink-400 shadow-[0_0_15px_rgba(249,168,212,0.4)]
            hover:shadow-[0_0_25px_rgba(249,168,212,0.6)] hover:scale-105
            transition-all duration-300
            ${loading ? 'opacity-70 cursor-wait' : 'animate-pulse'}
          `}
        >
          <span className="relative z-10 flex items-center gap-2">
            <Play size={14} fill="black" />
            {loading ? 'INITIALIZING...' : 'START SIMULATION'}
          </span>
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shine" />
        </button>
      </div>
      
      <style>{`
        @keyframes shine {
          100% { left: 100%; }
        }
        .animate-shine {
          animation: shine 0.7s;
        }
      `}</style>
    </div>
  );
};

export default MatchmakingPanel;