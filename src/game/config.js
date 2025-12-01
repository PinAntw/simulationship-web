import Phaser from 'phaser';
import MainScene from './scenes/MainScene';


const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-container',
  backgroundColor: '#000000',
  pixelArt: true,                  
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [MainScene],
};

export default config;