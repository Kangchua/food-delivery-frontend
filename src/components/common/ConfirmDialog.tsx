import React from 'react';
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertCircle className="h-12 w-12 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-12 w-12 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-12 w-12 text-primary" />;
    }
  };

  const getConfirmButtonVariant = () => {
    return variant === 'danger' ? 'destructive' : 'default';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl sm:max-w-sm">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          {getIcon()}
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-bold text-foreground">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            className="flex-1"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
