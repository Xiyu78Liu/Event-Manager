import { FullScreenDialog } from './FullScreenDialog';

interface ChangelogDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogDialog({ isOpen, onClose }: ChangelogDialogProps) {
  return (
    <FullScreenDialog isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">更新日志</h2>
      <p className="text-xs text-[var(--text-muted)] mb-8">总开发时间：18.5 hr</p>

      <div className="space-y-10 text-sm text-[var(--text-secondary)]">
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[rgba(var(--color-primary-rgb),0.15)] text-[var(--text-primary)] text-xs font-semibold">v2.1.1</span>
            <span className="text-[var(--text-muted)] text-xs">当前版本</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-25 16:00</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>修复：TimePicker 使用 Portal 渲染，解决 backdrop-filter 导致的图层错误</li>
            <li>修复：TimePicker 移除 scroll 事件监听，解决下拉面板移动过快的 bug</li>
            <li>修复：深色模式下所有组件文字显示不清（全面替换硬编码颜色为 CSS 变量）</li>
            <li>修复：日期板块展开面板去除 AnimatePresence 动画，任务标签始终可见</li>
            <li>修复：颜色选择圆圈黑色边框缝隙（border 改为 ring）</li>
            <li>修复：颜色选择圆圈白色勾居中</li>
            <li>修复：日期状态指示条镜像（弧度朝左）</li>
            <li>优化：设置面板宽度扩展，"跟随系统"文字不再换行</li>
            <li>优化：使用说明增加视觉层次（加粗、边框线、提示框）</li>
            <li>优化：主题系统扩展至 5 色（conic-gradient 展示）</li>
            <li>优化：更新日志 v2.0.0 补充具体时间</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v2.1.0</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-25 14:30</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>修复：日期板块选择日期后任务消失的问题</li>
            <li>修复：设置面板深色模式下文字显示不清</li>
            <li>修复：附件、备注、预估时间显示设置不生效</li>
            <li>修复：切换板块后新建任务窗口不自动收起</li>
            <li>修复：优先任务和已完成任务的左侧指示条样式优化</li>
            <li>修复：播放标题动画时设置按钮位移</li>
            <li>修复：优先任务列表不显示预估时间</li>
            <li>修复：子任务预估时间改为时间选择器</li>
            <li>新增：完成所有子任务后提示是否完成父任务</li>
            <li>新增：优先任务列表显示子任务完成进度</li>
            <li>新增：记录板块支持修改和创建任务反思</li>
            <li>新增：日记模块支持富文本编辑（加粗、斜体、下划线、字号、颜色、高亮）</li>
            <li>新增：11 种新预设主题色 + 6 种纯色选项</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v2.0.0</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-25 12:00</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>新增：分解板块 — 将大任务拆分为子任务，支持子任务的完整功能</li>
            <li>新增：日期板块 — 月视图日历，显示所有任务和子任务的截止日期</li>
            <li>新增：记录板块 — 查看完成总结 + 日记/感受记录</li>
            <li>新增：设置面板 — 深色/浅色模式、预设主题色、自定义颜色、显示设置</li>
            <li>新增：AI 规划支持用户自定义需求描述</li>
            <li>新增：CSS 变量系统，支持动态主题切换</li>
            <li>优化：动画性能优化，尊重用户减少动画偏好</li>
            <li>修复：规划板块"新建任务"按钮现在正确跳转到任务标签页</li>
            <li>修复：所有板块的添加任务按钮统一跳转到任务标签页</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.4.1</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-18 16:45</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>新增：附件预览弹窗（点击附件图标全屏查看图片、下载图片）</li>
            <li>新增：Dockerfile + nginx 配置，支持 Zeabur 等平台部署</li>
            <li>新增：MIT 开源协议</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.4.0</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-16 00:30</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>新增：附件功能（FileUploader 组件，支持拖拽上传、图片预览、文件列表）</li>
            <li>新增：优先任务面板备注悬浮提示（tooltip 显示备注全文）</li>
            <li>新增：优先任务面板附件悬浮提示（图片缩略图 + 文件名列表）</li>
            <li>新增：已完成任务列表同样支持备注和附件 tooltip</li>
            <li>优化：Attachment 类型从 string 改为结构化对象数组（id/name/type/size/data）</li>
            <li>优化：旧数据自动兼容（string → 空 Attachment[]）</li>
            <li>修复：EM 标题动画播放中鼠标移动导致动画僵住（添加播放完成冷却）</li>
            <li>修复：tooltip 被父容器 overflow-hidden 裁剪（移除多余 overflow 限制）</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.3.1</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-15 21:00</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>优化：手动添加任务时显示剩余时间（如：数学作业（2小时 剩余1小时30分））</li>
            <li>新增：鼠标悬浮标题「Event Manager」时重新播放解码动画</li>
            <li>修复：AI 规划板块勾选任务时，点击一个会影响其他任务的勾选状态</li>
            <li>优化：板块切换动画改为方向感知（向右切换则内容向右滑，反之向左）</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.3.0</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-15 20:30</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>新增：任务批量管理（多选 + 批量删除 + 批量移动分组）</li>
            <li>新增：删除分组时可选择保留任务（分组变为空）或一起删除</li>
            <li>新增：AI 规划板块支持分组筛选和手动选择任务</li>
            <li>新增：批量删除确认对话框（显示选中任务数量）</li>
            <li>修复：切换分组后优先任务面板仍显示其他分组的任务</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.2.0</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-15 19:30</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>新增：顶部标签页切换（「任务」和「规划」两个大板块）</li>
            <li>新增：规划板块 - 手动模式（DIY）：手动添加任务和休息时间块，支持设置开始时间和时长</li>
            <li>新增：规划板块 - AI 模式：接入 DeepSeek 大模型，智能生成学习/工作计划（自动排班+休息+建议）</li>
            <li>新增：API Key 设置（规划面板内配置，存储在 localStorage）</li>
            <li>新增：AI 生成加载动画和错误提示</li>
            <li>修复：优先任务面板支持编辑和删除任务（悬停显示按钮）</li>
            <li>修复：规划板块切换模式时未关闭的添加表单</li>
            <li>新增：TimePicker 时:分滚轮选择器（替代预估时间的文本输入）</li>
            <li>新增：快捷时长按钮（15分钟、30分钟、1小时、2小时、3小时）</li>
            <li>优化：标签页切换动画（左右滑动过渡）</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.1.3</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-15 18:44</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>修复：底部页面过渡动画触发逻辑（改为累积 deltaY + swipe 计数 + 冷却期机制）</li>
            <li>修复：hint 提示不消失问题（新增 5 秒自动消失 + 向上滑返回）</li>
            <li>修复：hint 后一次滑动就触发过渡的问题（每次 swipe 后 400ms 冷却，需两次 swipe）</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.1.2</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-15 18:06</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>修复：使用说明/更新日志全屏对话框关闭按钮无法点击（fixed 定位在 overflow 容器中失效，改为 flex 布局分离按钮和滚动区域）</li>
            <li>修复：页面过渡动画背景切换时机不对（改为覆盖层完全覆盖后切换内容，收窄时揭示新背景）</li>
            <li>新增：底部页面「← 返回」按钮，可从 footer 返回主页面</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.1.1</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-15 17:58</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>修复：返回按钮图层错误（z-index 从 55 降到 40，使其在覆盖层下方）</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.1.0</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-15 17:51</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>新增：任务预估时间、备注字段</li>
            <li>新增：完成任务总结功能（3道反思题：是否超出预期、难度评分、自由评论）</li>
            <li>新增：已完成任务搜索（支持按名称/创建时间/完成时间搜索）</li>
            <li>新增：底部页面过渡动画（连续滑动触发，两阶段覆盖+收窄揭示）</li>
            <li>新增：底部内容区域（版权、意见邮箱、使用说明、更新日志）</li>
            <li>新增：使用说明全屏窗口</li>
            <li>新增：更新日志全屏窗口</li>
            <li>优化：自动记录任务创建时间和完成时间</li>
            <li>优化：「全部任务」改为「已完成的任务」，只显示已完成任务</li>
            <li>修复：React 无限循环错误（useEffect 同步 completedTasks 导致，改用 useMemo）</li>
            <li>修复：TaskForm 的 attachments/notes 字段冲突（统一使用 notes 字段）</li>
            <li>修复：TaskList 和 PriorityPanel 空状态中的 emoji 替换为 SVG 图标</li>
            <li>修复：PageTransition phase2 期间 footer 内容揭示失败</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.0.4</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-15 10:48</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>新增：标题文字解码动画效果（EM → 乱码跳动 → Event Manager，使用 requestAnimationFrame 实现）</li>
            <li>优化：标题字体加大（text-4xl），使用等宽字体（font-mono）</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.0.3</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-14 19:02</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>修复：删除确认对话框背景虚化延迟问题（遮罩层去掉 opacity 动画，瞬间显示）</li>
            <li>优化：确认对话框动画加速（0.15s 线性过渡，去掉 spring 弹性）</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.0.2</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-14 18:31</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>优化：优先级选择器去掉 emoji，改用彩色圆点 + 文字的专业样式</li>
            <li>优化：表单标题和按钮去掉所有 emoji</li>
            <li>优化：顶部导航栏毛玻璃模糊效果减弱（blur 24px → 8px）</li>
            <li>新增：分组管理功能（动态添加/删除分组，持久化到 localStorage）</li>
            <li>优化：分组数据从硬编码改为动态管理</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-filter)] text-[var(--text-secondary)] text-xs font-semibold">v1.0.1</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-14 18:25</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>重构：背景从紫色渐变改为白色 (#f8f9fc)</li>
            <li>重构：任务分类筛选从左侧侧边栏移到顶部圆角胶囊按钮</li>
            <li>重构：侧边栏移除，统计概览独立为右侧面板</li>
            <li>优化：所有毛玻璃样式适配白色背景（半透明白色 + 浅灰边框）</li>
            <li>优化：文字颜色从白色系改为灰色系</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[rgba(245,158,11,0.15)] text-[var(--text-primary)] text-xs font-semibold">β1.0.0</span>
            <span className="text-[var(--text-muted)] text-xs">Beta 初始版本</span>
            <span className="text-[var(--text-faint)] text-xs ml-auto">2026-04-14 18:11</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>初始版本发布</li>
            <li>任务 CRUD（创建/编辑/删除/完成）</li>
            <li>分组管理（家里/工作两个默认分组）</li>
            <li>优先任务面板（按优先级+截止日期排序）</li>
            <li>截止日期视觉提示（过期红色、临近橙色、正常绿色）</li>
            <li>毛玻璃 UI 风格（Glassmorphism）</li>
            <li>localStorage 数据持久化</li>
            <li>framer-motion 动画（列表增删改过渡、对话框弹入弹出）</li>
            <li>侧边栏导航 + 统计概览 + 进度条</li>
          </ul>
        </section>
      </div>
    </FullScreenDialog>
  );
}
