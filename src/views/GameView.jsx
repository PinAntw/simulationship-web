// src/components/GameView.jsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import config from '../game/config';

const GameView = ({ onGameReady, phase }) => {
  const gameRef = useRef(null);

  // 初始化 Phaser 遊戲
  useEffect(() => {
    if (!gameRef.current) {
      const game = new Phaser.Game(config);
      gameRef.current = game;

      if (onGameReady) {
        setTimeout(() => {
          onGameReady(game);
        }, 0);
      }
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // phase 改變時通知 Phaser
  useEffect(() => {
    if (!gameRef.current) return;
    gameRef.current.events.emit('GAME_PHASE_CHANGE', phase);
  }, [phase]);

  return (
    <div className="flex justify-center items-center h-full w-full bg-[#1b1024]">
      <div
        className="nes-container is-dark with-title"
        style={{
          backgroundColor: '#2b1b2f',
          borderColor: '#f9a8d4',
          width: '880px',
        }}
      >
        <p className="title text-[10px]">Simulation Stage</p>
        <div
          id="phaser-container"
          className="mx-auto border border-pink-300"
          style={{
            width: '800px',
            height: '600px',
            backgroundColor: 'black',
          }}
        />
      </div>
    </div>
  );
};

export default GameView;
