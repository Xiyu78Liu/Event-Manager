import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Attachment } from '../types';

interface FileUploaderProps {
  value: Attachment[];
  onChange: (files: Attachment[]) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];

export function FileUploader({ value, onChange }: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: FileList | File[]) => {
    const newAttachments: Attachment[] = [...value];
    const fileArray = Array.from(files);

    fileArray.forEach(file => {
      // 限制单文件 5MB
      if (file.size > 5 * 1024 * 1024) return;

      const isImage = IMAGE_TYPES.includes(file.type);

      if (isImage) {
        const reader = new FileReader();
        reader.onload = () => {
          const attachment: Attachment = {
            id: uuidv4(),
            name: file.name,
            type: 'image',
            size: file.size,
            data: reader.result as string,
          };
          onChange([...newAttachments, attachment]);
        };
        reader.readAsDataURL(file);
      } else {
        const attachment: Attachment = {
          id: uuidv4(),
          name: file.name,
          type: 'file',
          size: file.size,
          data: '',
        };
        newAttachments.push(attachment);
      }
    });

    // 非图片文件立即更新
    if (fileArray.some(f => !IMAGE_TYPES.includes(f.type))) {
      onChange(newAttachments);
    }
  }, [value, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleRemove = (id: string) => {
    onChange(value.filter(a => a.id !== id));
  };

  return (
    <div>
      <label className="text-gray-400 text-xs mb-1.5 block">附件</label>

      {/* 已上传文件列表 */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map(att => (
            <div
              key={att.id}
              className="group/att relative flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5"
            >
              {att.type === 'image' && att.data ? (
                <img
                  src={att.data}
                  alt={att.name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              )}
              <span className="text-xs text-gray-600 max-w-[100px] truncate">{att.name}</span>
              <span className="text-xs text-gray-400">{formatFileSize(att.size)}</span>
              <button
                type="button"
                onClick={() => handleRemove(att.id)}
                className="opacity-0 group-hover/att:opacity-100 text-gray-300 hover:text-red-500 transition-all ml-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 拖拽区域 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <svg className="w-6 h-6 mx-auto mb-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
        <p className="text-xs text-gray-400">
          拖拽文件到此处或 <span className="text-indigo-500">点击上传</span>
        </p>
        <p className="text-xs text-gray-300 mt-0.5">支持图片、PDF、文档等（单个不超过 5MB）</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => {
          if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}
