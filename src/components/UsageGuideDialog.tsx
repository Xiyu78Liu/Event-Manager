import { FullScreenDialog } from './FullScreenDialog';

interface UsageGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsageGuideDialog({ isOpen, onClose }: UsageGuideDialogProps) {
  return (
    <FullScreenDialog isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">使用说明</h2>
      <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
        <section>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 pb-1 border-b border-[var(--border-default)]">基本功能</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>点击右上角 <strong className="text-[var(--text-primary)]">「新建任务」</strong> 创建任务，填写名称、分组、优先级、截止日期等信息</li>
            <li>点击任务左侧圆圈完成任务，完成后可填写反思总结</li>
            <li>点击编辑按钮修改任务，点击删除按钮移除任务</li>
          </ul>
        </section>
        <section>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 pb-1 border-b border-[var(--border-default)]">附件与备注</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>创建或编辑任务时可上传图片和文件</li>
            <li>点击任务卡片上的附件图标可预览和下载</li>
            <li>备注内容以悬浮提示显示，鼠标悬停即可查看</li>
          </ul>
        </section>
        <section>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 pb-1 border-b border-[var(--border-default)]">AI 智能规划</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>切换到 <strong className="text-[var(--text-primary)]">「规划」</strong> 标签页，选择 AI 模式</li>
            <li>在设置中填入 <strong className="text-[var(--text-primary)]">DeepSeek API Key</strong> 后即可使用</li>
            <li>可选择任务并设置开始时间，AI 自动生成排班</li>
            <li>可在输入框中描述额外需求，AI 会按照你的指示生成计划</li>
          </ul>
          <div className="mt-2 px-3 py-2 rounded-lg bg-[rgba(var(--color-primary-rgb),0.08)] border border-[rgba(var(--color-primary-rgb),0.15)]">
            <p className="text-xs text-[var(--text-muted)]">
              <strong className="text-[var(--text-secondary)]">提示：</strong>API Key 仅存储在本地浏览器中，不会上传到任何服务器
            </p>
          </div>
        </section>
        <section>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 pb-1 border-b border-[var(--border-default)]">分解板块</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>选择一个大任务，将其拆分为多个子任务</li>
            <li>子任务支持优先级、截止日期、预估时间等完整功能</li>
            <li>完成所有子任务后会提示是否完成父任务</li>
          </ul>
        </section>
        <section>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 pb-1 border-b border-[var(--border-default)]">日期板块</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>月视图日历显示所有任务和子任务的截止日期</li>
            <li>点击某天可查看当天的任务详情</li>
            <li>已完成的任务以删除线标记</li>
          </ul>
        </section>
        <section>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 pb-1 border-b border-[var(--border-default)]">记录板块</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-[var(--text-primary)]">「完成总结」</strong> 查看和编辑任务的反思记录，也可为没有写反思的任务创建反思</li>
            <li><strong className="text-[var(--text-primary)]">「日记」</strong> 记录每天的感受和想法，支持加粗、斜体、下划线、字号、颜色、高亮等格式</li>
          </ul>
        </section>
        <section>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 pb-1 border-b border-[var(--border-default)]">分组与批量操作</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>在筛选标签下方输入名称添加分组</li>
            <li>删除分组时可选保留或删除该分组下的任务</li>
            <li>点击 <strong className="text-[var(--text-primary)]">「批量管理」</strong> 进入多选模式，可批量删除或移动任务</li>
          </ul>
        </section>
        <section>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 pb-1 border-b border-[var(--border-default)]">设置</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>点击右上角齿轮图标打开设置面板</li>
            <li>支持浅色、深色、跟随系统三种主题模式</li>
            <li>提供 <strong className="text-[var(--text-primary)]">11 种预设主题色</strong> 和 <strong className="text-[var(--text-primary)]">6 种纯色</strong> 选项，也可自定义颜色</li>
            <li>可控制附件图标、备注图标、预估时间的显示</li>
            <li>支持数据导出、导入和清除</li>
          </ul>
          <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs text-red-600">
              <strong>注意：</strong>清除所有数据后不可恢复，建议先导出备份
            </p>
          </div>
        </section>
        <section>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 pb-1 border-b border-[var(--border-default)]">搜索</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>默认按任务名搜索，也可切换为按创建时间或完成时间搜索</li>
            <li>日期搜索格式：<strong className="text-[var(--text-primary)]">YYYY-MM-DD</strong></li>
          </ul>
        </section>
      </div>
    </FullScreenDialog>
  );
}
