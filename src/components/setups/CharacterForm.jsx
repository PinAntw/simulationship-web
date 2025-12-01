// src/components/setup/CharacterForm.jsx
import React from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import charMale from '../../assets/char_male.png';
import charFemale from '../../assets/char_female.png';

const CharacterForm = ({ formData, setFormData, onSubmit, onResetRoom }) => {
  const previewSrc = formData.gender === 'female' ? charFemale : charMale;

  return (
    <div
      className="w-[38%] nes-container is-dark with-title flex flex-col"
      style={{ backgroundColor: '#3a253f', borderColor: '#f9a8d4' }}
    >
      <p className="title flex items-center gap-2">
        <UserPlus size={12} />
        <span>Character Setup</span>
      </p>

      <form
        onSubmit={onSubmit}
        className="flex-1 flex flex-col pt-2 pr-1"
      >
        {/* 頭像預覽 */}
        <div className="mb-3 flex items-center justify-center">
          <div
            className="inline-flex items-center justify-center rounded-md border"
            style={{
              borderColor: formData.avatar_color || '#f9a8d4',
              backgroundColor: '#1f1024',
              padding: '6px',
            }}
          >
            <img
              src={previewSrc}
              alt="Character preview"
              className="w-16 h-16"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>

        {/* 使用者填角色資料地方 */}
        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="nes-field">
            <label className="text-[10px] text-pink-100">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="nes-input w-full text-black bg-white"
              placeholder="e.g. Jason Huang"
            />
          </div>

          <div className="flex gap-3">
            <div className="nes-field flex-1">
              <label className="text-[10px] text-pink-100">Gender</label>
              <div className="inline-flex gap-4 mt-1 text-[13px]">
                <label>
                  <input
                    type="radio"
                    className="nes-radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  />
                  <span className="ml-1">Male</span>
                </label>
                <label>
                  <input
                    type="radio"
                    className="nes-radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  />
                  <span className="ml-1">Female</span>
                </label>
              </div>
            </div>

            <div className="nes-field w-24">
              <label className="text-[10px] text-pink-100">Avatar Color</label>
              <input
                type="color"
                value={formData.avatar_color}
                onChange={(e) =>
                  setFormData({ ...formData, avatar_color: e.target.value })
                }
                className="w-full h-9 border border-pink-300 rounded bg-black cursor-pointer"
              />
            </div>
          </div>

          <div className="nes-field">
            <label className="text-[10px] text-pink-100">
              Personality / Backstory
            </label>
            <textarea
              value={formData.personality}
              onChange={(e) =>
                setFormData({ ...formData, personality: e.target.value })
              }
              className="nes-textarea w-full h-32 text-[14px] text-black bg-white"
              placeholder="e.g. Handsome and brave, loves adventures..."
            />
          </div>
        </div>

        {/* 送出資料 */}
        <div className="mt-3 pt-2 border-t border-pink-300 flex justify-between items-center gap-2">
          <button
            type="submit"
            className="nes-btn flex-1"
            style={{ backgroundColor: '#f472b6', color: 'black' }}
          >
            Add Character
          </button>
          <button
            type="button"
            onClick={onResetRoom}
            className="nes-btn is-error is-small"
          >
          {/* 重置角色*/}
          <Trash2 size={12} className="mr-1" />
            Reset Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharacterForm;
