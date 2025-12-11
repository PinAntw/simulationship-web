// src/mock/mockService.js

// 1. 靜態假角色資料
export const MOCK_CHARACTERS = [
  { name: 'Alice', gender: 'female', personality: 'Cheerful', avatar_color: '#ff0000', x: 400, y: 300 },
  { name: 'Bob', gender: 'male', personality: 'Grumpy', avatar_color: '#0000ff', x: 200, y: 300 },
  { name: 'Charlie', gender: 'male', personality: 'Brave', avatar_color: '#00ff00', x: 600, y: 300 },
];

// 2. 假的 WebSocket 類別
export class MockWebSocket {
  constructor(url) {
    console.log(`[MockWS] Connecting to ${url}...`);
    this.url = url;
    this.readyState = 1; // Open
    this.intervalId = null;
    
    // 儲存透過 addEventListener 註冊的監聽器
    this.listeners = {
      open: [],
      message: [],
      close: [],
      error: []
    };

    // 模擬連線成功延遲
    setTimeout(() => {
      this._trigger('open', {});
      this.startSimulation();
    }, 500);
  }

  // --- 標準 WebSocket API 實作 ---

  addEventListener(type, listener) {
    if (this.listeners[type]) {
      this.listeners[type].push(listener);
    }
  }

  removeEventListener(type, listener) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
  }

  send(data) {
    console.log('[MockWS] Sent:', data);
  }

  close() {
    console.log('[MockWS] Closed');
    if (this.intervalId) clearInterval(this.intervalId);
    this._trigger('close', {});
  }

  // --- 內部輔助方法 ---

  // 同時觸發 on[type] 屬性和 addEventListener 註冊的函式
  _trigger(type, event) {
    // 1. 觸發屬性處理器 (例如 this.onmessage)
    const propName = 'on' + type;
    if (typeof this[propName] === 'function') {
      this[propName](event);
    }

    // 2. 觸發監聽器列表
    if (this.listeners[type]) {
      this.listeners[type].forEach(listener => {
        try {
          listener(event);
        } catch (err) {
          console.error('[MockWS] Listener error:', err);
        }
      });
    }
  }

  // 開始發送假事件
  startSimulation() {
    console.log('[MockWS] Simulation started');
    
    // 模擬後端每 2 秒傳送一次移動指令
    this.intervalId = setInterval(() => {
      // 隨機挑一個角色
      const randomChar = MOCK_CHARACTERS[Math.floor(Math.random() * MOCK_CHARACTERS.length)];
      
      // 隨機座標
      const targetX = 100 + Math.random() * 600;
      const targetY = 100 + Math.random() * 400;

      // 建立假封包
      const mockEvent = {
        data: JSON.stringify({
          type: 'MOVE_CHAR',
          payload: {
            char_id: randomChar.name,
            x: targetX,
            y: targetY,
            color: randomChar.avatar_color,
            gender: randomChar.gender
          },
          log: `${randomChar.name} moved to (${Math.floor(targetX)}, ${Math.floor(targetY)})`
        })
      };

      // 觸發 message 事件
      this._trigger('message', mockEvent);

      // 偶爾發送說話事件 (30% 機率)
      if (Math.random() > 0.7) {
        const speakEvent = {
            data: JSON.stringify({
                type: 'CHARACTER_SPEAK',
                payload: {
                    char_id: randomChar.name,
                    content: "Hello! I am mocking."
                },
                log: `${randomChar.name} says hello.`
            })
        };
        // 延遲一點點說話
        setTimeout(() => this._trigger('message', speakEvent), 500);
      }

    }, 2000);
  }
}