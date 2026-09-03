import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

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

const formControlClasses = 'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 shadow-xs transition placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900/10 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500';

export interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  htmlFor,
  hint,
  error,
  required = false,
  className = '',
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <label htmlFor={htmlFor} className="block text-xs font-bold text-stone-700">
      {label}{required && <span className="ml-1 text-rose-700" aria-hidden="true">*</span>}
    </label>
    {children}
    {error ? (
      <p className="text-xs font-semibold text-rose-700" role="alert">{error}</p>
    ) : hint ? (
      <p className="text-xs text-stone-500">{hint}</p>
    ) : null}
  </div>
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input: React.FC<InputProps> = ({ className = '', invalid = false, ...props }) => (
  <input
    aria-invalid={invalid || undefined}
    className={`${formControlClasses} ${invalid ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' : ''} ${className}`}
    {...props}
  />
);

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select: React.FC<SelectProps> = ({ className = '', invalid = false, ...props }) => (
  <select
    aria-invalid={invalid || undefined}
    className={`${formControlClasses} ${invalid ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' : ''} ${className}`}
    {...props}
  />
);

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ className = '', invalid = false, ...props }) => (
  <textarea
    aria-invalid={invalid || undefined}
    className={`${formControlClasses} min-h-24 resize-y ${invalid ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' : ''} ${className}`}
    {...props}
  />
);

export interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
  closeLabel?: string;
}

const modalSizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  size = 'md',
  closeLabel = 'Fechar',
}) => {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const modal = (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-stone-950/75 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl ${modalSizeClasses[size]}`}
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-stone-100 px-6 py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold tracking-tight text-stone-900">{title}</h2>
            {description && <p id={descriptionId} className="mt-1 text-sm text-stone-500">{description}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={closeLabel}>
            ×
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="shrink-0 border-t border-stone-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
