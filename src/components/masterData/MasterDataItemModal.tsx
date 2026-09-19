/**
 * Didar Gold Platform - Master Data Item Form Modal
 * Create or edit dynamic lookup options
 */

import React, { useState, useEffect } from 'react';
import { MasterDataCategory, MasterDataItem } from '../../types/masterData.js';
import { X, Save, AlertCircle } from 'lucide-react';

interface MasterDataItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: MasterDataCategory;
  editingItem: MasterDataItem | null;
  onSave: (itemData: Partial<MasterDataItem>) => Promise<void>;
}

export const MasterDataItemModal: React.FC<MasterDataItemModalProps> = ({
  isOpen,
  onClose,
  category,
  editingItem,
  onSave
}) => {
  const [labelFa, setLabelFa] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [key, setKey] = useState('');
  const [code, setCode] = useState('');
  const [descriptionFa, setDescriptionFa] = useState('');
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [badgeColor, setBadgeColor] = useState('#C8A951');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setLabelFa(editingItem.labelFa || '');
      setLabelEn(editingItem.labelEn || '');
      setKey(editingItem.key || '');
      setCode(editingItem.code || '');
      setDescriptionFa(editingItem.descriptionFa || '');
      setOrderIndex(editingItem.orderIndex || 1);
      setBadgeColor(editingItem.badgeColor || '#C8A951');
      setIsActive(editingItem.isActive !== false);
    } else {
      setLabelFa('');
      setLabelEn('');
      setKey('');
      setCode('');
      setDescriptionFa('');
      setOrderIndex((category.itemCount || 0) + 1);
      setBadgeColor('#C8A951');
      setIsActive(true);
    }
    setError(null);
  }, [editingItem, category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelFa.trim()) {
      setError('عنوان فارسی گزینه الزامی است.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Auto-generate key if empty
      const generatedKey = key.trim() || labelFa.trim().toLowerCase().replace(/\s+/g, '_').slice(0, 30);

      await onSave({
        categoryId: category.id,
        labelFa: labelFa.trim(),
        labelEn: labelEn.trim() || undefined,
        key: generatedKey,
        code: code.trim() || undefined,
        descriptionFa: descriptionFa.trim() || undefined,
        orderIndex: Number(orderIndex) || 1,
        badgeColor,
        isActive
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره‌سازی گزینه');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorPresets = [
    '#C8A951', // Gold
    '#00D1FF', // Cyan
    '#3DD68C', // Green
    '#FFB800', // Amber
    '#9254DE', // Purple
    '#FF4D4F', // Red
    '#13C2C2', // Teal
    '#FA8C16', // Orange
    '#8C8C8C'  // Gray
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#191924] border border-[#2B2B3C] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#14141E] border-b border-[#2B2B3C] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{editingItem ? 'ویرایش گزینه داده پایه' : 'افزودن گزینه جدید به منوی کشویی'}</span>
            </h3>
            <p className="text-xs text-[#A0A0B5] mt-0.5">
              دسته: <strong className="text-[#C8A951]">{category.nameFa}</strong> ({category.nameEn})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#88889D] hover:text-white p-1 rounded-lg hover:bg-[#252536] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-[#FF4D4F]/10 border border-[#FF4D4F]/30 text-[#FF4D4F] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Persian Label */}
          <div>
            <label className="block text-xs font-semibold text-[#D2D2E0] mb-1.5">
              عنوان فارسی (متن نمایش در منوهای کشویی) <span className="text-[#FF4D4F]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثلاً: مأمور خریدار و سفارش‌گیری"
              value={labelFa}
              onChange={e => setLabelFa(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-sm text-white focus:outline-none focus:border-[#C8A951] focus:ring-1 focus:ring-[#C8A951]"
            />
          </div>

          {/* English Label & Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#D2D2E0] mb-1.5">
                عنوان انگلیسی / بین‌المللی (اختیاری)
              </label>
              <input
                type="text"
                placeholder="e.g. Buyer Representative"
                value={labelEn}
                onChange={e => setLabelEn(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D2D2E0] mb-1.5">
                کلید سیستمی ماشینی (Key)
              </label>
              <input
                type="text"
                placeholder="e.g. buyer_rep"
                value={key}
                disabled={editingItem?.isSystem}
                onChange={e => setKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs font-mono text-[#C8A951] focus:outline-none focus:border-[#C8A951] disabled:opacity-60"
                dir="ltr"
              />
              {editingItem?.isSystem && (
                <p className="text-[10px] text-[#A0A0B5] mt-1">کلید اقلام پیش‌فرض سیستمی ثابت است.</p>
              )}
            </div>
          </div>

          {/* Code & Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#D2D2E0] mb-1.5">
                کد شناسایی استاندارد / اختصاری
              </label>
              <input
                type="text"
                placeholder="مثلاً: ROL-BUY"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D2D2E0] mb-1.5">
                اولویت ترتیب نمایش (۱ بالاترین)
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={orderIndex}
                onChange={e => setOrderIndex(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#D2D2E0] mb-1.5">
              توضیحات تکمیلی و راهنمای کاربری
            </label>
            <textarea
              rows={2}
              placeholder="توضیح دهید این گزینه در چه شرایطی باید انتخاب شود..."
              value={descriptionFa}
              onChange={e => setDescriptionFa(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951] resize-none"
            />
          </div>

          {/* Color & Active State */}
          <div className="p-3.5 bg-[#14141E] rounded-xl border border-[#2B2B3C] flex items-center justify-between gap-4 flex-wrap">
            <div>
              <label className="block text-[11px] font-semibold text-[#A0A0B5] mb-1.5">
                رنگ تگ و نشان شاخص
              </label>
              <div className="flex items-center gap-1.5">
                {colorPresets.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBadgeColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform ${badgeColor === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-white font-medium cursor-pointer" htmlFor="active-toggle">
                وضعیت گزینه:
              </label>
              <button
                type="button"
                id="active-toggle"
                onClick={() => setIsActive(!isActive)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                {isActive ? 'فعال (در دسترس)' : 'غیرفعال (مخفی)'}
              </button>
            </div>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 bg-gradient-to-r from-[#C8A951] to-[#AA8B38] hover:from-[#D4B763] hover:to-[#B69640] text-[#141416] rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'در حال ثبت...' : editingItem ? 'ذخیره تغییرات' : 'افزودن به دراپ‌دان'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
