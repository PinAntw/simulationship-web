// src/components/HostMatchmakingOverlay.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Users, ArrowRight } from 'lucide-react';
import { API_BASE_URL, USE_MOCK } from '../config';
import { UI_TEXT, formatDay } from '../constants/i18nMap'; // [新增]

import MatchmakingPanel from './setups/MatchmakingPanel';
import RoomMembersPanel from './setups/RoomMembersPanel';

const HostMatchmakingOverlay = ({ visible, onClose, day, characters }) => {
  const [pairs, setPairs] = useState([]);
  const [pairForm, setPairForm] = useState({ a: '', b: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setPairs([]);
      setPairForm({ a: '', b: '' });
    }
  }, [visible]);

  if (!visible) return null;

  const handleAddPair = () => {
    const { a, b } = pairForm;
    if (!a || !b) {
      alert(UI_TEXT.ALERT_SELECT_TWO); // [修改]
      return;
    }
    if (a === b) {
      alert(UI_TEXT.ALERT_SAME_CHAR); // [修改]
      return;
    }
    const nameSet = new Set(characters.map((c) => c.name));
    if (!nameSet.has(a) || !nameSet.has(b)) {
      alert(UI_TEXT.ALERT_NOT_EXIST); // [修改]
      return;
    }
    const exists = pairs.some(
      (p) => (p.a === a && p.b === b) || (p.a === b && p.b === a),
    );
    if (exists) {
      alert(UI_TEXT.ALERT_EXISTS); // [修改]
      return;
    }
    setPairs((prev) => [...prev, { a, b }]);
    setPairForm({ a: '', b: '' });
  };

  const handleRemovePair = (index) => {
    setPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSlotDrop = (slotKey, charName) => {
    setPairForm((prev) => ({ ...prev, [slotKey]: charName }));
  };

  const refreshCharacters = async () => {
    if (USE_MOCK) return;
    try {
      await axios.get(`${API_BASE_URL}/api/characters/`);
    } catch (e) {
      console.error(e);
    }
  };

  const syncPairsToBackend = async () => {
    if (!pairs.length) return;
    if (USE_MOCK) return;
    try {
      await axios.post(`${API_BASE_URL}/api/pairs/`, {
        pairs: pairs.map((p) => ({ a: p.a, b: p.b })),
      });
    } catch (err) {
      console.error(err);
      throw new Error(UI_TEXT.MSG_PAIR_FAIL); // [修改]
    }
  };

  const handleStartNextRound = async () => {
    if (loading) return;

    if (!pairs.length) {
      const ok = confirm(UI_TEXT.CONFIRM_NO_PAIRS); // [修改]
      if (!ok) return;
    }

    setLoading(true);

    if (USE_MOCK) {
      setLoading(false);
      onClose();
      return;
    }

    try {
      await syncPairsToBackend();
      await axios.post(`${API_BASE_URL}/api/next-round`);
      onClose();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="w-[1200px] h-[680px] nes-container with-title flex flex-col relative shadow-2xl"
        style={{ backgroundColor: '#241127', borderColor: '#f9a8d4' }}
      >
        <p className="title flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-2">
            <Users size={12} className="text-pink-300" />
            <span>{UI_TEXT.HOST_TITLE}</span> {/* [修改] */}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="nes-btn is-error is-small"
            style={{ padding: '0 6px', fontSize: '10px' }}
            disabled={loading}
          >
            <X size={10} />
          </button>
        </p>

        <div className="flex-1 mt-2 flex flex-row gap-5 px-3 pb-2 overflow-hidden">
          <div className="flex-[1.7] min-w-0 flex">
            <MatchmakingPanel
              variant="host"
              characters={characters}
              pairs={pairs}
              pairForm={pairForm}
              setPairForm={setPairForm}
              onAddPair={handleAddPair}
              onRemovePair={handleRemovePair}
              onSlotDrop={handleSlotDrop}
              loading={loading}
              showStartButton={false} 
              showBackButton={false}
              onStart={() => {}} 
              onBack={() => {}}
            />
          </div>

          <div className="flex-[1.1] min-w-0 flex flex-col">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-pink-100 flex items-center gap-1">
                {UI_TEXT.CAST_OVERVIEW} {/* [修改] */}
              </span>
              <button
                type="button"
                onClick={refreshCharacters}
                className="text-[10px] text-pink-200/80 underline-offset-2 hover:underline"
              >
                {UI_TEXT.BTN_REFRESH} {/* [修改] */}
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <RoomMembersPanel
                characters={characters}
                onRefresh={refreshCharacters}
                enableDrag={true}
              />
            </div>
          </div>
        </div>

        <div className="mt-1 pt-3 border-t border-pink-300/40 flex items-center justify-between gap-3 px-1">
          <div className="text-[10px] text-pink-200/80">
            <div>
              {formatDay(day)}
            </div>
            <div>
              {UI_TEXT.HOST_STATUS_LABEL}&nbsp;
              <span className="font-semibold text-yellow-200">{UI_TEXT.HOST_WAITING}</span> — 
              {UI_TEXT.HOST_INSTRUCTION} {/* [修改] */}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="nes-btn is-small"
              style={{ backgroundColor: '#4b244c', color: '#f9a8d4' }}
              disabled={loading}
            >
              {UI_TEXT.BTN_CLOSE_PANEL} {/* [修改] */}
            </button>
            
            <button
              type="button"
              onClick={handleStartNextRound}
              disabled={loading}
              className="nes-btn is-small flex items-center gap-2"
              style={{
                backgroundColor: loading ? '#fda4af' : '#f973a1',
                color: 'black',
                opacity: loading ? 0.75 : 1,
                minWidth: '220px',
                justifyContent: 'center'
              }}
            >
              {loading ? UI_TEXT.BTN_PROCESSING : (
                <>
                  {UI_TEXT.BTN_SUBMIT} <ArrowRight size={14} /> {/* [修改] */}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostMatchmakingOverlay;