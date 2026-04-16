import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Attachment } from '../types';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  isOpen: boolean;
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function AttachmentPreview({ attachments, isOpen, onClose }: AttachmentPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!isOpen || attachments.length === 0) return null;

  const current = attachments[selectedIndex];

  const handleDownload = (att: Attachment) => {
    if (att.type === 'image' && att.data) {
      const a = document.createElement('a');
      a.href = att.data;
      a.download = att.name;
      a.click();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* 遮罩 */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* 主面板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-[90vw] max-h-[85vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 预览区域 */}
            <div className="bg-gray-50 flex items-center justify-center" style={{ minHeight: '300px' }}>
              {current.type === 'image' && current.data ? (
                <img
                  src={current.data}
                  alt={current.name}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              ) : (
                <div className="py-16 text-center">
                  <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-gray-500 text-sm font-medium">{current.name}</p>
                  <p className="text-gray-400 text-xs mt-1">{formatFileSize(current.size)}</p>
                  <p className="text-gray-400 text-xs mt-2">文件预览不可用</p>
                </div>
              )}
            </div>

            {/* 底部信息栏 */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[300px]">{current.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(current.size)}</p>
                </div>
                {current.type === 'image' && current.data && (
                  <button
                    onClick={() => handleDownload(current)}
                    className="glass-btn glass-btn-primary px-4 py-1.5 text-xs"
                  >
                    下载图片
                  </button>
                )}
              </div>

              {/* 缩略图列表 */}
              {attachments.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {attachments.map((att, i) => (
                    <button
                      key={att.id}
                      onClick={() => setSelectedIndex(i)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        i === selectedIndex ? 'border-indigo-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {att.type === 'image' && att.data ? (
                        <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
