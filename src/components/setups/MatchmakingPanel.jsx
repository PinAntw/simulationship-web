// src/components/setups/MatchmakingPanel.jsx
import React from 'react';
import { Heart, XCircle, Play, ArrowLeft } from 'lucide-react';

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

  return (
    <div
      className="w-[46%] nes-container is-dark with-title flex flex-col"
      style={{ backgroundColor: '#3a253f', borderColor: '#f9a8d4' }}
    >
      <p className="title text-[10px] flex items-center gap-2">
        <Heart size={10} className="text-pink-400" />
        <span>Matchmaking</span>
      </p>

      {/* 配對欄位（可拖拉 / 可選單） */}
      <div className="mt-2 grid grid-cols-2 gap-3">
        {/* Slot A */}
        <div
          className="nes-container is-dark relative flex flex-col items-stretch justify-between"
          style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}
          onDrop={(e) => handleDrop(e, 'a')}
          onDragOver={handleDragOver}
        >
          <p className="text-[10px] text-pink-200 mb-1">Slot A</p>
          <div className="flex-1 flex flex-col items-center justify-center text-[10px] text-pink-100">
            {pairForm.a ? (
              <span className="px-2 py-1 rounded bg-pink-900/60 border border-pink-400">
                {pairForm.a}
              </span>
            ) : (
              <span className="opacity-70 text-center px-2">
                Drag a character here <br /> or select below
              </span>
            )}
          </div>
          <div className="mt-2">
            <select
              value={pairForm.a}
              onChange={(e) =>
                setPairForm((prev) => ({ ...prev, a: e.target.value }))
              }
              className="nes-select w-full bg-white text-black text-[10px]"
            >
              <option value="">Select A</option>
              {characters.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Slot B */}
        <div
          className="nes-container is-dark relative flex flex-col items-stretch justify-between"
          style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}
          onDrop={(e) => handleDrop(e, 'b')}
          onDragOver={handleDragOver}
        >
          <p className="text-[10px] text-pink-200 mb-1">Slot B</p>
          <div className="flex-1 flex flex-col items-center justify-center text-[10px] text-pink-100">
            {pairForm.b ? (
              <span className="px-2 py-1 rounded bg-pink-900/60 border border-pink-400">
                {pairForm.b}
              </span>
            ) : (
              <span className="opacity-70 text-center px-2">
                Drag a character here <br /> or select below
              </span>
            )}
          </div>
          <div className="mt-2">
            <select
              value={pairForm.b}
              onChange={(e) =>
                setPairForm((prev) => ({ ...prev, b: e.target.value }))
              }
              className="nes-select w-full bg-white text-black text-[10px]"
            >
              <option value="">Select B</option>
              {characters.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 加入配對按鈕 & 已配對列表 */}
      <div className="mt-3">
        <button
          type="button"
          onClick={onAddPair}
          className="nes-btn is-small"
          style={{ backgroundColor: '#f9a8d4', color: 'black', fontSize: '10px' }}
        >
          Add Pair
        </button>

        <div className="mt-2 max-h-32 overflow-y-auto custom-scrollbar">
          {pairs.length === 0 ? (
            <p className="text-[10px] text-pink-200 mt-1">
              No pairs yet. Drag characters into A/B and click Add Pair.
            </p>
          ) : (
            <ul className="space-y-1 text-[10px]">
              {pairs.map((p, idx) => (
                <li
                  key={`${p.a}-${p.b}-${idx}`}
                  className="flex items-center justify-between bg-[#3a253f] px-2 py-1 rounded border border-pink-400/40"
                >
                  <span>
                    {p.a} ❤ {p.b}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemovePair(idx)}
                    className="text-pink-200 hover:text-red-300 flex items-center gap-1"
                  >
                    <XCircle size={10} />
                    <span>Remove</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 返回 / 開始 */}
      <div className="mt-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="nes-btn is-error is-small"
        >
          <span className="inline-flex items-center gap-1 text-[10px]">
            <ArrowLeft size={10} />
            Back
          </span>
        </button>

        <button
          type="button"
          onClick={onStart}
          disabled={loading}
          className={`nes-btn is-success ${loading ? 'is-disabled' : ''}`}
          style={{
            backgroundColor: loading ? '#fecaca' : '#f9a8d4',
            color: 'black',
            fontSize: '12px',
          }}
        >
          <span className="inline-flex items-center gap-1">
            <Play size={14} />
            {loading ? 'Starting...' : 'Start Simulation'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default MatchmakingPanel;
