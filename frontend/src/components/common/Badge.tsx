import React from 'react';
import { PaymentStatus } from '@/types/booking.types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variants = {
    default: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    neutral: 'bg-zinc-50 text-zinc-600 border-zinc-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border-sky-200/80',
  };

  const sizes = {
    sm: 'text-[11px] font-medium px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-wide uppercase ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  switch (status) {
    case 'PAYMENT_SUBMITTED':
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Confirmed
        </Badge>
      );
    case 'PAYMENT_PENDING':
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Payment Pending
        </Badge>
      );
    case 'PAYMENT_REJECTED':
      return (
        <Badge variant="danger">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Declined
        </Badge>
      );
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};
