/**
 * Didar Gold Platform - Entitlements Manager (K02)
 * Commercial gold limits, wholesale permissions, consignment lines, and freeze controls
 */

import React, { useState } from 'react';
import {
  Coins,
  Shield,
  Lock,
  Unlock,
  Building2,
  User,
  Edit,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Filter,
  Save,
  X
} from 'lucide-react';
import { CommercialEntitlements, TrustTier, TrustTierConfig } from '../../types/k02.js';

interface EntitlementsManagerProps {
  entitlements: Record<string, CommercialEntitlements>;
  tierConfigs: Record<TrustTier, TrustTierConfig>;
  onUpdateEntitlements: (targetId: string, updates: Partial<CommercialEntitlements>) => Promise<void>;
}

export const EntitlementsManager: React.FC<EntitlementsManagerProps> = ({
  entitlements,
  tierConfigs,
  onUpdateEntitlements
}) => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);

  // Edit state
  const [editDailyLimit, setEditDailyLimit] = useState<number>(0);
  const [editCreditLimit, setEditCreditLimit] = useState<number>(0);
  const [editWholesale, setEditWholesale] = useState<boolean>(false);
  const [editCustomOrders, setEditCustomOrders] = useState<boolean>(false);
  const [editConsignment, setEditConsignment] = useState<boolean>(false);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Lock modal state
  const [lockingEntity, setLockingEntity] = useState<CommercialEntitlements | null>(null);
  const [lockReason, setLockReason] = useState<string>('بررسی ریسک و استعلام تعهدات بانکی');

  const list: CommercialEntitlements[] = Object.values(entitlements);

  const filtered = list.filter(item => {
    const matchesSearch =
      item.targetName.toLowerCase().includes(search.toLowerCase()) ||
      item.targetId.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'all' || item.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleStartEdit = (item: CommercialEntitlements) => {
    setEditingTargetId(item.targetId);
    setEditDailyLimit(item.dailyGoldLimitGrams);
    setEditCreditLimit(item.creditAllowanceGrams);
    setEditWholesale(item.canAccessWholesaleMarket);
    setEditCustomOrders(item.canPlaceCustomOrders);
    setEditConsignment(item.canAccessConsignment);
    setEditDiscount(item.dealerMarginDiscountPercent);
    setSaveError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingTargetId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onUpdateEntitlements(editingTargetId, {
        dailyGoldLimitGrams: Number(editDailyLimit),
        creditAllowanceGrams: Number(editCreditLimit),
        canAccessWholesaleMarket: editWholesale,
        canPlaceCustomOrders: editCustomOrders,
        canAccessConsignment: editConsignment,
        dealerMarginDiscountPercent: Number(editDiscount)
      });
      setEditingTargetId(null);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'خطا در ذخیره حدود تجاری');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLock = async (item: CommercialEntitlements) => {
    if (!item.isCommercialLocked) {
      setLockingEntity(item);
    } else {
      // Unlock directly
      try {
        await onUpdateEntitlements(item.targetId, {
          isCommercialLocked: false
        });
      } catch (err) {
        console.error('Error unlocking:', err);
      }
    }
  };

  const handleConfirmLock = async () => {
    if (!lockingEntity) return;
    try {
      await onUpdateEntitlements(lockingEntity.targetId, {
        isCommercialLocked: true,
        lockReason
      });
      setLockingEntity(null);
    } catch (err) {
      console.error('Error locking:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div className="bg-[#171720] border border-[#2B2B38] rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام واحد صنفی، شرکت یا شناسه..."
            className="w-full bg-[#121218] border border-[#2B2B38] rounded-lg pr-9 pl-3 py-2 text-xs text-white placeholder-[#686878] focus:outline-none focus:border-[#C8A951]"
          />
          <Search className="w-4 h-4 text-[#686878] absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-[#121218] border border-[#2B2B38] rounded-lg px-3 py-2 text-xs text-[#D1D1DE] focus:outline-none focus:border-[#C8A951] cursor-pointer"
          >
            <option value="all">همه سطوح تجاری</option>
            <option value="tier_3_commercial">سطح ۳: شریک تجاری ممتاز</option>
            <option value="tier_2_business">سطح ۲: واحد صنفی معتبر</option>
            <option value="tier_1_identity">سطح ۱: هویت فردی</option>
            <option value="tier_0_guest">سطح ۰: مهمان</option>
          </select>
        </div>
      </div>

      {saveError && (
        <div className="p-3 bg-[#3D1414] border border-[#8C2E2E] rounded-xl text-[#F48282] text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#171722] border border-[#292938] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#121218] text-[#8C8C9C] border-b border-[#242430]">
                <th className="py-3.5 px-4 font-semibold">واحد تجاری / متقاضی</th>
                <th className="py-3.5 px-4 font-semibold">سطح اعتماد مصوب</th>
                <th className="py-3.5 px-4 font-semibold">سقف خرید روزانه (گرم)</th>
                <th className="py-3.5 px-4 font-semibold">خط اعتبار معوق (K16)</th>
                <th className="py-3.5 px-4 font-semibold">دسترسی‌ها</th>
                <th className="py-3.5 px-4 font-semibold">تخفیف همکار</th>
                <th className="py-3.5 px-4 font-semibold">وضعیت معامله</th>
                <th className="py-3.5 px-4 font-semibold text-center">مدیریت حدود</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20202C]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#7A7A88]">
                    هیچ رکوردی یافت نشد.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isEditing = editingTargetId === item.targetId;
                  const cfg = tierConfigs[item.tier] || tierConfigs.tier_0_guest;

                  return (
                    <tr key={item.targetId} className="hover:bg-[#1B1B26] transition-colors">
                      {/* Entity name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#242432] flex items-center justify-center text-[#C8A951]">
                            {item.targetType === 'organization' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{item.targetName}</span>
                            <span className="text-[11px] text-[#7A7A88] font-mono">{item.targetId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Tier badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold"
                          style={{
                            backgroundColor: `${cfg.badgeColor}22`,
                            color: cfg.badgeColor,
                            border: `1px solid ${cfg.badgeColor}44`
                          }}
                        >
                          {cfg.titleFa.split(':')[0]}
                        </span>
                      </td>

                      {/* Daily Limit */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editDailyLimit}
                            onChange={(e) => setEditDailyLimit(Number(e.target.value))}
                            className="w-24 bg-[#101016] border border-[#C8A951] rounded px-2 py-1 text-xs text-white"
                          />
                        ) : (
                          <span>{item.dailyGoldLimitGrams.toLocaleString('fa-IR')} گرم</span>
                        )}
                      </td>

                      {/* Credit Allowance */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#E5C365]">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editCreditLimit}
                            onChange={(e) => setEditCreditLimit(Number(e.target.value))}
                            className="w-24 bg-[#101016] border border-[#C8A951] rounded px-2 py-1 text-xs text-white"
                          />
                        ) : (
                          <span>{item.creditAllowanceGrams.toLocaleString('fa-IR')} گرم</span>
                        )}
                      </td>

                      {/* Permissions */}
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <div className="space-y-1 text-[11px]">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editWholesale}
                                onChange={(e) => setEditWholesale(e.target.checked)}
                                className="accent-[#C8A951]"
                              />
                              <span>بنکداری</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editCustomOrders}
                                onChange={(e) => setEditCustomOrders(e.target.checked)}
                                className="accent-[#C8A951]"
                              />
                              <span>سفارش ساخت</span>
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.canAccessWholesaleMarket && (
                              <span className="px-1.5 py-0.5 rounded bg-[#16291C] text-[#3DD68C] text-[10px] font-bold border border-[#274630]">
                                بنکداری
                              </span>
                            )}
                            {item.canPlaceCustomOrders && (
                              <span className="px-1.5 py-0.5 rounded bg-[#292215] text-[#E5C365] text-[10px] font-bold border border-[#483B20]">
                                سفارش ساخت
                              </span>
                            )}
                            {item.canAccessConsignment && (
                              <span className="px-1.5 py-0.5 rounded bg-[#1F1F2E] text-[#93C5FD] text-[10px] font-bold border border-[#303046]">
                                بار امانی
                              </span>
                            )}
                            {!item.canAccessWholesaleMarket && !item.canPlaceCustomOrders && (
                              <span className="text-[11px] text-[#7A7A88]">فقط سفارش خرد</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Discount % */}
                      <td className="py-3.5 px-4 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editDiscount}
                            onChange={(e) => setEditDiscount(Number(e.target.value))}
                            className="w-16 bg-[#101016] border border-[#C8A951] rounded px-2 py-1 text-xs text-white"
                          />
                        ) : (
                          <span>{item.dealerMarginDiscountPercent > 0 ? `${item.dealerMarginDiscountPercent}٪` : '-'}</span>
                        )}
                      </td>

                      {/* Status / Lock */}
                      <td className="py-3.5 px-4">
                        {item.isCommercialLocked ? (
                          <button
                            onClick={() => handleToggleLock(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#381818] text-[#F87171] border border-[#5E2424] hover:bg-[#4E1E1E] cursor-pointer"
                            title={item.lockReason}
                          >
                            <Lock className="w-3 h-3" />
                            <span>قفل تجاری</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleLock(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#14331C] text-[#3DD68C] border border-[#235832] hover:border-[#C8A951] cursor-pointer"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>فعال و آزاد</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className="p-1.5 bg-[#C8A951] hover:bg-[#D8BA63] text-[#141416] rounded-lg cursor-pointer"
                              title="ذخیره تغییرات"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingTargetId(null)}
                              className="p-1.5 bg-[#252532] hover:bg-[#343444] text-[#A0A0B0] rounded-lg cursor-pointer"
                              title="انصراف"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="px-2.5 py-1.5 bg-[#222230] hover:bg-[#2F2F40] text-[#E0E0EC] rounded-lg text-xs font-medium flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#C8A951]" />
                            <span>ویرایش حدود</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commercial Lock Modal */}
      {lockingEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#181822] border border-[#442222] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#F87171]">
              <div className="w-10 h-10 rounded-xl bg-[#3D1414] border border-[#8C2E2E] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">قفل موقت دسترسی تجاری (Commercial Freeze)</h3>
                <span className="text-xs text-[#9E9EA8]">{lockingEntity.targetName}</span>
              </div>
            </div>

            <p className="text-xs text-[#CBCBD8] leading-relaxed">
              با فعال‌سازی این قفل، دسترسی به ثبت سفارش خرید طلا، برداشت از خط اعتباری و معاملات عمده برای این موجودیت مسدود می‌گردد. حساب پایه شخص/سازمان همچنان حفظ خواهد شد.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#B2B2C2] mb-1.5">دلیل مسدودسازی دسترسی تجاری:</label>
              <textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                rows={3}
                placeholder="مثال: تاخیر در تسویه فاکتور بنکداری، استعلام انتظامی..."
                className="w-full bg-[#101016] border border-[#2B2B38] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#F87171]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setLockingEntity(null)}
                className="px-4 py-2 text-xs font-medium text-[#A0A0B0] hover:text-white hover:bg-[#252532] rounded-lg cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmLock}
                className="px-5 py-2 text-xs font-bold text-white bg-[#DC2626] hover:bg-[#EF4444] rounded-lg shadow-md shadow-red-500/20 cursor-pointer"
              >
                اعمال قفل تجاری
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
