import {gen, toId} from '../engine/calc';
import {Combobox} from './ui/Combobox';
import {TypeBadge} from './ui/primitives';

interface Props {
  index: number;
  move: string;
  crit: boolean;
  options: string[];
  onChange: (move: string) => void;
  onToggleCrit: () => void;
}

function moveType(name: string) {
  return gen.moves.get(toId(name))?.type;
}

export function MoveSlot({index, move, crit, options, onChange, onToggleCrit}: Props) {
  const data = move ? gen.moves.get(toId(move)) : undefined;
  return (
    <div className="flex items-center gap-1.5">
      <Combobox
        className="flex-1"
        value={move}
        options={options}
        onChange={onChange}
        allowEmpty
        placeholder="Add move"
        ariaLabel={`Move ${index + 1}`}
        renderOption={o => {
          const t = moveType(o);
          return t ? <TypeBadge type={t} small /> : null;
        }}
      />
      <div className="flex w-[4.5rem] shrink-0 justify-end">
        {data && <TypeBadge type={data.type} small />}
      </div>
      <button
        type="button"
        title="Critical hit"
        aria-label="Critical hit"
        aria-pressed={crit}
        disabled={!data || data.category === 'Status'}
        onClick={onToggleCrit}
        className={`grid size-7 shrink-0 place-items-center rounded-md text-xs font-bold transition disabled:opacity-30 ${
          crit ? 'bg-amber-400 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        ✦
      </button>
    </div>
  );
}
