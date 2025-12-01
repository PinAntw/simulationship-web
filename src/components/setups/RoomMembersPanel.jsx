// src/components/setups/RoomMembersPanel.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';
import charMale from '../../assets/char_male.png';
import charFemale from '../../assets/char_female.png';

const RoomMembersPanel = ({ characters, onRefresh, enableDrag = false }) => {
  return (
    <div
      className="nes-container is-dark with-title flex flex-col h-full"
      style={{ backgroundColor: '#3a253f', borderColor: '#f9a8d4' }}
    >
      <p className="title flex items-center justify-between">
        <span>Room Members ({characters.length})</span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            type="button"
            className="nes-btn is-small"
            style={{ backgroundColor: '#fb7185', color: 'black' }}
          >
            <RefreshCw size={12} className="mr-1" />
            Refresh
          </button>
        )}
      </p>

      <div className="flex-1 overflow-y-auto mt-3 pr-1 grid grid-cols-2 xl:grid-cols-3 gap-4 custom-scrollbar">
        {characters.map((char) => {
          const avatarSrc = char.gender === 'female' ? charFemale : charMale;

          return (
            <section
              key={char.id}
              className="nes-container is-dark with-title relative flex flex-col"
              style={{ backgroundColor: '#2b1b2f', borderColor: '#f9a8d4' }}
              draggable={enableDrag}
              onDragStart={(e) => {
                if (!enableDrag) return;
                e.dataTransfer.setData('text/plain', char.name);
              }}
            >
              <p className="title text-[10px] flex items-center justify-between">
                <span>
                  {char.name}{' '}
                  <span className="text-[9px] ml-1 opacity-80">({char.gender})</span>
                </span>
              </p>

              {/* 選顏色 */}
              <div
                className="absolute top-0 right-2 mt-2 w-3 h-3 rounded-sm"
                style={{ backgroundColor: char.avatar_color }}
              />

              {/* 頭像 + 個性填寫 */}
              <div className="flex items-start gap-2 mt-2">
                <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden border border-pink-300/60 bg-black">
                  <img
                    src={avatarSrc}
                    alt={char.gender}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[10px] text-pink-100 leading-snug line-clamp-4 min-h-[52px]">
                  {char.personality || '(No personality set yet)'}
                </p>
              </div>
            </section>
          );
        })}

        {characters.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-full">
            <p className="text-[10px] text-pink-200">
              No characters yet. Go back to Step 1 to create them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomMembersPanel;
