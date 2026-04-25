export function Footer({ onOpenGuide, onOpenChangelog }: { onOpenGuide: () => void; onOpenChangelog: () => void }) {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center px-4 sm:px-6 py-20">
      <div className="max-w-lg w-full text-center space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Event Manager</h2>
          <p className="text-[var(--text-faint)] text-sm">任务管理系统 v2.1.0</p>
        </div>

        <div className="space-y-3 text-sm text-[var(--text-muted)]">
          <p>Copyright &copy; 2026 <span className="text-[var(--text-primary)] font-medium">Xiyu</span></p>
          <p>
            意见邮箱：
            <a href="mailto:xiyu.liu@student.keystoneacademy.cn" className="text-[rgba(var(--color-primary-rgb),1)] hover:text-[rgba(var(--color-primary-rgb),0.8)] ml-1">
              xiyu.liu@student.keystoneacademy.cn
            </a>
          </p>
        </div>

        <div className="flex gap-6 justify-center">
          <button
            onClick={onOpenGuide}
            className="text-[rgba(var(--color-primary-rgb),1)] hover:text-[rgba(var(--color-primary-rgb),0.8)] text-sm font-medium transition-colors"
          >
            使用说明
          </button>
          <button
            onClick={onOpenChangelog}
            className="text-[rgba(var(--color-primary-rgb),1)] hover:text-[rgba(var(--color-primary-rgb),0.8)] text-sm font-medium transition-colors"
          >
            更新日志
          </button>
        </div>
      </div>
    </div>
  );
}
