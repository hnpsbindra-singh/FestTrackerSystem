import React from 'react';
import { RegisterForm } from '@/features/auth/RegisterForm';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RegisterPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-brand-600 transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-zinc-900">
            MakeMyPlan
          </span>
        </Link>
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
          Create your account
        </h2>
        <p className="text-xs text-zinc-500">
          Join MakeMyPlan as an attendee student or campus event organiser
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-zinc-200/90 rounded-2xl sm:px-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};
