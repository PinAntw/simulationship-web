// src/components/PairingPanel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const PairingPanel = ({ onPairsChange }) => {
  const [characters, setCharacters] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [saving, setSaving] = useState(false);

  // 讀取角色名單
  useEffect(() => {
    const fetchChars = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/characters/`);
        setCharacters(res.data || []);
      } catch (e) {
        console.error('載入角色失敗', e);
      }
    };
    fetchChars();
  }, []);

  const addPair = () => {
    if (!a || !b || a === b) return;
    // 不重複加入一樣的 pair
    if (pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
      return;
    }
    const next = [...pairs, [a, b]];
    setPairs(next);
    onPairsChange && onPairsChange(next);
  };

  const removePair = (idx) => {
    const next = pairs.filter((_, i) => i !== idx);
    setPairs(next);
    onPairsChange && onPairsChange(next);
  };

  const savePairsToServer = async () => {
    if (!pairs.length) return;
    setSaving(true);
    try {
      const payload = {
        pairs: pairs.map(([x, y]) => ({ a: x, b: y })),
      };
      await axios.post(`${API_BASE_URL}/api/pairs/`, payload);
      alert('配對已送出給後端');
    } catch (e) {
      console.error('送出配對失敗', e);
      alert('送出配對失敗，請看 console');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded p-3 space-y-3">
      <div className="font-bold text-sm mb-1">第一階段：指定 AI 配對</div>

      <div className="flex gap-2">
        <select
          className="flex-1 bg-gray-900 text-sm text-white border border-gray-600 rounded px-2 py-1"
          value={a}
          onChange={(e) => setA(e.target.value)}
        >
          <option value="">選擇角色 A</option>
          {characters.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="flex-1 bg-gray-900 text-sm text白 border border-gray-600 rounded px-2 py-1"
          value={b}
          onChange={(e) => setB(e.target.value)}
        >
          <option value="">選擇角色 B</option>
          {characters.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={addPair}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
        >
          加入
        </button>
      </div>

      <div className="text-xs text-gray-300">
        已選配對：
        {pairs.length === 0 && <span className="text-gray-500 ml-1">尚未指定</span>}
      </div>

      <ul className="space-y-1 max-h-32 overflow-y-auto text-xs">
        {pairs.map(([x, y], idx) => (
          <li
            key={`${x}-${y}-${idx}`}
            className="flex items-center justify-between bg-gray-900 px-2 py-1 rounded border border-gray-700"
          >
            <span>
              {x} ↔ {y}
            </span>
            <button
              type="button"
              onClick={() => removePair(idx)}
              className="text-red-400 hover:text-red-300 text-[11px]"
            >
              移除
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={savePairsToServer}
        disabled={!pairs.length || saving}
        className={`w-full mt-1 px-3 py-1 text-sm rounded ${
          !pairs.length || saving
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-500'
        }`}
      >
        {saving ? '送出中...' : '送出配對到後端'}
      </button>
    </div>
  );
};

export default PairingPanel;
