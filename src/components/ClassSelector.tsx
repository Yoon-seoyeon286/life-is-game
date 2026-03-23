import type { CharacterClass } from '../types';
import { CLASS_DEFS } from '../gameLogic';

interface Props {
  selected: CharacterClass;
  onChange: (c: CharacterClass) => void;
}

const CLASSES: CharacterClass[] = ['warrior', 'mage', 'rogue', 'ranger'];

export default function ClassSelector({ selected, onChange }: Props) {
  return (
    <div>
      <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">클래스 선택</label>
      <div className="grid grid-cols-2 gap-2">
        {CLASSES.map(c => {
          const def = CLASS_DEFS[c];
          const isSelected = selected === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-900/30'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{def.icon}</span>
                <span className="text-sm font-bold text-white">{def.label}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{def.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
