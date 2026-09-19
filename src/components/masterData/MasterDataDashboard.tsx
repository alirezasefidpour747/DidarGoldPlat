/**
 * Didar Gold Platform - Master Data Management (MDM) Dashboard
 * Centralized dynamic control center for all system dropdowns, taxonomies, and lookups
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  MasterDataCategory,
  MasterDataItem,
  MasterDataPayload,
  MasterDataCategoryId
} from '../../types/masterData.js';
import { api } from '../../lib/api.js';
import { MasterDataItemModal } from './MasterDataItemModal.js';
import { MasterDataCategoryModal } from './MasterDataCategoryModal.js';
import {
  Database,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Shield,
  Briefcase,
  MapPin,
  Gem,
  CreditCard,
  UserCheck,
  Receipt,
  FolderPlus,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Info,
  Check,
  AlertTriangle
} from 'lucide-react';

interface MasterDataDashboardProps {
  onBackToDomain?: (domainId: string) => void;
}

export const MasterDataDashboard: React.FC<MasterDataDashboardProps> = ({ onBackToDomain }) => {
  const [data, setData] = useState<MasterDataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Selected Category
  const [selectedCategoryId, setSelectedCategoryId] = useState<MasterDataCategoryId>('visit_reasons');

  // Search & Filter within items
  const [itemSearch, setItemSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Dropdown simulator selected value
  const [simulatorSelectedKey, setSimulatorSelectedKey] = useState<string>('');

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMasterData();
      setData(res);
      if (res?.categories?.length > 0 && !res.categories.some(c => c.id === selectedCategoryId)) {
        setSelectedCategoryId(res.categories[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری داده‌های پایه');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedCategory = useMemo(() => {
    return data?.categories?.find(c => c.id === selectedCategoryId) || null;
  }, [data?.categories, selectedCategoryId]);

  const categoryItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items
      .filter(i => i.categoryId === selectedCategoryId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [data?.items, selectedCategoryId]);

  const filteredItems = useMemo(() => {
    return categoryItems.filter(item => {
      const matchSearch =
        item.labelFa.toLowerCase().includes(itemSearch.toLowerCase()) ||
        (item.labelEn && item.labelEn.toLowerCase().includes(itemSearch.toLowerCase())) ||
        (item.code && item.code.toLowerCase().includes(itemSearch.toLowerCase())) ||
        item.key.toLowerCase().includes(itemSearch.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.isActive) ||
        (statusFilter === 'inactive' && !item.isActive);

      return matchSearch && matchStatus;
    });
  }, [categoryItems, itemSearch, statusFilter]);

  // Handler: Save Item
  const handleSaveItem = async (itemData: Partial<MasterDataItem>) => {
    try {
      if (editingItem) {
        await api.updateMasterItem(editingItem.id, itemData);
        showNotification('success', 'گزینه داده پایه با موفقیت به‌روزرسانی شد.');
      } else {
        await api.createMasterItem(itemData);
        showNotification('success', 'گزینه جدید با موفقیت به منوی کشویی افزوده شد.');
      }
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در ثبت اطلاعات');
      throw err;
    }
  };

  // Handler: Toggle Active
  const handleToggleItemActive = async (item: MasterDataItem) => {
    try {
      const updated = await api.toggleMasterItemActive(item.id, !item.isActive);
      showNotification(
        'success',
        updated.isActive
          ? `گزینه «${item.labelFa}» فعال شد و در دراپ‌دان‌ها در دسترس قرار گرفت.`
          : `گزینه «${item.labelFa}» غیرفعال و از فرم‌های جدید مخفی شد.`
      );
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در تغییر وضعیت');
    }
  };

  // Handler: Delete Item
  const handleDeleteItem = async (item: MasterDataItem) => {
    if (item.isSystem) {
      showNotification('error', 'آیتم‌های پیش‌فرض سیستمی قابل حذف نیستند؛ لطفاً آن را غیرفعال کنید.');
      return;
    }

    if (!window.confirm(`آیا از حذف دائم گزینه «${item.labelFa}» از سامانه مطمئن هستید؟`)) {
      return;
    }

    try {
      await api.deleteMasterItem(item.id);
      showNotification('success', `گزینه «${item.labelFa}» حذف گردید.`);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در حذف آیتم');
    }
  };

  // Handler: Reorder Item
  const handleMoveOrder = async (item: MasterDataItem, direction: 'up' | 'down') => {
    const currentIndex = categoryItems.findIndex(i => i.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categoryItems.length) return;

    const newItems = [...categoryItems];
    const temp = newItems[currentIndex];
    newItems[currentIndex] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const orderedIds = newItems.map(i => i.id);

    try {
      await api.reorderMasterItems(selectedCategoryId, orderedIds);
      await loadData();
    } catch (err: any) {
      showNotification('error', 'خطا در جابه‌جایی ترتیب نمایش');
    }
  };

  // Handler: Save Category
  const handleSaveCategory = async (catData: Partial<MasterDataCategory>) => {
    try {
      const created = await api.createMasterCategory(catData);
      showNotification('success', `دسته‌بندی «${created.nameFa}» با موفقیت ایجاد گردید.`);
      await loadData();
      setSelectedCategoryId(created.id);
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در ایجاد دسته');
      throw err;
    }
  };

  // Category Icon Resolver
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'UserCheck': return <UserCheck className="w-4 h-4" />;
      case 'XCircle': return <XCircle className="w-4 h-4" />;
      case 'Receipt': return <Receipt className="w-4 h-4" />;
      case 'ShieldAlert': return <Shield className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'MapPin': return <MapPin className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Gem': return <Gem className="w-4 h-4" />;
      case 'CreditCard': return <CreditCard className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  // Overall Statistics
  const stats = useMemo(() => {
    if (!data) return { totalCats: 0, totalItems: 0, activeItems: 0, systemItems: 0 };
    return {
      totalCats: data.categories?.length || 0,
      totalItems: data.items?.length || 0,
      activeItems: (data.items || []).filter(i => i.isActive).length,
      systemItems: (data.items || []).filter(i => i.isSystem).length
    };
  }, [data]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-lg border transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs opacity-75 hover:opacity-100">بستن</button>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#171722] via-[#1A1A28] to-[#14141D] border border-[#2B2B3C] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8A951]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E5C365] via-[#C8A951] to-[#8C6D23] flex items-center justify-center text-[#141416] shadow-lg shadow-[#C8A951]/20 font-bold border border-[#F4DC98]/40">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    مدیریت واژه‌نامه‌های مرجع و داده‌های پایه (Master Data & Reference Dictionaries)
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30">
                    واژه‌نامه‌های پایه
                  </span>
                </div>
                <p className="text-xs text-[#A0A0B5] mt-1">
                  مدیریت متمرکز جداول دلایل، عیارها، شرایط تسویه و پارامترهای پایه‌ای که در نرم‌افزار فرم تعریف مستقل ندارند (دامنه‌های مستقل نظیر مأموران، خوشه‌ها، قلمروها و گالری‌ها مستقیماً در ماژول‌های عملیاتی مربوطه اداره می‌شوند).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3.5 py-2 bg-[#252536] hover:bg-[#2F2F44] text-[#EDEDED] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-[#3A3A50]"
            >
              <FolderPlus className="w-4 h-4 text-[#C8A951]" />
              <span>تعریف دسته جدید</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 bg-[#20202E] hover:bg-[#28283C] text-[#C8A951] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-[#C8A951]/30"
              title="بارگذاری مجدد داده‌ها"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>تازه‌سازی</span>
            </button>

            {onBackToDomain && (
              <button
                onClick={() => onBackToDomain('K12')}
                className="px-4 py-2 bg-gradient-to-r from-[#C8A951] to-[#AA8B38] hover:from-[#D4B763] hover:to-[#B69640] text-[#141416] rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>بازگشت به دامنه‌ها (K12)</span>
              </button>
            )}
          </div>
        </div>

        {/* Top KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#2B2B3C]">
          <div className="bg-[#14141F]/80 p-3 rounded-xl border border-[#262638]">
            <span className="text-[11px] text-[#88889D] block">دسته‌بندی‌های منو</span>
            <span className="text-lg font-bold text-white mt-0.5 block font-mono">{stats.totalCats} دسته</span>
          </div>

          <div className="bg-[#14141F]/80 p-3 rounded-xl border border-[#262638]">
            <span className="text-[11px] text-[#88889D] block">کل گزینه‌های تعریف‌شده</span>
            <span className="text-lg font-bold text-[#C8A951] mt-0.5 block font-mono">{stats.totalItems} آیتم</span>
          </div>

          <div className="bg-[#14141F]/80 p-3 rounded-xl border border-[#262638]">
            <span className="text-[11px] text-[#88889D] block">گزینه‌های فعال در فرم‌ها</span>
            <span className="text-lg font-bold text-[#3DD68C] mt-0.5 block font-mono">{stats.activeItems} فعال</span>
          </div>

          <div className="bg-[#14141F]/80 p-3 rounded-xl border border-[#262638]">
            <span className="text-[11px] text-[#88889D] block">اقلام پایه سیستمی</span>
            <span className="text-lg font-bold text-[#00D1FF] mt-0.5 block font-mono">{stats.systemItems} سیستمی</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Categories List + Items Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Categories Navigation */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#161622] border border-[#28283C] rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C8A951]" />
                <span>دسته‌بندی‌ها و جداول پایه</span>
              </h2>
              <span className="text-[11px] font-mono text-[#88889D]">
                {data?.categories?.length || 0} مورد
              </span>
            </div>

            {/* Categories List */}
            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
              {data?.categories?.map(cat => {
                const isSelected = cat.id === selectedCategoryId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setItemSearch('');
                      setStatusFilter('all');
                    }}
                    className={`w-full text-right p-3 rounded-xl transition-all flex items-center justify-between group border ${
                      isSelected
                        ? 'bg-[#252536] border-[#C8A951] text-white shadow-md shadow-[#C8A951]/10'
                        : 'bg-[#191926] border-[#252538] text-[#B5B5C2] hover:bg-[#202030] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isSelected ? 'bg-[#C8A951] text-[#141416]' : 'bg-[#232334] text-[#A0A0B5] group-hover:text-[#C8A951]'
                      }`}>
                        {getCategoryIcon(cat.iconName)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs truncate">{cat.nameFa}</div>
                        <div className="text-[10px] text-[#88889D] truncate font-mono mt-0.5">{cat.nameEn}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 mr-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isSelected
                          ? 'bg-[#C8A951]/20 text-[#C8A951] border border-[#C8A951]/40'
                          : 'bg-[#252536] text-[#88889D]'
                      }`}>
                        {cat.itemCount || 0}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dropdown Live Preview Simulator */}
          <div className="bg-[#161622] border border-[#28283C] rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-white text-xs font-bold">
              <Eye className="w-4 h-4 text-[#3DD68C]" />
              <span>پیش‌نمایش زنده دراپ‌دان در فرم‌ها</span>
            </div>
            <p className="text-[11px] text-[#88889D]">
              این پیش‌نمایش دقیقاً نشان می‌دهد گزینه‌های دسته «{selectedCategory?.nameFa}» با تغییرات شما در فرم‌های سیستم چگونه رندر می‌شوند:
            </p>

            <div className="p-3 bg-[#12121A] rounded-xl border border-[#2B2B3C] space-y-2">
              <label className="block text-[11px] font-semibold text-[#C8A951]">
                انتخاب از منوی کشویی:
              </label>
              <select
                value={simulatorSelectedKey}
                onChange={e => setSimulatorSelectedKey(e.target.value)}
                className="w-full py-2 px-3 bg-[#191926] border border-[#3A3A50] rounded-lg text-xs text-white focus:outline-none focus:border-[#C8A951]"
              >
                <option value="">-- لطفاً یک گزینه را انتخاب کنید --</option>
                {categoryItems
                  .filter(i => i.isActive)
                  .map(item => (
                    <option key={item.id} value={item.key}>
                      {item.labelFa} {item.code ? `[${item.code}]` : ''}
                    </option>
                  ))}
              </select>

              {simulatorSelectedKey && (
                <div className="p-2 bg-[#1A1A26] rounded-lg border border-[#32324A] text-[11px] space-y-1 mt-2">
                  <div className="text-white font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#3DD68C]" />
                    <span>گزینه انتخابی:</span>
                  </div>
                  <div className="text-[#A0A0B5]">
                    {categoryItems.find(i => i.key === simulatorSelectedKey)?.descriptionFa || 'فاقد توضیح تکمیلی'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Area: Items Table and Controls */}
        <div className="lg:col-span-8 space-y-4">
          {selectedCategory && (
            <div className="bg-[#161622] border border-[#28283C] rounded-2xl p-5 shadow-lg space-y-5">
              {/* Category Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#28283C]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedCategory.nameFa}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#20202E] text-[#A0A0B5] border border-[#2E2E40]">
                      {selectedCategory.code}
                    </span>
                    {selectedCategory.isSystem && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        سیستمی
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A0A0B5] mt-1">{selectedCategory.descriptionFa}</p>
                </div>

                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsItemModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[#C8A951] to-[#AA8B38] hover:from-[#D4B763] hover:to-[#B69640] text-[#141416] rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن گزینه جدید به این دسته</span>
                </button>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#88889D] absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="جستجو در گزینه‌ها، کد و کلید..."
                    value={itemSearch}
                    onChange={e => setItemSearch(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 bg-[#12121A] border border-[#28283C] rounded-xl text-xs text-white placeholder-[#88889D] focus:outline-none focus:border-[#C8A951]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs text-[#88889D] flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>فیلتر:</span>
                  </span>
                  {(['all', 'active', 'inactive'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                        statusFilter === st
                          ? 'bg-[#C8A951] text-[#141416] font-bold'
                          : 'bg-[#1E1E2C] text-[#A0A0B5] hover:text-white'
                      }`}
                    >
                      {st === 'all' ? 'همه' : st === 'active' ? 'فقط فعال' : 'غیرفعال'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List / Table */}
              <div className="space-y-2.5">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-[#28283C] rounded-xl text-[#88889D] space-y-2">
                    <Database className="w-8 h-8 mx-auto text-[#444455]" />
                    <p className="text-xs">هیچ گزینه‌ای مطابق با جستجو یا فیلتر یافت نشد.</p>
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        item.isActive
                          ? 'bg-[#191926] border-[#2A2A3D] hover:border-[#C8A951]/40'
                          : 'bg-[#14141E]/70 border-[#222230] opacity-75'
                      }`}
                    >
                      {/* Left: Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="w-2.5 h-10 rounded-full shrink-0 mt-0.5"
                          style={{ backgroundColor: item.badgeColor || '#C8A951' }}
                        />

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-white">{item.labelFa}</h4>
                            {item.code && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#20202E] text-[#C8A951] border border-[#3A3A50]">
                                {item.code}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-[#88889D]">
                              key: {item.key}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${
                              item.isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}>
                              {item.isActive ? 'فعال' : 'غیرفعال'}
                            </span>
                          </div>

                          {item.labelEn && (
                            <p className="text-[10px] text-[#88889D] font-mono" dir="ltr">
                              {item.labelEn}
                            </p>
                          )}

                          {item.descriptionFa && (
                            <p className="text-[11px] text-[#A0A0B5] line-clamp-1">
                              {item.descriptionFa}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {/* Order Buttons */}
                        <div className="flex items-center bg-[#12121A] rounded-lg border border-[#28283C] p-0.5">
                          <button
                            onClick={() => handleMoveOrder(item, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded text-[#88889D] hover:text-white hover:bg-[#252536] disabled:opacity-30"
                            title="انتقال به بالا"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono px-1 text-[#C8A951]">
                            {item.orderIndex}
                          </span>
                          <button
                            onClick={() => handleMoveOrder(item, 'down')}
                            disabled={index === categoryItems.length - 1}
                            className="p-1 rounded text-[#88889D] hover:text-white hover:bg-[#252536] disabled:opacity-30"
                            title="انتقال به پایین"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Toggle Active Switch */}
                        <button
                          onClick={() => handleToggleItemActive(item)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 ${
                            item.isActive
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                          title={item.isActive ? 'غیرفعال‌سازی این گزینه در دراپ‌دان‌ها' : 'فعال‌سازی مجدد'}
                        >
                          {item.isActive ? 'غیرفعال' : 'فعال‌سازی'}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsItemModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#20202E] hover:bg-[#2A2A3E] text-[#D2D2E0] border border-[#333348] transition-colors"
                          title="ویرایش مشخصات"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button (Only for Non-System Items) */}
                        {!item.isSystem && (
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                            title="حذف کامل گزینه"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Informational Footer */}
              <div className="p-3.5 bg-[#14141E] rounded-xl border border-[#28283C] text-xs text-[#A0A0B5] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#C8A951] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>
                    <strong className="text-white">نکته یکپارچگی سیستمی:</strong> هر گزینه‌ای که در اینجا اضافه، ویرایش یا غیرفعال شود، به صورت بلادرنگ در تمام فرم‌ها و ماژول‌های سامانه (از جمله فرم ثبت مأمور، فرم زمان‌بندی ویزیت، ثبت دلایل عدم صدور فاکتور و قلمروها) بازتاب می‌یابد.
                  </p>
                  <p className="text-[11px] text-[#88889D]">
                    برای حفظ تاریخچه گزارش‌ها، توصیه می‌شود به جای حذف گزینه‌های قدیمی که در اسناد گذشته استفاده شده‌اند، آن‌ها را به حالت «غیرفعال» تغییر دهید.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedCategory && (
        <MasterDataItemModal
          isOpen={isItemModalOpen}
          onClose={() => {
            setIsItemModalOpen(false);
            setEditingItem(null);
          }}
          category={selectedCategory}
          editingItem={editingItem}
          onSave={handleSaveItem}
        />
      )}

      <MasterDataCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />
    </div>
  );
};
