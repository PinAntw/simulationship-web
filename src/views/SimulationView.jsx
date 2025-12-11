// src/views/SimulationView.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Activity, Power, Heart, MessageSquare, X } from 'lucide-react';
import { API_BASE_URL, USE_MOCK } from '../config'; // 引入開關
import { MOCK_CHARACTERS } from '../mock/mockService'; // 引入假資料

// Context
import { useGame } from '../context/GameContext';
import { GAME_PHASE } from '../constants/gamePhase';

// Components
import GameView from '../views/GameView'; // 請確認這個路徑
import Inspector from '../components/Inspector';

const SimulationView = () => {
  const navigate = useNavigate();
  
  const { 
    connectSocket, disconnectSocket, isConnected, 
    logs, gamePhase, day, agentsData, socket, clearLogs 
  } = useGame();

  const [phaserGame, setPhaserGame] = useState(null);
  const [characterMeta, setCharacterMeta] = useState({});
  const [showLogs, setShowLogs] = useState(false);
  
  const gameRef = useRef(null);
  useEffect(() => { gameRef.current = phaserGame; }, [phaserGame]);

  // 1. 啟動連線
  useEffect(() => {
    connectSocket();
    return () => {
       // disconnectSocket(); // 可選：離開時是否斷線
    };
  }, [connectSocket]);

  // 2. 初始化場景 (載入角色)
  useEffect(() => {
    const initGameScene = async () => {
      let chars = [];

      // ⭐ 修改處：Mock 模式直接使用假資料
      if (USE_MOCK) {
        console.log('Mock Mode: Loading mock characters...');
        chars = MOCK_CHARACTERS;
      } else {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/characters/`);
          chars = res.data;
        } catch (e) {
          console.error('Failed to init scene', e);
          return; 
        }
      }
      
      // 設定 Meta
      const meta = {};
      chars.forEach(c => {
        meta[c.name] = { 
          gender: c.gender, 
          personality: c.personality, 
          avatar_color: c.avatar_color 
        };
      });
      setCharacterMeta(meta);

      // 通知 Phaser 生成角色
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
      }
    };

    // 當 Phaser 準備好 且 (Socket 連上 或 Mock 模式開啟) 時執行
    if (phaserGame && isConnected) {
      setTimeout(initGameScene, 500);
    }
  }, [phaserGame, isConnected]);

  // 3. 橋接 Socket 視覺事件 -> Phaser
  useEffect(() => {
    if (!socket || !phaserGame) return;

    const handleMessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'MOVE_CHAR') {
        phaserGame.events.emit('MOVE_CHAR', data.payload);
      } else if (data.type === 'CHARACTER_SPEAK') {
        phaserGame.events.emit('CHARACTER_SPEAK', data.payload);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, phaserGame]);

  const handleStop = async () => {
    // ⭐ 修改處：Mock 模式不打 API
    if (!USE_MOCK) {
      try {
        await axios.post(`${API_BASE_URL}/api/stop`);
      } catch (e) {
        console.error(e);
      }
    }
    
    disconnectSocket();
    clearLogs();
    navigate('/'); 
  };

  return (
    <div className="h-screen w-screen bg-[#1b1024] text-white flex flex-row gap-4 px-4 py-4 relative">
      {/* 左區：GameView */}
      <div className="flex-1 nes-container with-title flex flex-col"
           style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}>
        
        <p className="title flex items-center gap-2">
          <Heart size={14} className="text-pink-400" />
          <span>SimulationShip Live {USE_MOCK && '(MOCK)'}</span>
        </p>

        {/* 狀態列 */}
        <div className="h-12 flex items-center justify-between px-2 mb-2 border-b border-pink-300/40">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#3a253f] border border-gray-700">
                <Activity size={14} className={isConnected ? 'text-green-400' : 'text-red-400'} />
                <span className="text-[10px] text-pink-100">{isConnected ? 'ONLINE' : 'CONNECTING...'}</span>
             </div>
             <div className="flex items-center gap-2 text-[10px] text-pink-100">
                <span className="px-2 py-1 rounded bg-[#3a253f] border border-pink-300/60">Day {day}</span>
                <span className="px-2 py-1 rounded bg-pink-900/60 border border-pink-500 text-pink-100">
                  {gamePhase === GAME_PHASE.AI_CHAT && 'AI Match Phase'}
                  {gamePhase === GAME_PHASE.FREE_CHAT && 'Free Chat Phase'}
                  {gamePhase === GAME_PHASE.PLAYER_TURN && 'Host Phase'}
                </span>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setShowLogs(v => !v)} className="nes-btn is-small" style={{ backgroundColor: '#f9a8d4', color: 'black' }}>
               <MessageSquare size={12} className="mr-1 inline" /> Log
            </button>
            <button onClick={handleStop} className="nes-btn is-small" style={{ backgroundColor: '#fecaca', color: '#7f1d1d' }}>
               <Power size={12} className="mr-1 inline" /> Stop
            </button>
          </div>
        </div>

        {/* Phaser 畫布 */}
        <div className="flex-1 bg-black mt-1 flex items-center justify-center border border-gray-700">
           <GameView onGameReady={setPhaserGame} phase={gamePhase} />
        </div>
      </div>

      {/* 右區：Inspector */}
      <div className="w-80 nes-container with-title flex flex-col" style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}>
        <p className="title text-[10px]">Inspector</p>
        <div className="flex-1 mt-1 overflow-y-auto custom-scrollbar">
           <Inspector agentsData={agentsData} characterMeta={characterMeta} />
        </div>
      </div>

      {/* 浮動 Log */}
      {showLogs && (
        <div className="absolute bottom-4 left-4 w-96 h-52 nes-container with-title flex flex-col" 
             style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}>
          <p className="title flex items-center justify-between text-[10px]">
            <span>Interaction Log</span>
            <button onClick={() => setShowLogs(false)}><X size={12}/></button>
          </p>
          <div className="flex-1 overflow-y-auto mt-1 custom-scrollbar pr-1">
            {logs.map((log, idx) => (
              <div key={idx} className="text-[10px] text-pink-100 border-b border-pink-300/30 pb-1 mb-1">{log}</div>
            ))}
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1f1024; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #f9a8d4; }
      `}</style>
    </div>
  );
};

export default SimulationView;