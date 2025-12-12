// src/views/LobbySetupView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { API_BASE_URL, USE_MOCK } from '../config';
import { MOCK_CHARACTERS } from '../mock/mockService';
import { UI_TEXT } from '../constants/i18nMap'; 

import StepHeader from '../components/setups/StepHeader'; // 注意路徑修正
import CharacterForm from '../components/setups/CharacterForm'; // 注意路徑修正
import MatchmakingPanel from '../components/setups/MatchmakingPanel';
import RoomMembersPanel from '../components/setups/RoomMembersPanel';

const LobbySetupView = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pairs, setPairs] = useState([]);
  const [pairForm, setPairForm] = useState({ a: '', b: '' });

  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    personality: '',
    avatar_color: '#f472b6',
  });

  const fetchCharacters = useCallback(async () => {
    if (USE_MOCK) {
      setCharacters(MOCK_CHARACTERS);
      const names = new Set(MOCK_CHARACTERS.map((c) => c.name));
      setPairForm((prev) => ({
        a: names.has(prev.a) ? prev.a : '',
        b: names.has(prev.b) ? prev.b : '',
      }));
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/characters/`);
      const chars = res.data;
      setCharacters(chars);
      const names = new Set(chars.map((c) => c.name));
      setPairForm((prev) => ({
        a: names.has(prev.a) ? prev.a : '',
        b: names.has(prev.b) ? prev.b : '',
      }));
    } catch (err) {
      console.error('[Lobby] Failed to fetch characters', err);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleAddCharacter = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.personality) return;

    if (USE_MOCK) {
      alert(UI_TEXT.ALERT_MOCK_ADD); // [修改]
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/characters/`, formData);
      setFormData({ ...formData, name: '', personality: '' });
      await fetchCharacters();
    } catch (err) {
      console.error(err);
      alert('Failed to add character: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleResetRoom = async () => {
    if (!confirm(UI_TEXT.CONFIRM_RESET)) return; // [修改]

    if (USE_MOCK) {
      alert(UI_TEXT.ALERT_MOCK_RESET); // [修改]
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/reset/`);
      setPairs([]);
      setPairForm({ a: '', b: '' });
      setStep(1);
      await fetchCharacters();
    } catch (err) {
      console.error(err);
    }
  };

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
    const names = new Set(characters.map((c) => c.name));
    if (!names.has(a) || !names.has(b)) {
      alert(UI_TEXT.ALERT_NOT_EXIST); // [修改]
      return;
    }
    const exists = pairs.some(
      (p) => (p.a === a && p.b === b) || (p.a === b && p.b === a)
    );
    if (exists) {
      alert(UI_TEXT.ALERT_EXISTS); // [修改]
      return;
    }
    setPairs((prev) => [...prev, { a, b }]);
  };

  const handleRemovePair = (index) => {
    setPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const syncPairsToBackend = async () => {
    if (pairs.length === 0) return;
    if (USE_MOCK) return;

    try {
      await axios.post(`${API_BASE_URL}/api/pairs/`, {
        pairs: pairs.map((p) => ({ a: p.a, b: p.b })),
      });
    } catch (err) {
      console.error(err);
      alert('Failed to sync pairs: ' + (err.response?.data?.detail || err.message));
      throw err;
    }
  };

  const handleNextStep = () => {
    if (characters.length < 2) {
      alert(UI_TEXT.ALERT_CREATE_TWO); // [修改]
      return;
    }
    setStep(2);
  };

  const handleSlotDrop = (slotKey, charName) => {
    setPairForm((prev) => ({ ...prev, [slotKey]: charName }));
  };

  const handleStart = async () => {
    if (characters.length < 2) {
      alert(UI_TEXT.ALERT_CREATE_TWO); // [修改]
      return;
    }

    if (USE_MOCK) {
      setLoading(true);
      setTimeout(() => navigate('/game'), 500);
      return;
    }

    try {
      setLoading(true);
      await syncPairsToBackend();
      await axios.post(`${API_BASE_URL}/api/start/`);
      navigate('/game');
    } catch (err) {
      console.error(err);
      alert(UI_TEXT.ALERT_START_FAIL); // [修改]
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#1b1024] text-white flex items-center justify-center px-8">
      <div
        className="w-[1400px] h-[760px] nes-container with-title flex flex-col"
        style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}
      >
        <p className="title flex items-center gap-2">
          <Heart size={14} className="text-pink-400" />
          <span>{UI_TEXT.LOBBY_TITLE} {USE_MOCK && UI_TEXT.MOCK_MODE}</span> {/* [修改] */}
        </p>

        <StepHeader step={step} />

        {step === 1 && (
          <div className="flex flex-1 gap-5 overflow-hidden">
            <CharacterForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddCharacter}
              onResetRoom={handleResetRoom}
            />

            <div className="flex-1 flex flex-col">
              <RoomMembersPanel
                characters={characters}
                onRefresh={fetchCharacters}
                enableDrag={false}
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="nes-btn w-64"
                  style={{ backgroundColor: '#f9a8d4', color: 'black', fontSize: '12px' }}
                >
                  {UI_TEXT.BTN_NEXT_MATCH} {/* [修改] */}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-1 gap-5 overflow-hidden">
            <MatchmakingPanel
              characters={characters}
              pairs={pairs}
              pairForm={pairForm}
              setPairForm={setPairForm}
              onAddPair={handleAddPair}
              onRemovePair={handleRemovePair}
              onBack={() => setStep(1)}
              onStart={handleStart}
              loading={loading}
              onSlotDrop={handleSlotDrop}
            />

            <div className="flex-1 flex flex-col">
              <RoomMembersPanel
                characters={characters}
                onRefresh={fetchCharacters}
                enableDrag={true}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1f1024; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #f9a8d4; }
      `}</style>
    </div>
  );
};

export default LobbySetupView;