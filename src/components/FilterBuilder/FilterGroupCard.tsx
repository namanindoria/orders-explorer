import React from 'react';
import type { FilterGroup, FilterCondition } from '../../types/order';
import { FilterConditionRow } from './FilterConditionRow';
import { Plus, Trash2 } from 'lucide-react';

interface FilterGroupCardProps {
  group: FilterGroup;
  groupIndex: number;
  totalGroups: number;
  onUpdateGroup: (updatedGroup: FilterGroup) => void;
  onRemoveGroup: () => void;
}

export const FilterGroupCard: React.FC<FilterGroupCardProps> = ({
  group,
  groupIndex,
  onUpdateGroup,
  onRemoveGroup,
}) => {
  const handleAddCondition = () => {
    const newCondition: FilterCondition = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      field: 'status',
      operator: 'is_one_of',
      value: ['shipped'],
    };

    onUpdateGroup({
      ...group,
      conditions: [...group.conditions, newCondition],
    });
  };

  const handleUpdateCondition = (index: number, updated: FilterCondition) => {
    const updatedConditions = [...group.conditions];
    updatedConditions[index] = updated;
    onUpdateGroup({ ...group, conditions: updatedConditions });
  };

  const handleRemoveCondition = (index: number) => {
    const updatedConditions = group.conditions.filter((_, i) => i !== index);
    onUpdateGroup({ ...group, conditions: updatedConditions });
  };

  return (
    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 shadow-sm space-y-2.5">
      {/* Group Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">
            Group {groupIndex + 1}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
            OR conditions inside
          </span>
        </div>

        <button
          type="button"
          onClick={onRemoveGroup}
          title="Delete Group"
          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 px-2 py-0.5 rounded hover:bg-rose-950/40 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Remove Group</span>
        </button>
      </div>

      {/* Condition Rows */}
      <div className="space-y-2">
        {group.conditions.map((condition, condIdx) => (
          <div key={condition.id} className="relative">
            {condIdx > 0 && (
              <div className="my-1 flex items-center gap-2 pl-4">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                  OR
                </span>
                <div className="h-[1px] flex-1 bg-slate-800/80" />
              </div>
            )}
            <FilterConditionRow
              condition={condition}
              onChange={(updated) => handleUpdateCondition(condIdx, updated)}
              onRemove={() => handleRemoveCondition(condIdx)}
            />
          </div>
        ))}
      </div>

      {/* Add Condition inside Group Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleAddCondition}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-400 bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/50 rounded transition-colors active:scale-98"
        >
          <Plus className="w-3 h-3" />
          <span>Add Condition (OR)</span>
        </button>
      </div>
    </div>
  );
};
