import React from 'react';
import { Badge, Card, SurfaceTone } from './DesignSystem';

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  category?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'info';
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const badgeTone: Record<NonNullable<AdminPageHeaderProps['badgeVariant']>, SurfaceTone> = {
  default: 'muted',
  success: 'success',
  warning: 'warning',
  info: 'info',
};

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  category,
  badge,
  badgeVariant = 'default',
  actions,
  children,
}) => {
  return (
    <Card padding="md" className="mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          {category && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              <span>{category}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
            {badge !== undefined && <Badge tone={badgeTone[badgeVariant]}>{badge}</Badge>}
          </div>
          {description && <p className="max-w-3xl text-sm leading-relaxed text-stone-500">{description}</p>}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
      </div>

      {children && <div className="mt-4 border-t border-stone-100 pt-4">{children}</div>}
    </Card>
  );
};
