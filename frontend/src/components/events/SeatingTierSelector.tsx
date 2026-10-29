import React from 'react';
import { SeatingDetails } from '@/types/event.types';
import { formatCurrency } from '@/utils/formatters';
import { Check, Users } from 'lucide-react';

export interface SeatingTierSelectorProps {
  tiers: SeatingDetails[];
  selectedTierId: string | null;
  onSelectTier: (tierId: string) => void;
  slots: number;
  onSlotsChange: (slots: number) => void;
  disabled?: boolean;
}

export const SeatingTierSelector: React.FC<SeatingTierSelectorProps> = ({
  tiers,
  selectedTierId,
  onSelectTier,
  slots,
  onSlotsChange,
  disabled = false,
}) => {
  const selectedTier = tiers.find((t) => t.id === selectedTierId);
  const maxSlots = selectedTier ? Math.min(selectedTier.availableSeats, 10) : 1;

  if (tiers.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-500">
        No seating information currently listed for this event.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
          Select Seating Tier
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {tiers.map((tier) => {
            const isSoldOut = tier.availableSeats <= 0;
            const isSelected = tier.id === selectedTierId;

            return (
              <button
                key={tier.id}
                type="button"
                disabled={disabled || isSoldOut}
                onClick={() => onSelectTier(tier.id)}
                className={`relative flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-zinc-900 bg-zinc-900/5 ring-1 ring-zinc-900'
                    : isSoldOut
                    ? 'border-zinc-200 bg-zinc-50 opacity-50 cursor-not-allowed'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-zinc-900">
                      {tier.name}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                      <Users className="w-3.5 h-3.5" />
                      {isSoldOut ? (
                        <span className="text-rose-600 font-medium">Sold Out</span>
                      ) : (
                        <span>{tier.availableSeats} seats remaining</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold text-zinc-900">
                    {formatCurrency(Number(tier.price))}
                  </span>
                  <span className="block text-[11px] text-zinc-400">per ticket</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedTier && selectedTier.availableSeats > 0 && (
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
          <div>
            <label className="block text-xs font-semibold text-zinc-800">
              Quantity / Number of Tickets
            </label>
            <p className="text-xs text-zinc-500">Max {maxSlots} per booking</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled || slots <= 1}
              onClick={() => onSlotsChange(Math.max(1, slots - 1))}
              className="w-8 h-8 rounded-lg border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-semibold text-zinc-900">
              {slots}
            </span>
            <button
              type="button"
              disabled={disabled || slots >= maxSlots}
              onClick={() => onSlotsChange(Math.min(maxSlots, slots + 1))}
              className="w-8 h-8 rounded-lg border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
