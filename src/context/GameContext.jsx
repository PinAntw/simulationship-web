import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react';
import { WS_URL, USE_MOCK } from '../config'; 
import { GAME_PHASE } from '../constants/gamePhase';
import { MockWebSocket } from '../mock/mockService'; 

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  
  // 核心遊戲狀態
  const [gamePhase, setGamePhase] = useState(GAME_PHASE.AI_CHAT);
  const [day, setDay] = useState(1);
  const [agentsData, setAgentsData] = useState({});
  const [finalResults, setFinalResults] = useState(null);

  // 即時互動狀態
  const [activeSessions, setActiveSessions] = useState({});
  const [pairLogs, setPairLogs] = useState({});

  const socketRef = useRef(null);
  
  // [關鍵修正] 使用 Ref 來儲存配對狀態，確保 Socket callback 能"同步"讀取最新資料
  const activeSessionsRef = useRef({}); 

  // 輔助：產生 Pair Key
  const getPairKey = (name1, name2) => {
    return [name1, name2].sort().join('-');
  };

  const addLog = useCallback((message) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${message}`, ...prev]);
  }, []);

  const clearPairLogs = useCallback(() => {
    setPairLogs({});
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    clearPairLogs();
  }, [clearPairLogs]);

  const connectSocket = useCallback(() => {
    if (socketRef.current) return;

    let socket;
    if (USE_MOCK) {
      console.log('Using Mock WebSocket');
      socket = new MockWebSocket(WS_URL);
    } else {
      socket = new WebSocket(WS_URL);
    }

    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WS Connected');
      setIsConnected(true);
      addLog(`System: Connected to ${USE_MOCK ? 'Mock' : 'Simulation'} Engine.`);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, payload, data, log } = msg;

        if (log) addLog(`Server: ${log}`);

        switch (type) {
          // [核心] 統一處理後端快照
          case 'GAME_SNAPSHOT':
            if (data) {
                if (data.phase) setGamePhase(data.phase);
                if (typeof data.day === 'number') setDay(data.day);
                
                if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                    setFinalResults(data.results);
                }

                // [關鍵修正] 同時更新 State (給 UI 用) 和 Ref (給邏輯用)
                if (data.chatSessions) {
                    setActiveSessions(data.chatSessions);
                    activeSessionsRef.current = data.chatSessions; // 立即生效！
                }
            }
            break;

          // [輔助] 處理每秒 Tick
          case 'TICK':
          case 'GAME_STATE':
             if (payload) {
                 if (payload.phase) setGamePhase(payload.phase);
                 if (payload.day) setDay(payload.day);
             }
             break;

          case 'AGENT_DECISION':
            if (payload && payload.char_id) {
                setAgentsData((prev) => ({ ...prev, [payload.char_id]: payload }));
            }
            break;

          // [Log] 角色說話
          case 'CHARACTER_SPEAK':
             if (payload) {
                 const { char_id, content } = payload;
                 // 1. 寫入通用 Log
                 addLog(`${char_id}: ${content}`);

                 // 2. 寫入分組 Log
                 // 直接從 Ref 讀取最新的配對資訊，確保不會因為 React Render 延遲而讀到空值
                 const currentSessions = activeSessionsRef.current;
                 const partner = currentSessions[char_id];
                 
                 if (partner) {
                     const key = getPairKey(char_id, partner);
                     setPairLogs(prev => {
                         const currentLogs = prev[key] || [];
                         // 保留最近 10 句
                         const newLogs = [...currentLogs, { sender: char_id, content }].slice(-10);
                         return { ...prev, [key]: newLogs };
                     });
                 }
             }
             break;

          default:
            break;
        }
      } catch (e) {
        console.error('Socket parse error', e);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      addLog('System: Connection closed.');
      socketRef.current = null;
    };
  }, [addLog]); // 這裡不需要依賴 activeSessions，因為我們用 Ref

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
    connectSocket,
    disconnectSocket,
    logs,
    addLog,
    clearLogs,
    gamePhase,
    day,
    agentsData,
    finalResults,
    activeSessions,
    pairLogs,
    clearPairLogs,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => useContext(GameContext);