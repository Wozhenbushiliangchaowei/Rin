import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Loading from 'react-loading';
import { FlatInset, FlatTabButton } from "@rin/ui";
import { useAlert } from "./dialog";
import { useColorMode } from "../utils/darkModeUtils";
import { buildMarkdownImage, uploadImageFile } from "../utils/image-upload";
import { Markdown } from "./markdown";

// 添加音频文件类型常量
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];
const AUDIO_MIME_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 
  'audio/mp4', 'audio/aac', 'audio/flac'
];

// 音乐模态框组件
function MusicModal({ 
  isOpen, 
  onClose, 
  onInsert,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onInsert: (url: string, title: string, type: 'url' | 'upload') => void;
}) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInsert = () => {
    if (!url.trim()) return;
    onInsert(url, title || '音乐', activeTab);
    setUrl('');
    setTitle('');
    onClose();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const isAudio = AUDIO_MIME_TYPES.includes(file.type) || 
                   AUDIO_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(`.${ext}`));
    
    if (!isAudio) {
      alert(t('请上传音频文件'));
      return;
    }

    // 这里可以调用上传函数，暂时使用本地URL演示
    setUploading(true);
    
    // 实际项目中应该调用上传API
    // const result = await uploadAudioFile(file);
    // setUrl(result.url);
    
    // 临时方案：使用本地URL
    const localUrl = URL.createObjectURL(file);
    setUrl(localUrl);
    setTitle(file.name.replace(/\.[^/.]+$/, '')); // 移除扩展名
    setUploading(false);
    
    // 清空input，允许重复上传同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('插入音乐')}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="mb-4 flex space-x-2 border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'url' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('url')}
          >
            {t('URL链接')}
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'upload' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            {t('上传文件')}
          </button>
        </div>

        {activeTab === 'url' ? (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('音乐标题')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                placeholder={t('例如：周杰伦 - 晴天')}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('音乐URL')}
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                placeholder="https://example.com/song.mp3"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('支持MP3, WAV, OGG等格式')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('音乐文件')}
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-500 dark:border-gray-600"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={AUDIO_MIME_TYPES.join(',')}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                  </svg>
                  <p>{t('点击或拖拽上传音频文件')}</p>
                  <p className="text-xs">{t('支持格式：MP3, WAV, OGG, M4A')}</p>
                </div>
              </div>
            </div>
            {title && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('音乐标题')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {t('取消')}
          </button>
          <button
            onClick={handleInsert}
            disabled={!url.trim() || uploading}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {uploading ? t('上传中...') : t('插入')}
          </button>
        </div>
      </div>
    </div>
  );
}

// 检测音频文件
function isAudioFile(url: string): boolean {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  return AUDIO_EXTENSIONS.includes(extension);
}

// 生成音乐Markdown语法
function buildMarkdownMusic(url: string, title: string): string {
  // 使用HTML audio标签，支持更多自定义
  return `<audio controls src="${url}" title="${title}">\n  ${title}\n</audio>`;
}

export function MarkdownEditor({ content, setContent, placeholder = "> Write your content here...", height = "400px" }: MarkdownEditorProps) {
  const { t } = useTranslation();
  const colorMode = useColorMode();
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const isComposingRef = useRef(false);
  const [preview, setPreview] = useState<'edit' | 'preview' | 'comparison'>('edit');
  const [uploading, setUploading] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const { showAlert, AlertUI } = useAlert();

  // 插入音乐函数
  const insertMusic = (url: string, title: string, type: 'url' | 'upload') => {
    const editorInstance = editorRef.current;
    if (!editorInstance) return;
    
    const selection = editorInstance.getSelection();
    if (!selection) return;
    
    let musicMarkdown: string;
    
    if (type === 'upload') {
      // 上传的音乐使用HTML标签
      musicMarkdown = buildMarkdownMusic(url, title);
    } else {
      // URL音乐，可以根据扩展名选择语法
      if (isAudioFile(url)) {
        // 简单音频链接
        musicMarkdown = `![${title}](${url})\n\n<!-- 音频播放器 -->\n<audio controls src="${url}"></audio>`;
      } else {
        // 外部服务链接（如网易云、QQ音乐）
        musicMarkdown = `<!-- ${title} -->\n<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width="330" height="86" src="${url}"></iframe>`;
      }
    }
    
    editorInstance.executeEdits(undefined, [{
      range: selection,
      text: musicMarkdown,
    }]);
  };

  // 现有代码保持不变...
  // ... [原有的所有代码]

  // 在工具栏中添加音乐按钮
  return (
    <div className="flex flex-col gap-0 sm:gap-3">
      <FlatInset className="flex flex-wrap items-center gap-2 border-0 border-b border-black/10 rounded-none bg-transparent p-3 dark:border-white/10">
        <FlatTabButton active={preview === 'edit'} onClick={() => setPreview('edit')}> {t("edit")} </FlatTabButton>
        <FlatTabButton active={preview === 'preview'} onClick={() => setPreview('preview')}> {t("preview")} </FlatTabButton>
        <FlatTabButton active={preview === 'comparison'} onClick={() => setPreview('comparison')}> {t("comparison")} </FlatTabButton>
        <div className="flex-grow" />
        
        {/* 添加音乐按钮 */}
        <button
          type="button"
          onClick={() => setShowMusicModal(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-w px-3 py-2 text-sm t-primary transition-colors hover:border-black/20 dark:border-white/10 dark:hover:border-white/20"
        >
          <i className="ri-music-2-line" />
          <span>{t("音乐")}</span>
        </button>
        
        <UploadImageButton />
        {uploading &&
          <div className="flex flex-row items-center space-x-2">
            <Loading type="spin" color="#FC466B" height={16} width={16} />
            <span className="text-sm text-neutral-500">{t('uploading')}</span>
          </div>
        }
      </FlatInset>
      
      {/* 音乐模态框 */}
      <MusicModal
        isOpen={showMusicModal}
        onClose={() => setShowMusicModal(false)}
        onInsert={insertMusic}
      />
      
      {/* 其余部分保持不变... */}
    </div>
  );
}
