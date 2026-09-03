import React from 'react';

export type SurfaceTone = 'default' | 'muted' | 'success' | 'warning' | 'info' | 'danger';

const toneClasses: Record<SurfaceTone, string> = {
  default: 'bg-white text-stone-900 border-stone-200',
  muted: 'bg-stone-50 text-stone-700 border-stone-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  info: 'bg-sky-50 text-sky-800 border-sky-200',
  danger: 'bg-rose-50 text-rose-900 border-rose-200',
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8 sm:p-10',
};

export const Card: React.FC<CardProps> = ({
  tone = 'default',
  padding = 'md',
  className = '',
  ...props
}) => (
  <div
    className={`rounded-2xl border shadow-xs ${toneClasses[tone]} ${paddingClasses[padding]} ${className}`}
    {...props}
  />
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: SurfaceTone;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'muted', className = '', ...props }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-black ${toneClasses[tone]} ${className}`}
    {...props}
  />
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}

const buttonVariantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800',
  secondary: 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50',
  danger: 'bg-rose-900 text-white border-rose-900 hover:bg-rose-800',
  ghost: 'bg-transparent text-stone-700 border-transparent hover:bg-stone-100',
};

const buttonSizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-xs rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled,
  ...props
}) => (
  <button
    type={type}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-1.5 border font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${buttonVariantClasses[variant]} ${buttonSizeClasses[size]} ${className}`}
    {...props}
  />
);

export interface SectionTitleProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, description, actions, className = '' }) => (
  <div className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${className}`}>
    <div className="min-w-0">
      <h2 className="text-lg font-bold tracking-tight text-stone-900">{title}</h2>
      {description && <p className="mt-1 text-sm leading-relaxed text-stone-500">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
