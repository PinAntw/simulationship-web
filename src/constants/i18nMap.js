// src/constants/i18nMap.js
import { GAME_PHASE } from './gamePhase';

// 1. 遊戲階段顯示名稱
export const PHASE_LABEL = {
  [GAME_PHASE.AI_CHAT]: '深度交流 階段',
  [GAME_PHASE.FREE_CHAT]: '自由活動',
  [GAME_PHASE.PLAYER_TURN]: '主持人配對階段',
  [GAME_PHASE.GAME_OVER]: '遊戲結算',
};

// 2. 介面文字 (UI Text)
export const UI_TEXT = {
  // 通用
  APP_TITLE: 'SimulationShip 實時模擬',
  LOBBY_TITLE: 'SimulationShip 大廳',
  MOCK_MODE: '(測試模式)',
  ONLINE: '連線正常',
  CONNECTING: '連線中...',
  DAY_PREFIX: '第',
  DAY_SUFFIX: '天',
  UNKNOWN: '未知',
  
  // 按鈕
  BTN_LOG: '對話紀錄',
  BTN_STOP: '停止模擬',
  BTN_NEXT_MATCH: '下一步：進行配對',
  BTN_ADD_CHAR: '新增角色',
  BTN_RESET: '重置房間',
  BTN_ADD_PAIR: '加入配對清單',
  BTN_BACK: '返回',
  BTN_START_SIM: '開始模擬',
  BTN_INIT: '初始化中...',
  BTN_REFRESH: '重新整理',
  BTN_DETAILS: '詳細資訊',
  BTN_CLOSE_PANEL: '關閉面板',
  BTN_SUBMIT: '確認配對並開始下一局',
  BTN_PROCESSING: '處理中...',
  BTN_SEND_BACKEND: '送出配對到後端',
  BTN_SENDING: '送出中...',
  BTN_ADD: '加入',
  BTN_REMOVE: '移除',

  // 角色設定 (CharacterForm)
  CHAR_SETUP_TITLE: '角色設定',
  LBL_NAME: '姓名',
  PH_NAME: '例如：彥x, x哲',
  LBL_GENDER: '性別',
  GENDER_M: '♂ 男',
  GENDER_F: '♀ 女',
  LBL_COLOR: '代表色',
  LBL_PERSONALITY: '個性 / 背景故事',
  PH_PERSONALITY: '例如：樂觀開朗，喜歡運動.',
  NO_PERSONALITY: '(尚未設定個性)',

  // 配對面板 (MatchmakingPanel)
  MATCH_TITLE: '配對環節',
  LBL_CHAR_A: '角色 A',
  LBL_CHAR_B: '角色 B',
  PH_SELECT_A: '選擇角色 A',
  PH_SELECT_B: '選擇角色 B',
  DRAG_HINT: '拖角色至此\n或是下方選擇',
  EMPTY_LIST: '清單是空的。\n請新增配對以開始模擬。',
  LIST_EMPTY_SIMPLE: '尚未指定',
  
  // 房間成員 (RoomMembersPanel)
  MEMBERS_TITLE: '房間成員',
  EMPTY_MEMBERS: '目前沒有角色。請回到第一步建立角色。',

  // 步驟 (StepHeader)
  STEP_1: '1. 建立角色',
  STEP_2: '2. 進行配對',
  BADGE_LOBBY: '準備大廳',

  // 模擬視窗 (SimulationView)
  SIM_STAGE_TITLE: '模擬世界',
  INSPECTOR_TITLE: '角色狀態',
  LOG_PANEL_TITLE: '即時互動紀錄',
  WAITING_AI: '等待 AI 決策中...',
  LBL_ACTION: '正在執行',
  LBL_SPOKEN: '對話內容',
  LBL_THOUGHT: '內心murmur',
  LIVE: '直播中...',

  // Host Panel (主持人介面)
  HOST_TITLE: '主持人控制台 · 配對中心',
  CAST_OVERVIEW: '目前角色列表',
  HOST_STATUS_LABEL: '當前狀態：',
  HOST_WAITING: '等待主持人操作',
  HOST_INSTRUCTION: '請拖曳角色進行配對，完成後點擊右下角按鈕進入下一天。',
  
  // Result Panel (結算介面)
  RESULT_TITLE: '最終配對結果報告',
  RANKING_TITLE: '💖 心動指數排行榜',
  NO_DATA: '本次模擬未偵測到足夠的互動數據。',
  NO_PARTNER: '落單 / No Partner',
  EXPLAIN_TITLE: '🧐 這些配對是怎麼決定的？',
  EXPLAIN_LIST: [
    '系統讀取了每一對角色之間的所有對話紀錄。',
    'AI 評審根據對話內容，計算出雙方的「戀愛相容度」(0-100分)。',
    '系統採用「高分優先 (Greedy)」策略：分數最高的組合優先配對。',
    '若某個角色沒有適合的對象，可能會落單。'
  ],
  TIP: '💡 提示：你可以嘗試調整角色的個性設定，觀察故事會有什麼不同的發展！',

  // Alerts & Confirms
  ALERT_CREATE_TWO: '請至少建立兩位角色',
  ALERT_START_FAIL: '無法開始模擬，請檢查伺服器',
  ALERT_SELECT_TWO: '請選擇兩位角色',
  ALERT_SAME_CHAR: '不能選擇同一位角色',
  ALERT_NOT_EXIST: '選擇的角色不存在',
  ALERT_EXISTS: '此配對已經存在',
  ALERT_MOCK_ADD: '測試模式：無法新增角色',
  ALERT_MOCK_RESET: '測試模式：不支援重置',
  CONFIRM_RESET: '確定要清除所有角色嗎？',
  CONFIRM_NO_PAIRS: '尚未設定任何配對，確定要直接開始嗎？AI 將會隨機互動。',
  MSG_PAIR_SENT: '配對已送出給後端',
  MSG_PAIR_FAIL: '送出配對失敗，請看 console',
};

// 小工具
export const formatDay = (day) => `${UI_TEXT.DAY_PREFIX} ${day} ${UI_TEXT.DAY_SUFFIX}`;
export const t = (key) => UI_TEXT[key] || key;