import type { Item } from '../types';
import { RARITY_LABELS, RARITY_COLORS } from '../gameLogic';

interface Props {
  items: Item[];
  onEquip: (id: string) => void;
}

export default function ItemPanel({ items, onEquip }: Props) {
  const equipped = items.filter(i => i.equipped);
  const unequipped = items.filter(i => !i.equipped);

  return (
    <div className="rounded-2xl border border-purple-900/40 bg-[#13111c] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-base">🎒 인벤토리</h3>
        <span className="text-xs text-gray-500">{items.length}개 아이템</span>
      </div>

      {equipped.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">장착 중</div>
          <div className="space-y-2">
            {equipped.map(item => (
              <ItemCard key={item.id} item={item} onEquip={onEquip} />
            ))}
          </div>
        </div>
      )}

      {unequipped.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">보관함</div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {unequipped.map(item => (
              <ItemCard key={item.id} item={item} onEquip={onEquip} />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center text-gray-600 py-8 text-sm">
          보스를 격파하여 아이템을 획득하세요
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, onEquip }: { item: Item; onEquip: (id: string) => void }) {
  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        item.equipped
          ? 'bg-purple-950/40 border-purple-800/60'
          : 'bg-gray-900/50 border-gray-800/50 hover:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium text-white">{item.name}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ color: RARITY_COLORS[item.rarity], backgroundColor: `${RARITY_COLORS[item.rarity]}22` }}
            >
              {RARITY_LABELS[item.rarity]}
            </span>
          </div>
          <div className="text-xs text-gray-500">{item.description}</div>
        </div>
        <button
          onClick={() => onEquip(item.id)}
          className={`text-xs px-3 py-1 rounded-lg transition-colors shrink-0 ${
            item.equipped
              ? 'bg-red-900/60 hover:bg-red-800 text-red-400'
              : 'bg-purple-700 hover:bg-purple-600 text-white'
          }`}
        >
          {item.equipped ? '해제' : '장착'}
        </button>
      </div>
    </div>
  );
}
