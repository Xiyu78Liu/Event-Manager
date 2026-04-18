export function Footer({ onOpenGuide, onOpenChangelog }: { onOpenGuide: () => void; onOpenChangelog: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 py-20">
      <div className="max-w-lg w-full text-center space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Manager</h2>
          <p className="text-gray-400 text-sm">任务管理系统 v1.4.1</p>
        </div>

        <div className="space-y-3 text-sm text-gray-500">
          <p>Copyright &copy; 2026 <span className="text-gray-700 font-medium">Xiyu</span></p>
          <p>
            意见邮箱：
            <a href="mailto:xiyu.liu@student.keystoneacademy.cn" className="text-indigo-500 hover:text-indigo-600 ml-1">
              xiyu.liu@student.keystoneacademy.cn
            </a>
          </p>
        </div>

        <div className="flex gap-6 justify-center">
          <button
            onClick={onOpenGuide}
            className="text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors"
          >
            使用说明
          </button>
          <button
            onClick={onOpenChangelog}
            className="text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors"
          >
            更新日志
          </button>
        </div>
      </div>
    </div>
  );
}
