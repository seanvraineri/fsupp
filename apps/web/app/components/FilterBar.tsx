"use client";
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";

const options = [
  { value: 'all', label: 'All' },
  { value: 'core', label: 'Core' },
  { value: 'optional', label: 'Optional' },
  { value: 'experimental', label: 'Experimental' },
];

export default function FilterBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v: string) => onChange(v || 'all')} className="inline-flex gap-2">
      {options.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          className={
            value === o.value
              ? 'px-3 py-1 rounded-lg bg-primary-from text-white text-sm font-medium'
              : 'px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm'
          }
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
} 