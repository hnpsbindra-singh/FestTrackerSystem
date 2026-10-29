import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { FestInformation } from '@/types/event.types';
import { formatDate, formatTime } from '@/utils/formatters';
import { Badge } from '@/components/common/Badge';

export interface EventCardProps {
  event: FestInformation;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="group bg-white rounded-xl border border-zinc-200/90 shadow-xs hover:border-zinc-300 hover:shadow-md transition-all duration-150 flex flex-col overflow-hidden">
      {/* Poster image or subtle pattern fallback */}
      <div className="relative aspect-16/9 w-full bg-zinc-100 overflow-hidden border-b border-zinc-100">
        {event.posterUrl && !imageError ? (
          <img
            src={event.posterUrl}
            alt={event.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-200 p-4 text-center">
            <Sparkles className="w-8 h-8 text-zinc-400 mb-1" />
            <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              {event.genre || 'College Fest'}
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {event.genre && (
            <Badge variant="neutral" size="sm" className="bg-white/95 backdrop-blur-xs font-medium">
              {event.genre}
            </Badge>
          )}
          {event.language && (
            <Badge variant="neutral" size="sm" className="bg-white/95 backdrop-blur-xs font-medium">
              {event.language}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-zinc-900 group-hover:text-brand-600 transition-colors line-clamp-1">
          {event.title}
        </h3>

        <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{formatDate(event.date)}</span>
            <span className="text-zinc-300">•</span>
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{formatTime(event.time)}</span>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1 text-zinc-600">{event.detailedAddress}</span>
          </div>
        </div>

        {/* Action */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <Link
            to={`/events/${event.id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors group-hover:border-zinc-300"
          >
            <span>Explore & Book Seats</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
};
