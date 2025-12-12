// src/views/SimulationView.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Activity, Power, Heart, MessageSquare, X } from 'lucide-react';
import { API_BASE_URL, USE_MOCK } from '../config';
import { MOCK_CHARACTERS } from '../mock/mockService';
import { PHASE_LABEL, UI_TEXT, formatDay } from '../constants/i18nMap'; 

// [新增] 引入即時對話面板
import LiveChatPanel from '../components/LiveChatPanel'; 

// Context
import { useGame } from '../context/GameContext';
import { GAME_PHASE } from '../constants/gamePhase';

// Components
import GameView from '../views/GameView';
import Inspector from '../components/Inspector';
import HostMatchmakingOverlay from '../components/HostMatchmakingOverlay';

const SimulationView = () => {
  const navigate = useNavigate();

  // 從 Context 取得狀態
  const {
    connectSocket,
    disconnectSocket, // eslint-disable-line
    isConnected,
    // logs, // [移除] 不再直接顯示原始 logs
    gamePhase,
    day,
    agentsData,
    socket,
    clearLogs,
    finalResults,
    
    // [新增] 取得即時對話資料
    activeSessions,
    pairLogs,
  } = useGame();

  const [phaserGame, setPhaserGame] = useState(null);
  const [characterMeta, setCharacterMeta] = useState({});
  const [showLogs, setShowLogs] = useState(false);

  // 給 Host 面板用的角色列表
  const [characters, setCharacters] = useState([]);

  // 面板顯示控制
  const [showHostPanel, setShowHostPanel] = useState(false);
  const [showResultPanel, setShowResultPanel] = useState(false);

  const gameRef = useRef(null);
  useEffect(() => {
    gameRef.current = phaserGame;
  }, [phaserGame]);

  // 1. 啟動 WebSocket
  useEffect(() => {
    connectSocket();
    return () => {
      // disconnectSocket(); 
    };
  }, [connectSocket]);

  // 2. 初始化場景
  useEffect(() => {
    const initGameScene = async () => {
      let chars = [];

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

      setCharacters(chars);

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
      }
    };

    if (phaserGame && isConnected) {
      setTimeout(initGameScene, 500);
    }
  }, [phaserGame, isConnected]);

  // 3. WebSocket -> Phaser 橋接
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

  // 4. Host Panel 自動開關
  useEffect(() => {
    if (gamePhase === GAME_PHASE.PLAYER_TURN) {
      setShowHostPanel(true);
    } else {
      setShowHostPanel(false);
    }
  }, [gamePhase]);

  // 5. Result Panel 自動開關
  useEffect(() => {
    if (gamePhase === GAME_PHASE.GAME_OVER && finalResults && finalResults.length > 0) {
      setShowResultPanel(true);
    }
  }, [gamePhase, finalResults]);

  const handleStop = async () => {
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
      {/* LEFT: GameView */}
      <div
        className="flex-1 nes-container with-title flex flex-col"
        style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}
      >
        <p className="title flex items-center gap-2">
          <Heart size={14} className="text-pink-400" />
          <span>{UI_TEXT.APP_TITLE} {USE_MOCK && UI_TEXT.MOCK_MODE}</span>
        </p>

        {/* Status bar */}
        <div className="h-12 flex items-center justify-between px-2 mb-2 border-b border-pink-300/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#3a253f] border border-gray-700">
              <Activity size={14} className={isConnected ? 'text-green-400' : 'text-red-400'} />
              <span className="text-[10px] text-pink-100">
                {isConnected ? UI_TEXT.ONLINE : UI_TEXT.CONNECTING}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-pink-100">
              <span className="px-2 py-1 rounded bg-[#3a253f] border border-pink-300/60">
                {formatDay(day)}
              </span>
              <span className="px-2 py-1 rounded bg-pink-900/60 border border-pink-500 text-pink-100">
                {PHASE_LABEL[gamePhase] || gamePhase}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLogs((v) => !v)}
              className="nes-btn is-small"
              style={{ backgroundColor: '#f9a8d4', color: 'black' }}
            >
              <MessageSquare size={12} className="mr-1 inline" /> {UI_TEXT.BTN_LOG}
            </button>
            <button
              onClick={handleStop}
              className="nes-btn is-small"
              style={{ backgroundColor: '#fecaca', color: '#7f1d1d' }}
            >
              <Power size={12} className="mr-1 inline" /> {UI_TEXT.BTN_STOP}
            </button>
          </div>
        </div>

        {/* Phaser canvas */}
        <div className="flex-1 bg-black mt-1 flex items-center justify-center border border-gray-700">
          <GameView onGameReady={setPhaserGame} phase={gamePhase} />
        </div>
      </div>

      {/* RIGHT: Inspector */}
      <div
        className="w-80 nes-container with-title flex flex-col"
        style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}
      >
        <p className="title text-[10px]">{UI_TEXT.INSPECTOR_TITLE}</p>
        <div className="flex-1 mt-1 overflow-y-auto custom-scrollbar">
          <Inspector agentsData={agentsData} characterMeta={characterMeta} />
        </div>
      </div>

      {/* [修改] Floating Live Chat Panel -> 改為中央大型面板 */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-[2px]">
          <div
            // 調整寬高：w-[800px] h-[600px]
            className="w-[800px] h-[600px] nes-container with-title flex flex-col shadow-2xl"
            style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}
          >
            <p className="title flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2">
                <MessageSquare size={14} />
                {UI_TEXT.LOG_PANEL_TITLE}
              </span>
              <button
                onClick={() => setShowLogs(false)}
                className="hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </p>
            
            <div className="flex-1 overflow-hidden mt-2 p-2 bg-[#1a1020] border border-pink-500/20 rounded">
               <LiveChatPanel 
                 activeSessions={activeSessions} 
                 pairLogs={pairLogs}
                 agentsData={agentsData}
               />
            </div>
            
            <div className="mt-2 text-right">
                <button 
                    onClick={() => setShowLogs(false)}
                    className="nes-btn is-error is-small"
                >
                    關閉
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Host Phase Overlay */}
      <HostMatchmakingOverlay
        visible={showHostPanel && gamePhase === GAME_PHASE.PLAYER_TURN}
        onClose={() => setShowHostPanel(false)}
        day={day}
        characters={characters}
      />

      {/* Final Results Overlay */}
      {showResultPanel && finalResults && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70]">
          <div
            className="w-[960px] h-[560px] nes-container with-title flex flex-col relative"
            style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}
          >
            <p className="title flex items-center justify-between text-[11px]">
              <span>{UI_TEXT.RESULT_TITLE}</span>
              <button
                type="button"
                onClick={() => setShowResultPanel(false)}
                className="nes-btn is-error is-small"
                style={{ padding: '0 6px', fontSize: '10px' }}
              >
                <X size={10} />
              </button>
            </p>

            <div className="flex-1 mt-2 flex flex-row gap-4 overflow-hidden">
              {/* Left: Pair Ranking */}
              <div className="flex-[1.4] border border-pink-300/40 rounded p-3 bg-black/20 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-pink-100 uppercase tracking-wide">
                    {UI_TEXT.RANKING_TITLE}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                  {finalResults.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-pink-200 text-[11px] opacity-70">
                      {UI_TEXT.NO_DATA}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {finalResults.map((item, idx) => (
                        <li
                          key={`${item.a}-${item.b || 'single'}-${idx}`}
                          className="bg-slate-900/80 border border-pink-500/60 rounded px-3 py-2 flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-pink-100">
                              {item.b
                                ? `${item.a}  ❤  ${item.b}`
                                : `${item.a} (${UI_TEXT.NO_PARTNER})`}
                            </span>
                            <span className="text-[11px] font-mono bg-pink-500/20 text-pink-200 px-2 py-0.5 rounded">
                              Score: {item.score}
                            </span>
                          </div>
                          {item.summary && (
                            <p className="text-[10px] text-pink-100/80 leading-snug">
                              {item.summary}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right: Explanation */}
              <div className="flex-1 border border-pink-300/40 rounded p-3 text-[11px] bg-black/30 flex flex-col">
                <div className="font-bold mb-2 text-pink-100">
                  {UI_TEXT.EXPLAIN_TITLE}
                </div>
                <ul className="list-disc list-inside space-y-1 text-pink-100/90">
                  {UI_TEXT.EXPLAIN_LIST.map((text, i) => (
                    <li key={i}>{text}</li>
                  ))}
                </ul>

                <div className="mt-auto pt-3 text-[10px] text-pink-200/80 border-t border-pink-500/20">
                  {UI_TEXT.TIP}
                </div>
              </div>
            </div>
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