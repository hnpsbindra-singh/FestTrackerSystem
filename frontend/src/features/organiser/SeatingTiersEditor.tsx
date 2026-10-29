import React from 'react';
import { SeatingTypeRequest } from '@/types/event.types';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Plus, Trash2, Armchair } from 'lucide-react';

export interface SeatingTiersEditorProps {
  tiers: SeatingTypeRequest[];
  onChange: (tiers: SeatingTypeRequest[]) => void;
  disabled?: boolean;
}

export const SeatingTiersEditor: React.FC<SeatingTiersEditorProps> = ({
  tiers,
  onChange,
  disabled = false,
}) => {
  const handleAddTier = () => {
    onChange([
      ...tiers,
      {
        name: tiers.length === 0 ? 'General Entry' : `Tier ${tiers.length + 1}`,
        price: 0,
        totalSeats: 100,
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length <= 1) return;
    onChange(tiers.filter((_, i) => i !== index));
  };

  const handleUpdateTier = (
    index: number,
    field: keyof SeatingTypeRequest,
    value: string | number
  ) => {
    const updated = [...tiers];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
          Ticket & Seating Categories <span className="text-rose-500">*</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddTier}
          disabled={disabled}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Tier
        </Button>
      </div>

      <div className="space-y-2.5">
        {tiers.map((tier, index) => (
          <div
            key={index}
            className="p-3.5 rounded-xl border border-zinc-200 bg-white grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
          >
            <div className="sm:col-span-5">
              <Input
                label={index === 0 ? 'Category Name' : undefined}
                placeholder="e.g. VIP, General, Early Bird"
                value={tier.name}
                onChange={(e) => handleUpdateTier(index, 'name', e.target.value)}
                leftAddon={<Armchair className="w-3.5 h-3.5" />}
                required
                disabled={disabled}
              />
            </div>

            <div className="sm:col-span-3">
              <Input
                label={index === 0 ? 'Price (₹)' : undefined}
                type="number"
                min={0}
                placeholder="0 for free"
                value={tier.price}
                onChange={(e) => handleUpdateTier(index, 'price', Number(e.target.value))}
                required
                disabled={disabled}
              />
            </div>

            <div className="sm:col-span-3">
              <Input
                label={index === 0 ? 'Total Capacity' : undefined}
                type="number"
                min={1}
                placeholder="100"
                value={tier.totalSeats}
                onChange={(e) => handleUpdateTier(index, 'totalSeats', Math.max(1, parseInt(e.target.value, 10) || 1))}
                required
                disabled={disabled}
              />
            </div>

            <div className={`sm:col-span-1 flex justify-end ${index === 0 ? 'sm:mt-5' : ''}`}>
              <button
                type="button"
                onClick={() => handleRemoveTier(index)}
                disabled={disabled || tiers.length <= 1}
                className="text-zinc-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-zinc-400 p-1.5 rounded transition-colors"
                title="Remove tier"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
