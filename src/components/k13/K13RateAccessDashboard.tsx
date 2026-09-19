import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Edit3,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sliders,
  Eye,
  Activity,
  Zap,
  Key,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  Radio,
  SlidersHorizontal,
  Flame,
  Search,
  Scale
} from 'lucide-react';
import {
  GoldSpotRate,
  RateAuthorizedUser,
  RateChangeAuditLog,
  RateSecurityPolicy,
  RatePermissionKey,
  RateUserRole
} from '../../types/k13';

interface K13RateAccessDashboardProps {
  rates: GoldSpotRate[];
  authorizedUsers: RateAuthorizedUser[];
  auditLogs: RateChangeAuditLog[];
  securityPolicy: RateSecurityPolicy;
  onRefreshRates: () => Promise<void>;
  onModifyRate: (params: { rateId: string; newSellPrice: number; newBuyPrice?: number; operatorId: string; reason: string }) => Promise<{ success: boolean; requiresApproval?: boolean; message?: string; error?: string }>;
  onApproveDual: (auditLogId: string, approverId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  onRejectDual: (auditLogId: string, approverId: string, reason?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  onUpdateUser: (userId: string, updates: Partial<RateAuthorizedUser>) => Promise<{ success: boolean; message?: string; error?: string }>;
  onCreateUser: (user: Omit<RateAuthorizedUser, 'id'>) => Promise<{ success: boolean; message?: string; error?: string }>;
  onDeleteUser: (userId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  onToggleCircuitBreaker: (freeze: boolean, reason: string, operatorId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  onUpdatePolicy: (policy: Partial<RateSecurityPolicy>) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const PERMISSION_CONFIG: {
  key: RatePermissionKey;
  labelFa: string;
  descriptionFa: string;
  badgeColor: string;
}[] = [
  {
    key: 'RATE_VIEW',
    labelFa: 'مشاهده مظنه زنده',
    descriptionFa: 'دسترسی به تابلو و استعلام‌های بلادرنگ نرخ طلا',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
  },
  {
    key: 'RATE_MANUAL_OVERRIDE',
    labelFa: 'تغییر دستی نرخ طلا',
    descriptionFa: 'امکان بازنویسی و تغییر دستی نرخ‌های خرید و فروش در سیستم',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  {
    key: 'SPREAD_CONFIG',
    labelFa: 'تنظیم اسپرد خرید/فروش',
    descriptionFa: 'تغییر دامنه اختلاف قیمت مظنه خرید و فروش بازار',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  },
  {
    key: 'AUTO_FEED_TOGGLE',
    labelFa: 'کنترل فید خودکار بازار',
    descriptionFa: 'سوئیچ بین استعلام آنلاین اتحادیه و نرخ‌گذاری دستی خزانه‌داری',
    badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30'
  },
  {
    key: 'DUAL_APPROVAL_SIGN',
    labelFa: 'امضای تأیید دونفره (Dual Approval)',
    descriptionFa: 'تأییدیه مرحله دوم برای جهش‌های قیمتی بالاتر از آستانه مجاز',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    key: 'CIRCUIT_BREAKER_TRIGGER',
    labelFa: 'فیوز توقف اضطراری (Circuit Breaker)',
    descriptionFa: 'توقف آنی معاملات و قفل مظنه‌ها در شرایط بحرانی نوسان',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  }
];

export const K13RateAccessDashboard: React.FC<K13RateAccessDashboardProps> = ({
  rates,
  authorizedUsers,
  auditLogs,
  securityPolicy,
  onRefreshRates,
  onModifyRate,
  onApproveDual,
  onRejectDual,
  onUpdateUser,
  onCreateUser,
  onDeleteUser,
  onToggleCircuitBreaker,
  onUpdatePolicy
}) => {
  // Navigation tabs inside rate dashboard
  const [activeTab, setActiveTab] = useState<'live_rates' | 'user_access' | 'dual_approval' | 'audit_log' | 'security_rules'>('live_rates');

  // Currently impersonated / simulated active operator
  const [currentOperatorId, setCurrentOperatorId] = useState<string>(
    authorizedUsers[0]?.id || 'usr-tr-01'
  );

  // Rate modification modal
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<GoldSpotRate | null>(null);
  const [newSellPriceInput, setNewSellPriceInput] = useState<number>(0);
  const [newBuyPriceInput, setNewBuyPriceInput] = useState<number>(0);
  const [rateChangeReason, setRateChangeReason] = useState<string>('');
  const [isSubmittingRate, setIsSubmittingRate] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // User management modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userNameInput, setUserNameInput] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [userNationalIdInput, setUserNationalIdInput] = useState('');
  const [userDeptInput, setUserDeptInput] = useState('میز معاملات خزانه‌داری');
  const [userRoleInput, setUserRoleInput] = useState<RateUserRole>('RATE_OPERATOR');
  const [userPermissionsInput, setUserPermissionsInput] = useState<RatePermissionKey[]>([
    'RATE_VIEW',
    'RATE_MANUAL_OVERRIDE'
  ]);
  const [userMaxDeltaInput, setUserMaxDeltaInput] = useState<number>(2.0);
  const [userStatusInput, setUserStatusInput] = useState<'active' | 'suspended'>('active');

  // Auto-refresh timer state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshSec, setAutoRefreshSec] = useState(30);
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(true);

  // Search & filter
  const [rateSearch, setRateSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Circuit breaker modal
  const [isCircuitBreakerModalOpen, setIsCircuitBreakerModalOpen] = useState(false);
  const [circuitBreakerReasonInput, setCircuitBreakerReasonInput] = useState('');

  // Dual approval action state
  const [approvingLogId, setApprovingLogId] = useState<string | null>(null);

  const activeOperator = authorizedUsers.find((u) => u.id === currentOperatorId) || authorizedUsers[0];
  const pendingApprovals = auditLogs.filter((l) => l.status === 'pending_dual_approval');

  const onRefreshRatesRef = React.useRef(onRefreshRates);
  useEffect(() => {
    onRefreshRatesRef.current = onRefreshRates;
  }, [onRefreshRates]);

  const handleManualRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefreshRatesRef.current();
    } finally {
      setIsRefreshing(false);
      setAutoRefreshSec(30);
    }
  }, []);

  // Auto-refresh countdown effect (pure timer)
  useEffect(() => {
    if (!isAutoRefreshActive || securityPolicy.marketStatus === 'frozen') return;
    const interval = setInterval(() => {
      setAutoRefreshSec((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoRefreshActive, securityPolicy.marketStatus]);

  // Trigger refresh when timer reaches 0 in an effect (not inside setState updater)
  useEffect(() => {
    if (autoRefreshSec === 0) {
      setAutoRefreshSec(30);
      handleManualRefresh();
    }
  }, [autoRefreshSec, handleManualRefresh]);

  const openModifyRateModal = (rate: GoldSpotRate) => {
    setSelectedRate(rate);
    setNewSellPriceInput(rate.sellPriceToman);
    setNewBuyPriceInput(rate.buyPriceToman);
    setRateChangeReason('');
    setFormFeedback(null);
    setIsModifyModalOpen(true);
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRate || !activeOperator) return;

    if (!activeOperator.permissions.includes('RATE_MANUAL_OVERRIDE')) {
      setFormFeedback({
        type: 'error',
        message: 'اپراتور انتخابی فاقد مجوز تغییر دستی نرخ طلا (RATE_MANUAL_OVERRIDE) است.'
      });
      return;
    }

    setIsSubmittingRate(true);
    setFormFeedback(null);
    try {
      const res = await onModifyRate({
        rateId: selectedRate.id,
        newSellPrice: newSellPriceInput,
        newBuyPrice: newBuyPriceInput,
        operatorId: activeOperator.id,
        reason: rateChangeReason
      });

      if (res.success) {
        if (res.requiresApproval) {
          setFormFeedback({
            type: 'warning',
            message: res.message || 'درخواست نوسان ثبت شد و به دلیل عبور از آستانه، نیازمند تأیید دونفره (Dual Approval) است.'
          });
          setTimeout(() => setIsModifyModalOpen(false), 2200);
        } else {
          setFormFeedback({
            type: 'success',
            message: res.message || 'نرخ طلا با موفقیت در تابلوی زنده سامانه اعمال گردید.'
          });
          setTimeout(() => setIsModifyModalOpen(false), 1400);
        }
      } else {
        setFormFeedback({
          type: 'error',
          message: res.error || 'خطا در ثبت تغییر نرخ طلا'
        });
      }
    } catch {
      setFormFeedback({
        type: 'error',
        message: 'خطای سیستمی در برقراری ارتباط با خزانه‌داری'
      });
    } finally {
      setIsSubmittingRate(false);
    }
  };

  const handleApproveDualLog = async (logId: string) => {
    if (!activeOperator) return;
    setApprovingLogId(logId);
    try {
      const res = await onApproveDual(logId, activeOperator.id);
      if (!res.success) {
        alert(res.error || 'خطا در تأیید درخواست');
      }
    } finally {
      setApprovingLogId(null);
    }
  };

  const handleRejectDualLog = async (logId: string) => {
    if (!activeOperator) return;
    const reason = prompt('لطفاً دلیل رد درخواست تغییر نرخ را وارد نمایید:');
    if (reason === null) return;
    await onRejectDual(logId, activeOperator.id, reason);
  };

  const handleToggleUserPermission = async (userId: string, permKey: RatePermissionKey) => {
    const user = authorizedUsers.find((u) => u.id === userId);
    if (!user) return;

    const hasPerm = user.permissions.includes(permKey);
    const newPerms = hasPerm
      ? user.permissions.filter((p) => p !== permKey)
      : [...user.permissions, permKey];

    await onUpdateUser(userId, { permissions: newPerms });
  };

  const handleToggleUserStatus = async (user: RateAuthorizedUser) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await onUpdateUser(user.id, { status: newStatus });
  };

  const openCreateUserModal = () => {
    setEditingUserId(null);
    setUserNameInput('');
    setUserEmailInput('');
    setUserNationalIdInput('');
    setUserDeptInput('میز معاملات خزانه‌داری');
    setUserRoleInput('RATE_OPERATOR');
    setUserPermissionsInput(['RATE_VIEW', 'RATE_MANUAL_OVERRIDE']);
    setUserMaxDeltaInput(2.0);
    setUserStatusInput('active');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleLabels: Record<RateUserRole, string> = {
      CHIEF_TREASURER: 'مدیر ارشد خزانه‌داری و نقدینگی',
      RATE_OPERATOR: 'اپراتور ارشد ثبت مظنه بازار',
      RISK_MANAGER: 'مدیر ریسک و انطباق استاندارد طلا',
      BRANCH_TRADER: 'معامله‌گر مجاز شعبه مرکزی',
      AUDITOR: 'ناظر و حسابرس ارشد سیستم'
    };

    if (editingUserId) {
      await onUpdateUser(editingUserId, {
        nameFa: userNameInput,
        email: userEmailInput,
        nationalId: userNationalIdInput,
        departmentFa: userDeptInput,
        role: userRoleInput,
        roleFa: roleLabels[userRoleInput],
        permissions: userPermissionsInput,
        maxAllowedDailyChangePercent: userMaxDeltaInput,
        status: userStatusInput
      });
    } else {
      await onCreateUser({
        nameFa: userNameInput,
        email: userEmailInput,
        nationalId: userNationalIdInput,
        departmentFa: userDeptInput,
        role: userRoleInput,
        roleFa: roleLabels[userRoleInput],
        permissions: userPermissionsInput,
        maxAllowedDailyChangePercent: userMaxDeltaInput,
        status: userStatusInput,
        twoFactorRequired: true
      });
    }
    setIsUserModalOpen(false);
  };

  const filteredRates = rates.filter(
    (r) =>
      r.titleFa.includes(rateSearch) ||
      r.titleEn.toLowerCase().includes(rateSearch.toLowerCase()) ||
      r.symbol.toLowerCase().includes(rateSearch.toLowerCase())
  );

  const filteredUsers = authorizedUsers.filter(
    (u) =>
      u.nameFa.includes(userSearch) ||
      u.email.includes(userSearch) ||
      u.roleFa.includes(userSearch) ||
      u.departmentFa.includes(userSearch)
  );

  const formatToman = (val: number) => {
    return new Intl.NumberFormat('fa-IR').format(val) + ' تومان';
  };

  // Delta calculation for modify modal
  const priceDeltaPercent = selectedRate && selectedRate.sellPriceToman > 0
    ? parseFloat((((newSellPriceInput - selectedRate.sellPriceToman) / selectedRate.sellPriceToman) * 100).toFixed(2))
    : 0;
  const isAboveDualThreshold = Math.abs(priceDeltaPercent) >= securityPolicy.dualApprovalThresholdPercent;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner: Market Status, Active Operator Switcher & Live Polling */}
      <div className="bg-[#15151B] border border-[#292938] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Market Status & Circuit Breaker */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                securityPolicy.marketStatus === 'open'
                  ? 'bg-[#3DD68C]/15 border-[#3DD68C]/30 text-[#3DD68C]'
                  : 'bg-[#E5484D]/15 border-[#E5484D]/30 text-[#E5484D] animate-pulse'
              }`}
            >
              {securityPolicy.marketStatus === 'open' ? (
                <Activity className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#8A8A9E]">وضعیت تابلوی طلا:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    securityPolicy.marketStatus === 'open'
                      ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                      : 'bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/40'
                  }`}
                >
                  {securityPolicy.marketStatus === 'open' ? 'معاملات و مظنه‌گیری فعال' : 'توقف اضطراری معاملات (Frozen)'}
                </span>
                {securityPolicy.feedSource === 'hybrid' && (
                  <span className="px-2 py-0.5 rounded-md bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 text-[10px] font-medium">
                    فید هیبرید (اتحادیه + خزانه‌داری)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8A8A9E] mt-0.5">
                {securityPolicy.marketStatus === 'open'
                  ? 'سفارش‌گذاری و استعلام لحظه‌ای بر اساس آخرین نوسانات بازار طلا برقرار است.'
                  : `توجه: فیوز اضطراری بازار فعال است. دلیل: ${securityPolicy.circuitBreakerReason || 'نوسانات شدید بازار'}`}
              </p>
            </div>
          </div>

          {/* Active Operator Simulation Selector */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-[#1B1B25] border border-[#2D2D3E] p-2.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-[#A1A1B2]">
              <Key className="w-3.5 h-3.5 text-[#C8A951]" />
              <span className="font-medium">اپراتور فعال:</span>
            </div>
            <select
              value={currentOperatorId}
              onChange={(e) => setCurrentOperatorId(e.target.value)}
              className="bg-[#242432] border border-[#38384C] text-[#EDEDED] text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:border-[#C8A951] cursor-pointer"
            >
              {authorizedUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nameFa} — {u.roleFa} ({u.status === 'active' ? 'فعال' : 'معلق'})
                </option>
              ))}
            </select>

            {/* Operator Badges */}
            {activeOperator && (
              <div className="hidden md:flex items-center gap-1.5">
                {activeOperator.permissions.includes('RATE_MANUAL_OVERRIDE') ? (
                  <span className="px-2 py-0.5 rounded bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30 text-[10px] font-bold">
                    مجاز به تغییر نرخ
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30 text-[10px] font-bold">
                    فقط مشاهده
                  </span>
                )}
                {activeOperator.permissions.includes('DUAL_APPROVAL_SIGN') && (
                  <span className="px-2 py-0.5 rounded bg-[#9E86FF]/15 text-[#9E86FF] border border-[#9E86FF]/30 text-[10px] font-bold">
                    امضای تأیید دوم
                  </span>
                )}
              </div>
            )}

            {/* Circuit Breaker Toggle Button */}
            {activeOperator?.permissions.includes('CIRCUIT_BREAKER_TRIGGER') && (
              <button
                onClick={() => {
                  if (securityPolicy.marketStatus === 'open') {
                    setIsCircuitBreakerModalOpen(true);
                  } else {
                    onToggleCircuitBreaker(false, 'بازگشایی مجدد توسط اپراتور ارشد', activeOperator.id);
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  securityPolicy.marketStatus === 'open'
                    ? 'bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30 hover:bg-[#E5484D]/25'
                    : 'bg-[#3DD68C]/20 text-[#3DD68C] border border-[#3DD68C]/40 hover:bg-[#3DD68C]/30'
                }`}
                title="فیوز قطع اضطراری معاملات بازار طلا"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{securityPolicy.marketStatus === 'open' ? 'فعال‌سازی فیوز بازار' : 'لغو توقف بازار'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#292938] pb-3">
        <button
          onClick={() => setActiveTab('live_rates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'live_rates'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
              : 'bg-[#181822] text-[#A1A1B2] hover:text-[#EDEDED] hover:bg-[#20202D]'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${activeTab === 'live_rates' ? 'animate-pulse text-[#141416]' : 'text-[#C8A951]'}`} />
          <span>تابلوی نرخ زنده و تغییر مظنه</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
            {rates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('user_access')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'user_access'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
              : 'bg-[#181822] text-[#A1A1B2] hover:text-[#EDEDED] hover:bg-[#20202D]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>مدیریت دسترسی کاربران به تغییرات نرخ</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
            {authorizedUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dual_approval')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'dual_approval'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
              : 'bg-[#181822] text-[#A1A1B2] hover:text-[#EDEDED] hover:bg-[#20202D]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>تأییدیه دونفره نوسانات (Dual Approval)</span>
          {pendingApprovals.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#E5484D] text-white font-mono animate-bounce">
              {pendingApprovals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit_log')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'audit_log'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
              : 'bg-[#181822] text-[#A1A1B2] hover:text-[#EDEDED] hover:bg-[#20202D]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>لاگ و تاریخچه ممیزی تغییر نرخ</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('security_rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security_rules'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
              : 'bg-[#181822] text-[#A1A1B2] hover:text-[#EDEDED] hover:bg-[#20202D]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>سیاست‌های امنیتی و سقف نوسان</span>
        </button>
      </div>

      {/* TAB 1: LIVE GOLD RATES & OVERRIDE */}
      {activeTab === 'live_rates' && (
        <div className="space-y-5">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#15151B] border border-[#292938] rounded-2xl p-4">
            <div>
              <h2 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3DD68C] animate-ping" />
                <span>تابلوی نرخ‌های زنده طلا و مسکوکات (Spot Rates)</span>
              </h2>
              <p className="text-xs text-[#8A8A9E] mt-0.5">
                مظنه‌های معاملاتی رسمی اتحادیه با قابلیت تغییر نظارت‌شده توسط اپراتورهای دارای مجوز
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#6B6B7C] absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="جستجوی نماد، عیار یا سکه..."
                  value={rateSearch}
                  onChange={(e) => setRateSearch(e.target.value)}
                  className="bg-[#1C1C26] border border-[#2E2E3E] rounded-xl pr-8 pl-3 py-1.5 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none w-48"
                />
              </div>

              {/* Refresh Button & Countdown */}
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222230] border border-[#333345] hover:bg-[#2A2A3B] text-xs font-semibold text-[#EDEDED] transition-colors cursor-pointer"
                title="بروزرسانی استعلام لحظه‌ای"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#C8A951] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>بروزرسانی</span>
                <span className="text-[10px] text-[#7A7A8E] font-mono">({autoRefreshSec}s)</span>
              </button>
            </div>
          </div>

          {/* Rates Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRates.map((rate) => {
              const spreadToman = rate.sellPriceToman - rate.buyPriceToman;
              const spreadPercent = parseFloat(((spreadToman / rate.sellPriceToman) * 100).toFixed(2));
              const canEditRate = activeOperator?.permissions.includes('RATE_MANUAL_OVERRIDE') && securityPolicy.marketStatus === 'open';

              return (
                <div
                  key={rate.id}
                  className={`bg-[#15151B] border rounded-2xl p-4.5 transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                    rate.isPrimaryReference
                      ? 'border-[#C8A951]/50 shadow-md shadow-[#C8A951]/5'
                      : 'border-[#262634] hover:border-[#38384C]'
                  }`}
                >
                  {/* Top Bar: Title & 24h Change */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[#EDEDED]">{rate.titleFa}</h3>
                          {rate.isPrimaryReference && (
                            <span className="px-1.5 py-0.2 rounded bg-[#C8A951]/20 text-[#E5C365] text-[10px] font-bold border border-[#C8A951]/30">
                              نرخ مرجع
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#7A7A8E] font-mono">{rate.symbol}</span>
                      </div>

                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold font-mono ${
                          rate.changePercent24h >= 0
                            ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                            : 'bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30'
                        }`}
                      >
                        {rate.changePercent24h >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>{Math.abs(rate.changePercent24h)}%</span>
                      </div>
                    </div>

                    {/* Price Highlights */}
                    <div className="mt-4 bg-[#1B1B25] border border-[#272736] rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8A8A9E]">مظنه فروش (بنکداری):</span>
                        <span className="text-base font-bold font-mono text-[#E5C365]">
                          {formatToman(rate.sellPriceToman)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#242432] pt-1.5">
                        <span className="text-xs text-[#8A8A9E]">مظنه خرید (تسویه):</span>
                        <span className="text-xs font-bold font-mono text-[#EDEDED]">
                          {formatToman(rate.buyPriceToman)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#7A7A8E] pt-0.5">
                        <span>اسپرد (اختلاف مظنه):</span>
                        <span className="font-mono text-[#A1A1B2]">
                          {new Intl.NumberFormat('fa-IR').format(spreadToman)} تومان ({spreadPercent}٪)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Bar & Modify Action */}
                  <div className="mt-4 pt-3 border-t border-[#242432] flex items-center justify-between">
                    <div className="text-[10px] text-[#7A7A8E] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#6B6B7C]" />
                      <span>{rate.updatedAtFa}</span>
                    </div>

                    <button
                      onClick={() => openModifyRateModal(rate)}
                      disabled={!canEditRate}
                      className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        canEditRate
                          ? 'bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 hover:bg-[#C8A951]/25'
                          : 'bg-[#22222E] text-[#6B6B7C] border border-[#2C2C3C] cursor-not-allowed'
                      }`}
                      title={
                        canEditRate
                          ? 'تغییر دستی نرخ به عنوان اپراتور مجاز'
                          : 'اپراتور فعلی مجوز تغییر دستی نرخ را ندارد یا بازار متوقف است'
                      }
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>تغییر نرخ</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCESS MANAGEMENT (RBAC) */}
      {activeTab === 'user_access' && (
        <div className="space-y-5">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#15151B] border border-[#292938] rounded-2xl p-4">
            <div>
              <h2 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C8A951]" />
                <span>ماتریس سطوح دسترسی کاربران به تغییرات نرخ طلا</span>
              </h2>
              <p className="text-xs text-[#8A8A9E] mt-0.5">
                کنترل دقیق و مستقل مجوزهای حساس شامل تغییر مظنه، امضای تأیید دونفره و فیوز اضطراری
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#6B6B7C] absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="جستجوی نام کاربر یا نقش..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-[#1C1C26] border border-[#2E2E3E] rounded-xl pr-8 pl-3 py-1.5 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none w-48"
                />
              </div>

              <button
                onClick={openCreateUserModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C8A951] text-[#141416] text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-md shadow-[#C8A951]/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>افزودن اپراتور مجاز</span>
              </button>
            </div>
          </div>

          {/* User Access Table */}
          <div className="bg-[#15151B] border border-[#292938] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#262634] text-[#868698] bg-[#1A1A24]">
                    <th className="py-3 px-4">مشخصات کاربر و نقش</th>
                    <th className="py-3 px-4">وضعیت</th>
                    <th className="py-3 px-4 text-center">مشاهده نرخ (VIEW)</th>
                    <th className="py-3 px-4 text-center">تغییر دستی (OVERRIDE)</th>
                    <th className="py-3 px-4 text-center">تنظیم اسپرد (SPREAD)</th>
                    <th className="py-3 px-4 text-center">تأیید دوم (DUAL SIGN)</th>
                    <th className="py-3 px-4 text-center">فیوز بازار (CIRCUIT)</th>
                    <th className="py-3 px-4">سقف مجاز نوسان</th>
                    <th className="py-3 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222230]">
                  {filteredUsers.map((user) => {
                    const isChief = user.role === 'CHIEF_TREASURER';

                    return (
                      <tr key={user.id} className="hover:bg-[#1A1A26] transition-colors">
                        {/* User Profile */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#252534] border border-[#38384C] flex items-center justify-center font-bold text-[#E5C365] text-xs">
                              {user.nameFa.slice(0, 1)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#EDEDED]">{user.nameFa}</span>
                                {user.twoFactorRequired && (
                                  <span className="px-1.5 py-0.2 rounded bg-[#3DD68C]/15 text-[#3DD68C] text-[9px] font-bold border border-[#3DD68C]/30">
                                    2FA
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#C8A951] font-medium block">
                                {user.roleFa}
                              </span>
                              <span className="text-[10px] text-[#7A7A8E] font-mono block">
                                {user.email} | کدملی: {user.nationalId}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer border ${
                              user.status === 'active'
                                ? 'bg-[#3DD68C]/15 text-[#3DD68C] border-[#3DD68C]/30 hover:bg-[#3DD68C]/25'
                                : 'bg-[#E5484D]/15 text-[#E5484D] border-[#E5484D]/30 hover:bg-[#E5484D]/25'
                            }`}
                            title="کلیک برای تغییر وضعیت حساب"
                          >
                            {user.status === 'active' ? 'فعال' : 'معلق'}
                          </button>
                        </td>

                        {/* Permission Toggles */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleUserPermission(user.id, 'RATE_VIEW')}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                              user.permissions.includes('RATE_VIEW')
                                ? 'bg-[#3DD68C]/20 text-[#3DD68C] border border-[#3DD68C]/40'
                                : 'bg-[#22222E] text-[#555566] border border-[#2B2B38]'
                            }`}
                            title="مشاهده تابلوی زنده"
                          >
                            {user.permissions.includes('RATE_VIEW') ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleUserPermission(user.id, 'RATE_MANUAL_OVERRIDE')}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                              user.permissions.includes('RATE_MANUAL_OVERRIDE')
                                ? 'bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40'
                                : 'bg-[#22222E] text-[#555566] border border-[#2B2B38]'
                            }`}
                            title="تغییر دستی نرخ طلا"
                          >
                            {user.permissions.includes('RATE_MANUAL_OVERRIDE') ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleUserPermission(user.id, 'SPREAD_CONFIG')}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                              user.permissions.includes('SPREAD_CONFIG')
                                ? 'bg-[#9E86FF]/20 text-[#9E86FF] border border-[#9E86FF]/40'
                                : 'bg-[#22222E] text-[#555566] border border-[#2B2B38]'
                            }`}
                            title="تنظیم اسپرد خرید/فروش"
                          >
                            {user.permissions.includes('SPREAD_CONFIG') ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleUserPermission(user.id, 'DUAL_APPROVAL_SIGN')}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                              user.permissions.includes('DUAL_APPROVAL_SIGN')
                                ? 'bg-[#3DD68C]/20 text-[#3DD68C] border border-[#3DD68C]/40'
                                : 'bg-[#22222E] text-[#555566] border border-[#2B2B38]'
                            }`}
                            title="امضای تأیید دونفره نوسانات"
                          >
                            {user.permissions.includes('DUAL_APPROVAL_SIGN') ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleUserPermission(user.id, 'CIRCUIT_BREAKER_TRIGGER')}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                              user.permissions.includes('CIRCUIT_BREAKER_TRIGGER')
                                ? 'bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/40'
                                : 'bg-[#22222E] text-[#555566] border border-[#2B2B38]'
                            }`}
                            title="فعال‌سازی فیوز توقف معاملات"
                          >
                            {user.permissions.includes('CIRCUIT_BREAKER_TRIGGER') ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        {/* Max Allowed Daily Delta */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs text-[#EDEDED] font-bold">
                            {user.maxAllowedDailyChangePercent > 0 ? `±${user.maxAllowedDailyChangePercent}%` : 'نامحدود (مدیر)'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingUserId(user.id);
                                setUserNameInput(user.nameFa);
                                setUserEmailInput(user.email);
                                setUserNationalIdInput(user.nationalId);
                                setUserDeptInput(user.departmentFa);
                                setUserRoleInput(user.role);
                                setUserPermissionsInput(user.permissions);
                                setUserMaxDeltaInput(user.maxAllowedDailyChangePercent);
                                setUserStatusInput(user.status);
                                setIsUserModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-[#242432] text-[#A1A1B2] hover:text-[#EDEDED] hover:bg-[#2F2F42] transition-colors cursor-pointer"
                              title="ویرایش مشخصات اپراتور"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {!isChief && (
                              <button
                                onClick={() => {
                                  onDeleteUser(user.id);
                                }}
                                className="p-1.5 rounded-lg bg-[#242432] text-[#E5484D]/70 hover:text-[#E5484D] hover:bg-[#2F2F42] transition-colors cursor-pointer"
                                title="حذف دسترسی"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DUAL APPROVAL WORKFLOW */}
      {activeTab === 'dual_approval' && (
        <div className="space-y-5">
          <div className="bg-[#15151B] border border-[#292938] rounded-2xl p-4">
            <h2 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#C8A951]" />
              <span>صف کارتابل تأیید دونفره تغییرات نرخ طلا (Dual Control / Four-Eyes Principle)</span>
            </h2>
            <p className="text-xs text-[#8A8A9E] mt-0.5">
              تغییرات دستی که نوسان آنها فراتر از آستانه امنیتی ({securityPolicy.dualApprovalThresholdPercent}٪) است، جهت پیشگیری از خطای انسانی نیازمند تأیید یک مدیر مستقل می‌باشند.
            </p>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="bg-[#15151B] border border-[#292938] rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#3DD68C]/10 text-[#3DD68C] border border-[#3DD68C]/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#EDEDED]">کلیه درخواست‌های تغییر نرخ بررسی و اعمال شده‌اند</h3>
              <p className="text-xs text-[#7A7A8E] max-w-md mx-auto">
                هیچ تغییر نرخی در انتظار تأیید دونفره وجود ندارد. تمام نرخ‌های فعال در تابلوی سامانه دارای اعتبار قطعی هستند.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingApprovals.map((log) => {
                const isCurrentOperatorTheCreator = activeOperator?.id === log.operatorId;
                const canApprove = activeOperator?.permissions.includes('DUAL_APPROVAL_SIGN') && !isCurrentOperatorTheCreator;

                return (
                  <div
                    key={log.id}
                    className="bg-[#15151B] border border-[#E5484D]/40 rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#EDEDED]">{log.titleFa}</span>
                            <span className="px-2 py-0.5 rounded bg-[#E5484D]/20 text-[#E5484D] font-mono text-xs font-bold border border-[#E5484D]/30">
                              {log.deltaPercent >= 0 ? `+${log.deltaPercent}%` : `${log.deltaPercent}%`} نوسان
                            </span>
                          </div>
                          <span className="text-xs text-[#8A8A9E] font-mono mt-0.5 block">
                            کد رهگیری: {log.id} | ثبت: {log.timestampFa}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectDualLog(log.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#E5484D]/15 text-[#E5484D] hover:bg-[#E5484D]/25 border border-[#E5484D]/30 text-xs font-bold transition-all cursor-pointer"
                        >
                          رد درخواست
                        </button>
                        <button
                          onClick={() => handleApproveDualLog(log.id)}
                          disabled={!canApprove || approvingLogId === log.id}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            canApprove
                              ? 'bg-[#3DD68C] text-[#141416] hover:brightness-110 shadow-md shadow-[#3DD68C]/20'
                              : 'bg-[#242432] text-[#6B6B7C] border border-[#333344] cursor-not-allowed'
                          }`}
                          title={
                            isCurrentOperatorTheCreator
                              ? 'اصل چهارچشم: ثبت‌کننده نمی‌تواند تغییر خودش را تأیید کند.'
                              : !canApprove
                              ? 'اپراتور فعلی فاقد مجوز DUAL_APPROVAL_SIGN است.'
                              : 'تأیید و اعمال فوری در بازار'
                          }
                        >
                          {approvingLogId === log.id && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          <Check className="w-3.5 h-3.5" />
                          <span>تأیید و اعمال در بازار</span>
                        </button>
                      </div>
                    </div>

                    {/* Rate Comparison Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#1C1C26] border border-[#2D2D3E] rounded-xl p-3 text-xs">
                      <div>
                        <span className="text-[#7A7A8E] block">نرخ قبلی بازار:</span>
                        <span className="font-mono font-bold text-[#EDEDED] text-sm mt-0.5 block">
                          {formatToman(log.oldSellPrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#7A7A8E] block">نرخ جدید پیشنهادی:</span>
                        <span className="font-mono font-bold text-[#E5C365] text-sm mt-0.5 block">
                          {formatToman(log.newSellPrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#7A7A8E] block">اپراتور درخواست‌دهنده:</span>
                        <span className="font-bold text-[#EDEDED] text-xs mt-0.5 block">
                          {log.operatorNameFa} ({log.operatorRoleFa})
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-[#A1A1B2] bg-[#171720] border border-[#242434] rounded-lg p-2.5">
                      <span className="font-bold text-[#C8A951]">علت تغییر نرخ: </span>
                      <span>{log.reason}</span>
                    </div>

                    {isCurrentOperatorTheCreator && (
                      <p className="text-[11px] text-[#E5484D] font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>شما ثبت‌کننده این تغییر هستید. برای رعایت اصل چهارچشم، یک مدیر مستقل باید این تغییر را تأیید کند. (می‌توانید از منوی بالا به دکتر نوری یا مهندس کریمی سوئیچ کنید).</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL LOG */}
      {activeTab === 'audit_log' && (
        <div className="space-y-5">
          <div className="bg-[#15151B] border border-[#292938] rounded-2xl p-4">
            <h2 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C8A951]" />
              <span>دفتر کل و رهگیری ممیزی تغییرات نرخ (Audit Trail)</span>
            </h2>
            <p className="text-xs text-[#8A8A9E] mt-0.5">
              ثبت تاریخچه کامل کلیه دستکاری‌ها، تأییدها و نوسانات نرخ‌های طلا همراه با شناسه اپراتور و آدرس شبکه
            </p>
          </div>

          <div className="bg-[#15151B] border border-[#292938] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#262634] text-[#868698] bg-[#1A1A24]">
                    <th className="py-3 px-4">زمان ثبت</th>
                    <th className="py-3 px-4">نماد طلا</th>
                    <th className="py-3 px-4">نرخ قبل</th>
                    <th className="py-3 px-4">نرخ بعد</th>
                    <th className="py-3 px-4 text-center">نوسان (%)</th>
                    <th className="py-3 px-4">اپراتور / مبدا</th>
                    <th className="py-3 px-4">دلیل و توجیه</th>
                    <th className="py-3 px-4">وضعیت / تاییدکننده</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222230]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#1A1A26] transition-colors">
                      <td className="py-3 px-4 font-mono text-[#8A8A9E] text-[11px]">
                        {log.timestampFa}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#EDEDED]">
                        {log.titleFa}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#8A8A9E]">
                        {new Intl.NumberFormat('fa-IR').format(log.oldSellPrice)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#E5C365]">
                        {new Intl.NumberFormat('fa-IR').format(log.newSellPrice)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono px-2 py-0.5 rounded text-[11px] font-bold ${
                            log.deltaPercent >= 0
                              ? 'bg-[#3DD68C]/15 text-[#3DD68C]'
                              : 'bg-[#E5484D]/15 text-[#E5484D]'
                          }`}
                        >
                          {log.deltaPercent >= 0 ? `+${log.deltaPercent}%` : `${log.deltaPercent}%`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#EDEDED] block">{log.operatorNameFa}</span>
                        <span className="text-[10px] text-[#7A7A8E] font-mono">{log.ipAddress}</span>
                      </td>
                      <td className="py-3 px-4 text-[#A1A1B2] max-w-xs truncate" title={log.reason}>
                        {log.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold block w-fit ${
                            log.status === 'applied'
                              ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                              : log.status === 'pending_dual_approval'
                              ? 'bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/30'
                              : 'bg-[#8A8A9E]/15 text-[#8A8A9E]'
                          }`}
                        >
                          {log.statusFa}
                        </span>
                        {log.approverNameFa && (
                          <span className="text-[10px] text-[#7A7A8E] block mt-0.5">
                            تأیید: {log.approverNameFa}
                          </span>
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

      {/* TAB 5: SECURITY RULES & THRESHOLDS */}
      {activeTab === 'security_rules' && (
        <div className="space-y-5">
          <div className="bg-[#15151B] border border-[#292938] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#C8A951]" />
              <span>پیکربندی سیاست‌های امنیتی و سقف نوسانات طلا</span>
            </h2>
            <p className="text-xs text-[#8A8A9E]">
              تنظیمات سقف‌های مجاز نوسان لحظه‌ای، فعال‌سازی تأیید دومرحله‌ای و کنترل فید داده‌ها
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#1C1C26] border border-[#2D2D3E] rounded-xl p-4 space-y-2">
                <label className="text-xs font-bold text-[#EDEDED] block">
                  آستانه الزام به تأیید دونفره (Dual Approval Threshold):
                </label>
                <p className="text-[11px] text-[#7A7A8E]">
                  هرگونه تغییر دستی بالاتر از این درصد نوسان، نیازمند تأیید یک مدیر ریسک مستقل خواهد بود.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="10.0"
                    value={securityPolicy.dualApprovalThresholdPercent}
                    onChange={(e) =>
                      onUpdatePolicy({ dualApprovalThresholdPercent: parseFloat(e.target.value) || 1.5 })
                    }
                    className="w-28 bg-[#242432] border border-[#38384C] rounded-lg px-3 py-1.5 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                  <span className="text-xs text-[#8A8A9E] font-mono">درصد (%)</span>
                </div>
              </div>

              <div className="bg-[#1C1C26] border border-[#2D2D3E] rounded-xl p-4 space-y-2">
                <label className="text-xs font-bold text-[#EDEDED] block">
                  آستانه هشدار توقف بازار (Circuit Breaker Delta):
                </label>
                <p className="text-[11px] text-[#7A7A8E]">
                  در صورت نوسان ناگهانی بیش از این حد، سامانه به صورت خودکار پیشنهاد قطع معاملات را صادر می‌کند.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    step="0.5"
                    min="2.0"
                    max="15.0"
                    value={securityPolicy.circuitBreakerThresholdPercent}
                    onChange={(e) =>
                      onUpdatePolicy({ circuitBreakerThresholdPercent: parseFloat(e.target.value) || 4.0 })
                    }
                    className="w-28 bg-[#242432] border border-[#38384C] rounded-lg px-3 py-1.5 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                  <span className="text-xs text-[#8A8A9E] font-mono">درصد (%)</span>
                </div>
              </div>

              <div className="bg-[#1C1C26] border border-[#2D2D3E] rounded-xl p-4 space-y-2">
                <label className="text-xs font-bold text-[#EDEDED] block">
                  منبع داده‌های تابلوی طلا (Feed Source Mode):
                </label>
                <p className="text-[11px] text-[#7A7A8E]">
                  نحوه دریافت و تطبیق نرخ‌های پایه با بازار آزاد و اتحادیه
                </p>
                <select
                  value={securityPolicy.feedSource}
                  onChange={(e) =>
                    onUpdatePolicy({ feedSource: e.target.value as any })
                  }
                  className="w-full bg-[#242432] border border-[#38384C] rounded-lg px-3 py-1.5 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                >
                  <option value="hybrid">هیبرید هوشمند (اتحادیه رسمی تهران + بازنویسی خزانه‌داری دیدار)</option>
                  <option value="live_union_feed">فقط وب‌سرویس اتحادیه طلا و جواهر تهران</option>
                  <option value="manual_governed">دستی کنترل‌شده (فقط نرخ‌های اعلامی میز معاملات دیدار)</option>
                </select>
              </div>

              <div className="bg-[#1C1C26] border border-[#2D2D3E] rounded-xl p-4 space-y-2">
                <label className="text-xs font-bold text-[#EDEDED] block">
                  حداقل اسپرد خرید و فروش (Min Spread Buffer):
                </label>
                <p className="text-[11px] text-[#7A7A8E]">
                  حداقل اختلاف ریالی مجاز بین مظنه خرید و فروش جهت جلوگیری از آربیتراژ منفی
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    step="5000"
                    min="10000"
                    value={securityPolicy.minSpreadToman}
                    onChange={(e) =>
                      onUpdatePolicy({ minSpreadToman: parseInt(e.target.value) || 25000 })
                    }
                    className="w-40 bg-[#242432] border border-[#38384C] rounded-lg px-3 py-1.5 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                  <span className="text-xs text-[#8A8A9E]">تومان به ازای هر گرم</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: MANUAL RATE OVERRIDE */}
      {isModifyModalOpen && selectedRate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171722] border border-[#303044] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A2A3C] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EDEDED]">
                    تغییر دستی مظنه طلا: {selectedRate.titleFa}
                  </h3>
                  <span className="text-[11px] text-[#8A8A9E] font-mono">{selectedRate.symbol}</span>
                </div>
              </div>
              <button
                onClick={() => setIsModifyModalOpen(false)}
                className="p-1 rounded-lg text-[#7A7A8E] hover:text-[#EDEDED] hover:bg-[#252535] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Operator Warning / Context */}
            <div className="bg-[#1C1C28] border border-[#2D2D40] rounded-xl p-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-[#8A8A9E] block text-[11px]">اپراتور تغییردهنده:</span>
                <span className="font-bold text-[#EDEDED]">{activeOperator.nameFa}</span>
                <span className="text-[10px] text-[#C8A951] block">{activeOperator.roleFa}</span>
              </div>
              <div className="text-left">
                <span className="text-[#8A8A9E] block text-[11px]">سقف مجاز نوسان:</span>
                <span className="font-bold font-mono text-[#3DD68C]">
                  {activeOperator.maxAllowedDailyChangePercent > 0 ? `±${activeOperator.maxAllowedDailyChangePercent}%` : 'نامحدود'}
                </span>
              </div>
            </div>

            <form onSubmit={handleRateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8A8A9E] block mb-1">مظنه فروش جدید (تومان):</label>
                  <input
                    type="number"
                    required
                    step="1000"
                    value={newSellPriceInput}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setNewSellPriceInput(val);
                      setNewBuyPriceInput(Math.round(val * 0.994));
                    }}
                    className="w-full bg-[#1F1F2C] border border-[#303044] rounded-xl px-3 py-2 text-sm text-[#E5C365] font-mono font-bold focus:border-[#C8A951] outline-none"
                  />
                  <span className="text-[10px] text-[#6B6B7C] block mt-0.5">
                    فعلی: {new Intl.NumberFormat('fa-IR').format(selectedRate.sellPriceToman)} تومان
                  </span>
                </div>

                <div>
                  <label className="text-[#8A8A9E] block mb-1">مظنه خرید جدید (تسویه):</label>
                  <input
                    type="number"
                    required
                    step="1000"
                    value={newBuyPriceInput}
                    onChange={(e) => setNewBuyPriceInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1F1F2C] border border-[#303044] rounded-xl px-3 py-2 text-sm text-[#EDEDED] font-mono font-bold focus:border-[#C8A951] outline-none"
                  />
                  <span className="text-[10px] text-[#6B6B7C] block mt-0.5">
                    فعلی: {new Intl.NumberFormat('fa-IR').format(selectedRate.buyPriceToman)} تومان
                  </span>
                </div>
              </div>

              {/* Real-time Delta Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isAboveDualThreshold
                    ? 'bg-[#E5484D]/10 border-[#E5484D]/30 text-[#E5484D]'
                    : 'bg-[#3DD68C]/10 border-[#3DD68C]/30 text-[#3DD68C]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <div>
                    <span className="font-bold block">
                      درصد نوسان نسبت به نرخ قبلی: {priceDeltaPercent >= 0 ? `+${priceDeltaPercent}%` : `${priceDeltaPercent}%`}
                    </span>
                    <span className="text-[10px] text-[#8A8A9E] block">
                      {isAboveDualThreshold
                        ? `توجه: به دلیل عبور از آستانه ${securityPolicy.dualApprovalThresholdPercent}٪، ثبت نهایی نیازمند تأیید دونفره (Dual Approval) است.`
                        : 'در محدوده مجاز امنیتی - اعمال به صورت آنی'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[#8A8A9E] block mb-1">علت و مستندات تغییر نرخ (الزامی جهت ممیزی):</label>
                <textarea
                  required
                  rows={2}
                  placeholder="مثال: جهش انس جهانی در بورس لندن، بازگشایی حراج مرکز مبادله..."
                  value={rateChangeReason}
                  onChange={(e) => setRateChangeReason(e.target.value)}
                  className="w-full bg-[#1F1F2C] border border-[#303044] rounded-xl p-2.5 text-[#EDEDED] focus:border-[#C8A951] outline-none text-xs"
                />
              </div>

              {formFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    formFeedback.type === 'success'
                      ? 'bg-[#3DD68C]/20 text-[#3DD68C] border border-[#3DD68C]/40'
                      : formFeedback.type === 'warning'
                      ? 'bg-[#E5C365]/20 text-[#E5C365] border border-[#E5C365]/40'
                      : 'bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/40'
                  }`}
                >
                  {formFeedback.message}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModifyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#242432] text-[#EDEDED] font-semibold hover:bg-[#2E2E40] cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRate}
                  className="px-4 py-2 rounded-xl bg-[#C8A951] text-[#141416] font-bold hover:brightness-110 cursor-pointer shadow-md shadow-[#C8A951]/20 flex items-center gap-1.5"
                >
                  {isSubmittingRate && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAboveDualThreshold ? 'ارسال جهت تأیید دونفره' : 'ثبت و اعمال مستقیم نرخ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: USER ACCESS EDIT / CREATE */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171722] border border-[#303044] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A2A3C] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EDEDED]">
                    {editingUserId ? 'ویرایش سطوح دسترسی اپراتور' : 'تعریف اپراتور جدید نرخ طلا'}
                  </h3>
                  <span className="text-[11px] text-[#8A8A9E]">تعیین اختیارات دقیق در زنجیره مظنه‌گذاری خزانه‌داری دیدار</span>
                </div>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg text-[#7A7A8E] hover:text-[#EDEDED] hover:bg-[#252535] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8A8A9E] block mb-1">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    required
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    className="w-full bg-[#1F1F2C] border border-[#303044] rounded-xl px-3 py-2 text-[#EDEDED] focus:border-[#C8A951] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#8A8A9E] block mb-1">ایمیل سازمانی:</label>
                  <input
                    type="email"
                    required
                    value={userEmailInput}
                    onChange={(e) => setUserEmailInput(e.target.value)}
                    className="w-full bg-[#1F1F2C] border border-[#303044] rounded-xl px-3 py-2 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#8A8A9E] block mb-1">کد ملی:</label>
                  <input
                    type="text"
                    required
                    value={userNationalIdInput}
                    onChange={(e) => setUserNationalIdInput(e.target.value)}
                    className="w-full bg-[#1F1F2C] border border-[#303044] rounded-xl px-3 py-2 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#8A8A9E] block mb-1">نقش سازمانی:</label>
                  <select
                    value={userRoleInput}
                    onChange={(e) => setUserRoleInput(e.target.value as RateUserRole)}
                    className="w-full bg-[#1F1F2C] border border-[#303044] rounded-xl px-3 py-2 text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                  >
                    <option value="CHIEF_TREASURER">مدیر ارشد خزانه‌داری (دسترسی کامل)</option>
                    <option value="RATE_OPERATOR">اپراتور ارشد ثبت مظنه بازار</option>
                    <option value="RISK_MANAGER">مدیر ریسک و انطباق استاندارد طلا</option>
                    <option value="BRANCH_TRADER">معامله‌گر مجاز شعبه</option>
                    <option value="AUDITOR">ناظر و حسابرس سیستم</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#8A8A9E] block mb-1">سقف مجاز نوسان روزانه (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={userMaxDeltaInput}
                    onChange={(e) => setUserMaxDeltaInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1F1F2C] border border-[#303044] rounded-xl px-3 py-2 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#8A8A9E] block mb-1">وضعیت حساب:</label>
                  <select
                    value={userStatusInput}
                    onChange={(e) => setUserStatusInput(e.target.value as 'active' | 'suspended')}
                    className="w-full bg-[#1F1F2C] border border-[#303044] rounded-xl px-3 py-2 text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                  >
                    <option value="active">فعال</option>
                    <option value="suspended">معلق / غیرفعال</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div>
                <label className="text-[#8A8A9E] block mb-2 font-bold">مجوزهای دسترسی تفکیکی:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#1C1C28] border border-[#2B2B3C] p-3 rounded-xl">
                  {PERMISSION_CONFIG.map((perm) => {
                    const isChecked = userPermissionsInput.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className="flex items-start gap-2 text-xs text-[#EDEDED] cursor-pointer p-1.5 rounded-lg hover:bg-[#252535]"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUserPermissionsInput([...userPermissionsInput, perm.key]);
                            } else {
                              setUserPermissionsInput(userPermissionsInput.filter((k) => k !== perm.key));
                            }
                          }}
                          className="mt-0.5 accent-[#C8A951] cursor-pointer"
                        />
                        <div>
                          <span className="font-bold block">{perm.labelFa}</span>
                          <span className="text-[10px] text-[#7A7A8E]">{perm.descriptionFa}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#242432] text-[#EDEDED] font-semibold hover:bg-[#2E2E40] cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C8A951] text-[#141416] font-bold hover:brightness-110 cursor-pointer shadow-md shadow-[#C8A951]/20"
                >
                  ذخیره اطلاعات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CIRCUIT BREAKER TRIGGER */}
      {isCircuitBreakerModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171722] border border-[#E5484D]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-[#2A2A3C] pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#EDEDED]">
                  فعال‌سازی فیوز توقف معاملات طلا (Circuit Breaker)
                </h3>
                <span className="text-[11px] text-[#8A8A9E]">مسدودسازی آنی کلیه سفارش‌گذاری‌ها و تغییرات مظنه</span>
              </div>
            </div>

            <p className="text-xs text-[#A1A1B2]">
              با فعال‌سازی این قابلیت، تابلوی نرخ طلا منجمد شده و صدور فاکتور و قفل مظنه برای جلوگیری از خسارت ناشی از شوک‌های غیرمنتظره ارزی یا جنگی متوقف می‌گردد.
            </p>

            <div>
              <label className="text-[#8A8A9E] block mb-1 text-xs">علت توقف اضطراری (الزامی):</label>
              <textarea
                required
                rows={3}
                placeholder="مثلاً: نوسان ناگهانی انس جهانی به دلیل شوک سیاسی، افزایش تقاضای هیجانی..."
                value={circuitBreakerReasonInput}
                onChange={(e) => setCircuitBreakerReasonInput(e.target.value)}
                className="w-full bg-[#1F1F2C] border border-[#303044] rounded-xl p-2.5 text-[#EDEDED] focus:border-[#E5484D] outline-none text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsCircuitBreakerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#242432] text-[#EDEDED] font-semibold hover:bg-[#2E2E40] cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={!circuitBreakerReasonInput.trim()}
                onClick={async () => {
                  if (!circuitBreakerReasonInput.trim()) return;
                  await onToggleCircuitBreaker(true, circuitBreakerReasonInput, activeOperator.id);
                  setIsCircuitBreakerModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#E5484D] text-white font-bold hover:brightness-110 cursor-pointer shadow-md shadow-[#E5484D]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                توقف قطعی بازار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
