import React, { useState } from 'react';
import type { FilterQuery, FilterGroup } from '../../types/order';
import { FilterGroupCard } from './FilterGroupCard';
import { Plus, Filter, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface FilterBuilderProps {
  filter: FilterQuery;
  onChangeFilter: (query: FilterQuery) => void;
  onClearAll: () => void;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  filter,
  onChangeFilter,
  onClearAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddGroup = () => {
    const newGroup: FilterGroup = {
      id: `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conditions: [
        {
          id: `c_${Date.now()}_1`,
          field: 'status',
          operator: 'is_one_of',
          value: ['shipped', 'delivered'],
        },
      ],
    };

    onChangeFilter({
      groups: [...filter.groups, newGroup],
    });
  };

  const handleUpdateGroup = (index: number, updatedGroup: FilterGroup) => {
    const updated = [...filter.groups];
    updated[index] = updatedGroup;
    onChangeFilter({ groups: updated });
  };

  const handleRemoveGroup = (index: number) => {
    const updated = filter.groups.filter((_, i) => i !== index);
    onChangeFilter({ groups: updated });
  };

  const activeConditionCount = filter.groups.reduce(
    (acc, g) => acc + (g.conditions ? g.conditions.length : 0),
    0
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xs">
      {/* Bar Header / Toggle */}
      <div className="px-4 py-2.5 flex items-center justify-between bg-slate-950/60 border-b border-slate-800/80">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
        >
          <Filter className="w-3.5 h-3.5 text-sky-400" />
          <span>FILTER BUILDER</span>
          {activeConditionCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] border border-sky-500/30">
              {activeConditionCount} {activeConditionCount === 1 ? 'condition' : 'conditions'}
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />}
        </button>

        <div className="flex items-center gap-2">
          {activeConditionCount > 0 && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}

          <button
            onClick={handleAddGroup}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded transition-colors active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Group (AND)</span>
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {filter.groups.length === 0 ? (
            <div className="text-center py-5 border border-dashed border-slate-800 rounded-lg bg-slate-950/30">
              <p className="text-xs text-slate-400 mb-2">No active filter conditions.</p>
              <button
                onClick={handleAddGroup}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-medium rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create first filter group</span>
              </button>
            </div>
          ) : (
            filter.groups.map((group, groupIdx) => (
              <React.Fragment key={group.id}>
                {groupIdx > 0 && (
                  <div className="flex items-center justify-center my-2">
                    <div className="h-[1px] flex-1 bg-slate-800" />
                    <span className="mx-3 px-2.5 py-0.5 text-[10px] font-bold text-sky-400 uppercase tracking-widest bg-sky-950/80 rounded-full border border-sky-800">
                      AND
                    </span>
                    <div className="h-[1px] flex-1 bg-slate-800" />
                  </div>
                )}
                <FilterGroupCard
                  group={group}
                  groupIndex={groupIdx}
                  totalGroups={filter.groups.length}
                  onUpdateGroup={(updated) => handleUpdateGroup(groupIdx, updated)}
                  onRemoveGroup={() => handleRemoveGroup(groupIdx)}
                />
              </React.Fragment>
            ))
          )}
        </div>
      )}
    </div>
  );
};
