import { FullScreenDialog } from './FullScreenDialog';

interface UsageGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsageGuideDialog({ isOpen, onClose }: UsageGuideDialogProps) {
  return (
    <FullScreenDialog isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">使用说明</h2>

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-2">基本功能</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>点击右上角「+ 新建任务」创建任务</li>
            <li>填写任务名称、选择分组和优先级、设置截止日期</li>
            <li>可填写预估时间和附件/备注信息</li>
            <li>点击任务左侧圆圈完成任务，完成后会弹出总结窗口</li>
            <li>点击编辑按钮修改任务，点击删除按钮移除任务</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-2">分组管理</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>在筛选标签下方输入新分组名称，点击「+ 添加分组」</li>
            <li>点击分组名称后的「×」删除分组（该分组下的任务也会被删除）</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-2">搜索已完成任务</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>默认按「任务名」搜索，输入关键词即可过滤</li>
            <li>点击「创建时间」或「完成时间」切换为日期搜索</li>
            <li>日期搜索格式：<code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600">YYYY-MM-DD</code>，如 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600">2026-04-15</code></li>
            <li>三种搜索模式互斥，同一时间只能选择一种</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-2">优先任务面板</h3>
          <p>优先任务面板显示所有未完成任务，按优先级（高→中→低）和截止日期排序，帮助你聚焦最重要的工作。</p>
        </section>

        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-2">截止日期提示</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="text-red-500 font-medium">红色</span>：已过期（截止日期已过）</li>
            <li><span className="text-amber-500 font-medium">橙色</span>：即将到期（3天内）</li>
            <li><span className="text-emerald-500 font-medium">绿色</span>：正常</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-2">使用建议</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>每天开始工作前，先查看优先任务面板，规划当天的工作</li>
            <li>合理使用分组功能，将工作和生活分开管理</li>
            <li>完成任务后花一分钟做一下总结，帮助回顾和改进</li>
            <li>定期查看已完成的任务，回顾自己的进步</li>
          </ul>
        </section>
      </div>
    </FullScreenDialog>
  );
}
