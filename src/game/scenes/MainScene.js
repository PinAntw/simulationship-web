import Phaser from 'phaser';
import bgRoom from '../../assets/bg_room.png';
import charMale from '../../assets/char_male.png';
import charFemale from '../../assets/char_female.png';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.characters = {}; 
        this.currentPhase = 'AI_CHAT'; 
    }

    // === 1. preload：載入像素圖 ===
    preload() {
        // 背景圖
        this.load.image('bg-room', bgRoom);

        // 角色圖
        this.load.image('char-male', charMale);
        this.load.image('char-female', charFemale);
    }

    // === 2. create：建立場景與事件監聽 ===
    create() {
        // 2-1. 背景圖
        const bg = this.add.image(400, 300, 'bg-room');
        bg.setOrigin(0.5, 0.5);
        bg.setDisplaySize(800, 600);
        

        // 2-2. 柔和一點的 overlay（可有可無）
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.08);
        overlay.setDepth(0.05);

        // 2-3. 角色容器層（之後角色都放這層）
        this.charLayer = this.add.layer();
        this.charLayer.setDepth(1);

        // 3. 監聽 MOVE / SPAWN / PHASE 改變
        this.game.events.on('MOVE_CHAR', (payload) => {
            const { char_id, x, y, color } = payload;
            this.handleCharacterMove(char_id, x, y, color);
        });

        this.game.events.on('SPAWN_CHAR', (payload) => {
            const {
                char_id,
                x,
                y,
                color,
                gender,
            } = payload;
            if (!this.characters[char_id]) {
                this.createCharacter(char_id, x, y, color, gender);
            }
        });

        this.game.events.on('GAME_PHASE_CHANGE', (phase) => {
            this.currentPhase = phase; // 'AI_CHAT' / 'FREE_CHAT' / 'PLAYER_TURN'
        });

        this.game.events.on('CHARACTER_SPEAK', (payload) => {
            const { char_id, content } = payload;
            this.showSpeechBubble(char_id, content);
        });
    }

    // === 3. 建立角色 ===
    createCharacter(id, x, y, color, gender = 'male') {
        if (this.characters[id]) return;

        console.log(`✨ Create pixel character: ${id}, gender=${gender}, color=${color}`);

        // 3-1. 選用不同角色圖
        const textureKey =
            gender === 'female'
                ? 'char-female'
                : 'char-male';

        const sprite = this.add.sprite(x, y, textureKey);
        sprite.setOrigin(0.5, 1); // 腳踩在 y 座標
        sprite.setScale(0.13);       // 放大一點，配合 pixelArt

        // // 邊框（debug用）
        // const selectionOutline = this.add.rectangle(
        //     x, y - sprite.displayHeight / 2,
        //     sprite.displayWidth + 4,
        //     sprite.displayHeight + 4,
        //     0xffffff,
        //     0
        // );
        // selectionOutline.setStrokeStyle(1, 0xffffff, 0.4);

        // 3-2. 名牌（姓名標籤）
        const labelBg = this.add.rectangle(
            x,
            y - sprite.displayHeight - 12,
            id.length * 8 + 10,
            14,
            0x000000,
            0.6
        );
        labelBg.setStrokeStyle(1, 0xf9a8d4, 0.9);

        const label = this.add.text(x, y - sprite.displayHeight - 12, id, {
            fontSize: '8px',
            color: '#f9a8d4',
        }).setOrigin(0.5);

        // 層級整理
        this.charLayer.add(sprite);
        this.charLayer.add(labelBg);
        this.charLayer.add(label);

        this.characters[id] = {
            sprite,
            label,
            labelBg,
            lastSpeechBubble: null,
        };
    }

    // === 4. 處理移動（Tween 播放像素小人走動） ===
    handleCharacterMove(id, targetX, targetY, color, gender) {
        if (!this.characters[id]) {
            this.createCharacter(id, targetX, targetY, color, gender);
        }

        const charObj = this.characters[id];
        const { sprite, label, labelBg, outline } = charObj;

        const duration = 600;

        this.tweens.add({
            targets: [sprite, label, labelBg, outline],
            x: targetX,
            y: {
                // sprite 腳踩在 y
                getEnd: (target) => {
                    if (target === sprite || target === outline) return targetY;
                    if (target === label || target === labelBg) {
                        return targetY - sprite.displayHeight - 12;
                    }
                    return targetY;
                },
            },
            duration,
            ease: 'Sine.easeInOut',
        });
    }

    //  helper functions ===
    showSpeechBubble(id, text) {
        const charObj = this.characters[id];
        if (!charObj) return;
        const { sprite, lastSpeechBubble } = charObj;
        if (lastSpeechBubble) {
            lastSpeechBubble.bg.destroy();
            lastSpeechBubble.text.destroy();
        }

        const maxWidth = 120;
        const padding = 4;

        const bubbleText = this.add.text(
            sprite.x,
            sprite.y - sprite.displayHeight - 28,
            text,
            {
            fontSize: '8px',
            color: '#111827',
            wordWrap: { width: maxWidth },
            }
        ).setOrigin(0.5, 1);

        const bounds = bubbleText.getBounds();
        const bubbleBg = this.add.rectangle(
            bounds.centerX,
            bounds.centerY,
            bounds.width + padding * 2,
            bounds.height + padding * 2,
            0xffffff,
            0.9
        );
        bubbleBg.setStrokeStyle(1, 0xf9a8d4, 1);

        bubbleText.setDepth(10);
        bubbleBg.setDepth(9);

        this.charLayer.add(bubbleBg);
        this.charLayer.add(bubbleText);

        this.characters[id].lastSpeechBubble = {
            bg: bubbleBg,
            text: bubbleText,
        };

        // 氣泡在 3 秒後淡出並刪除
        this.time.delayedCall(3000, () => {
            this.tweens.add({
            targets: [bubbleBg, bubbleText],
            alpha: 0,
            duration: 400,
            onComplete: () => {
                bubbleBg.destroy();
                bubbleText.destroy();
                if (this.characters[id]) {
                this.characters[id].lastSpeechBubble = null;
                }
            },
            });
        });
        }

}
