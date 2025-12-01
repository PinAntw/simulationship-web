// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import GameView from './components/GameView';
import LobbySetupView from './views/LobbySetupView';
import Inspector from './components/Inspector';

import { Activity, Power, Heart, MessageSquare, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, WS_URL } from './config';
import { GAME_PHASE } from './constants/gamePhase';

function App() {
  const [appMode, setAppMode] = useState('setup'); // 'setup' | 'running'

  const [gamePhase, setGamePhase] = useState(GAME_PHASE.AI_CHAT);
  const [day, setDay] = useState(1);
  const [round, setRound] = useState(1);

  const [phaserGame, setPhaserGame] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [agentsData, setAgentsData] = useState({});

  // ⭐ 新增：角色 meta（gender / personality / avatar_color）
  const [characterMeta, setCharacterMeta] = useState({});

  const [showLogs, setShowLogs] = useState(false);

  const gameRef = useRef(null);
  useEffect(() => {
    gameRef.current = phaserGame;
  }, [phaserGame]);

    const initGameScene = async () => {
    try {
      console.log('Loading initial characters...');
      const res = await axios.get(`${API_BASE_URL}/api/characters/`);
      const chars = res.data;

      const meta = {};
      chars.forEach((c) => {
        meta[c.name] = {
          gender: c.gender,
          personality: c.personality,
          avatar_color: c.avatar_color,
        };
      });
      setCharacterMeta(meta);

      if (gameRef.current) {
        chars.forEach((char) => {
          gameRef.current.events.emit('SPAWN_CHAR', {
            char_id: char.name,
            x: char.x,
            y: char.y,
            color: char.avatar_color,
            gender: char.gender,       
          });
        });
        setLogs((prev) => [`System: Loaded ${chars.length} characters`, ...prev]);
      } else {
        console.error('Phaser instance is not ready yet');
      }
    } catch (e) {
      console.error('Failed to init scene', e);
    }
  };


  useEffect(() => {
    if (appMode !== 'running') return;

    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log('Connected to backend!');
      setIsConnected(true);
      setLogs((prev) => ['System: Simulation engine started, loading AI...', ...prev]);

      setTimeout(() => {
        initGameScene();
      }, 500);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { type, payload, log } = data;

      if (log) {
        const time = new Date().toLocaleTimeString();
        setLogs((prev) => [`[${time}] ${log}`, ...prev]);
      }

      if (type === 'GAME_STATE') {
        if (typeof payload.day === 'number') setDay(payload.day);
        if (payload.phase) setGamePhase(payload.phase);
      }

      if (type === 'AGENT_DECISION') {
        setAgentsData((prev) => ({
          ...prev,
          [payload.char_id]: payload,
        }));
      }

      if (gameRef.current) {
        if (type === 'MOVE_CHAR') {
          gameRef.current.events.emit('MOVE_CHAR', payload);
        } else if (type === 'CHARACTER_SPEAK') {
          gameRef.current.events.emit('CHARACTER_SPEAK', payload);
        }
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      setLogs((prev) => ['System: Connection closed', ...prev]);
    };

    return () => {
      socket.close();
    };
  }, [appMode, phaserGame]);

  const handleStop = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/stop`);
      setAppMode('setup');
      setLogs([]);
      setIsConnected(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (appMode === 'setup') {
    return <LobbySetupView onStartGame={() => setAppMode('running')} />;

  }

  return (
    <div className="h-screen w-screen bg-[#1b1024] text-white flex flex-row gap-4 px-4 py-4 relative">
      {/* 左邊：Game */}
      <div
        className="flex-1 nes-container with-title flex flex-col"
        style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}
      >
        <p className="title flex items-center gap-2">
          <Heart size={14} className="text-pink-400" />
          <span>SimulationShip Live</span>
        </p>

        <div className="h-12 flex items-center justify-between px-2 mb-2 border-b border-pink-300/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#3a253f] border border-gray-700">
              <Activity
                size={14}
                className={isConnected ? 'text-green-400' : 'text-red-400'}
              />
              <span className="text-[10px] text-pink-100">
                {isConnected ? 'AI ONLINE' : 'CONNECTING...'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-pink-100">
              <span className="px-2 py-1 rounded bg-[#3a253f] border border-pink-300/60">
                Day {day}
              </span>
              <span className="px-2 py-1 rounded bg-pink-900/60 border border-pink-500 text-pink-100">
                {gamePhase === GAME_PHASE.AI_CHAT && 'AI Match Phase'}
                {gamePhase === GAME_PHASE.FREE_CHAT && 'Free Chat Phase'}
                {gamePhase === GAME_PHASE.PLAYER_TURN && 'Host Phase'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLogs((v) => !v)}
              className="nes-btn is-small"
              style={{ backgroundColor: '#f9a8d4', color: 'black' }}
            >
              <span className="inline-flex items-center gap-1 text-[10px]">
                <MessageSquare size={12} />
                Log
              </span>
            </button>

            <button
              onClick={handleStop}
              className="nes-btn is-small"
              style={{ backgroundColor: '#fecaca', color: '#7f1d1d' }}
            >
              <span className="inline-flex items-center gap-1 text-[10px]">
                <Power size={12} /> Stop
              </span>
            </button>
          </div>
        </div>

        <div className="flex-1 bg-black mt-1 flex items-center justify-center border border-gray-700">
          <GameView onGameReady={(game) => setPhaserGame(game)} phase={gamePhase} />
        </div>
      </div>

      {/* 右邊：Inspector */}
      <div
        className="w-80 nes-container with-title flex flex-col"
        style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}
      >
        <p className="title text-[10px]">Inspector</p>
        <div className="flex-1 mt-1 overflow-y-auto custom-scrollbar">
          {/* ⭐ 把 characterMeta 傳給 Inspector */}
          <Inspector agentsData={agentsData} characterMeta={characterMeta} />
        </div>
      </div>

      {/* 浮動 Log 視窗 */}
      {showLogs && (
        <div
          className="absolute bottom-4 left-4 w-96 h-52 nes-container with-title flex flex-col"
          style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}
        >
          <p className="title flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={12} /> Interaction Log
            </span>
            <button
              type="button"
              onClick={() => setShowLogs(false)}
              className="border-0 bg-transparent text-pink-200 hover:text-pink-400 p-0 m-0"
              style={{ lineHeight: 0 }}
            >
              <X size={12} />
            </button>
          </p>
          <div className="flex-1 overflow-y-auto mt-1 custom-scrollbar pr-1">
            {logs.length === 0 && (
              <p className="text-[10px] text-pink-100 opacity-70">
                No logs yet. Wait for agents to move or talk.
              </p>
            )}
            {logs.map((log, idx) => (
              <div
                key={idx}
                className="text-[10px] text-pink-100 border-b border-pink-300/30 pb-1 mb-1"
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f1024;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #f9a8d4;
        }
      `}</style>
    </div>
  );
}

export default App;
