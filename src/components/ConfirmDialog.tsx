import { AnimatePresence, motion } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen, title, message,
  confirmText = '确认', cancelText = '取消',
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            className="glass-card-solid relative z-10 p-6 max-w-sm w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
            <p className="text-[var(--text-secondary)] mb-6 text-sm">{message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={onCancel} className="glass-btn px-4 py-2 text-sm">
                {cancelText}
              </button>
              <button onClick={onConfirm} className="glass-btn glass-btn-danger px-4 py-2 text-sm">
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
