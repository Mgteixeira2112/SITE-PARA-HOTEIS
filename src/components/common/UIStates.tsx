import React from 'react';
import { AlertCircle, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { Button, Card } from './DesignSystem';

export interface EmptyStateProps {
  icon?: React.FC<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <Card padding="lg" className={`mx-auto my-6 max-w-lg text-center ${className}`}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-stone-200 bg-stone-100 text-stone-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-1 text-base font-bold text-stone-900">{title}</h3>
      <p className="mb-6 text-xs leading-relaxed text-stone-500">{description}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </Card>
  );
};

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando dados operacionais...',
  className = '',
}) => {
  return (
    <Card padding="lg" className={`flex flex-col items-center justify-center gap-3 text-center ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-stone-600" aria-hidden="true" />
      <span className="text-xs font-medium text-stone-500" role="status" aria-live="polite">
        {message}
      </span>
    </Card>
  );
};

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Erro ao processar',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <Card tone="danger" padding="md" className={className} role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
        <div className="flex-1 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider">{title}</div>
          <p className="text-xs leading-relaxed text-rose-800">{message}</p>
        </div>
        {onRetry && (
          <Button variant="danger" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tentar novamente</span>
          </Button>
        )}
      </div>
    </Card>
  );
};

export interface StatSummaryCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  isActive?: boolean;
}

export const StatSummaryCard: React.FC<StatSummaryCardProps> = ({
  label,
  value,
  hint,
  icon,
  trend,
  onClick,
  isActive,
}) => {
  const card = (
    <Card
      padding="sm"
      className={`w-full text-left transition ${
        onClick ? 'hover:border-stone-400' : ''
      } ${isActive ? 'border-stone-900 ring-2 ring-stone-900/10' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">{label}</span>
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2.5 text-2xl font-black tracking-tight text-stone-900">{value}</div>
      {(hint || trend) && (
        <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500">
          {hint && <span>{hint}</span>}
          {trend && (
            <span className={`font-bold ${trend.isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );

  if (!onClick) return card;

  return (
    <button type="button" onClick={onClick} className="block w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2">
      {card}
    </button>
  );
};
