// src/components/Inspector.jsx
import React, { useState } from 'react';
import { Brain, Footprints, MessageCircle, User, ChevronDown, ChevronUp } from 'lucide-react';
import { UI_TEXT } from '../constants/i18nMap'; // [新增]

const genderLabel = (gender) => {
  if (!gender) return UI_TEXT.UNKNOWN;
  if (gender === 'male') return 'Male'; // 可視需求改中文
  if (gender === 'female') return 'Female';
  return gender;
};

const Inspector = ({ agentsData, characterMeta = {} }) => {
  const agentList = Object.values(agentsData)
    .sort((a, b) => (a.char_id || '').localeCompare(b.char_id || ''));

  const [openAgents, setOpenAgents] = useState({});

  const toggleAgent = (id) => {
    setOpenAgents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col h-full text-white">
      {agentList.length === 0 && (
        <div className="mt-6 text-center text-[11px] text-pink-100 opacity-70">
          {UI_TEXT.WAITING_AI} {/* [修改] */}
        </div>
      )}

      <div className="space-y-3 pb-3">
        {agentList.map((agent) => {
          const id = agent.char_id;
          const meta = characterMeta[id] || {};
          const isOpen = !!openAgents[id];

          return (
            <section
              key={id}
              className="nes-container is-dark with-title relative"
              style={{ backgroundColor: '#3a253f', borderColor: '#f9a8d4' }}
            >
              <p className="title text-[10px] flex items-center justify-between pr-4">
                <span className="inline-flex items-center gap-1">
                  <span
                    className="inline-block w-2 h-2 rounded-sm"
                    style={{ backgroundColor: agent.char_color || meta.avatar_color || '#f472b6' }}
                  />
                  <span>{id}</span>
                  <span className="ml-1 px-1 py-[1px] rounded bg-[#2b1b2f] border border-pink-300/60 text-[9px] uppercase">
                    {genderLabel(meta.gender)}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => toggleAgent(id)}
                  className="border-0 bg-transparent text-pink-200 hover:text-pink-400 flex items-center gap-1 text-[9px]"
                >
                  <span>{UI_TEXT.BTN_DETAILS}</span> {/* [修改] */}
                  {isOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
              </p>

              <div className="flex items-center justify-between text-[9px] text-pink-100 mb-1">
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#2b1b2f] border border-pink-300/40">
                  <Footprints size={10} />
                  <span>{UI_TEXT.LBL_ACTION}: {agent.action || '—'}</span> {/* [修改] */}
                </div>
              </div>

              {agent.content && (
                <div className="mt-2 mb-1">
                  <p className="text-[9px] text-pink-50 flex items-center gap-1 mb-1">
                    <MessageCircle size={10} /> {UI_TEXT.LBL_SPOKEN} {/* [修改] */}
                  </p>
                  <div className="relative">
                    <p className="text-[10px] leading-snug bg-[#111827] border border-pink-300/60 text-pink-50 px-2 py-1 rounded">
                      “{agent.content}”
                    </p>
                  </div>
                </div>
              )}

              {isOpen && (
                <div className="mt-3 space-y-2 border-t border-pink-300/30 pt-2">
                  <div>
                    <p className="text-[9px] text-pink-100 flex items-center gap-1 mb-1">
                      <User size={10} /> {UI_TEXT.LBL_PERSONALITY} {/* [修改] */}
                    </p>
                    <p className="text-[10px] leading-snug text-pink-100 bg-[#2b1b2f] border border-pink-300/40 rounded px-2 py-1">
                      {meta.personality || UI_TEXT.NO_PERSONALITY} {/* [修改] */}
                    </p>
                  </div>

                  {agent.thought && (
                    <div>
                      <p className="text-[9px] text-pink-100 flex items-center gap-1 mb-1">
                        <Brain size={10} /> {UI_TEXT.LBL_THOUGHT} {/* [修改] */}
                      </p>
                      <p className="text-[10px] text-yellow-100 italic bg-[#17111d] border border-yellow-500/60 px-2 py-1 rounded">
                        “{agent.thought}”
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Inspector;