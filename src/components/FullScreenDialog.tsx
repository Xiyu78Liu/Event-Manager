import { motion, AnimatePresence } from 'framer-motion';

interface FullScreenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function FullScreenDialog({ isOpen, onClose, children }: FullScreenDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] bg-[var(--bg-card-solid)] backdrop-blur-lg flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 关闭按钮 - 固定在顶部，不随内容滚动 */}
          <div className="flex-shrink-0 flex justify-end p-3 sm:p-5">
            <button
              onClick={onClose}
              className="glass-btn px-4 py-2 text-sm text-[var(--text-secondary)]"
            >
              关闭
            </button>
          </div>
          {/* 可滚动内容区域 */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
