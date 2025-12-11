// src/context/GameContext.jsx
import React, { createContext, useState, useContext, useRef, useCallback } from 'react';
import { WS_URL, USE_MOCK } from '../config'; // 記得引入 USE_MOCK
import { GAME_PHASE } from '../constants/gamePhase';
import { MockWebSocket } from '../mock/mockService'; // 引入 Mock Socket

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const [gamePhase, setGamePhase] = useState(GAME_PHASE.AI_CHAT);
  const [day, setDay] = useState(1);
  const [agentsData, setAgentsData] = useState({});
  
  const socketRef = useRef(null);

  const addLog = useCallback((message) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${message}`, ...prev]);
  }, []);

  const connectSocket = useCallback(() => {
    if (socketRef.current) return;

    // ⭐ 修改處：判斷是否使用 Mock
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
        const data = JSON.parse(event.data);
        const { type, payload, log } = data;

        if (log) addLog(`Server: ${log}`);

        switch (type) {
          case 'GAME_STATE':
            if (typeof payload.day === 'number') setDay(payload.day);
            if (payload.phase) setGamePhase(payload.phase);
            break;
          case 'AGENT_DECISION':
            setAgentsData((prev) => ({ ...prev, [payload.char_id]: payload }));
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
  }, [addLog]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const clearLogs = () => setLogs([]);

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
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => useContext(GameContext);