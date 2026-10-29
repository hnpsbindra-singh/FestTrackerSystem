import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { organiserService } from '@/services/organiser.service';
import { SeatingTypeRequest } from '@/types/event.types';
import { SeatingTiersEditor } from '@/features/organiser/SeatingTiersEditor';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { parseApiError } from '@/lib/errors';
import { useToast } from '@/hooks/useToast';
import { PRESET_LOCATIONS } from '@/hooks/useGeolocation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Upload,
  CreditCard,
  QrCode,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Basic event fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [duration, setDuration] = useState('4 Hours');
  const [ageLimit, setAgeLimit] = useState<number>(0);
  const [language, setLanguage] = useState('English & Hindi');
  const [genre, setGenre] = useState('Cultural & Music');
  const [latitude, setLatitude] = useState<number>(28.6139);
  const [longitude, setLongitude] = useState<number>(77.2090);

  // Bank & UPI details
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  // Seating tiers
  const [seatingTiers, setSeatingTiers] = useState<SeatingTypeRequest[]>([
    { name: 'General Admission', price: 199, totalSeats: 250 },
  ]);

  // Files
  const [paymentQrFile, setPaymentQrFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Payment QR image must be under 10MB.');
        return;
      }
      setError(null);
      setPaymentQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError('Event poster image must be under 15MB.');
        return;
      }
      setError(null);
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentQrFile) {
      setError('An organiser payment QR image is required so attendees can pay for tickets');
      return;
    }
    if (seatingTiers.length === 0) {
      setError('At least one seating or ticket tier must be configured');
      return;
    }

    // Format time to HH:mm:ss if user input HH:mm
    let formattedTime = time;
    if (formattedTime.split(':').length === 2) {
      formattedTime = `${formattedTime}:00`;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await organiserService.addEvent(
        {
          title: title.trim(),
          description: description.trim(),
          date,
          time: formattedTime,
          detailedAddress: detailedAddress.trim(),
          duration: duration.trim(),
          ageLimit: Number(ageLimit),
          language: language.trim(),
          genre: genre.trim(),
          latitude: Number(latitude),
          longitude: Number(longitude),
          bankAccountNumber: bankAccountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          accountHolderName: accountHolderName.trim(),
          seatingTypeRequests: seatingTiers,
        },
        paymentQrFile,
        posterFile
      );

      toast.success('Fest Published!', `"${title}" has been successfully created.`);
      navigate('/organiser/events');
    } catch (err) {
      setError(parseApiError(err, 'Failed to create event. Please check all fields.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/organiser/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Events</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Publish a New Campus Fest
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Set up event schedules, ticketing categories, and direct UPI payout details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-xl border border-zinc-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">
            1. Event Overview
          </h2>

          <Input
            label="Fest Title"
            placeholder="e.g. Symphony 2026 — Annual Cultural Fest"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe the artist lineup, competitions, schedule, and guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg border border-zinc-300 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Genre / Category"
              placeholder="e.g. Cultural & Music, Hackathon, Dance"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              required
            />

            <Input
              label="Primary Language(s)"
              placeholder="e.g. English, Hindi, Punjabi"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Duration"
              placeholder="e.g. 5 Hours, 2 Days"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />

            <Input
              label="Age Limit (0 for all ages)"
              type="number"
              min={0}
              placeholder="0"
              value={ageLimit}
              onChange={(e) => setAgeLimit(parseInt(e.target.value, 10) || 0)}
              required
            />
          </div>
        </div>

        {/* Section 2: Date, Time & Location */}
        <div className="bg-white rounded-xl border border-zinc-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">
            2. Schedule & Venue Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Event Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              leftAddon={<Calendar className="w-4 h-4" />}
              min={new Date().toISOString().split('T')[0]}
              required
            />

            <Input
              label="Start Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              leftAddon={<Clock className="w-4 h-4" />}
              required
            />
          </div>

          <Input
            label="Detailed Venue Address"
            placeholder="e.g. Main Auditorium, Campus Ground, IIT Delhi, Hauz Khas"
            value={detailedAddress}
            onChange={(e) => setDetailedAddress(e.target.value)}
            leftAddon={<MapPin className="w-4 h-4" />}
            required
          />

          {/* Preset Location Picker for Coordinates */}
          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700">
                Quick Fill Campus Coordinates
              </span>
              <span className="text-[11px] text-zinc-500">
                Used for geospatial nearby discovery
              </span>
            </div>
            <select
              onChange={(e) => {
                const found = PRESET_LOCATIONS.find((loc) => loc.name === e.target.value);
                if (found) {
                  setLatitude(found.latitude);
                  setLongitude(found.longitude);
                }
              }}
              className="w-full text-xs rounded-lg border border-zinc-300 py-1.5 px-2 bg-white"
            >
              <option value="">Select a college / metro area...</option>
              {PRESET_LOCATIONS.filter((l) => l.name !== 'Current Location').map((l) => (
                <option key={l.name} value={l.name}>
                  {l.name} ({l.latitude}, {l.longitude})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              required
            />

            <Input
              label="Longitude"
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Section 3: Seating & Ticket Tiers */}
        <div className="bg-white rounded-xl border border-zinc-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">
            3. Ticketing & Seating Capacities
          </h2>

          <SeatingTiersEditor
            tiers={seatingTiers}
            onChange={setSeatingTiers}
            disabled={isSubmitting}
          />
        </div>

        {/* Section 4: Bank Details & UPI Payment QR */}
        <div className="bg-white rounded-xl border border-zinc-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            4. Direct Payout Account & Payment QR
          </h2>

          <p className="text-xs text-zinc-500">
            Attendees pay directly to your society's bank account or UPI QR. MakeMyPlan verifies the transaction ID submitted by the user.
          </p>

          <Input
            label="Account Holder Name"
            placeholder="e.g. Cultural Council, ABC University"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Bank Account Number"
              placeholder="e.g. 50100234567890"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              required
            />

            <Input
              label="Bank IFSC Code"
              placeholder="e.g. HDFC0000123"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          {/* Payment QR Upload */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Payment QR Code Image <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
              {qrPreview ? (
                <img
                  src={qrPreview}
                  alt="QR Preview"
                  className="w-24 h-24 object-contain rounded-lg border bg-white p-1"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <QrCode className="w-8 h-8" />
                </div>
              )}
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <input
                  type="file"
                  id="qr-file-input"
                  accept="image/*"
                  onChange={handleQrChange}
                  className="hidden"
                  required
                />
                <label
                  htmlFor="qr-file-input"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 hover:bg-zinc-50 py-1.5 px-3 rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose QR Image</span>
                </label>
                <p className="text-[11px] text-zinc-500">
                  Upload your society's official UPI QR code (PNG, JPG)
                </p>
              </div>
            </div>
          </div>

          {/* Optional Event Poster */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Event Poster Image (Optional)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
              {posterPreview ? (
                <img
                  src={posterPreview}
                  alt="Poster Preview"
                  className="w-24 h-24 object-cover rounded-lg border bg-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <input
                  type="file"
                  id="poster-file-input"
                  accept="image/*"
                  onChange={handlePosterChange}
                  className="hidden"
                />
                <label
                  htmlFor="poster-file-input"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 hover:bg-zinc-50 py-1.5 px-3 rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Poster Image</span>
                </label>
                <p className="text-[11px] text-zinc-500">
                  Recommended size: 16:9 ratio, max 5MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
          <Link to="/organiser/events">
            <Button variant="ghost" size="md" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={<CheckCircle className="w-4 h-4" />}
          >
            Publish Fest
          </Button>
        </div>
      </form>
    </div>
  );
};
