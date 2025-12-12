// src/components/LiveChatPanel.jsx
import React, { useMemo, useEffect, useRef } from 'react';
import { MessageCircle, HeartHandshake } from 'lucide-react';
import { UI_TEXT } from '../constants/i18nMap';

const LiveChatPanel = ({ activeSessions, pairLogs, agentsData }) => {
  // 自動捲動到底部 (Optional)
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pairLogs]);

  const uniquePairs = useMemo(() => {
    const pairs = [];
    const seen = new Set();
    Object.entries(activeSessions).forEach(([a, b]) => {
      const key = [a, b].sort().join('-');
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push({ key, a, b });
      }
    });
    return pairs;
  }, [activeSessions]);

  return (
    <div className="flex flex-col h-full">
      {/* 標題列 */}
      <div className="mb-3 flex items-center justify-between text-xs text-pink-200 border-b border-pink-500/30 pb-2">
        <span className="flex items-center gap-2 font-bold">
          <HeartHandshake size={16} className="text-pink-400" /> 
          進行中的對話 ({uniquePairs.length})
        </span>
        <span className="text-[10px] opacity-70">
          即時監控中...
        </span>
      </div>

      {/* 內容區：改為 Grid 排列，大畫面可以並排顯示多組對話 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        {uniquePairs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
            <MessageCircle size={32} className="opacity-20" />
            <p className="text-xs">目前沒有任何角色在交談。</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uniquePairs.map(({ key, a, b }) => {
            const logs = pairLogs[key] || [];
            return (
              <div 
                key={key} 
                className="bg-[#241528] border border-pink-500/40 rounded-md p-3 flex flex-col h-[300px] shadow-lg relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-pink-100">{a}</span>
                    <HeartHandshake size={14} className="text-pink-500 animate-pulse" />
                    <span className="text-sm font-bold text-pink-100">{b}</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-green-900/50 text-green-300 rounded border border-green-700/50">
                    Live
                  </span>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[10px] text-gray-600 italic">
                      等待對話開始...
                    </div>
                  ) : (
                    logs.map((msg, idx) => {
                      const isLeft = msg.sender === a;
                      return (
                        <div 
                          key={idx} 
                          className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}
                        >
                          <div 
                            className={`
                              max-w-[90%] px-3 py-2 rounded-lg text-[11px] leading-relaxed shadow-sm
                              ${isLeft 
                                ? 'bg-slate-700 text-pink-50 rounded-tl-none border border-slate-600' 
                                : 'bg-pink-700 text-white rounded-tr-none border border-pink-600'}
                            `}
                          >
                            <div className="text-[9px] opacity-60 mb-0.5 font-bold">
                              {msg.sender}
                            </div>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiveChatPanel;