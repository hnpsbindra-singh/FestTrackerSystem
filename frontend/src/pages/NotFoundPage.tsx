import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">404</h1>
      <h2 className="text-base font-semibold text-zinc-800 mt-1">Page Not Found</h2>
      <p className="mt-2 text-xs text-zinc-500 max-w-sm">
        The fest page or link you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button variant="outline" size="sm" leftIcon={<Home className="w-3.5 h-3.5" />}>
            Home
          </Button>
        </Link>
        <Link to="/discover">
          <Button variant="primary" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
            Discover Fests
          </Button>
        </Link>
      </div>
    </div>
  );
};
