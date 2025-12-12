// src/components/setups/CharacterForm.jsx
import React from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import charMale from '../../assets/char_male.png';
import charFemale from '../../assets/char_female.png';
import { UI_TEXT } from '../../constants/i18nMap'; // [新增]

const CharacterForm = ({ formData, setFormData, onSubmit, onResetRoom }) => {
  const previewSrc = formData.gender === 'female' ? charFemale : charMale;

  return (
    <div
      className="w-[38%] nes-container is-dark with-title flex flex-col"
      style={{ backgroundColor: '#3a253f', borderColor: '#f9a8d4' }}
    >
      <p className="title flex items-center gap-2">
        <UserPlus size={12} />
        <span>{UI_TEXT.CHAR_SETUP_TITLE}</span> {/* [修改] */}
      </p>

      <form onSubmit={onSubmit} className="flex-1 flex flex-col pt-2 pr-1">
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

        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="nes-field">
            <label className="text-[10px] text-pink-100">{UI_TEXT.LBL_NAME}</label> {/* [修改] */}
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="nes-input w-full text-black bg-white"
              placeholder={UI_TEXT.PH_NAME} // [修改]
            />
          </div>

          <div className="flex gap-3 items-end"> 
            <div className="nes-field flex-1">
              <label className="text-[10px] text-pink-100 mb-1 block">{UI_TEXT.LBL_GENDER}</label> {/* [修改] */}
              <div className="flex gap-2">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`flex-1 h-8 text-[10px] border-2 transition-all flex items-center justify-center ${
                      formData.gender === g
                        ? 'bg-pink-500 text-black border-pink-200 font-bold' 
                        : 'bg-slate-800 text-pink-400 border-pink-900 hover:border-pink-500' 
                    }`}
                  >
                    {g === 'male' ? UI_TEXT.GENDER_M : UI_TEXT.GENDER_F} {/* [修改] */}
                  </button>
                ))}
              </div>
            </div>

            <div className="nes-field w-auto min-w-[80px]">
              <label className="text-[10px] text-pink-100 whitespace-nowrap mb-1 block">{UI_TEXT.LBL_COLOR}</label> {/* [修改] */}
              <div className="relative">
                <input
                  type="color"
                  value={formData.avatar_color}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar_color: e.target.value })
                  }
                  className="w-full h-8 border border-pink-300 rounded bg-black cursor-pointer p-0"
                />
              </div>
            </div>
          </div>

          <div className="nes-field">
            <label className="text-[10px] text-pink-100">
              {UI_TEXT.LBL_PERSONALITY} {/* [修改] */}
            </label>
            <textarea
              value={formData.personality}
              onChange={(e) =>
                setFormData({ ...formData, personality: e.target.value })
              }
              className="nes-textarea w-full h-32 text-[14px] text-black bg-white"
              placeholder={UI_TEXT.PH_PERSONALITY} // [修改]
            />
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-pink-300 flex justify-between items-center gap-2">
          <button
            type="submit"
            className="nes-btn flex-1"
            style={{ backgroundColor: '#f472b6', color: 'black' }}
          >
            {UI_TEXT.BTN_ADD_CHAR} {/* [修改] */}
          </button>
          <button
            type="button"
            onClick={onResetRoom}
            className="px-3 py-2 text-pink-700 font-bold border-2 border-pink-900/30 hover:bg-pink-500 hover:border-pink-500 hover:text-white transition-all rounded-sm flex items-center justify-center"
          >
            <Trash2 size={14} className="mr-1" />
            <span className="text-xs">{UI_TEXT.BTN_RESET}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharacterForm;