import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  footerContent: React.ReactNode;
}

type Phase = 'main' | 'hint' | 'phase1' | 'phase2' | 'footer';

export function PageTransition({ children, footerContent }: PageTransitionProps) {
  const [phase, setPhase] = useState<Phase>('main');
  const [contentReady, setContentReady] = useState(false);

  const phaseRef = useRef<Phase>('main');
  const accumRef = useRef(0); // hint 阶段累积的向下滚动量
  const swipeCountRef = useRef(0); // 已完成的 swipe 次数
  const cooldownRef = useRef(false);
  const reenterRef = useRef(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAtBottom = useCallback(() => {
    const st = window.scrollY || document.documentElement.scrollTop;
    const sh = document.documentElement.scrollHeight;
    const ch = document.documentElement.clientHeight;
    return sh - st - ch < 50;
  }, []);

  const goToMain = useCallback(() => {
    if (dismissTimerRef.current) { clearTimeout(dismissTimerRef.current); dismissTimerRef.current = null; }
    phaseRef.current = 'main';
    setPhase('main');
    accumRef.current = 0;
    reenterRef.current = true;
    setTimeout(() => { reenterRef.current = false; }, 500);
  }, []);

  const goToHint = useCallback(() => {
    if (phaseRef.current === 'hint') return;
    if (dismissTimerRef.current) { clearTimeout(dismissTimerRef.current); dismissTimerRef.current = null; }
    phaseRef.current = 'hint';
    setPhase('hint');
    accumRef.current = 0;
    swipeCountRef.current = 0;
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, 600);
    // 5 秒无操作自动回到 main
    dismissTimerRef.current = setTimeout(() => {
      if (phaseRef.current === 'hint') goToMain();
    }, 5000);
  }, [goToMain]);

  const triggerTransition = useCallback(() => {
    if (dismissTimerRef.current) { clearTimeout(dismissTimerRef.current); dismissTimerRef.current = null; }
    phaseRef.current = 'phase1';
    accumRef.current = 0;
    setPhase('phase1');
  }, []);

  // 单一 wheel handler，通过 ref 读取所有状态，无闭包问题
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const p = phaseRef.current;

      // 向上滑 → 离开 hint
      if (e.deltaY < 0) {
        if (p === 'hint') goToMain();
        return;
      }

      if (e.deltaY <= 0) return;

      // main → hint
      if (p === 'main') {
        if (isAtBottom() && !reenterRef.current) goToHint();
        return;
      }

      // hint → 累积滚动量，每 200 算一次 swipe，需要 2 次，两次之间有冷却
      if (p === 'hint') {
        if (cooldownRef.current) return;
        accumRef.current += e.deltaY;
        if (accumRef.current > 200) {
          accumRef.current = 0;
          swipeCountRef.current += 1;
          if (swipeCountRef.current >= 2) {
            triggerTransition();
          } else {
            // 一次 swipe 完成后，400ms 冷却防止同一滑动计两次
            cooldownRef.current = true;
            setTimeout(() => { cooldownRef.current = false; }, 400);
          }
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [isAtBottom, goToMain, goToHint, triggerTransition]);

  // 清理
  useEffect(() => {
    return () => { if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current); };
  }, []);

  const handlePhase1Complete = useCallback(() => {
    setContentReady(true);
    setPhase('phase2');
  }, []);

  const handlePhase2Complete = useCallback(() => {
    setPhase('footer');
  }, []);

  const handleBackToMain = useCallback(() => {
    setContentReady(false);
    phaseRef.current = 'main';
    setPhase('main');
  }, []);

  return (
    <div className="relative">
      <div className={contentReady ? 'hidden' : ''}>
        {children}
      </div>

      {contentReady && (
        <div>
          {footerContent}
          <div className="fixed top-5 left-5 z-40">
            <button onClick={handleBackToMain} className="glass-btn px-4 py-2 text-sm text-[var(--text-secondary)]">
              ← 返回
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {phase === 'hint' && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 h-2 z-40 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, #a78bfa, #818cf8, #6366f1, #818cf8, #a78bfa)',
              backgroundSize: '200% 100%',
              animation: 'gradientShift 3s ease-in-out infinite, hintFloat 2s ease-in-out infinite',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'phase1' && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50"
            style={{ background: 'linear-gradient(180deg, #c4b5fd, #a78bfa)' }}
            initial={{ height: 0 }}
            animate={{ height: '100vh' }}
            exit={{ height: '100vh' }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={handlePhase1Complete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'phase2' && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50"
            style={{ background: 'linear-gradient(180deg, #c4b5fd, #a78bfa)' }}
            initial={{ height: '100vh' }}
            animate={{ height: 0 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={handlePhase2Complete}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes hintFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
