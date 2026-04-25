import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TaskSummary } from '../types';

interface TaskSummaryDialogProps {
  isOpen: boolean;
  onConfirm: (summary: TaskSummary) => void;
  onSkip: () => void;
}

export function TaskSummaryDialog({ isOpen, onConfirm, onSkip }: TaskSummaryDialogProps) {
  const [showQuestions, setShowQuestions] = useState(false);
  const [exceeded, setExceeded] = useState<boolean | null>(null);
  const [difficulty, setDifficulty] = useState(3);
  const [comment, setComment] = useState('');

  const handleSave = () => {
    if (exceeded === null) return;
    onConfirm({ exceeded, difficulty, comment });
  };

  const handleClose = () => {
    setShowQuestions(false);
    setExceeded(null);
    setDifficulty(3);
    setComment('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onSkip} />
          <motion.div
            className="glass-card-solid relative z-10 p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <AnimatePresence mode="wait">
              {!showQuestions ? (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">你要不要做一下总结？</h3>
                  <p className="text-[var(--text-muted)] text-sm mb-6">花一分钟回顾一下这个任务</p>
                  <div className="flex gap-3 justify-end">
                    <button onClick={onSkip} className="glass-btn px-4 py-2 text-sm">
                      跳过
                    </button>
                    <button onClick={() => setShowQuestions(true)} className="glass-btn glass-btn-primary px-4 py-2 text-sm">
                      开始总结
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="questions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">任务总结</h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">这个任务有没有超出你的预期？</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExceeded(true)}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                            exceeded === true
                              ? 'border-red-400 bg-red-50 text-red-600'
                              : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-input)]'
                          }`}
                        >
                          是的，超出了
                        </button>
                        <button
                          onClick={() => setExceeded(false)}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                            exceeded === false
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                              : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-input)]'
                          }`}
                        >
                          没有，符合预期
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">难度评分</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            onClick={() => setDifficulty(n)}
                            className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                              n <= difficulty
                                ? 'bg-amber-400 text-white'
                                : 'bg-[var(--bg-filter)] text-[var(--text-faint)] hover:bg-[var(--bg-filter-hover)]'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">有什么想说的？</p>
                      <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="写下你的想法..."
                        className="glass-input w-full px-4 py-3 text-sm resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-5">
                    <button onClick={handleClose} className="glass-btn px-4 py-2 text-sm">
                      返回
                    </button>
                    <button onClick={handleSave} className="glass-btn glass-btn-primary px-4 py-2 text-sm">
                      保存总结
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
