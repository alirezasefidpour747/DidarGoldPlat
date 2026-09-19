/**
 * Didar Gold Platform - Kernel 13 (K13): Gold Rates, Pricing, Terms & Invoicing
 * Operational Dashboard for Treasury, Sales & Moaddian Invoicing
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  GoldSpotRate,
  PriceQuoteLock,
  MakingWageRule,
  Invoice,
  K13DataPayload,
  PriceCalculationResult,
  RateAuthorizedUser,
  RateChangeAuditLog,
  RateSecurityPolicy,
  TaxConsolidationPeriod
} from '../../types/k13.js';
import { CreditSimulationResult } from '../../types/k14.js';
import { K13RateAccessDashboard } from './K13RateAccessDashboard.js';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Lock,
  FileText,
  Calculator,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Clock,
  Send,
  Eye,
  Plus,
  Coins,
  Receipt,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Printer,
  X,
  Shield,
  Key,
  Users,
  Layers,
  Landmark,
  ArrowUpRight,
  Trash2,
  PackageCheck,
  Truck
} from 'lucide-react';

interface DraftInvoiceItem {
  id: string;
  sku: string;
  productCode: string; // کد کالا در کاتالوگ / سامانه مودیان
  titleFa: string;
  categoryKey: string;
  categoryFa: string;
  carat: number; // 750, 995, 999.9
  weightGrams: number;
  wageType: 'percentage' | 'fixed_per_gram';
  wageValue: number;
  lineDiscountType: 'percentage' | 'fixed_amount';
  itemDiscountPercent: number; // Max ±1.0% (تخفیف خطی ردیف کالا)
  lineDiscountReasonFa?: string;
}

const BUYER_TEMPLATES = [
  {
    orgId: 'org-ret-parnia-004',
    nameFa: 'گالری طلا و جواهرات پرنیا (سعادت‌آباد)',
    nationalId: '14008491280',
    economicCode: '411489129031',
    tier: 'T1' as const,
    phone: '021-22681490',
    addressFa: 'تهران، سعادت‌آباد، مجتمع تجاری رویال، طبقه همکف، واحد ۱۲'
  },
  {
    orgId: 'org-ret-zomorod-002',
    nameFa: 'گالری طلا و جواهر زمرد تهران',
    nationalId: '10103569841',
    economicCode: '411589632145',
    tier: 'T2' as const,
    phone: '021-55623344',
    addressFa: 'تهران، بازار بزرگ، سرای امید، پلاک ۲۴'
  },
  {
    orgId: 'org-whs-pars-003',
    nameFa: 'بازرگانی طلا و جواهر پارس زرین',
    nationalId: '10380291482',
    economicCode: '411982341298',
    tier: 'T1' as const,
    phone: '021-55618290',
    addressFa: 'تهران، بازار بزرگ، پاساژ حکیم هاشمی، پلاک ۴۲'
  }
];

export const K13Dashboard: React.FC = () => {
  const [data, setData] = useState<K13DataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingRates, setRefreshingRates] = useState(false);
  const [activeTab, setActiveTab] = useState<'rates_access' | 'rates_locks' | 'calculator' | 'matrix' | 'invoices'>('rates_access');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Calculator State
  const [calcWeight, setCalcWeight] = useState<number>(24.5);
  const [calcCarat, setCalcCarat] = useState<number>(750);
  const [calcCategory, setCalcCategory] = useState<string>('bangle');
  const [calcWageType, setCalcWageType] = useState<'percentage' | 'fixed_per_gram'>('percentage');
  const [calcWageValue, setCalcWageValue] = useState<number>(6.5);
  const [calcTier, setCalcTier] = useState<'T1' | 'T2' | 'T3'>('T2');
  const [calcMargin, setCalcMargin] = useState<number>(1.8);
  const [calcItemDiscount, setCalcItemDiscount] = useState<number>(0); // Max ±1.0%
  const [calcVolumeDiscount, setCalcVolumeDiscount] = useState<number>(0); // Max ±2.0%
  const [calcSettlementMode, setCalcSettlementMode] = useState<'split' | 'rial_only' | 'gold_only'>('split');
  const [calcRialSplit, setCalcRialSplit] = useState<number>(40);
  const [calcResult, setCalcResult] = useState<PriceCalculationResult | null>(null);

  // Lock Quote Modal State
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockWeight, setLockWeight] = useState<number>(50);
  const [lockBuyerName, setLockBuyerName] = useState<string>('گالری طلا و جواهر زمرد تهران');
  const [lockValidityMin, setLockValidityMin] = useState<number>(5);
  const [lockPurpose, setLockPurpose] = useState<string>('تثبیت مظنه برای صدور سفارش تجاری');

  // New Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [newInvType, setNewInvType] = useState<'proforma' | 'official_tax_invoice'>('official_tax_invoice');
  const [newInvBuyerOrgId, setNewInvBuyerOrgId] = useState<string>('org-ret-zomorod-002');
  const [newInvBuyerName, setNewInvBuyerName] = useState<string>('گالری طلا و جواهر زمرد تهران');
  const [newInvBuyerNationalId, setNewInvBuyerNationalId] = useState<string>('10103569841');
  const [newInvBuyerEconomicCode, setNewInvBuyerEconomicCode] = useState<string>('411589632145');
  const [newInvBuyerTier, setNewInvBuyerTier] = useState<'T1' | 'T2' | 'T3'>('T2');
  const [newInvBuyerAddress, setNewInvBuyerAddress] = useState<string>('تهران، بازار بزرگ، سرای امید، پلاک ۲۴');
  const [newInvBuyerPhone, setNewInvBuyerPhone] = useState<string>('021-55623344');

  const [newInvItems, setNewInvItems] = useState<DraftInvoiceItem[]>([
    {
      id: 'it-1',
      sku: 'SKU-GLD-NK-01',
      productCode: 'GLD-18K-NK-01',
      titleFa: 'سرویس طلا تراش‌خورده ۱۸ عیار دیدار',
      categoryKey: 'necklace',
      categoryFa: 'سرویس و گردنبند',
      carat: 750,
      weightGrams: 35.2,
      wageType: 'percentage',
      wageValue: 9.5,
      lineDiscountType: 'percentage',
      itemDiscountPercent: 0,
      lineDiscountReasonFa: ''
    }
  ]);

  const [newInvSettlementMode, setNewInvSettlementMode] = useState<'split' | 'rial_only' | 'gold_only'>('split');
  const [newInvRialSplit, setNewInvRialSplit] = useState<number>(40);
  const [newInvVolumeDiscount, setNewInvVolumeDiscount] = useState<number>(-0.5); // Max ±2.0%
  const [newInvQuoteLockId, setNewInvQuoteLockId] = useState<string>('');

  // Viewing Invoice Modal
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // K13 - K14 Integration & Automated Zarrin Delivery Finalization Modal
  const [selectedInvForFinalize, setSelectedInvForFinalize] = useState<Invoice | null>(null);
  const [finalizeSimulation, setFinalizeSimulation] = useState<CreditSimulationResult | null>(null);
  const [simulatingFinalize, setSimulatingFinalize] = useState<boolean>(false);
  const [finalizingK14, setFinalizingK14] = useState<boolean>(false);
  const [forceOverrideReason, setForceOverrideReason] = useState<string>('');
  const [forceOverrideMode, setForceOverrideMode] = useState<boolean>(false);

  // Suggested volume discount based on weight volume
  const getSuggestedVolumeDiscount = (grams: number): number => {
    if (grams >= 1000) return -2.0;
    if (grams >= 500) return -1.5;
    if (grams >= 200) return -1.0;
    if (grams >= 50) return -0.5;
    return 0;
  };

  const handleSelectBuyerTemplate = (orgId: string) => {
    const found = BUYER_TEMPLATES.find((t) => t.orgId === orgId);
    if (found) {
      setNewInvBuyerOrgId(found.orgId);
      setNewInvBuyerName(found.nameFa);
      setNewInvBuyerNationalId(found.nationalId);
      setNewInvBuyerEconomicCode(found.economicCode);
      setNewInvBuyerTier(found.tier);
      setNewInvBuyerAddress(found.addressFa);
      setNewInvBuyerPhone(found.phone);
    }
  };

  const handleAddDraftItem = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setNewInvItems((prev) => [
      ...prev,
      {
        id: `it-${Date.now()}`,
        sku: `SKU-GLD-BR-${randomSuffix}`,
        productCode: `GLD-18K-BR-${randomSuffix}`,
        titleFa: 'دستبند زنجیری طلای ۱۸ عیار',
        categoryKey: 'bracelet',
        categoryFa: 'دستبند طلا',
        carat: 750,
        weightGrams: 15.0,
        wageType: 'percentage',
        wageValue: 7.5,
        lineDiscountType: 'percentage',
        itemDiscountPercent: 0,
        lineDiscountReasonFa: ''
      }
    ]);
  };

  const handleRemoveDraftItem = (id: string) => {
    if (newInvItems.length <= 1) return;
    setNewInvItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleUpdateDraftItem = (id: string, updates: Partial<DraftInvoiceItem>) => {
    setNewInvItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...updates } : it))
    );
  };

  // Load K13 Data
  const loadK13Data = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch('/api/admin/kernel/k13');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setNotification({ type: 'error', message: json.error || 'خطا در بارگذاری اطلاعات K13' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'خطا در برقراری ارتباط با سرویس نرخ و قیمت‌گذاری' });
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadK13Data();
  }, [loadK13Data]);

  // Execute interactive price calculation
  const handleCalculate = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/kernel/k13/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightGrams: calcWeight,
          carat: calcCarat,
          categoryKey: calcCategory,
          wageType: calcWageType,
          wageValue: calcWageValue,
          didarMarginPercent: calcMargin,
          retailerTier: calcTier,
          itemDiscountPercent: calcItemDiscount,
          volumeDiscountPercent: calcVolumeDiscount,
          settlementMode: calcSettlementMode,
          rialSplitPercent: calcRialSplit
        })
      });
      const json = await res.json();
      if (json.success) {
        setCalcResult(json.data);
      } else if (json.error) {
        setNotification({ type: 'error', message: json.error });
      }
    } catch (err) {
      console.error(err);
    }
  }, [calcWeight, calcCarat, calcCategory, calcWageType, calcWageValue, calcMargin, calcTier, calcItemDiscount, calcVolumeDiscount, calcSettlementMode, calcRialSplit]);

  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  // Refresh live rates
  const handleRefreshRates = useCallback(async () => {
    try {
      setRefreshingRates(true);
      const res = await fetch('/api/admin/kernel/k13/rates/refresh', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: 'نرخ‌های تابلو بازار با موفقیت بروزرسانی شد.' });
        await loadK13Data(true);
      }
    } catch {
      setNotification({ type: 'error', message: 'خطا در دریافت نرخ‌های جدید بازار' });
    } finally {
      setRefreshingRates(false);
    }
  }, [loadK13Data]);

  // Create Lock Quote
  const handleCreateLock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/kernel/k13/lock-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerOrgId: 'org-r-01',
          buyerOrgNameFa: lockBuyerName,
          totalWeightGrams: lockWeight,
          validitySeconds: lockValidityMin * 60,
          purpose: lockPurpose
        })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        setIsLockModalOpen(false);
        loadK13Data();
      } else {
        setNotification({ type: 'error', message: json.error });
      }
    } catch {
      setNotification({ type: 'error', message: 'خطا در ثبت قفل مظنه' });
    }
  };

  // Create Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvItems || newInvItems.length === 0) {
      setNotification({ type: 'error', message: 'حداقل یک قلم کالا در سبد صورتحساب الزامی است.' });
      return;
    }

    // Validate item discount ceiling (±1.0%)
    for (let i = 0; i < newInvItems.length; i++) {
      const it = newInvItems[i];
      if (Math.abs(Number(it.itemDiscountPercent || 0)) > 1.0) {
        setNotification({
          type: 'error',
          message: `تعدیل قیمت در ردیف ${i + 1} (${it.titleFa}) فراتر از سقف قانونی ۱٪ است (${it.itemDiscountPercent}٪).`
        });
        return;
      }
    }

    // Validate volume discount ceiling (±2.0%)
    if (Math.abs(Number(newInvVolumeDiscount || 0)) > 2.0) {
      setNotification({
        type: 'error',
        message: `تخفیف حجمی کل فاکتور فراتر از سقف قانونی ۲٪ است (${newInvVolumeDiscount}٪).`
      });
      return;
    }

    try {
      const res = await fetch('/api/admin/kernel/k13/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceType: newInvType,
          buyerOrgId: newInvBuyerOrgId,
          buyerNameFa: newInvBuyerName,
          buyerNationalId: newInvBuyerNationalId,
          buyerEconomicCode: newInvBuyerEconomicCode,
          buyerAddressFa: newInvBuyerAddress,
          buyerPhone: newInvBuyerPhone,
          retailerTier: newInvBuyerTier,
          settlementMode: newInvSettlementMode,
          rialSplitPercent: newInvRialSplit,
          volumeDiscountPercent: newInvVolumeDiscount,
          quoteLockId: newInvQuoteLockId || undefined,
          items: newInvItems.map((it) => ({
            sku: it.sku || `SKU-GLD-${Date.now().toString().slice(-4)}`,
            productCode: it.productCode || it.sku || `PRD-GLD-${Date.now().toString().slice(-4)}`,
            titleFa: it.titleFa,
            categoryFa: it.categoryFa || 'مصنوعات طلای ۱۸ عیار',
            categoryKey: it.categoryKey,
            carat: it.carat || 750,
            weightGrams: Number(it.weightGrams),
            wageType: it.wageType,
            wageValue: Number(it.wageValue),
            itemDiscountPercent: Number(it.itemDiscountPercent || 0),
            lineDiscountType: it.lineDiscountType || 'percentage',
            lineDiscountPercent: Number(it.itemDiscountPercent || 0),
            lineDiscountReasonFa: it.lineDiscountReasonFa || undefined
          }))
        })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        setIsInvoiceModalOpen(false);
        loadK13Data();
      } else {
        setNotification({ type: 'error', message: json.error });
      }
    } catch {
      setNotification({ type: 'error', message: 'خطا در صدور صورتحساب' });
    }
  };

  // Send to Moaddian
  const handleSendMoaddian = async (invId: string) => {
    try {
      const res = await fetch(`/api/admin/kernel/k13/invoices/${invId}/moaddian-send`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        loadK13Data();
        if (viewingInvoice && viewingInvoice.id === invId) {
          setViewingInvoice(json.data);
        }
      } else {
        setNotification({ type: 'error', message: json.error });
      }
    } catch {
      setNotification({ type: 'error', message: 'خطا در ارسال به سامانه مودیان' });
    }
  };

  // Open Pre-flight Finalization & K14 Credit Simulation Modal
  const openFinalizeModal = async (inv: Invoice) => {
    setSelectedInvForFinalize(inv);
    setFinalizeSimulation(null);
    setSimulatingFinalize(true);
    setForceOverrideMode(false);
    setForceOverrideReason('');
    try {
      const res = await fetch(`/api/admin/kernel/k13/invoices/${inv.id}/credit-simulation`);
      const json = await res.json();
      if (json.success) {
        setFinalizeSimulation(json.data);
      } else {
        setNotification({ type: 'error', message: json.error || 'خطا در ارزیابی اعتباری K14' });
      }
    } catch {
      setNotification({ type: 'error', message: 'خطا در ارتباط با سرویس شبیه‌سازی اعتباری K14' });
    } finally {
      setSimulatingFinalize(false);
    }
  };

  // Confirm Finalization with K14 and auto-delivery to Zarrin
  const handleConfirmFinalizeWithK14 = async (forceBypass = false) => {
    if (!selectedInvForFinalize) return;
    try {
      setFinalizingK14(true);
      const res = await fetch(`/api/admin/kernel/k13/invoices/${selectedInvForFinalize.id}/finalize-with-k14`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorName: 'مدیر بازرگانی و کمیته اعتبارات دیدار',
          forceBypassOverride: forceBypass,
          overrideReason: forceOverrideReason || undefined
        })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message || 'فاکتور با موفقیت نهایی و اقلام تحویل زرین شد.' });
        setSelectedInvForFinalize(null);
        await loadK13Data(true);
        if (viewingInvoice && viewingInvoice.id === selectedInvForFinalize.id) {
          setViewingInvoice(json.invoice);
        }
      } else {
        if (json.requiresOverride) {
          setForceOverrideMode(true);
          setNotification({ type: 'error', message: json.error || 'سقف اعتباری K14 تکمیل است. نیاز به ثبت مجوز استثنا دارد.' });
        } else {
          setNotification({ type: 'error', message: json.error || 'خطا در نهایی‌سازی و تحویل زرین' });
        }
      }
    } catch {
      setNotification({ type: 'error', message: 'خطا در برقراری ارتباط با سرور' });
    } finally {
      setFinalizingK14(false);
    }
  };

  const formatToman = (val: number) => {
    return new Intl.NumberFormat('fa-IR').format(val) + ' تومان';
  };

  const formatRial = (val: number) => {
    return new Intl.NumberFormat('fa-IR').format(val) + ' ریال';
  };

  const formatGrams = (val: number) => {
    return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 3 }).format(val) + ' گرم';
  };

  // Rate Access Action Handlers
  const handleModifyRate = async (params: {
    rateId: string;
    newSellPrice: number;
    newBuyPrice?: number;
    operatorId: string;
    reason: string;
  }) => {
    try {
      const res = await fetch('/api/admin/kernel/k13/rates/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const json = await res.json();
      if (json.success) {
        setNotification({
          type: 'success',
          message: json.message || 'نرخ طلا با موفقیت تغییر یافت.'
        });
        await loadK13Data();
        return { success: true, requiresApproval: json.requiresApproval, message: json.message };
      } else {
        setNotification({ type: 'error', message: json.error || 'خطا در تغییر نرخ' });
        return { success: false, error: json.error };
      }
    } catch {
      return { success: false, error: 'خطای ارتباط با سرور' };
    }
  };

  const handleApproveDual = async (auditLogId: string, approverId: string) => {
    try {
      const res = await fetch('/api/admin/kernel/k13/rates/approve-dual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditLogId, approverId })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        await loadK13Data();
        return { success: true, message: json.message };
      } else {
        return { success: false, error: json.error };
      }
    } catch {
      return { success: false, error: 'خطای سرور' };
    }
  };

  const handleRejectDual = async (auditLogId: string, approverId: string, reason?: string) => {
    try {
      const res = await fetch('/api/admin/kernel/k13/rates/reject-dual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditLogId, approverId, rejectionReason: reason })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        await loadK13Data();
        return { success: true, message: json.message };
      } else {
        return { success: false, error: json.error };
      }
    } catch {
      return { success: false, error: 'خطای سرور' };
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<RateAuthorizedUser>) => {
    try {
      const res = await fetch(`/api/admin/kernel/k13/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        await loadK13Data();
        return { success: true, message: json.message };
      } else {
        return { success: false, error: json.error };
      }
    } catch {
      return { success: false, error: 'خطای سرور' };
    }
  };

  const handleCreateUser = async (user: Omit<RateAuthorizedUser, 'id'>) => {
    try {
      const res = await fetch('/api/admin/kernel/k13/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        await loadK13Data();
        return { success: true, message: json.message };
      } else {
        return { success: false, error: json.error };
      }
    } catch {
      return { success: false, error: 'خطای سرور' };
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/kernel/k13/users/${userId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        await loadK13Data();
        return { success: true, message: json.message };
      } else {
        return { success: false, error: json.error };
      }
    } catch {
      return { success: false, error: 'خطای سرور' };
    }
  };

  const handleToggleCircuitBreaker = async (freeze: boolean, reason: string, operatorId: string) => {
    try {
      const res = await fetch('/api/admin/kernel/k13/security/circuit-breaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freeze, reason, operatorId })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        await loadK13Data();
        return { success: true, message: json.message };
      } else {
        return { success: false, error: json.error };
      }
    } catch {
      return { success: false, error: 'خطای سرور' };
    }
  };

  const handleUpdatePolicy = async (policy: Partial<RateSecurityPolicy>) => {
    try {
      const res = await fetch('/api/admin/kernel/k13/security/policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy)
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        await loadK13Data();
        return { success: true, message: json.message };
      } else {
        return { success: false, error: json.error };
      }
    } catch {
      return { success: false, error: 'خطای سرور' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-all ${
            notification.type === 'success'
              ? 'bg-[#3DD68C]/10 border-[#3DD68C]/30 text-[#3DD68C]'
              : 'bg-[#E5484D]/10 border-[#E5484D]/30 text-[#FF6B6B]'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-current hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E1B15] via-[#16161C] to-[#121216] border border-[#C8A951]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8A951]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/40 shadow-inner">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#EDEDED]">
                    هسته K13: نرخ طلا، قیمت‌گذاری، شرایط و صورتحساب
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40">
                    K13A + K13B + K13C
                  </span>
                </div>
                <p className="text-xs text-[#9E9EA8] mt-0.5">
                  موتور زنده مظنه طلا، قفل ۵ دقیقه‌ای نوسانات، ماتریس اجرت و سود، و صورتحساب رسمی مطابق ماده ۲۶ مالیات بر ارزش افزوده
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsLockModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A951] to-[#B3933B] text-[#141416] font-bold text-xs hover:brightness-110 transition-all shadow-md shadow-[#C8A951]/20 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>قفل مظنه جدید</span>
            </button>

            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#252536] hover:bg-[#303046] text-[#EDEDED] font-semibold text-xs border border-[#3E3E56] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#C8A951]" />
              <span>صدور صورتحساب</span>
            </button>

            <button
              onClick={handleRefreshRates}
              disabled={refreshingRates}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#181822] hover:bg-[#222230] text-[#9E9EA8] hover:text-[#EDEDED] border border-[#2B2B3C] text-xs transition-colors cursor-pointer disabled:opacity-50"
              title="بروزرسانی بلادرنگ تابلو نرخ‌ها"
            >
              <RefreshCw className={`w-4 h-4 ${refreshingRates ? 'animate-spin text-[#C8A951]' : ''}`} />
              <span className="hidden sm:inline">بروزرسانی تابلو</span>
            </button>
          </div>
        </div>

        {/* Real-time Ticker Metrics */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-[#2B2B3C]/80">
            <div className="p-3 rounded-xl bg-[#14141A]/70 border border-[#272736]">
              <span className="text-[11px] text-[#8C8C9E] block mb-1">طلای ۱۸ عیار دیدار (هر گرم)</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-[#E5C365]">
                  {formatToman(data.metrics.current18kPriceToman)}
                </span>
                <span className="text-[10px] text-[#3DD68C] font-mono flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +۱.۲۵٪
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#14141A]/70 border border-[#272736]">
              <span className="text-[11px] text-[#8C8C9E] block mb-1">مثقال آبشده تهران (۱۷ عیار)</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-[#EDEDED]">
                  {formatToman(data.metrics.currentMesghalPriceToman)}
                </span>
                <span className="text-[10px] text-[#3DD68C] font-mono flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +۱.۱۵٪
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#14141A]/70 border border-[#272736]">
              <span className="text-[11px] text-[#8C8C9E] block mb-1">مظنه‌های قفل‌شده فعال</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-[#3DD68C]">
                  {data.metrics.activeLockedQuotesCount} مورد
                </span>
                <Lock className="w-3.5 h-3.5 text-[#3DD68C]" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#14141A]/70 border border-[#272736]">
              <span className="text-[11px] text-[#8C8C9E] block mb-1">حجم صدور ماه جاری</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-[#EDEDED]">
                  {formatGrams(data.metrics.totalGoldWeightInvoicedGrams)}
                </span>
                <Scale className="w-3.5 h-3.5 text-[#C8A951]" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#14141A]/70 border border-[#272736]">
              <span className="text-[11px] text-[#8C8C9E] block mb-1">انطباق سامانه مودیان</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-[#3DD68C]">
                  %{data.metrics.moaddianSuccessRatePercent}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#3DD68C]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#262634] pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('rates_access')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'rates_access'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20 font-bold'
              : 'bg-[#181822] text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#20202E] border border-[#282838]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>تابلوی زنده نرخ و مدیریت دسترسی کاربران (Rate Access Governance)</span>
          {data && (data.metrics.pendingDualApprovalsCount ?? 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#E5484D] text-white font-mono animate-bounce">
              {data.metrics.pendingDualApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rates_locks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'rates_locks'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20 font-bold'
              : 'bg-[#181822] text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#20202E] border border-[#282838]'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>تابلو زنده مظنه و قفل نرخ طلا (K13A)</span>
          {data && (
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              activeTab === 'rates_locks' ? 'bg-[#141416] text-[#C8A951]' : 'bg-[#252536] text-[#8A8A9E]'
            }`}>
              {data.rates.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'calculator'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20 font-bold'
              : 'bg-[#181822] text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#20202E] border border-[#282838]'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>محاسبه‌گر رسمی قیمت و مالیات ارزش افزوده</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20 font-bold'
              : 'bg-[#181822] text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#20202E] border border-[#282838]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>ماتریس اجرت ساخت و سود دیدار (K13B)</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20 font-bold'
              : 'bg-[#181822] text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#20202E] border border-[#282838]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>دفتر صورتحساب‌ها و سامانه مودیان (K13C)</span>
          {data && (
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              activeTab === 'invoices' ? 'bg-[#141416] text-[#C8A951]' : 'bg-[#252536] text-[#8A8A9E]'
            }`}>
              {data.invoices.length}
            </span>
          )}
        </button>
      </div>

      {loading && !data ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#9E9EA8]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#C8A951]" />
          <span className="text-xs">در حال بارگذاری موتور قیمت‌گذاری و نرخ طلا...</span>
        </div>
      ) : (
        <>
          {/* TAB 0: LIVE RATES & USER ACCESS GOVERNANCE */}
          {activeTab === 'rates_access' && data && (
            <K13RateAccessDashboard
              rates={data.rates}
              authorizedUsers={data.authorizedUsers || []}
              auditLogs={data.auditLogs || []}
              securityPolicy={data.securityPolicy || {
                marketStatus: 'open',
                dualApprovalThresholdPercent: 1.5,
                circuitBreakerThresholdPercent: 4.0,
                minSpreadToman: 25000,
                feedSource: 'hybrid',
                lastCircuitBreakerTriggerAt: null
              }}
              onRefreshRates={handleRefreshRates}
              onModifyRate={handleModifyRate}
              onApproveDual={handleApproveDual}
              onRejectDual={handleRejectDual}
              onUpdateUser={handleUpdateUser}
              onCreateUser={handleCreateUser}
              onDeleteUser={handleDeleteUser}
              onToggleCircuitBreaker={handleToggleCircuitBreaker}
              onUpdatePolicy={handleUpdatePolicy}
            />
          )}

          {/* TAB 1: SPOT RATES & QUOTE LOCKS */}
          {activeTab === 'rates_locks' && data && (
            <div className="space-y-6">
              {/* Gold Rates Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                    <Coins className="w-4 h-4 text-[#C8A951]" />
                    <span>تابلو مرجع نرخ‌های زنده طلا و مسکوکات دیدار</span>
                  </h3>
                  <span className="text-[11px] text-[#7A7A8E]">
                    آخرین تطبیق: {data.metrics.lastRateFetchAt}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.rates.map((rate) => (
                    <div
                      key={rate.id}
                      className={`p-4 rounded-xl border transition-all ${
                        rate.isPrimaryReference
                          ? 'bg-gradient-to-br from-[#1C1A14] to-[#15151B] border-[#C8A951]/50 shadow-md shadow-[#C8A951]/10'
                          : 'bg-[#15151B] border-[#292938] hover:border-[#38384C]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#EDEDED]">{rate.titleFa}</span>
                        {rate.isPrimaryReference && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40">
                            نرخ مبنا
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 my-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#888899]">فروش به همکار (مظنه):</span>
                          <span className="font-mono font-bold text-[#E5C365]">
                            {rate.symbol === 'GOLD_OUNCE_USD' ? `$${rate.sellPriceToman}` : formatToman(rate.sellPriceToman)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#888899]">خرید از همکار:</span>
                          <span className="font-mono text-[#B5B5C4]">
                            {rate.symbol === 'GOLD_OUNCE_USD' ? `$${rate.buyPriceToman}` : formatToman(rate.buyPriceToman)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-[#262634] flex items-center justify-between text-[11px]">
                        <span className="text-[#6D6D7D] truncate max-w-[130px]">{rate.source}</span>
                        <span
                          className={`font-mono flex items-center ${
                            rate.changePercent24h >= 0 ? 'text-[#3DD68C]' : 'text-[#E5484D]'
                          }`}
                        >
                          {rate.changePercent24h >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-0.5" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-0.5" />
                          )}
                          %{Math.abs(rate.changePercent24h)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Quote Locks */}
              <div className="bg-[#15151B] border border-[#292938] rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#3DD68C]" />
                      <span>فهرست مظنه‌های تضمین‌شده و قفل نرخ (Quote Locks)</span>
                    </h3>
                    <p className="text-xs text-[#8A8A9E] mt-0.5">
                      تضمین عدم تغییر نرخ طلا به مدت ۵ دقیقه برای پیشگیری از نوسانات شدید بازار حین تسویه و ثبت سفارش
                    </p>
                  </div>
                  <button
                    onClick={() => setIsLockModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C8A951]/15 text-[#E5C365] hover:bg-[#C8A951]/25 border border-[#C8A951]/30 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>قفل مظنه جدید</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#262634] text-[#868698]">
                        <th className="py-2.5 px-3">شناسه مظنه</th>
                        <th className="py-2.5 px-3">مشتری طلافروش</th>
                        <th className="py-2.5 px-3">نرخ قفل‌شده (هر گرم ۱۸)</th>
                        <th className="py-2.5 px-3">وزن متعهد</th>
                        <th className="py-2.5 px-3">ارزش برآوردی</th>
                        <th className="py-2.5 px-3">انقضا</th>
                        <th className="py-2.5 px-3">وضعیت اعتبار</th>
                        <th className="py-2.5 px-3 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222230]">
                      {data.activeLocks.map((lock) => (
                        <tr key={lock.quoteId} className="hover:bg-[#1A1A24]">
                          <td className="py-3 px-3 font-mono font-bold text-[#EDEDED]">
                            {lock.quoteId}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-[#EDEDED]">{lock.buyerOrgNameFa}</span>
                            <span className="block text-[10px] text-[#7A7A8E]">{lock.purpose}</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-[#E5C365]">
                            {formatToman(lock.lockedRatePerGram750Toman)}
                          </td>
                          <td className="py-3 px-3 font-mono text-[#EDEDED]">
                            {formatGrams(lock.totalWeightGrams)}
                          </td>
                          <td className="py-3 px-3 font-mono text-[#EDEDED]">
                            {formatToman(lock.calculatedTotalToman)}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-[#8C8C9C]">
                            {lock.expiresAtFa}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                lock.status === 'active'
                                  ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                                  : 'bg-[#868698]/15 text-[#868698] border border-[#868698]/30'
                              }`}
                            >
                              {lock.statusFa}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {lock.status === 'active' ? (
                              <button
                                onClick={() => {
                                  setNewInvBuyerName(lock.buyerOrgNameFa);
                                  setNewInvItems([
                                    {
                                      id: `it-${Date.now()}`,
                                      sku: `SKU-GLD-LCK-${Date.now().toString().slice(-4)}`,
                                      titleFa: `مصنوعات طلای ۱۸ عیار قفل‌شده (${lock.buyerOrgNameFa})`,
                                      categoryKey: 'necklace',
                                      categoryFa: 'سرویس و گردنبند',
                                      carat: 750,
                                      weightGrams: lock.totalWeightGrams,
                                      wageType: 'percentage',
                                      wageValue: 9.0,
                                      itemDiscountPercent: 0
                                    }
                                  ]);
                                  setNewInvQuoteLockId(lock.quoteId);
                                  setIsInvoiceModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#C8A951] text-[#141416] text-[11px] font-bold hover:brightness-110 cursor-pointer"
                              >
                                صدور فاکتور
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#636372]">منقضی شده</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE PRICE & TAX CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Input Parameters */}
              <div className="lg:col-span-6 bg-[#15151B] border border-[#292938] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-[#262634] pb-3">
                  <Calculator className="w-5 h-5 text-[#C8A951]" />
                  <h3 className="text-sm font-bold text-[#EDEDED]">
                    ورودی‌های محاسبه بهای تمام‌شده و مالیات طلا
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#8A8A9E] block mb-1">وزن کل طلا (گرم):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#8A8A9E] block mb-1">عیار طلا:</label>
                    <select
                      value={calcCarat}
                      onChange={(e) => setCalcCarat(parseInt(e.target.value))}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                    >
                      <option value={750}>۱۸ عیار استاندارد (۷۵۰)</option>
                      <option value={995}>۲۴ عیار شمش تجاری (۹۹۵)</option>
                      <option value={999.9}>۲۴ عیار خالص بین‌المللی (۹۹۹.۹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#8A8A9E] block mb-1">رسته کالا:</label>
                    <select
                      value={calcCategory}
                      onChange={(e) => setCalcCategory(e.target.value)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                    >
                      <option value="bangle">النگو و تک‌پوش طلا</option>
                      <option value="ring">انگشتر و حلقه طلا</option>
                      <option value="necklace">گردنبند، مدال و زنجیر فیوژن</option>
                      <option value="bracelet">دستبند طلا</option>
                      <option value="earring">گوشواره و پلاک</option>
                      <option value="coin_bar">شمش و پلاک کادویی</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#8A8A9E] block mb-1">نوع اجرت ساخت:</label>
                    <select
                      value={calcWageType}
                      onChange={(e) => setCalcWageType(e.target.value as any)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                    >
                      <option value="percentage">درصدی از مظنه طلا (%)</option>
                      <option value="fixed_per_gram">ثابت به ازای هر گرم (تومان)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#8A8A9E] block mb-1">
                      {calcWageType === 'percentage' ? 'میزان اجرت ساخت (%):' : 'اجرت هر گرم (تومان):'}
                    </label>
                    <input
                      type="number"
                      step={calcWageType === 'percentage' ? '0.1' : '5000'}
                      value={calcWageValue}
                      onChange={(e) => setCalcWageValue(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#8A8A9E] block mb-1">سطح مشتری (رتبه تجاری K02/K11):</label>
                    <select
                      value={calcTier}
                      onChange={(e) => setCalcTier(e.target.value as any)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                    >
                      <option value="T1">سطح T1 (مشتری استاندارد - بدون تخفیف اجرت)</option>
                      <option value="T2">سطح T2 (مشتری معتبر - ۰.۵٪ تخفیف از اجرت)</option>
                      <option value="T3">سطح T3 (شریک ویژه بنکداری - ۱.۰٪ تخفیف از اجرت)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#8A8A9E] block mb-1">سود عمده‌فروشی پلتفرم دیدار (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={calcMargin}
                      onChange={(e) => setCalcMargin(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                    />
                  </div>
                </div>

                {/* Section: Discount & Volume Adjustments (Item Max ±1%, Volume Max ±2%) */}
                <div className="p-3.5 rounded-xl bg-[#14141C] border border-[#2B2B3E] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C8A951]" />
                      <span>قوانین تخفیف و تعدیل قیمت فاکتور (سقف قانونی K13)</span>
                    </span>
                    <span className="text-[10px] text-[#8A8A9E]">
                      سقف هر کالا: ±۱٪ | سقف کل فاکتور: ±۲٪
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Item-level discount */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] text-[#A6A6B8]">تعدیل قیمت کالا (±۱.۰۰٪):</label>
                        <span className={`text-[10px] font-mono font-bold ${
                          calcItemDiscount < 0 ? 'text-[#3DD68C]' : calcItemDiscount > 0 ? 'text-[#E5A84B]' : 'text-[#8A8A9E]'
                        }`}>
                          {calcItemDiscount > 0 ? `+${calcItemDiscount}٪` : `${calcItemDiscount}٪`}
                        </span>
                      </div>
                      <input
                        type="number"
                        min="-1.0"
                        max="1.0"
                        step="0.1"
                        value={calcItemDiscount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          if (Math.abs(val) <= 1.0) {
                            setCalcItemDiscount(val);
                          }
                        }}
                        className={`w-full bg-[#1C1C26] border rounded-xl px-3 py-1.5 text-xs text-[#EDEDED] font-mono outline-none ${
                          Math.abs(calcItemDiscount) > 1.0 ? 'border-[#E5484D]' : 'border-[#2D2D3E] focus:border-[#C8A951]'
                        }`}
                      />
                      <span className="block text-[10px] text-[#7A7A8E] mt-0.5">
                        حداکثر ۱٪ بالا یا پایین بر روی هر قلم کالا
                      </span>
                    </div>

                    {/* Volume-level discount */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] text-[#A6A6B8]">تخفیف حجمی کل فاکتور (±۲.۰۰٪):</label>
                        <span className={`text-[10px] font-mono font-bold ${
                          calcVolumeDiscount < 0 ? 'text-[#3DD68C]' : calcVolumeDiscount > 0 ? 'text-[#E5A84B]' : 'text-[#8A8A9E]'
                        }`}>
                          {calcVolumeDiscount > 0 ? `+${calcVolumeDiscount}٪` : `${calcVolumeDiscount}٪`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="-2.0"
                          max="2.0"
                          step="0.1"
                          value={calcVolumeDiscount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            if (Math.abs(val) <= 2.0) {
                              setCalcVolumeDiscount(val);
                            }
                          }}
                          className={`flex-1 bg-[#1C1C26] border rounded-xl px-3 py-1.5 text-xs text-[#EDEDED] font-mono outline-none ${
                            Math.abs(calcVolumeDiscount) > 2.0 ? 'border-[#E5484D]' : 'border-[#2D2D3E] focus:border-[#C8A951]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setCalcVolumeDiscount(getSuggestedVolumeDiscount(calcWeight))}
                          className="px-2.5 py-1.5 rounded-xl bg-[#C8A951]/20 hover:bg-[#C8A951]/30 text-[#E5C365] text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors"
                          title="اعمال درصد پیشنهادی الگوریتم بر اساس وزن خرید"
                        >
                          پیشنهاد ({getSuggestedVolumeDiscount(calcWeight)}٪)
                        </button>
                      </div>
                      <span className="block text-[10px] text-[#7A7A8E] mt-0.5">
                        بر مبنای حجم کل خرید (سقف مجاز: ۲٪)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section: Settlement Split & Mandatory Quote Lock */}
                <div className="p-3.5 rounded-xl bg-[#14141C] border border-[#2B2B3E] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#C8A951]" />
                      <span>شیوه تسویه حساب و مدیریت قفل مظنه (Settlement & Quote Lock)</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      calcSettlementMode !== 'gold_only'
                        ? 'bg-[#E5A84B]/20 text-[#E5C365] border border-[#E5A84B]/40'
                        : 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                    }`}>
                      {calcSettlementMode !== 'gold_only' ? '🔒 الزام قفل مظنه' : 'بدون نیاز به قفل ریالی'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCalcSettlementMode('split');
                        setCalcRialSplit(40);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        calcSettlementMode === 'split'
                          ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#E5C365] font-bold'
                          : 'bg-[#1C1C26] border-[#2D2D3E] text-[#9E9EA8] hover:text-[#EDEDED]'
                      }`}
                    >
                      <span className="block text-xs">تسویه ترکیبی</span>
                      <span className="text-[10px] opacity-75">ریالی + طلای آبشده</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCalcSettlementMode('rial_only');
                        setCalcRialSplit(100);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        calcSettlementMode === 'rial_only'
                          ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#E5C365] font-bold'
                          : 'bg-[#1C1C26] border-[#2D2D3E] text-[#9E9EA8] hover:text-[#EDEDED]'
                      }`}
                    >
                      <span className="block text-xs">۱۰۰٪ ریالی</span>
                      <span className="text-[10px] opacity-75">با قفل مظنه</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCalcSettlementMode('gold_only');
                        setCalcRialSplit(0);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        calcSettlementMode === 'gold_only'
                          ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#E5C365] font-bold'
                          : 'bg-[#1C1C26] border-[#2D2D3E] text-[#9E9EA8] hover:text-[#EDEDED]'
                      }`}
                    >
                      <span className="block text-xs">۱۰۰٪ طلایی</span>
                      <span className="text-[10px] opacity-75">حواله شمش ۷۵۰</span>
                    </button>
                  </div>

                  {calcSettlementMode === 'split' && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#3DD68C] font-bold font-mono">
                          سهم ریالی: {calcRialSplit}٪
                        </span>
                        <span className="text-[#E5C365] font-bold font-mono">
                          سهم طلایی: {100 - calcRialSplit}٪
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        step="5"
                        value={calcRialSplit}
                        onChange={(e) => setCalcRialSplit(parseInt(e.target.value))}
                        className="w-full accent-[#C8A951] cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Quote Lock Security Banner */}
                  {calcSettlementMode !== 'gold_only' ? (
                    <div className="p-2.5 rounded-xl bg-[#221B0E] border border-[#E5A84B]/40 flex items-start gap-2 text-[11px] text-[#E5C365]">
                      <Lock className="w-4 h-4 shrink-0 text-[#E5A84B] mt-0.5" />
                      <div>
                        <strong>الزام قطعی قفل مظنه طلا (Quote Lock Required):</strong>
                        <p className="text-[10px] text-[#D4C39E] mt-0.5">
                          به دلیل تسویه ریالی، قیمت مظنه طلا ({formatToman(calcResult?.effectiveSpotRateToman || 4210000)}) باید قفل شود تا نوسانات بازار در زمان تسویه فاکتور به هیچ‌یک از طرفین ضرر نزند.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-[#141E18] border border-[#3DD68C]/30 flex items-start gap-2 text-[11px] text-[#3DD68C]">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3DD68C] mt-0.5" />
                      <div>
                        <strong>تسویه کامل وزنی (وزن طلای آبشده عیار ۷۵۰):</strong>
                        <p className="text-[10px] text-[#98D8AF] mt-0.5">
                          خریدار تمام فاکتور را به صورت گرم طلای آبشده عیار ۷۵۰ پرداخت می‌نماید؛ نیازی به تثبیت نرخ ریالی طلا نیست.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#262634] flex items-center justify-between">
                  <span className="text-[11px] text-[#868698]">
                    محاسبه بلادرنگ بر مبنای آخرین نرخ رسمی ۱۸ عیار اتحادیه
                  </span>
                  <button
                    type="button"
                    onClick={handleCalculate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C8A951]/20 text-[#E5C365] hover:bg-[#C8A951]/30 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>محاسبه مجدد</span>
                  </button>
                </div>
              </div>

              {/* Calculator Output & Tax Breakdown */}
              <div className="lg:col-span-6 bg-gradient-to-br from-[#1A1813] via-[#15151B] to-[#121217] border border-[#C8A951]/40 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#2C2C3C] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C8A951]" />
                    <h3 className="text-sm font-bold text-[#EDEDED]">
                      تراز و ساختار رسمی فاکتور (ماده ۲۶ مالیات طلا)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
                    معافیت اصل طلا
                  </span>
                </div>

                {calcResult && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[#141418] border border-[#262634] flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[#8A8A9E] block">ارزش اصل طلای خام (معاف از مالیات):</span>
                        <span className="text-[10px] text-[#696979]">
                          {formatGrams(calcResult.weightGrams)} × {formatToman(calcResult.effectiveSpotRateToman)}
                        </span>
                      </div>
                      <span className="text-sm font-mono font-bold text-[#EDEDED]">
                        {formatToman(calcResult.goldPureValueToman)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#141418] border border-[#262634] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#8A8A9E]">اجرت ساخت خالص (پس از کسر تخفیف رتبه):</span>
                        <span className="font-mono text-[#E5C365]">
                          {formatToman(calcResult.effectiveWageToman)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#8A8A9E]">سود عمده‌فروشی دیدار:</span>
                        <span className="font-mono text-[#E5C365]">
                          {formatToman(calcResult.didarMarginToman)}
                        </span>
                      </div>

                      {/* Display item discount if active */}
                      {calcResult.itemDiscountAmountToman !== 0 && (
                        <div className="flex items-center justify-between text-xs text-[#3DD68C]">
                          <span>تعدیل قلم کالا ({calcResult.itemDiscountPercent}٪):</span>
                          <span className="font-mono font-bold">
                            {formatToman(calcResult.itemDiscountAmountToman)}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#232330] flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#A4A4B8]">جمع مشمول مالیات (اجرت + سود پس از تعدیل):</span>
                        <span className="font-mono text-[#EDEDED]">
                          {formatToman(calcResult.taxableAmountToman)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#141418] border border-[#262634] flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[#8A8A9E] block">مالیات بر ارزش افزوده (۱۰٪ روی اجرت و سود):</span>
                        <span className="text-[10px] text-[#3DD68C]">
                          طبق ماده ۲۶ قانون دائمی مالیات بر ارزش افزوده
                        </span>
                      </div>
                      <span className="text-sm font-mono font-bold text-[#FF8585]">
                        {formatToman(calcResult.vatAmountToman)}
                      </span>
                    </div>

                    {/* Display volume discount if active */}
                    {calcResult.volumeDiscountAmountToman !== 0 && (
                      <div className="p-3 rounded-xl bg-[#162119] border border-[#3DD68C]/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#3DD68C]" />
                          <span className="text-[#96D6AF]">
                            تخفیف حجمی کل خرید ({calcResult.volumeDiscountPercent}٪):
                          </span>
                        </div>
                        <span className="font-mono font-bold text-[#3DD68C]">
                          {formatToman(calcResult.volumeDiscountAmountToman)}
                        </span>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#2B2313] to-[#1C1A14] border border-[#C8A951] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C8A951]">جمع کل قابل پرداخت فاکتور:</span>
                        <span className="text-base font-bold font-mono text-[#E5C365]">
                          {formatToman(calcResult.grandTotalToman)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#9E9EA8]">
                        <span>قیمت تمام‌شده هر گرم طلا:</span>
                        <span className="font-mono font-semibold text-[#EDEDED]">
                          {formatToman(calcResult.gramEffectivePriceToman)}
                        </span>
                      </div>
                    </div>

                    {/* Split Settlement Result Card */}
                    <div className="p-3.5 rounded-xl bg-[#181824] border border-[#3E3E56] space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#2A2A3C] pb-1.5 text-xs">
                        <span className="font-bold text-[#EDEDED] flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-[#C8A951]" />
                          <span>تسهیم تسویه نهایی صورتحساب ({calcResult.settlementMode === 'split' ? 'ترکیبی' : calcResult.settlementMode === 'rial_only' ? 'نقدی ریالی' : 'طلایی خالص'})</span>
                        </span>
                        {calcResult.isQuoteLocked && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            مظنه قفل‌شده
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-[#14141A] border border-[#262634]">
                          <span className="text-[11px] text-[#8A8A9E] block mb-0.5">
                            سهم تسویه ریالی ({calcResult.rialSplitPercent}٪):
                          </span>
                          <span className="font-mono font-bold text-sm text-[#3DD68C]">
                            {formatToman(calcResult.settlementRialAmountToman)}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#14141A] border border-[#262634]">
                          <span className="text-[11px] text-[#8A8A9E] block mb-0.5">
                            سهم تسویه طلایی ({calcResult.goldSplitPercent}٪):
                          </span>
                          <span className="font-mono font-bold text-sm text-[#E5C365]">
                            {formatGrams(calcResult.settlementGoldWeightGrams750)} (عیار ۷۵۰)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#16161E] border border-[#262634] text-[11px] text-[#7E7E92]">
                      <p>{calcResult.vatLegalNoteFa}</p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setNewInvItems([
                            {
                              id: `it-${Date.now()}`,
                              sku: `SKU-CALC-${Date.now().toString().slice(-4)}`,
                              titleFa: `محصول محاسبه‌شده (${calcCategory === 'bangle' ? 'النگو' : calcCategory === 'ring' ? 'انگشتر' : calcCategory === 'necklace' ? 'سرویس' : calcCategory === 'bracelet' ? 'دستبند' : 'مصنوعات طلا'}) عیار ۷۵۰`,
                              categoryKey: calcCategory,
                              categoryFa: calcCategory === 'bangle' ? 'النگو و تک‌پوش طلا' : calcCategory === 'ring' ? 'انگشتر طلا' : calcCategory === 'necklace' ? 'سرویس و گردنبند' : 'مصنوعات طلای ۱۸ عیار',
                              carat: calcCarat,
                              weightGrams: calcResult.weightGrams,
                              wageType: calcWageType,
                              wageValue: calcWageValue,
                              itemDiscountPercent: calcItemDiscount
                            }
                          ]);
                          setNewInvVolumeDiscount(calcVolumeDiscount);
                          setNewInvSettlementMode(calcSettlementMode);
                          setNewInvRialSplit(calcRialSplit);
                          setIsInvoiceModalOpen(true);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-[#C8A951] text-[#141416] text-xs font-bold hover:brightness-110 transition-all cursor-pointer text-center"
                      >
                        صدور فاکتور از روی این محاسبه
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WAGE RULES & MARKUP MATRIX */}
          {activeTab === 'matrix' && data && (
            <div className="bg-[#15151B] border border-[#292938] rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#C8A951]" />
                  <span>ماتریس قوانین اجرت ساخت، سود عمده‌فروشی و تخفیفات رتبه‌بندی</span>
                </h3>
                <p className="text-xs text-[#8A8A9E] mt-0.5">
                  پیکربندی استانداردهای مالی و درصد اجرت برای هر رسته از مصنوعات طلا و جواهر
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-[#262634] text-[#868698]">
                      <th className="py-2.5 px-3">رسته محصول</th>
                      <th className="py-2.5 px-3">نوع اجرت</th>
                      <th className="py-2.5 px-3">اجرت مبنا</th>
                      <th className="py-2.5 px-3">سود دیدار</th>
                      <th className="py-2.5 px-3">تخفیف سطح T2</th>
                      <th className="py-2.5 px-3">تخفیف سطح T3</th>
                      <th className="py-2.5 px-3">مالیات (VAT)</th>
                      <th className="py-2.5 px-3">یادداشت فنی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222230]">
                    {data.wageRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-[#1A1A24]">
                        <td className="py-3 px-3 font-semibold text-[#EDEDED]">
                          {rule.categoryNameFa}
                        </td>
                        <td className="py-3 px-3 text-[#A4A4B8]">
                          {rule.wageType === 'percentage' ? 'درصدی (%)' : 'ثابت به ازای هر گرم'}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#E5C365]">
                          {rule.wageType === 'percentage'
                            ? `%${rule.baseWagePercent}`
                            : formatToman(rule.baseWageFixedToman)}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#EDEDED]">
                          %{rule.didarMarginPercent}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#3DD68C]">
                          {rule.wageType === 'percentage'
                            ? `-%${rule.tierDiscountPercent.T2}`
                            : `-${formatToman(rule.tierDiscountPercent.T2)}`}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#3DD68C]">
                          {rule.wageType === 'percentage'
                            ? `-%${rule.tierDiscountPercent.T3}`
                            : `-${formatToman(rule.tierDiscountPercent.T3)}`}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#EDEDED]">
                          %{rule.vatPercent} (روی اجرت و سود)
                        </td>
                        <td className="py-3 px-3 text-[11px] text-[#868698]">
                          {rule.notesFa || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: INVOICES & SAMANEH MOADDIAN */}
          {activeTab === 'invoices' && data && (
            <div className="space-y-4">
              <div className="bg-[#15151B] border border-[#292938] rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#C8A951]" />
                      <span>دفتر پیش‌فاکتورها و صورتحساب‌های الکترونیکی رسمی (سامانه مودیان)</span>
                    </h3>
                    <p className="text-xs text-[#8A8A9E] mt-0.5">
                      صدور فاکتورهای رسمی طلا با شناسه مالیاتی ۲۲ رقمی و ارسال سیستمی به کارپوشه دارایی
                    </p>
                  </div>
                  <button
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C8A951] text-[#141416] text-xs font-bold hover:brightness-110 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>صدور صورتحساب جدید</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#262634] text-[#868698]">
                        <th className="py-2.5 px-3">شماره صورتحساب</th>
                        <th className="py-2.5 px-3">نوع سند</th>
                        <th className="py-2.5 px-3">خریدار (طرف تجاری)</th>
                        <th className="py-2.5 px-3">وزن طلا</th>
                        <th className="py-2.5 px-3">نحوه تسویه و قفل مظنه</th>
                        <th className="py-2.5 px-3">تخفیف و تعدیل</th>
                        <th className="py-2.5 px-3">مبلغ کل فاکتور</th>
                        <th className="py-2.5 px-3">مالیات بر ارزش افزوده</th>
                        <th className="py-2.5 px-3">سامانه مودیان</th>
                        <th className="py-2.5 px-3">دفترکل زرین (K16)</th>
                        <th className="py-2.5 px-3 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222230]">
                      {data.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#1A1A24]">
                          <td className="py-3 px-3 font-mono font-bold text-[#EDEDED]">
                            {inv.invoiceNumber}
                            {inv.orderCode && (
                              <span className="block text-[10px] text-[#7A7A8E]">{inv.orderCode}</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                inv.invoiceType === 'official_tax_invoice'
                                  ? 'bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30'
                                  : 'bg-[#292938] text-[#A6A6B8]'
                              }`}
                            >
                              {inv.invoiceType === 'official_tax_invoice' ? 'رسمی مودیان' : 'پیش‌فاکتور'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-[#EDEDED]">{inv.buyerNameFa}</span>
                            <span className="block text-[10px] text-[#7A7A8E] font-mono">
                              شناسه ملی: {inv.buyerNationalId}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-[#EDEDED]">
                            {formatGrams(inv.totalWeightGrams)}
                          </td>
                          {/* Settlement Mode & Quote Lock column */}
                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                inv.settlementMode === 'split'
                                  ? 'bg-[#E5A84B]/15 text-[#E5C365] border border-[#E5A84B]/30'
                                  : inv.settlementMode === 'rial_only'
                                  ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                                  : 'bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30'
                              }`}>
                                {inv.settlementMode === 'split'
                                  ? `ترکیبی (${inv.rialSplitPercent || 40}٪ ریالی / ${100 - (inv.rialSplitPercent || 40)}٪ طلا)`
                                  : inv.settlementMode === 'rial_only'
                                  ? '۱۰۰٪ ریالی'
                                  : '۱۰۰٪ حواله طلا'}
                              </span>
                              {inv.quoteLockId && (
                                <span className="flex items-center gap-1 text-[10px] text-[#3DD68C] font-mono">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>{inv.quoteLockId}</span>
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Discounts Column */}
                          <td className="py-3 px-3">
                            {((inv.volumeDiscountPercent && inv.volumeDiscountPercent !== 0) ||
                              (inv.items && inv.items[0]?.itemDiscountPercent && inv.items[0].itemDiscountPercent !== 0)) ? (
                              <div className="space-y-0.5 text-[10px] font-mono">
                                {inv.volumeDiscountPercent && inv.volumeDiscountPercent !== 0 && (
                                  <span className="block text-[#3DD68C]">
                                    حجمی: {inv.volumeDiscountPercent > 0 ? `+${inv.volumeDiscountPercent}٪` : `${inv.volumeDiscountPercent}٪`}
                                  </span>
                                )}
                                {inv.items && inv.items[0]?.itemDiscountPercent && inv.items[0].itemDiscountPercent !== 0 && (
                                  <span className="block text-[#E5C365]">
                                    قلم: {inv.items[0].itemDiscountPercent > 0 ? `+${inv.items[0].itemDiscountPercent}٪` : `${inv.items[0].itemDiscountPercent}٪`}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#6E6E82]">بدون تخفیف</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-[#E5C365]">
                            {formatToman(inv.grandTotalToman)}
                          </td>
                          <td className="py-3 px-3 font-mono text-[#FF8585]">
                            {formatToman(inv.totalVatToman)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                inv.moaddianStatus === 'verified'
                                  ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                                  : 'bg-[#E5A84B]/15 text-[#E5A84B] border border-[#E5A84B]/30'
                              }`}
                            >
                              {inv.moaddianStatusFa}
                            </span>
                          </td>
                          {/* Zarrin GL Voucher & Automated Delivery status */}
                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              {inv.deliveryStatus === 'delivered_to_zarrin' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
                                  <PackageCheck className="w-3 h-3 text-[#3DD68C]" />
                                  <span>تحویل زرین شد</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E5A84B]/15 text-[#E5A84B] border border-[#E5A84B]/30">
                                  <Clock className="w-3 h-3 text-[#E5A84B]" />
                                  <span>در انتظار نهایی‌سازی</span>
                                </span>
                              )}

                              {inv.k15VoucherRecorded && (
                                <div className="text-[9px] font-mono text-[#E5C365] bg-[#C8A951]/10 px-1 py-0.5 rounded border border-[#C8A951]/20">
                                  سند دوبل K15: {inv.k15VoucherRecorded.voucherNumber}
                                </div>
                              )}
                              {inv.zarrinVoucher && !inv.k15VoucherRecorded && (
                                <div className="text-[9px] font-mono text-[#8C9BAE]">
                                  سند زرین: {inv.zarrinVoucher.voucherNumber}
                                </div>
                              )}
                              {inv.zarrinDeliveryReceiptNumber && (
                                <span className="block text-[9px] font-mono text-[#3DD68C]">
                                  {inv.zarrinDeliveryReceiptNumber}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => setViewingInvoice(inv)}
                                className="p-1.5 rounded-lg bg-[#20202D] hover:bg-[#2B2B3C] text-[#EDEDED] transition-colors cursor-pointer"
                                title="مشاهده سند رسمی"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {inv.moaddianStatus !== 'verified' && (
                                <button
                                  onClick={() => handleSendMoaddian(inv.id)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#3DD68C]/15 hover:bg-[#3DD68C]/25 text-[#3DD68C] border border-[#3DD68C]/30 text-[10px] font-bold transition-colors cursor-pointer"
                                  title="ارسال مستقیم به سامانه مودیان"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>ارسال مودیان</span>
                                </button>
                              )}

                              {inv.deliveryStatus !== 'delivered_to_zarrin' && (
                                <button
                                  onClick={() => openFinalizeModal(inv)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#C8A951]/15 hover:bg-[#C8A951]/25 text-[#E5C365] border border-[#C8A951]/30 text-[10px] font-bold transition-colors cursor-pointer shadow-sm"
                                  title="نهایی‌سازی فاکتور، بررسی سقف اعتباری K14 و تحویل خودکار اقلام به زرین"
                                >
                                  <PackageCheck className="w-3 h-3 text-[#E5C365]" />
                                  <span>تحویل زرین</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION: TAX CONSOLIDATION PERIODS (تجمیع فصلی مالیات بر ارزش افزوده طلا ماده ۲۶) */}
              {data.taxConsolidations && data.taxConsolidations.length > 0 && (
                <div className="bg-[#15151B] border border-[#292938] rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#C8A951]" />
                        <span>گزارش تجمیع فصلی مالیات بر ارزش افزوده طلا (اظهارنامه دوره‌ای ماده ۲۶)</span>
                      </h3>
                      <p className="text-xs text-[#8A8A9E] mt-0.5">
                        تفکیک اصل طلا (معاف از مالیات) از اجرت و سود (مشمول مالیات ۱۰٪) جهت اظهار مستقیم به سازمان امور مالیاتی
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.taxConsolidations.map((tc) => (
                      <div
                        key={tc.periodId}
                        className="bg-[#181822] border border-[#2B2B3C] rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-[#262638] pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#EDEDED]">{tc.titleFa}</span>
                            <span className="text-[10px] font-mono text-[#8A8A9E]">({tc.periodId})</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tc.status === 'declared_to_tax_authority'
                              ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                              : 'bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30'
                          }`}>
                            {tc.statusFa}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-[#12121A] border border-[#242434] space-y-1">
                            <span className="text-[10px] text-[#8C8C9E] block">تعداد صورتحساب‌ها:</span>
                            <span className="font-mono font-bold text-[#EDEDED]">{tc.totalInvoicesCount} فقره</span>
                            <div className="text-[9px] text-[#3DD68C] font-mono pt-1">
                              مودیان: {tc.moaddianDeclaredCount} ارسال‌شده | {tc.moaddianPendingCount} در انتظار
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-[#12121A] border border-[#242434] space-y-1">
                            <span className="text-[10px] text-[#8C8C9E] block">کل وزن طلای خام:</span>
                            <span className="font-mono font-bold text-[#E5C365]">{formatGrams(tc.totalPureGoldGrams)}</span>
                            <div className="text-[9px] text-[#8C8C9E] pt-1">
                              ارزش: {formatToman(tc.totalPureGoldValueToman)} (معاف ماده ۲۶)
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-[#12121A] border border-[#242434] space-y-1">
                            <span className="text-[10px] text-[#8C8C9E] block">ماخذ مشمول مالیات (اجرت+سود-تخفیف):</span>
                            <span className="font-mono font-bold text-[#EDEDED]">{formatToman(tc.taxableNetBaseToman)}</span>
                            <div className="text-[9px] text-[#3DD68C] pt-1 font-mono">
                              تخفیفات اعطایی: {formatToman(tc.totalDiscountsToman)}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-[#1D1714] border border-[#E5A84B]/30 space-y-1">
                            <span className="text-[10px] text-[#E5A84B] block font-bold">مالیات بر ارزش افزوده وصولی (۱۰٪):</span>
                            <span className="font-mono font-bold text-sm text-[#FF8585]">{formatToman(tc.totalVatCollectedToman)}</span>
                            <div className="text-[9px] text-[#A6A6B8] pt-1">
                              ماده ۲۶: ۱۰٪ روی اجرت و سود
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL: VIEW OFFICIAL INVOICE */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#181822] border border-[#C8A951]/40 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-4 my-8">
            {/* Modal Header */}
            <div className="bg-[#121218] p-4 border-b border-[#282838] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#C8A951]" />
                <h3 className="text-sm font-bold text-[#EDEDED]">
                  صورتحساب الکترونیکی رسمی طلا (نوع اول) - سامانه مودیان
                </h3>
              </div>
              <button
                onClick={() => setViewingInvoice(null)}
                className="text-[#888899] hover:text-[#EDEDED] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Body Printable Layout */}
            <div className="p-6 space-y-6 text-xs text-[#EDEDED] bg-[#14141A]">
              {/* Header Box */}
              <div className="border border-[#38384C] rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 bg-[#181822]">
                <div>
                  <h4 className="text-base font-bold text-[#E5C365]">
                    {viewingInvoice.sellerNameFa}
                  </h4>
                  <p className="text-[11px] text-[#8C8C9E] mt-0.5">
                    شماره اقتصادی: {viewingInvoice.sellerEconomicCode} | شناسه ملی: {viewingInvoice.sellerNationalId}
                  </p>
                  <p className="text-[11px] text-[#7A7A8E] mt-0.5">{viewingInvoice.sellerAddressFa}</p>
                </div>
                <div className="text-left font-mono space-y-1 sm:border-r sm:border-[#2C2C3C] sm:pr-4">
                  <div>
                    <span className="text-[#8C8C9E]">شماره فاکتور: </span>
                    <span className="font-bold text-[#EDEDED]">{viewingInvoice.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8C9E]">تاریخ صدور: </span>
                    <span>{viewingInvoice.issueDateFa}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8C9E]">شناسه مالیاتی (مودیان): </span>
                    <span className="text-[#3DD68C] text-[10px] break-all">{viewingInvoice.taxIdentificationNumber}</span>
                  </div>
                </div>
              </div>

              {/* Buyer Box */}
              <div className="border border-[#2C2C3C] rounded-xl p-3.5 bg-[#161620]">
                <span className="text-[10px] text-[#C8A951] font-bold block mb-1">مشخصات خریدار:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[#8C8C9E]">نام خریدار: </span>
                    <span className="font-semibold">{viewingInvoice.buyerNameFa}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8C9E]">شناسه ملی: </span>
                    <span className="font-mono">{viewingInvoice.buyerNationalId}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8C9E]">کد اقتصادی: </span>
                    <span className="font-mono">{viewingInvoice.buyerEconomicCode}</span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-[#8C8C9E]">نشانی: </span>
                    <span>{viewingInvoice.buyerAddressFa}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-[#2C2C3C] rounded-xl overflow-x-auto">
                <table className="w-full text-right text-xs whitespace-nowrap min-w-[700px]">
                  <thead className="bg-[#1C1C28] text-[#8C8C9E]">
                    <tr>
                      <th className="py-2.5 px-3">ردیف</th>
                      <th className="py-2.5 px-3">کد کالا</th>
                      <th className="py-2.5 px-3">شرح قلم کالا</th>
                      <th className="py-2.5 px-3">عیار</th>
                      <th className="py-2.5 px-3">وزن (گرم)</th>
                      <th className="py-2.5 px-3">قیمت واحد (گرم)</th>
                      <th className="py-2.5 px-3">تخفیف خطی</th>
                      <th className="py-2.5 px-3">ارزش طلای خام</th>
                      <th className="py-2.5 px-3">ماخذ اجرت و سود</th>
                      <th className="py-2.5 px-3">مالیات (۱۰٪)</th>
                      <th className="py-2.5 px-3">مبلغ کل نهایی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262638]">
                    {viewingInvoice.items.map((it, idx) => {
                      const lineDisc = it.lineDiscountPercent !== undefined ? it.lineDiscountPercent : it.itemDiscountPercent;
                      return (
                        <tr key={it.id} className="hover:bg-[#1A1A26]">
                          <td className="py-2.5 px-3 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono text-[#E5C365]">{it.productCode || it.sku}</td>
                          <td className="py-2.5 px-3 font-medium text-[#EDEDED]">{it.titleFa}</td>
                          <td className="py-2.5 px-3 font-mono">{it.carat}</td>
                          <td className="py-2.5 px-3 font-mono font-bold">{it.weightGrams}</td>
                          <td className="py-2.5 px-3 font-mono text-[#A6A6B8]">{formatToman(it.unitPriceToman)}</td>
                          <td className="py-2.5 px-3 font-mono">
                            {lineDisc !== 0 ? (
                              <span className={lineDisc < 0 ? 'text-[#3DD68C]' : 'text-[#E5A84B]'}>
                                {lineDisc > 0 ? `+${lineDisc}٪` : `${lineDisc}٪`}
                              </span>
                            ) : (
                              <span className="text-[#6A6A7E]">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono">{formatToman(it.goldPureValueToman)}</td>
                          <td className="py-2.5 px-3 font-mono">{formatToman(it.taxableAmountToman)}</td>
                          <td className="py-2.5 px-3 font-mono text-[#FF8585]">{formatToman(it.vatAmountToman)}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#E5C365]">{formatToman(it.totalPriceToman)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#181822] border border-[#2C2C3C] space-y-2 text-[11px] text-[#8C8C9E]">
                  <p><strong>قانون حاکم:</strong> ماده ۲۶ قانون دائمی مالیات بر ارزش افزوده</p>
                  <p><strong>وضعیت سامانه مودیان:</strong> {viewingInvoice.moaddianStatusFa}</p>
                  {viewingInvoice.moaddianTrackingCode && (
                    <p><strong>کد رهگیری مالیاتی:</strong> <span className="font-mono text-[#3DD68C]">{viewingInvoice.moaddianTrackingCode}</span></p>
                  )}
                  {viewingInvoice.quoteLockId && (
                    <div className="pt-1.5 border-t border-[#262634] text-[#E5C365]">
                      <span className="flex items-center gap-1 font-bold">
                        <Lock className="w-3.5 h-3.5 text-[#C8A951]" />
                        <span>شناسه قفل مظنه ریالی: </span>
                        <span className="font-mono text-[#3DD68C]">{viewingInvoice.quoteLockId}</span>
                      </span>
                      {viewingInvoice.spotRateLockedAt && (
                        <p className="text-[10px] text-[#A6A6B8] mt-0.5">
                          نرخ مظنه تضمین‌شده: {formatToman(viewingInvoice.spotRateLockedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-[#1C1A14] border border-[#C8A951]/40 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8C8C9E]">مجموع ارزش طلای خام:</span>
                    <span>{formatToman(viewingInvoice.totalPureGoldValueToman)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C8C9E]">مجموع اجرت و سود:</span>
                    <span>{formatToman(viewingInvoice.totalTaxableAmountToman)}</span>
                  </div>

                  {/* Volume discount in totals */}
                  {viewingInvoice.volumeDiscountPercent && viewingInvoice.volumeDiscountPercent !== 0 && (
                    <div className="flex justify-between text-[#3DD68C]">
                      <span>تخفیف حجمی کل فاکتور ({viewingInvoice.volumeDiscountPercent}٪):</span>
                      <span>{viewingInvoice.volumeDiscountPercent > 0 ? `+${viewingInvoice.volumeDiscountPercent}٪` : `${viewingInvoice.volumeDiscountPercent}٪`}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#FF8585]">
                    <span>مالیات ارزش افزوده (۱۰٪):</span>
                    <span>{formatToman(viewingInvoice.totalVatToman)}</span>
                  </div>
                  <div className="pt-2 border-t border-[#3A321E] flex justify-between font-bold text-sm text-[#E5C365]">
                    <span>جمع کل صورتحساب:</span>
                    <span>{formatToman(viewingInvoice.grandTotalToman)}</span>
                  </div>
                </div>
              </div>

              {/* Settlement Split Official Breakdown Box */}
              <div className="p-4 rounded-xl bg-[#171722] border border-[#3A3A52] space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#2C2C40] pb-2">
                  <span className="font-bold text-[#E5C365] flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#C8A951]" />
                    <span>شیوه تسویه حساب و تسهیم مبالغ (تعهدات طرفین معامله)</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    viewingInvoice.settlementMode === 'split'
                      ? 'bg-[#E5A84B]/15 text-[#E5C365] border border-[#E5A84B]/30'
                      : viewingInvoice.settlementMode === 'rial_only'
                      ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                      : 'bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30'
                  }`}>
                    {viewingInvoice.settlementMode === 'split'
                      ? 'تسویه ترکیبی ریالی/طلایی'
                      : viewingInvoice.settlementMode === 'rial_only'
                      ? 'تسویه ۱۰۰٪ ریالی با قفل مظنه'
                      : 'تسویه ۱۰۰٪ طلای آبشده عیار ۷۵۰'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#12121A] border border-[#282838]">
                    <span className="text-[11px] text-[#8C8C9E] block mb-1">
                      سهم تسویه نقدی ریالی ({viewingInvoice.rialSplitPercent || 0}٪):
                    </span>
                    <span className="font-mono font-bold text-sm text-[#3DD68C]">
                      {viewingInvoice.settlementRialAmountToman ? formatToman(viewingInvoice.settlementRialAmountToman) : '—'}
                    </span>
                    <span className="block text-[10px] text-[#6E6E82] mt-1">
                      واریز به حساب شبای اعلامی پلتفرم دیدار با شناسه واریز
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#12121A] border border-[#282838]">
                    <span className="text-[11px] text-[#8C8C9E] block mb-1">
                      سهم تسویه حواله طلا ({viewingInvoice.goldSplitPercent || 0}٪):
                    </span>
                    <span className="font-mono font-bold text-sm text-[#E5C365]">
                      {viewingInvoice.settlementGoldWeightGrams750 ? formatGrams(viewingInvoice.settlementGoldWeightGrams750) : '—'} (عیار ۷۵۰)
                    </span>
                    <span className="block text-[10px] text-[#6E6E82] mt-1">
                      انتقال از موجودی کارت طلای آبشده یا حواله فیزیکی بنکداری
                    </span>
                  </div>
                </div>
              </div>

              {/* Zarrin Module (K16) Integration & Double-Entry Accounting Voucher */}
              {viewingInvoice.zarrinVoucher && (
                <div className="p-4 rounded-xl bg-[#131722] border border-[#3E5C76]/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#253248] pb-2">
                    <span className="font-bold text-[#64B5F6] flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-[#64B5F6]" />
                      <span>سند حسابداری دوبل ماژول تسویه زرین (K16 General Ledger)</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      viewingInvoice.zarrinVoucher.status === 'posted_to_zarrin'
                        ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                        : viewingInvoice.zarrinVoucher.status === 'reconciled'
                        ? 'bg-[#64B5F6]/15 text-[#64B5F6] border border-[#64B5F6]/30'
                        : 'bg-[#E5A84B]/15 text-[#E5A84B] border border-[#E5A84B]/30'
                    }`}>
                      {viewingInvoice.zarrinVoucher.statusFa}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#0F131D] border border-[#212E42] space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#8C9BAE]">شماره سند حسابداری:</span>
                        <span className="font-mono text-[#EDEDED] font-bold">{viewingInvoice.zarrinVoucher.voucherNumber}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#8C9BAE]">تاریخ صدور سند:</span>
                        <span className="font-mono text-[#EDEDED]">{viewingInvoice.zarrinVoucher.voucherDateFa}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#8C9BAE]">بچ حسابداری K16:</span>
                        <span className="font-mono text-[#64B5F6]">{viewingInvoice.zarrinVoucher.zarrinBatchId}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0F131D] border border-[#212E42] space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#8C9BAE]">حساب بدهکار ریالی:</span>
                        <span className="text-[#3DD68C] font-mono text-[10px]">{viewingInvoice.zarrinVoucher.rialDebitAccount}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#8C9BAE]">مبلغ ریالی بدهکار:</span>
                        <span className="font-mono text-[#3DD68C] font-bold">{formatToman(viewingInvoice.zarrinVoucher.rialAmountToman)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#8C9BAE]">حساب طلایی بدهکار:</span>
                        <span className="text-[#E5C365] font-mono text-[10px]">{viewingInvoice.zarrinVoucher.goldDebitAccount}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#8C9BAE]">وزن کاردکس طلایی:</span>
                        <span className="font-mono text-[#E5C365] font-bold">{formatGrams(viewingInvoice.zarrinVoucher.goldWeightGrams750)} (۷۵۰)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* K14 Governance & Automated Zarrin Goods Delivery Card */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                viewingInvoice.deliveryStatus === 'delivered_to_zarrin'
                  ? 'bg-[#0E1A14] border-[#2E7D4E]/60'
                  : 'bg-[#1C1814] border-[#C8A951]/40'
              }`}>
                <div className="flex items-center justify-between border-b border-[#28382A] pb-2">
                  <div className="flex items-center gap-2">
                    <PackageCheck className={`w-4 h-4 ${
                      viewingInvoice.deliveryStatus === 'delivered_to_zarrin' ? 'text-[#3DD68C]' : 'text-[#E5C365]'
                    }`} />
                    <span className="font-bold text-sm text-[#EDEDED]">
                      وضعیت انبار و تحویل کالا به زرین (اتصال K13 ↔ K14 ↔ K16)
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    viewingInvoice.deliveryStatus === 'delivered_to_zarrin'
                      ? 'bg-[#3DD68C]/20 text-[#3DD68C] border border-[#3DD68C]/40'
                      : 'bg-[#E5A84B]/20 text-[#E5A84B] border border-[#E5A84B]/40'
                  }`}>
                    {viewingInvoice.deliveryStatus === 'delivered_to_zarrin'
                      ? 'کالاها به‌طور خودکار در کاردکس زرین تحویل شدند'
                      : 'در انتظار نهایی‌سازی فاکتور و کنترل اعتباری K14'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#141A16] border border-[#1E2E22] space-y-1">
                    <span className="text-[10px] text-[#8C9E90] block">شماره رسید تحویل به زرین:</span>
                    <span className="font-mono font-bold text-[#EDEDED] text-xs">
                      {viewingInvoice.zarrinDeliveryReceiptNumber || 'پس از نهایی‌سازی تولید می‌شود'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#141A16] border border-[#1E2E22] space-y-1">
                    <span className="text-[10px] text-[#8C9E90] block">تاریخ و ساعت تحویل کالاها:</span>
                    <span className="font-mono text-[#EDEDED] text-xs">
                      {viewingInvoice.zarrinDeliveryDateFa || '—'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#141A16] border border-[#1E2E22] space-y-1">
                    <span className="text-[10px] text-[#8C9E90] block">ثبت مواجهه در ماژول K14:</span>
                    <span className={`font-bold text-xs ${
                      viewingInvoice.k14ExposureRecorded ? 'text-[#3DD68C]' : 'text-[#E5A84B]'
                    }`}>
                      {viewingInvoice.k14ExposureRecorded ? 'مواجهه دوگانه طلا و ریال اعمال شد' : 'در انتظار اعمال'}
                    </span>
                  </div>
                </div>

                {viewingInvoice.items && (
                  <div className="pt-2 border-t border-[#243428] text-[11px] text-[#8C9E90] flex items-center justify-between">
                    <span>تعداد {viewingInvoice.items.length} قلم کالا (مجموع {formatGrams(viewingInvoice.totalWeightGrams)}) تحت پایش کاردکس انبار زرین</span>
                    <span className="text-[10px] text-[#3DD68C] font-mono">پروتکل همگام‌سازی لحظه‌ای K13-K14 فعال</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-[#121218] p-4 border-t border-[#282838] flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#252536] hover:bg-[#303046] text-[#EDEDED] text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>چاپ فاکتور رسمی</span>
              </button>

              <div className="flex items-center gap-2">
                {viewingInvoice.deliveryStatus !== 'delivered_to_zarrin' && (
                  <button
                    onClick={() => {
                      const targetInv = viewingInvoice;
                      setViewingInvoice(null);
                      openFinalizeModal(targetInv);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C8A951] text-[#141416] text-xs font-bold hover:brightness-110 cursor-pointer shadow-md"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>نهایی‌سازی فاکتور و تحویل خودکار به زرین</span>
                  </button>
                )}

                {viewingInvoice.moaddianStatus !== 'verified' && (
                  <button
                    onClick={() => handleSendMoaddian(viewingInvoice.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3DD68C] text-[#141416] text-xs font-bold hover:brightness-110 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ارسال نهایی به سامانه مودیان</span>
                  </button>
                )}
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-[#282836] text-[#EDEDED] text-xs font-semibold hover:bg-[#323246] cursor-pointer"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRE-FLIGHT K14 CREDIT SIMULATION & AUTO-DELIVERY TO ZARRIN */}
      {selectedInvForFinalize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#181822] border border-[#C8A951]/60 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 my-8">
            <div className="bg-[#121218] p-4 border-b border-[#282838] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-[#C8A951]" />
                <div>
                  <h3 className="text-sm font-bold text-[#EDEDED]">
                    نهایی‌سازی فاکتور و تحویل خودکار به زرین (کنترل اعتباری K14)
                  </h3>
                  <p className="text-[11px] text-[#8A8A9E]">
                    صورتحساب شماره {selectedInvForFinalize.invoiceNumber} | خریدار: {selectedInvForFinalize.buyerNameFa}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvForFinalize(null)}
                className="p-1 rounded-lg hover:bg-[#252536] text-[#8A8A9E] hover:text-[#EDEDED] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Order & Delivery Summary */}
              <div className="p-3.5 rounded-xl bg-[#131720] border border-[#233144] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8A9EB5]">اقلام مشمول تحویل به زرین:</span>
                  <span className="font-bold text-[#EDEDED]">{selectedInvForFinalize.items?.length || 1} ردیف کالا</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8A9EB5]">مجموع وزن طلای اقلام:</span>
                  <span className="font-mono font-bold text-[#E5C365]">{formatGrams(selectedInvForFinalize.totalWeightGrams)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8A9EB5]">مبلغ کل صورتحساب:</span>
                  <span className="font-mono font-bold text-[#3DD68C]">{formatToman(selectedInvForFinalize.grandTotalToman)}</span>
                </div>
              </div>

              {/* Simulation Result */}
              {simulatingFinalize ? (
                <div className="p-6 text-center text-xs text-[#8A8A9E] flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C8A951]" />
                  <span>در حال استعلام وضعیت اعتباری خریدار از هسته K14...</span>
                </div>
              ) : finalizeSimulation ? (
                <div className="space-y-3">
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    finalizeSimulation.approved
                      ? 'bg-[#0F1C16] border-[#2A8555]/50'
                      : 'bg-[#221415] border-[#A83838]/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {finalizeSimulation.approved ? (
                          <ShieldCheck className="w-5 h-5 text-[#3DD68C]" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-[#FF6B6B]" />
                        )}
                        <span className={`text-xs font-bold ${
                          finalizeSimulation.approved ? 'text-[#3DD68C]' : 'text-[#FF6B6B]'
                        }`}>
                          {finalizeSimulation.statusFa}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8A8A9E]">
                        رتبه اعتباری: {finalizeSimulation.buyerTier}
                      </span>
                    </div>
                    <p className="text-xs text-[#C6C6D8] leading-relaxed">
                      {finalizeSimulation.message}
                    </p>
                  </div>

                  {/* Dual-currency Limit vs Utilization comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#14141E] border border-[#262638] space-y-2">
                      <span className="text-[11px] font-bold text-[#E5C365] block">
                        سقف اعتباری وزنی طلا (K14):
                      </span>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#8A8A9E]">مواجهه فعلی:</span>
                        <span className="font-mono text-[#EDEDED]">{formatGrams(finalizeSimulation.currentGoldExposureGrams)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#8A8A9E]">افزایش با این فاکتور:</span>
                        <span className="font-mono text-[#E5C365] font-bold">+{formatGrams(finalizeSimulation.goldExposureIncreaseGrams)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] pt-1 border-t border-[#202030]">
                        <span className="text-[#8A8A9E]">درصد بهره‌برداری جدید:</span>
                        <span className={`font-mono font-bold ${
                          finalizeSimulation.projectedGoldUtilizationPercent > 100 ? 'text-[#FF6B6B]' : 'text-[#3DD68C]'
                        }`}>
                          {finalizeSimulation.projectedGoldUtilizationPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#14141E] border border-[#262638] space-y-2">
                      <span className="text-[11px] font-bold text-[#3DD68C] block">
                        سقف اعتباری ریالی (K14):
                      </span>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#8A8A9E]">مواجهه فعلی:</span>
                        <span className="font-mono text-[#EDEDED]">{formatToman(finalizeSimulation.currentRialExposureToman)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#8A8A9E]">افزایش با این فاکتور:</span>
                        <span className="font-mono text-[#3DD68C] font-bold">+{formatToman(finalizeSimulation.rialExposureIncreaseToman)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] pt-1 border-t border-[#202030]">
                        <span className="text-[#8A8A9E]">درصد بهره‌برداری جدید:</span>
                        <span className={`font-mono font-bold ${
                          finalizeSimulation.projectedRialUtilizationPercent > 100 ? 'text-[#FF6B6B]' : 'text-[#3DD68C]'
                        }`}>
                          {finalizeSimulation.projectedRialUtilizationPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* What happens on confirmation */}
                  <div className="p-3 rounded-lg bg-[#181824] border border-[#2A2A3C] space-y-1.5 text-xs text-[#A6A6B8]">
                    <span className="font-bold text-[#EDEDED] block text-[11px]">
                      فرآیندهای خودکار پس از تایید:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-[#A6A6B8]">
                      <li>کلیه اقلام فاکتور بلافاصله به وضعیت «تحویل به زرین شده» منتقل می‌گردند.</li>
                      <li>شماره رهگیری و رسید رسمی تحویل کالا به زرین (REC-ZR-...) صادر می‌شود.</li>
                      <li>مواجهه ریالی و وزنی خریدار در هسته K14 به‌صورت بلادرنگ ثبت و به‌روزرسانی خواهد شد.</li>
                      <li>سند حسابداری دوبل انبار و مطالبات در دفترکل زرین ثبت می‌گردد.</li>
                    </ul>
                  </div>

                  {/* Override Mode Input if limit exceeded */}
                  {(!finalizeSimulation.approved || forceOverrideMode) && (
                    <div className="p-3.5 rounded-xl bg-[#281818] border border-[#FF6B6B]/40 space-y-2">
                      <div className="flex items-center gap-2 text-[#FF6B6B] text-xs font-bold">
                        <AlertCircle className="w-4 h-4" />
                        <span>نیاز به تایید کمیته ریسک و ثبت مجوز استثنا (Four-Eyes Principle)</span>
                      </div>
                      <p className="text-[11px] text-[#D8B4B4]">
                        سقف اعتباری مشتری تکمیل است. جهت دور زدن محدودیت و صدور مجوز موقت، علت و مصوبه مربوطه را وارد کنید:
                      </p>
                      <input
                        type="text"
                        value={forceOverrideReason}
                        onChange={(e) => setForceOverrideReason(e.target.value)}
                        placeholder="علت استثنا (مثال: مصوبه شماره ۴۰۲ کمیته اعتبارات با تایید اسناد تجاری مضاعف)"
                        className="w-full px-3 py-2 rounded-lg bg-[#1A1212] border border-[#522828] text-xs text-[#EDEDED] focus:outline-none focus:border-[#FF6B6B]"
                      />
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Actions */}
            <div className="bg-[#121218] p-4 border-t border-[#282838] flex items-center justify-between">
              <button
                onClick={() => setSelectedInvForFinalize(null)}
                className="px-4 py-2 rounded-xl bg-[#282836] text-[#EDEDED] text-xs font-semibold hover:bg-[#323246] cursor-pointer"
              >
                انصراف
              </button>

              <div className="flex items-center gap-2">
                {finalizeSimulation?.approved ? (
                  <button
                    onClick={() => handleConfirmFinalizeWithK14(false)}
                    disabled={finalizingK14}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3DD68C] text-[#141416] text-xs font-bold hover:brightness-110 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {finalizingK14 ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <PackageCheck className="w-4 h-4" />
                    )}
                    <span>تایید نهایی‌سازی و تحویل قطعی به زرین</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleConfirmFinalizeWithK14(true)}
                    disabled={finalizingK14 || !forceOverrideReason.trim()}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FF6B6B] text-white text-xs font-bold hover:brightness-110 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {finalizingK14 ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldAlert className="w-4 h-4" />
                    )}
                    <span>نهایی‌سازی با مجوز استثنا و تحویل به زرین</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* MODAL: CREATE PRICE QUOTE LOCK */}
      {isLockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-[#181822] border border-[#C8A951]/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4">
            <div className="bg-[#121218] p-4 border-b border-[#282838] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#C8A951]" />
                <h3 className="text-sm font-bold text-[#EDEDED]">قفل مظنه طلا (Price Quote Lock)</h3>
              </div>
              <button onClick={() => setIsLockModalOpen(false)} className="text-[#888899] hover:text-[#EDEDED] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLock} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-[#8A8A9E] block mb-1">نام طرف تجاری (طلافروشی خریدار):</label>
                <input
                  type="text"
                  required
                  value={lockBuyerName}
                  onChange={(e) => setLockBuyerName(e.target.value)}
                  className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-[#EDEDED] focus:border-[#C8A951] outline-none"
                />
              </div>

              <div>
                <label className="text-[#8A8A9E] block mb-1">وزن مورد نظر برای معامله (گرم):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={lockWeight}
                  onChange={(e) => setLockWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                />
              </div>

              <div>
                <label className="text-[#8A8A9E] block mb-1">مدت زمان اعتبار قفل مظنه:</label>
                <select
                  value={lockValidityMin}
                  onChange={(e) => setLockValidityMin(parseInt(e.target.value))}
                  className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                >
                  <option value={3}>۳ دقیقه (بازار پرتلاطم)</option>
                  <option value={5}>۵ دقیقه (استاندارد پلتفرم دیدار)</option>
                  <option value={10}>۱۰ دقیقه (سفارش‌های بنکداری سنگین)</option>
                </select>
              </div>

              <div>
                <label className="text-[#8A8A9E] block mb-1">علت و عنوان قفل:</label>
                <input
                  type="text"
                  value={lockPurpose}
                  onChange={(e) => setLockPurpose(e.target.value)}
                  className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-[#EDEDED] focus:border-[#C8A951] outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#141418] border border-[#262634] text-[11px] text-[#A6A6B8]">
                <span>نرخ قفل‌شونده مبنا: </span>
                <span className="font-bold text-[#E5C365]">
                  {data ? formatToman(data.metrics.current18kPriceToman) : '—'}
                </span>
                <span className="block text-[10px] text-[#7A7A8E] mt-0.5">
                  توکن رمزنگاری‌شده SHA-256 تولید و به طرف تجاری ابلاغ خواهد شد.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#282836] text-[#EDEDED] font-semibold hover:bg-[#323246] cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C8A951] text-[#141416] font-bold hover:brightness-110 cursor-pointer shadow-md shadow-[#C8A951]/20"
                >
                  تأیید و قفل مظنه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE INVOICE (MULTI-ITEM GOLD INVOICE BUILDER) */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#161620] border border-[#C8A951]/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="bg-[#101016] p-4 border-b border-[#262638] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-[#C8A951]" />
                <div>
                  <h3 className="text-sm font-bold text-[#EDEDED]">صدور صورتحساب چندقلمی طلا (K13 Multi-Item Invoice Builder)</h3>
                  <p className="text-[11px] text-[#8C8C9E]">انطباق کامل با ماده ۲۶ مالیات ارزش افزوده و ثبت خودکار در دفترکل دوبل زرین (K16 GL)</p>
                </div>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1.5 rounded-lg text-[#888899] hover:text-[#EDEDED] hover:bg-[#222230] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateInvoice} className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* SECTION 1: BUYER SELECTION & METADATA */}
              <div className="bg-[#12121A] border border-[#242436] rounded-xl p-4 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202030] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#C8A951]" />
                    <span className="font-bold text-[#EDEDED] text-xs">مشخصات طرف تجاری و خریدار فاکتور</span>
                  </div>

                  {/* Preset Buyer Quick Select */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#8C8C9E]">انتخاب سریع همکار:</span>
                    <select
                      value={newInvBuyerOrgId}
                      onChange={(e) => handleSelectBuyerTemplate(e.target.value)}
                      className="bg-[#1C1C28] border border-[#333346] rounded-lg px-2.5 py-1 text-[11px] text-[#E5C365] focus:border-[#C8A951] outline-none cursor-pointer"
                    >
                      {BUYER_TEMPLATES.map((t) => (
                        <option key={t.orgId} value={t.orgId}>
                          {t.nameFa} ({t.tier})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[#8A8A9E] block mb-1">نوع صورتحساب:</label>
                    <select
                      value={newInvType}
                      onChange={(e) => setNewInvType(e.target.value as any)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer font-bold"
                    >
                      <option value="official_tax_invoice">صورتحساب الکترونیکی رسمی مودیان (نوع ۱)</option>
                      <option value="proforma">پیش‌فاکتور تجاری با مهلت تسویه</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#8A8A9E] block mb-1">نام کامل خریدار (گالری/بنکداری):</label>
                    <input
                      type="text"
                      required
                      value={newInvBuyerName}
                      onChange={(e) => setNewInvBuyerName(e.target.value)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-[#EDEDED] focus:border-[#C8A951] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[#8A8A9E] block mb-1">سطح اعتباری همکار (Tier):</label>
                    <select
                      value={newInvBuyerTier}
                      onChange={(e) => setNewInvBuyerTier(e.target.value as any)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                    >
                      <option value="T1">سطح ویژه T1 (حداکثر تخفیف و اعتبار بازرگانی)</option>
                      <option value="T2">سطح متوسط T2 (گالری‌های معتبر با تسویه دوره‌ای)</option>
                      <option value="T3">سطح استاندارد T3 (خرید نقدی / تسویه قطعی)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#8A8A9E] block mb-1">شناسه ملی / کد ثبت خریدار:</label>
                    <input
                      type="text"
                      required
                      value={newInvBuyerNationalId}
                      onChange={(e) => setNewInvBuyerNationalId(e.target.value)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[#8A8A9E] block mb-1">شماره اقتصادی خریدار:</label>
                    <input
                      type="text"
                      value={newInvBuyerEconomicCode}
                      onChange={(e) => setNewInvBuyerEconomicCode(e.target.value)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[#8A8A9E] block mb-1">شماره تماس:</label>
                    <input
                      type="text"
                      value={newInvBuyerPhone}
                      onChange={(e) => setNewInvBuyerPhone(e.target.value)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[#8A8A9E] block mb-1">نشانی رسمی ثبت‌شده خریدار:</label>
                    <input
                      type="text"
                      value={newInvBuyerAddress}
                      onChange={(e) => setNewInvBuyerAddress(e.target.value)}
                      className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-xl px-3 py-2 text-[#EDEDED] focus:border-[#C8A951] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: MULTI-ITEM BASKET */}
              <div className="bg-[#12121A] border border-[#242436] rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#202030] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-[#C8A951]" />
                    <span className="font-bold text-[#EDEDED] text-xs">اقلام طلا و مصنوعات فاکتور ({newInvItems.length} قلم کالا)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDraftItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C8A951]/20 hover:bg-[#C8A951]/30 text-[#E5C365] text-xs font-bold border border-[#C8A951]/40 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن قلم کالا به سبد فاکتور</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {newInvItems.map((item, idx) => {
                    const spot = data?.metrics.current18kPriceToman || 4450000;
                    const caratFactor = (item.carat || 750) / 750;
                    const itemSpotRate = Math.round(spot * caratFactor);
                    const itemGoldVal = (item.weightGrams || 0) * itemSpotRate;
                    const itemWageVal = (item.weightGrams || 0) * itemSpotRate * ((item.wageValue || 0) / 100);
                    const itemMarginVal = (item.weightGrams || 0) * itemSpotRate * 0.018;
                    const grossLineVal = itemGoldVal + itemWageVal + itemMarginVal;
                    const unitPriceBeforeDisc = (item.weightGrams || 0) > 0 ? Math.round(grossLineVal / item.weightGrams) : 0;
                    const lineDiscAmount = Math.round(((itemWageVal + itemMarginVal) * (item.itemDiscountPercent || 0)) / 100);
                    const netLineVal = grossLineVal + lineDiscAmount;
                    const netUnitPrice = (item.weightGrams || 0) > 0 ? Math.round(netLineVal / item.weightGrams) : 0;

                    return (
                      <div
                        key={item.id}
                        className="bg-[#181824] border border-[#28283C] rounded-xl p-3.5 space-y-3 hover:border-[#383852] transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222232] pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#C8A951]/20 text-[#E5C365] font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-[#EDEDED] text-xs">{item.titleFa || `قلم شماره ${idx + 1}`}</span>
                            <span className="font-mono text-[10px] text-[#A6A6B8] bg-[#12121A] px-2 py-0.5 rounded border border-[#262638]">
                              کد: {item.productCode || item.sku}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-[11px] font-mono text-[#8C8C9E] flex items-center gap-2">
                              <span>قیمت واحد خالص: <strong className="text-[#3DD68C]">{formatToman(netUnitPrice)}/گرم</strong></span>
                              <span className="text-[#4E4E62]">|</span>
                              <span>جمع خطی ردیف: <strong className="text-[#E5C365]">{formatToman(netLineVal)}</strong></span>
                            </div>
                            {newInvItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDraftItem(item.id)}
                                className="p-1 rounded text-[#FF6B6B] hover:bg-[#FF6B6B]/15 transition-colors cursor-pointer"
                                title="حذف این ردیف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
                          <div>
                            <label className="text-[#7E7E94] block text-[10px] mb-1">کد کالا (SKU):</label>
                            <input
                              type="text"
                              required
                              value={item.productCode || item.sku}
                              onChange={(e) => handleUpdateDraftItem(item.id, { productCode: e.target.value, sku: e.target.value })}
                              className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-lg px-2.5 py-1.5 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                            />
                          </div>

                          <div className="col-span-2 sm:col-span-2">
                            <label className="text-[#7E7E94] block text-[10px] mb-1">عنوان قلم کالا:</label>
                            <input
                              type="text"
                              required
                              value={item.titleFa}
                              onChange={(e) => handleUpdateDraftItem(item.id, { titleFa: e.target.value })}
                              className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-lg px-2.5 py-1.5 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[#7E7E94] block text-[10px] mb-1">عیار طلا:</label>
                            <select
                              value={item.carat}
                              onChange={(e) => handleUpdateDraftItem(item.id, { carat: parseInt(e.target.value, 10) || 750 })}
                              className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-lg px-2 py-1.5 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none cursor-pointer"
                            >
                              <option value="750">۷۵۰ (۱۸ عیار استاندارد)</option>
                              <option value="995">۹۹۵ (شمش آبشده)</option>
                              <option value="999">۹۹۹.۹ (طلای ۲۴ عیار خالص)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[#7E7E94] block text-[10px] mb-1">وزن خالص (گرم):</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={item.weightGrams}
                              onChange={(e) => handleUpdateDraftItem(item.id, { weightGrams: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-lg px-2.5 py-1.5 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[#7E7E94] block text-[10px] mb-1">اجرت ساخت (%):</label>
                            <input
                              type="number"
                              step="0.1"
                              required
                              value={item.wageValue}
                              onChange={(e) => handleUpdateDraftItem(item.id, { wageValue: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-lg px-2.5 py-1.5 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-1">
                              <label className="text-[#7E7E94]">تخفیف خطی (±۱٪):</label>
                              <span className={`font-mono font-bold ${
                                item.itemDiscountPercent < 0 ? 'text-[#3DD68C]' : item.itemDiscountPercent > 0 ? 'text-[#E5A84B]' : 'text-[#8A8A9E]'
                              }`}>
                                {item.itemDiscountPercent > 0 ? `+${item.itemDiscountPercent}٪` : `${item.itemDiscountPercent}٪`}
                              </span>
                            </div>
                            <input
                              type="number"
                              step="0.1"
                              min="-1.0"
                              max="1.0"
                              value={item.itemDiscountPercent}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                if (Math.abs(val) <= 1.0) handleUpdateDraftItem(item.id, { itemDiscountPercent: val });
                              }}
                              className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-lg px-2.5 py-1.5 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                            />
                          </div>
                        </div>

                        {/* Line Item Pricing & Discount Breakdown */}
                        <div className="p-2.5 rounded-lg bg-[#12121A] border border-[#222232] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                          <div>
                            <span className="text-[#7E7E94] block text-[10px]">مظنه واحد هر گرم:</span>
                            <span className="text-[#EDEDED]">{formatToman(itemSpotRate)}</span>
                          </div>
                          <div>
                            <span className="text-[#7E7E94] block text-[10px]">قیمت ناخالص واحد:</span>
                            <span className="text-[#EDEDED]">{formatToman(unitPriceBeforeDisc)}</span>
                          </div>
                          <div>
                            <span className="text-[#7E7E94] block text-[10px]">تعدیل تخفیف خطی:</span>
                            <span className={lineDiscAmount < 0 ? 'text-[#3DD68C]' : lineDiscAmount > 0 ? 'text-[#E5A84B]' : 'text-[#8C8C9E]'}>
                              {formatToman(lineDiscAmount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#7E7E94] block text-[10px]">قیمت خالص واحد (هر گرم):</span>
                            <span className="text-[#3DD68C] font-bold">{formatToman(netUnitPrice)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: INVOICE-LEVEL VOLUME DISCOUNT & SETTLEMENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Volume discount card */}
                <div className="p-4 rounded-xl bg-[#12121A] border border-[#242436] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#E5C365] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C8A951]" />
                      <span>تخفیف حجمی کل صورتحساب (سقف ±۲.۰۰٪)</span>
                    </span>
                    <span className={`text-xs font-mono font-bold ${
                      newInvVolumeDiscount < 0 ? 'text-[#3DD68C]' : newInvVolumeDiscount > 0 ? 'text-[#E5A84B]' : 'text-[#8A8A9E]'
                    }`}>
                      {newInvVolumeDiscount > 0 ? `+${newInvVolumeDiscount}٪` : `${newInvVolumeDiscount}٪`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="-2.0"
                      max="2.0"
                      value={newInvVolumeDiscount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (Math.abs(val) <= 2.0) setNewInvVolumeDiscount(val);
                      }}
                      className="flex-1 bg-[#1C1C28] border border-[#2D2D40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                    />
                    {(() => {
                      const totalGrams = newInvItems.reduce((acc, it) => acc + (Number(it.weightGrams) || 0), 0);
                      const suggested = getSuggestedVolumeDiscount(totalGrams);
                      return (
                        <button
                          type="button"
                          onClick={() => setNewInvVolumeDiscount(suggested)}
                          className="px-3 py-2 rounded-xl bg-[#C8A951]/20 hover:bg-[#C8A951]/30 text-[#E5C365] text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
                        >
                          پیشنهاد هوشمند ({suggested}٪)
                        </button>
                      );
                    })()}
                  </div>
                  <span className="block text-[10px] text-[#7A7A8E]">
                    محاسبه تخفیف حجمی بر مبنای کل وزن اقلام سبد فاکتور (حداکثر ۲.۰۰٪ طبق ضوابط تجاری K13)
                  </span>
                </div>

                {/* Settlement Mode Selection */}
                <div className="p-4 rounded-xl bg-[#12121A] border border-[#242436] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#E5C365] flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#C8A951]" />
                      <span>شیوه تسویه و تعهدات بانکی/طلایی</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      newInvSettlementMode !== 'gold_only'
                        ? 'bg-[#E5A84B]/15 text-[#E5C365] border border-[#E5A84B]/30'
                        : 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                    }`}>
                      {newInvSettlementMode !== 'gold_only' ? '🔒 نیازمند قفل مظنه' : 'حواله طلا بدون قفل'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewInvSettlementMode('split');
                        setNewInvRialSplit(40);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        newInvSettlementMode === 'split'
                          ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#E5C365] font-bold'
                          : 'bg-[#1C1C26] border-[#2D2D3E] text-[#9E9EA8] hover:text-[#EDEDED]'
                      }`}
                    >
                      <span className="block text-xs">ترکیبی</span>
                      <span className="text-[10px] opacity-75">ریالی + طلایی</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewInvSettlementMode('rial_only');
                        setNewInvRialSplit(100);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        newInvSettlementMode === 'rial_only'
                          ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#E5C365] font-bold'
                          : 'bg-[#1C1C26] border-[#2D2D3E] text-[#9E9EA8] hover:text-[#EDEDED]'
                      }`}
                    >
                      <span className="block text-xs">۱۰۰٪ ریالی</span>
                      <span className="text-[10px] opacity-75">با قفل مظنه</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewInvSettlementMode('gold_only');
                        setNewInvRialSplit(0);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        newInvSettlementMode === 'gold_only'
                          ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#E5C365] font-bold'
                          : 'bg-[#1C1C26] border-[#2D2D3E] text-[#9E9EA8] hover:text-[#EDEDED]'
                      }`}
                    >
                      <span className="block text-xs">۱۰۰٪ طلایی</span>
                      <span className="text-[10px] opacity-75">حواله شمش ۷۵۰</span>
                    </button>
                  </div>

                  {newInvSettlementMode === 'split' && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#3DD68C] font-bold">سهم ریالی: {newInvRialSplit}٪</span>
                        <span className="text-[#E5C365] font-bold">سهم طلایی: {100 - newInvRialSplit}٪</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        step="5"
                        value={newInvRialSplit}
                        onChange={(e) => setNewInvRialSplit(parseInt(e.target.value))}
                        className="w-full accent-[#C8A951] cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Quote Lock Selector if Rial is involved */}
                  {newInvSettlementMode !== 'gold_only' && (
                    <div className="pt-2 border-t border-[#222232]">
                      <select
                        value={newInvQuoteLockId}
                        onChange={(e) => setNewInvQuoteLockId(e.target.value)}
                        className="w-full bg-[#1C1C26] border border-[#2D2D3E] rounded-lg px-2.5 py-1.5 text-[11px] text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                      >
                        <option value="">🔒 قفل هوشمند فوری ۵ دقیقه‌ای توسط K13 (نرخ: {data ? formatToman(data.metrics.current18kPriceToman) : '—'})</option>
                        {data?.quoteLocks
                          .filter((l) => l.status === 'locked')
                          .map((l) => (
                            <option key={l.id} value={l.id}>
                              قفل فعال #{l.id} - خریدار: {l.buyerNameFa} ({formatGrams(l.weightGrams)} - {formatToman(l.lockedSpotPriceToman)})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: LIVE COMPUTATION PREVIEW (ARTICLE 26 TAX COMPLIANCE & ZARRIN GL DUAL LEDGER) */}
              {(() => {
                const goldSpot = data?.metrics.current18kPriceToman || 4450000;
                const totalGrams = newInvItems.reduce((acc, it) => acc + (Number(it.weightGrams) || 0), 0);
                const pureGoldValue = totalGrams * goldSpot;
                const totalWages = newInvItems.reduce((acc, it) => {
                  const w = Number(it.weightGrams) || 0;
                  return acc + (w * goldSpot * ((Number(it.wageValue) || 0) / 100));
                }, 0);
                const totalMargin = totalGrams * goldSpot * 0.018; // 1.8% didar margin
                const itemDiscounts = newInvItems.reduce((acc, it) => {
                  const w = Number(it.weightGrams) || 0;
                  const itemWage = w * goldSpot * ((Number(it.wageValue) || 0) / 100);
                  return acc + (itemWage * ((Number(it.itemDiscountPercent) || 0) / 100));
                }, 0);
                const volumeDiscountAmount = (totalWages + totalMargin) * ((Number(newInvVolumeDiscount) || 0) / 100);
                const taxableBase = Math.max(0, (totalWages + totalMargin) + itemDiscounts + volumeDiscountAmount);
                const vat10 = Math.round(taxableBase * 0.10);
                const grandTotal = Math.round(pureGoldValue + taxableBase + vat10);

                const rialPartAmount = newInvSettlementMode === 'gold_only'
                  ? 0
                  : newInvSettlementMode === 'rial_only'
                    ? grandTotal
                    : Math.round(grandTotal * (newInvRialSplit / 100));

                const goldPartGrams = newInvSettlementMode === 'rial_only'
                  ? 0
                  : newInvSettlementMode === 'gold_only'
                    ? totalGrams
                    : parseFloat((totalGrams * ((100 - newInvRialSplit) / 100)).toFixed(3));

                return (
                  <div className="bg-[#18161E] border border-[#C8A951]/40 rounded-xl p-4 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-[#2D2A3A] pb-2">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-[#C8A951]" />
                        <span className="font-bold text-xs text-[#EDEDED]">پیش‌نمایش ارقام رسمی صورتحساب و سند دوبل دفترکل زرین</span>
                      </div>
                      <span className="text-[10px] text-[#3DD68C] font-mono font-bold">
                        ماده ۲۶: اصل طلا معاف | مالیات فقط بر اجرت و سود
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-2.5 rounded-lg bg-[#12121A] border border-[#262638] space-y-0.5">
                        <span className="text-[10px] text-[#8C8C9E] block">کل وزن اقلام طلا:</span>
                        <span className="font-mono font-bold text-sm text-[#E5C365]">{formatGrams(totalGrams)}</span>
                        <span className="text-[9px] text-[#7A7A90] block">عیار ۷۵۰ (۱۸ عیار)</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#12121A] border border-[#262638] space-y-0.5">
                        <span className="text-[10px] text-[#8C8C9E] block">ارزش اصل طلا (معاف):</span>
                        <span className="font-mono font-bold text-sm text-[#EDEDED]">{formatToman(pureGoldValue)}</span>
                        <span className="text-[9px] text-[#3DD68C] block">معافیت ۱۰۰٪ از مالیات</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#12121A] border border-[#262638] space-y-0.5">
                        <span className="text-[10px] text-[#8C8C9E] block">ماخذ مشمول مالیات (اجرت+سود):</span>
                        <span className="font-mono font-bold text-sm text-[#EDEDED]">{formatToman(taxableBase)}</span>
                        <span className="text-[9px] text-[#7A7A90] block">پس از اعمال تخفیفات</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#1F1718] border border-[#FF6B6B]/30 space-y-0.5">
                        <span className="text-[10px] text-[#FF8585] block font-bold">مالیات بر ارزش افزوده (۱۰٪):</span>
                        <span className="font-mono font-bold text-sm text-[#FF8585]">{formatToman(vat10)}</span>
                        <span className="text-[9px] text-[#A68A8A] block">۱۰٪ صرفاً روی ماخذ اجرت</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#1F1A12] border border-[#E5A84B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[#8C8C9E] block text-[11px]">مبلغ نهایی قابل تسویه صورتحساب:</span>
                        <span className="font-mono font-bold text-base text-[#E5C365]">{formatToman(grandTotal)}</span>
                        <span className="text-[10px] font-mono text-[#A6A6B8] block mt-0.5">معادل {formatRial(grandTotal * 10)}</span>
                      </div>

                      <div className="flex items-center gap-4 text-left sm:text-right border-t sm:border-t-0 sm:border-r border-[#332A1C] pt-2 sm:pt-0 sm:pr-4">
                        <div>
                          <span className="text-[10px] text-[#8C8C9E] block">تعهد پرداخت ریالی:</span>
                          <span className="font-mono font-bold text-sm text-[#3DD68C]">{formatToman(rialPartAmount)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8C8C9E] block">تعهد تحویل طلایی:</span>
                          <span className="font-mono font-bold text-sm text-[#E5C365]">{formatGrams(goldPartGrams)} (۷۵۰)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 shrink-0 border-t border-[#202030]">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#252535] text-[#EDEDED] font-semibold hover:bg-[#303042] transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C8A951] text-[#141416] font-bold hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-[#C8A951]/20 flex items-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  <span>تأیید و صدور صورتحساب الکترونیکی</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
