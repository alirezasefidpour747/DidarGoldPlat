/**
 * Didar Gold Platform - Master Data Category Form Modal
 * Create dynamic new taxonomies for platform domains
 */

import React, { useState } from 'react';
import { MasterDataCategory } from '../../types/masterData.js';
import { X, Plus, AlertCircle, FolderPlus } from 'lucide-react';

interface MasterDataCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: Partial<MasterDataCategory>) => Promise<void>;
}

export const MasterDataCategoryModal: React.FC<MasterDataCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [nameFa, setNameFa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [descriptionFa, setDescriptionFa] = useState('');
  const [iconName, setIconName] = useState('Folder');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) {
      setError('نام فارسی دسته الزامی است.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const generatedId = `cat_${nameFa.trim().toLowerCase().replace(/\s+/g, '_').slice(0, 20)}`;

      await onSave({
        id: generatedId,
        code: code.trim() || `CAT-${Date.now().toString().slice(-4)}`,
        nameFa: nameFa.trim(),
        nameEn: nameEn.trim() || nameFa.trim(),
        descriptionFa: descriptionFa.trim() || '',
        iconName
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت دسته‌بندی جدید');
    } finally {
      setIsSubmitting(false);
    }
  };

  const icons = ['Folder', 'ListFilter', 'Tag', 'Layers', 'Grid', 'Database', 'Sparkles', 'Shield'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#191924] border border-[#2B2B3C] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#14141E] border-b border-[#2B2B3C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C8A951]/15 text-[#C8A951] border border-[#C8A951]/30">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ایجاد دسته جدید در داده‌های پایه</h3>
              <p className="text-xs text-[#A0A0B5]">تعریف منوی کشویی جدید برای فرم‌های سازمانی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#88889D] hover:text-white p-1 rounded-lg hover:bg-[#252536] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#FF4D4F]/10 border border-[#FF4D4F]/30 text-[#FF4D4F] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#D2D2E0] mb-1.5">
              نام فارسی دسته‌بندی <span className="text-[#FF4D4F]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثلاً: انواع پلاک و مدال‌های مذهبی"
              value={nameFa}
              onChange={e => setNameFa(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-sm text-white focus:outline-none focus:border-[#C8A951]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#D2D2E0] mb-1.5">
                نام انگلیسی دسته
              </label>
              <input
                type="text"
                placeholder="e.g. Religious Medals"
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D2D2E0] mb-1.5">
                کد دسته‌بندی
              </label>
              <input
                type="text"
                placeholder="CAT-MEDAL"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D2D2E0] mb-1.5">
              توضیح مأموریت این دسته‌بندی
            </label>
            <textarea
              rows={2}
              placeholder="توضیح دهید گزینه‌های این دسته در کدام فرم‌ها کاربرد دارند..."
              value={descriptionFa}
              onChange={e => setDescriptionFa(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951] resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#252536] hover:bg-[#2F2F44] text-[#D2D2E0] rounded-xl text-xs font-semibold transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#C8A951] hover:bg-[#D4B763] text-[#141416] rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'در حال ثبت...' : 'ایجاد دسته'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
