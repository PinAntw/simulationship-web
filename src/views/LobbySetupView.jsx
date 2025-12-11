// src/views/LobbySetupView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 引入路由 Hook
import { Heart } from 'lucide-react';
import { API_BASE_URL, USE_MOCK } from '../config';
import { MOCK_CHARACTERS } from '../mock/mockService'; // 引入假資料

// Components
import StepHeader from '../components/setups/StepHeader';
import CharacterForm from '../components/setups/CharacterForm';
import MatchmakingPanel from '../components/setups/MatchmakingPanel';
import RoomMembersPanel from '../components/setups/RoomMembersPanel';

const LobbySetupView = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: create characters, 2: matchmaking
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

  // 取得角色列表
  const fetchCharacters = useCallback(async () => {
    // --- Mock 模式攔截 ---
    if (USE_MOCK) {
      setCharacters(MOCK_CHARACTERS);
      const names = new Set(MOCK_CHARACTERS.map((c) => c.name));
      setPairForm((prev) => ({
        a: names.has(prev.a) ? prev.a : '',
        b: names.has(prev.b) ? prev.b : '',
      }));
      return; 
    }
    // -------------------

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
      console.error('Failed to fetch characters', err);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  // 新增角色
  const handleAddCharacter = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.personality) return;

    // --- Mock 模式攔截 ---
    if (USE_MOCK) {
      alert('Mock Mode: Cannot add new characters to static mock data.');
      return;
    }
    // -------------------

    try {
      await axios.post(`${API_BASE_URL}/api/characters/`, formData);
      setFormData({ ...formData, name: '', personality: '' });
      fetchCharacters();
    } catch (err) {
      alert('Failed to add character: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleResetRoom = async () => {
    if (!confirm('Are you sure you want to clear all characters?')) return;

    // --- Mock 模式攔截 ---
    if (USE_MOCK) {
      alert('Mock Mode: Reset not supported.');
      return;
    }
    // -------------------

    try {
      await axios.post(`${API_BASE_URL}/api/reset/`);
      setPairs([]);
      setPairForm({ a: '', b: '' });
      setStep(1);
      fetchCharacters();
    } catch (err) {
      console.error(err);
    }
  };

  // 加入配對
  const handleAddPair = () => {
    const { a, b } = pairForm;
    if (!a || !b) {
      alert('Please select two characters.');
      return;
    }
    if (a === b) {
      alert('You cannot pair a character with themselves.');
      return;
    }
    const names = new Set(characters.map((c) => c.name));
    if (!names.has(a) || !names.has(b)) {
      alert('Selected character does not exist.');
      return;
    }
    const exists = pairs.some(
      (p) => (p.a === a && p.b === b) || (p.a === b && p.b === a)
    );
    if (exists) {
      alert('This pair already exists.');
      return;
    }
    setPairs((prev) => [...prev, { a, b }]);
  };

  // 移除配對
  const handleRemovePair = (index) => {
    setPairs((prev) => prev.filter((_, i) => i !== index));
  };

  // 將配對同步到後端
  const syncPairsToBackend = async () => {
    if (pairs.length === 0) return;

    // --- Mock 模式攔截 ---
    if (USE_MOCK) return; 
    // -------------------

    try {
      await axios.post(`${API_BASE_URL}/api/pairs/`, {
        pairs: pairs.map((p) => ({ a: p.a, b: p.b })),
      });
    } catch (err) {
      console.error('Failed to sync pairs', err);
      alert('Failed to sync pairs: ' + (err.response?.data?.detail || err.message));
      throw err;
    }
  };

  // Step1 → Step2
  const handleNextStep = () => {
    if (characters.length < 2) {
      alert('Please create at least two characters');
      return;
    }
    setStep(2);
  };

  // 拖拉時，從右邊丟進左邊 slot
  const handleSlotDrop = (slotKey, charName) => {
    setPairForm((prev) => ({ ...prev, [slotKey]: charName }));
  };

  // 開始模擬
  const handleStart = async () => {
    if (characters.length < 2) {
      alert('Please create at least two characters');
      return;
    }

    // --- Mock 模式攔截 (關鍵修改) ---
    if (USE_MOCK) {
      setLoading(true);
      console.log('Mock Mode: Starting Game...');
      // 假裝載入 0.5 秒後跳轉
      setTimeout(() => {
        navigate('/game');
      }, 500);
      return;
    }
    // -----------------------------

    try {
      setLoading(true);
      await syncPairsToBackend();
      await axios.post(`${API_BASE_URL}/api/start/`);
      
      // 跳轉到遊戲頁面
      navigate('/game');
    } catch (err) {
      alert('Failed to start simulation');
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
          <span>SimulationShip Lobby {USE_MOCK && '(MOCK MODE)'}</span>
        </p>

        <StepHeader step={step} />

        {/* STEP 1：創建角色 */}
        {step === 1 && (
          <div className="flex flex-1 gap-5 overflow-hidden">
            <CharacterForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddCharacter}
              onResetRoom={handleResetRoom}
            />

            {/* 右：角色列表 + Next */}
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
                  Next: Matchmaking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2：配對 + 右邊角色列表（可拖拉） */}
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