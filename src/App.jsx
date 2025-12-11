// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { GameProvider } from './context/GameContext';

// Views
import LobbySetupView from './views/LobbySetupView';
import SimulationView from './views/SimulationView';

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          {/* 首頁：設定大廳 */}
          <Route path="/" element={<LobbySetupView />} />
          
          {/* 遊戲頁面 */}
          <Route path="/game" element={<SimulationView />} />
          
          {/* 未知路徑導回首頁 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;