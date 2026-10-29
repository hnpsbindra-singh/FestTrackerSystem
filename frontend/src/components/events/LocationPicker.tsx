import React from 'react';
import { MapPin, Navigation, SlidersHorizontal } from 'lucide-react';
import { Coordinates, PRESET_LOCATIONS } from '@/hooks/useGeolocation';
import { Button } from '@/components/common/Button';

export interface LocationPickerProps {
  coords: Coordinates;
  onCoordsChange: (coords: Coordinates) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  onDetectLocation: () => void;
  isDetecting?: boolean;
}

const RADIUS_OPTIONS = [10, 25, 50, 100, 250, 500];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  coords,
  onCoordsChange,
  radius,
  onRadiusChange,
  onDetectLocation,
  isDetecting = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
            <MapPin className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              Discovery Region
            </h4>
            <p className="text-xs text-zinc-500">
              {coords.name || `${coords.latitude}, ${coords.longitude}`}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDetectLocation}
          isLoading={isDetecting}
          leftIcon={<Navigation className="w-3.5 h-3.5" />}
        >
          Use GPS
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
        {/* Preset Location Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            College / City Hub
          </label>
          <select
            value={coords.name || ''}
            onChange={(e) => {
              const selected = PRESET_LOCATIONS.find((loc) => loc.name === e.target.value);
              if (selected) {
                onCoordsChange(selected);
              }
            }}
            className="w-full text-xs rounded-lg border border-zinc-200 py-1.5 px-2.5 bg-zinc-50/50 text-zinc-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
          >
            {PRESET_LOCATIONS.filter((loc) => loc.name !== 'Current Location').map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Radius Selector */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Radius
            </label>
            <span className="text-xs font-medium text-zinc-900">{radius} km</span>
          </div>
          <div className="flex items-center gap-1.5">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onRadiusChange(opt)}
                className={`flex-1 py-1 text-[11px] font-medium rounded border transition-colors ${
                  radius === opt
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
