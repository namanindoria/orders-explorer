import React from 'react';
import type { FilterCondition, FilterOperator } from '../../types/order';
import { FILTER_FIELDS } from './fieldDefinitions';
import { Trash2 } from 'lucide-react';

interface FilterConditionRowProps {
  condition: FilterCondition;
  onChange: (updated: FilterCondition) => void;
  onRemove: () => void;
}

export const FilterConditionRow: React.FC<FilterConditionRowProps> = ({
  condition,
  onChange,
  onRemove,
}) => {
  const currentFieldConfig = FILTER_FIELDS.find((f) => f.id === condition.field) || FILTER_FIELDS[0];

  const handleFieldChange = (newFieldId: string) => {
    const nextConfig = FILTER_FIELDS.find((f) => f.id === newFieldId) || FILTER_FIELDS[0];
    const defaultOp = nextConfig.operators[0].id;

    let defaultValue: FilterCondition['value'] = '';
    if (nextConfig.type === 'enum') {
      defaultValue = [];
    } else if (defaultOp === 'between') {
      defaultValue = { min: '', max: '' };
    }

    onChange({
      ...condition,
      field: newFieldId as FilterCondition['field'],
      operator: defaultOp,
      value: defaultValue,
    });
  };

  const handleOperatorChange = (newOp: FilterOperator) => {
    let nextValue = condition.value;
    if (newOp === 'between') {
      if (typeof condition.value !== 'object' || condition.value === null || Array.isArray(condition.value)) {
        nextValue = { min: '', max: '' };
      }
    } else if (typeof condition.value === 'object' && !Array.isArray(condition.value) && condition.value !== null) {
      nextValue = '';
    }

    onChange({
      ...condition,
      operator: newOp,
      value: nextValue,
    });
  };

  const renderValueInput = () => {
    const { type } = currentFieldConfig;

    if (type === 'enum') {
      const selectedValues: string[] = Array.isArray(condition.value) ? condition.value.map(String) : [];
      const options = currentFieldConfig.options || [];

      const toggleOption = (val: string) => {
        let updated: string[];
        if (selectedValues.includes(val)) {
          updated = selectedValues.filter((v) => v !== val);
        } else {
          updated = [...selectedValues, val];
        }
        onChange({ ...condition, value: updated });
      };

      return (
        <div className="flex flex-wrap gap-1.5 items-center">
          {options.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleOption(opt.value)}
                className={`px-2 py-0.5 text-xs rounded transition-all cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
          {selectedValues.length === 0 && (
            <span className="text-[11px] text-amber-400 italic">Select one or more options</span>
          )}
        </div>
      );
    }

    if (condition.operator === 'between') {
      const rangeVal = (typeof condition.value === 'object' && condition.value !== null && !Array.isArray(condition.value)
        ? condition.value
        : { min: '', max: '' }) as { min: number | string; max: number | string };

      return (
        <div className="flex items-center gap-1.5 text-xs">
          <input
            type={type === 'date' ? 'date' : 'number'}
            value={rangeVal.min}
            placeholder="Min"
            onChange={(e) =>
              onChange({
                ...condition,
                value: { ...rangeVal, min: e.target.value },
              })
            }
            className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 text-xs w-32"
          />
          <span className="text-slate-500 text-[11px]">to</span>
          <input
            type={type === 'date' ? 'date' : 'number'}
            value={rangeVal.max}
            placeholder="Max"
            onChange={(e) =>
              onChange({
                ...condition,
                value: { ...rangeVal, max: e.target.value },
              })
            }
            className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 text-xs w-32"
          />
        </div>
      );
    }

    if (type === 'date') {
      return (
        <input
          type="date"
          value={typeof condition.value === 'string' ? condition.value : ''}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-500 text-xs w-40"
        />
      );
    }

    if (type === 'number') {
      return (
        <input
          type="number"
          value={condition.value !== null && condition.value !== undefined ? String(condition.value) : ''}
          placeholder="Enter numeric value..."
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 text-xs w-36"
        />
      );
    }

    // Default: text
    return (
      <input
        type="text"
        value={typeof condition.value === 'string' ? condition.value : ''}
        placeholder="Type search text..."
        onChange={(e) => onChange({ ...condition, value: e.target.value })}
        className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 text-xs flex-1 min-w-[160px]"
      />
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-colors">
      {/* Field Selector */}
      <select
        value={condition.field}
        onChange={(e) => handleFieldChange(e.target.value)}
        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-sky-500 cursor-pointer font-medium"
      >
        {FILTER_FIELDS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Operator Selector */}
      <select
        value={condition.operator}
        onChange={(e) => handleOperatorChange(e.target.value as FilterOperator)}
        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-sky-400 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
      >
        {currentFieldConfig.operators.map((op) => (
          <option key={op.id} value={op.id}>
            {op.label}
          </option>
        ))}
      </select>

      {/* Dynamic Value Input */}
      <div className="flex-1 min-w-[200px] flex items-center">
        {renderValueInput()}
      </div>

      {/* Remove Condition */}
      <button
        type="button"
        onClick={onRemove}
        title="Remove condition"
        className="p-1.5 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
