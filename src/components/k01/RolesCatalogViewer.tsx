import React, { useState, useEffect, useMemo } from 'react';
import { RoleDefinition, PermissionDefinition } from '../../types/rbac.js';
import { api } from '../../lib/api.js';
import {
  Shield,
  Search,
  Filter,
  Layers,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Smartphone,
  Eye,
  Building,
  UserCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const CATEGORY_NAMES_FA: Record<string, string> = {
  governance: 'حکمرانی و معماری هویت',
  compliance: 'انطباق، ریسک و پولشویی',
  treasury: 'خزانه‌داری و کنترل فیزیکی طلا',
  finance: 'مالی، حسابداری و تسویه',
  supply: 'عملیات زنجیره تأمین و سفارش',
  retailer: 'کسب‌وکار و فروشگاه خرده‌فروشی',
  supplier: 'تأمین‌کننده، کارگاه و بنکداری',
  agent: 'ناوگان و عاملان میدانی دیدار',
  individual: 'کاربران و اعضای حقیقی'
};

const ENVIRONMENT_NAMES_FA: Record<string, string> = {
  'app-kernel': 'هسته مدیریتی (Kernel)',
  'app-retailer': 'پنل خرده‌فروشی (Retailer)',
  'app-agent': 'اپلیکیشن ویزیتور و ناوگان (Agent)',
  'app-supplier': 'پنل بنکدار / تأمین‌کننده (Supplier)'
};

export const RolesCatalogViewer: React.FC = () => {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEnv, setSelectedEnv] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [fetchedRoles, fetchedPerms] = await Promise.all([
        api.getRoles(),
        api.getPermissions()
      ]);
      setRoles(fetchedRoles);
      setPermissions(fetchedPerms);
      if (fetchedRoles.length > 0 && !selectedRole) {
        setSelectedRole(fetchedRoles[0]);
      }
    } catch (err) {
      console.error('Error loading RBAC catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    roles.forEach(r => set.add(r.category));
    return Array.from(set);
  }, [roles]);

  const environments = useMemo(() => {
    const set = new Set<string>();
    roles.forEach(r => set.add(r.targetEnvironment));
    return Array.from(set);
  }, [roles]);

  const filteredRoles = useMemo(() => {
    return roles.filter(r => {
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      if (selectedEnv !== 'all' && r.targetEnvironment !== selectedEnv) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = r.titleFa.includes(q) || r.titleEn.toLowerCase().includes(q);
        const matchKey = r.roleKey.toLowerCase().includes(q);
        const matchCode = r.analysisCode.toLowerCase().includes(q);
        const matchDesc = r.descriptionFa.includes(q);
        return matchTitle || matchKey || matchCode || matchDesc;
      }
      return true;
    });
  }, [roles, selectedCategory, selectedEnv, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1C1A14] via-[#1A1A24] to-[#14141E] border border-[#3A3222] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40">
              DIDAR-KERNEL-ACCESS-CHANGE-001
            </span>
            <span className="text-xs text-[#8E8E9F]">استاندارد مرجع امنیت و کنترل دسترسی</span>
          </div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C8A951]" />
            کاتالوگ ۷۰ نقش استاندارد سامانه دیدار در ۹ دسته عملیاتی
          </h2>
          <p className="text-xs text-[#A0A0B2] mt-1 leading-relaxed max-w-3xl">
            ماتریس جامع تفکیک وظایف، نقش‌های عملیاتی ۴ محیط نرم‌افزاری (هسته، خرده‌فروشی، عاملان میدانی و بنکداران) و کدهای ریزدانه‌ای مجوز با تفکیک صریح اختیارات.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-[#14141C] border border-[#2B2B3C] text-center">
            <div className="text-[10px] text-[#8E8E9F]">تعداد نقش‌ها</div>
            <div className="text-base font-bold font-mono text-[#C8A951]">{roles.length} نقش</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-[#14141C] border border-[#2B2B3C] text-center">
            <div className="text-[10px] text-[#8E8E9F]">دسته‌های کاری</div>
            <div className="text-base font-bold font-mono text-white">{categories.length} دسته</div>
          </div>
          <button
            onClick={loadCatalog}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#222230] hover:bg-[#2D2D40] text-[#A0A0B0] hover:text-white border border-[#3A3A4C] transition-colors cursor-pointer disabled:opacity-50"
            title="تازه‌سازی"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-xl bg-[#171722] border border-[#262634] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7A7A8E] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در نام نقش، کلید سیستمی (مثلاً treasury.vault_custodian)، کد یا شرح وظایف..."
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-[#121218] border border-[#2D2D3E] text-xs text-white placeholder:text-[#646476] focus:outline-none focus:border-[#C8A951] transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#C8A951] shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#121218] border border-[#2D2D3E] text-xs text-[#E0E0E8] focus:outline-none focus:border-[#C8A951] cursor-pointer"
          >
            <option value="all">همه ۹ دسته عملیاتی ({roles.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_NAMES_FA[cat] || cat} ({roles.filter(r => r.category === cat).length})
              </option>
            ))}
          </select>
        </div>

        {/* Environment Filter */}
        <div>
          <select
            value={selectedEnv}
            onChange={(e) => setSelectedEnv(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#121218] border border-[#2D2D3E] text-xs text-[#E0E0E8] focus:outline-none focus:border-[#C8A951] cursor-pointer"
          >
            <option value="all">همه محیط‌های کاربری</option>
            {environments.map(env => (
              <option key={env} value={env}>
                {ENVIRONMENT_NAMES_FA[env] || env}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Role List (Left) + Role Details Inspection (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Role Cards List */}
        <div className="lg:col-span-7 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#8E8E9F]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#C8A951]" />
              <span className="text-xs">در حال بارگذاری کاتالوگ نقش‌ها...</span>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="py-16 text-center text-[#8E8E9F] bg-[#161620] rounded-xl border border-[#252534]">
              <AlertCircle className="w-8 h-8 mx-auto text-[#E5A84B] mb-2" />
              <p className="text-xs font-semibold">هیچ نقشی با مشخصات جستجو شده یافت نشد.</p>
            </div>
          ) : (
            filteredRoles.map((role) => {
              const isSelected = selectedRole?.roleKey === role.roleKey;
              return (
                <div
                  key={role.roleKey}
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#201D16] to-[#181822] border-[#C8A951] shadow-lg shadow-[#C8A951]/10'
                      : 'bg-[#161620] border-[#252534] hover:border-[#38384C] hover:bg-[#1A1A26]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">
                          {role.titleFa}
                        </span>
                        <span className="text-[11px] text-[#A0A0B2] font-medium">
                          ({role.titleEn})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#20202E] text-[#C8A951] border border-[#313144]">
                          {role.roleKey}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#242434] text-[#8E8E9F]">
                          کد: {role.analysisCode}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30">
                        {CATEGORY_NAMES_FA[role.category] || role.category}
                      </span>
                      <span className="text-[10px] text-[#7A7A8C]">
                        {ENVIRONMENT_NAMES_FA[role.targetEnvironment] || role.targetEnvironment}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#A0A0B2] mt-2 line-clamp-2 leading-relaxed">
                    {role.descriptionFa}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[#232332] flex items-center justify-between text-[11px] text-[#7A7A8C]">
                    <div className="flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-[#C8A951]" />
                      <span>{role.defaultPermissions.length} مجوز پیش‌فرض</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#1D1D2A] text-[10px] text-[#9E9EA8]">
                        نسخه {role.version}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Role Deep-Inspection Panel */}
        <div className="lg:col-span-5">
          {selectedRole ? (
            <div className="sticky top-6 p-5 rounded-2xl bg-[#171722] border border-[#2B2B3C] space-y-5 shadow-2xl">
              {/* Header */}
              <div className="border-b border-[#29293A] pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40">
                    {CATEGORY_NAMES_FA[selectedRole.category] || selectedRole.category}
                  </span>
                  <span className="font-mono text-xs text-[#8E8E9F]">
                    کد تحلیل: {selectedRole.analysisCode}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {selectedRole.titleFa}
                </h3>
                <div className="text-xs text-[#A0A0B2] font-medium mt-0.5">
                  {selectedRole.titleEn}
                </div>
                <div className="mt-2 font-mono text-xs px-2.5 py-1 rounded bg-[#111118] text-[#C8A951] border border-[#2A2A3A] select-all">
                  {selectedRole.roleKey}
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-xs font-semibold text-[#8E8E9F] block mb-1">
                  شرح وظایف و مأموریت سازمانی:
                </span>
                <p className="text-xs text-[#EDEDED] leading-relaxed bg-[#121218] p-3 rounded-xl border border-[#232332]">
                  {selectedRole.descriptionFa}
                </p>
              </div>

              {/* Environment & Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#14141D] border border-[#242432]">
                  <span className="text-[11px] text-[#7A7A8C] block">محیط دسترسی</span>
                  <span className="font-semibold text-white mt-0.5 block">
                    {ENVIRONMENT_NAMES_FA[selectedRole.targetEnvironment] || selectedRole.targetEnvironment}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#14141D] border border-[#242432]">
                  <span className="text-[11px] text-[#7A7A8C] block">نسخه کاتالوگ</span>
                  <span className="font-semibold text-white mt-0.5 block">
                    نسخه {selectedRole.version} (فعال)
                  </span>
                </div>
              </div>

              {/* Default Permissions List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#8E8E9F] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#C8A951]" />
                    <span>مجوزهای عملیاتی متصل ({selectedRole.defaultPermissions.length}):</span>
                  </span>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {selectedRole.defaultPermissions.length === 0 ? (
                    <div className="p-3 rounded-xl bg-[#121218] text-center text-xs text-[#7A7A8C]">
                      هیچ مجوز مستقیمی متصل نشده است.
                    </div>
                  ) : (
                    selectedRole.defaultPermissions.map((permKey) => {
                      const permDef = permissions.find(p => p.key === permKey);
                      return (
                        <div
                          key={permKey}
                          className="p-2.5 rounded-lg bg-[#121218] border border-[#232332] flex items-start justify-between gap-2 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="font-medium text-white flex items-center gap-1.5">
                              <span>{permDef?.titleFa || permKey}</span>
                              {permDef?.isSensitive && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30">
                                  حساس
                                </span>
                              )}
                              {permDef?.requiresMfa && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#E5A84B]/15 text-[#E5A84B] border border-[#E5A84B]/30">
                                  MFA
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-[#7A7A8E]">
                              {permKey}
                            </div>
                          </div>

                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1D1D2A] text-[#C8A951]">
                            {permDef?.domain || 'COMMON'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-[#8E8E9F] bg-[#161620] rounded-2xl border border-[#262634]">
              <Eye className="w-8 h-8 mx-auto text-[#C8A951] mb-2 opacity-50" />
              <p className="text-xs">یک نقش را از فهرست سمت راست انتخاب کنید تا جزییات کامل آن نمایش داده شود.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
