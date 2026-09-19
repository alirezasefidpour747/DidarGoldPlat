import React, { useState } from 'react';
import {
  RoleAssignment,
  WorkContext,
  EffectiveAccessResult
} from '../../types/rbac.js';
import { Party, Organization, Membership } from '../../types/k01.js';
import { api } from '../../lib/api.js';
import {
  ShieldCheck,
  UserCheck,
  Building2,
  Lock,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface EffectiveAccessExplorerProps {
  persons: Party[];
  organizations: Organization[];
  memberships: Membership[];
}

export const EffectiveAccessExplorer: React.FC<EffectiveAccessExplorerProps> = ({
  persons,
  organizations,
  memberships
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(persons[0]?.id || '');
  const [contextType, setContextType] = useState<'personal' | 'organization'>('organization');
  const [selectedOrgId, setSelectedOrgId] = useState<string>(organizations[0]?.id || '');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EffectiveAccessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPerson = persons.find(p => p.id === selectedPersonId);
  const userMemberships = memberships.filter(m => m.partyId === selectedPersonId);

  const handleEvaluate = async () => {
    if (!selectedPersonId) return;
    setLoading(true);
    setError(null);

    try {
      const context: WorkContext = {
        contextType,
        partyId: selectedPersonId,
        organizationId: contextType === 'organization' ? selectedOrgId : undefined,
        activeRoleKeys: []
      };

      const res = await api.getEffectiveAccess(selectedPersonId, context);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ارزیابی دسترسی مؤثر');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#1C1C26] via-[#1E1E2C] to-[#171722] border border-[#2B2B3D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C8A951]" />
            کاوشگر و موتور ارزیابی دسترسی مؤثر (K02 Effective Access)
          </h2>
          <p className="text-xs text-[#A0A0B2] mt-1 max-w-2xl leading-relaxed">
            محاسبه قطعی و زمان واقعی مجوزهای عملیاتی، تفکیک وظایف و محدوده‌های دسترسی شخص بر مبنای نقش‌های معتبر در زمینه کاری انتخابی (سازمانی یا فردی).
          </p>
        </div>

        <button
          onClick={handleEvaluate}
          disabled={loading || !selectedPersonId}
          className="px-4 py-2 bg-[#C8A951] hover:bg-[#D4B765] text-[#141416] font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          محاسبه و ارزیابی زنده
        </button>
      </div>

      {/* Control Panel: Person & Context Picker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#181822] border border-[#262634]">
        {/* Person Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#A0A0B2] mb-1.5 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-[#C8A951]" />
            انتخاب شخص (K01 Person):
          </label>
          <select
            value={selectedPersonId}
            onChange={(e) => {
              setSelectedPersonId(e.target.value);
              setResult(null);
            }}
            className="w-full bg-[#1F1F2C] border border-[#2C2C3D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8A951]"
          >
            {persons.map(p => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} ({p.nationalId}) - {p.partyType}
              </option>
            ))}
          </select>
        </div>

        {/* WorkContext Type */}
        <div>
          <label className="block text-xs font-semibold text-[#A0A0B2] mb-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#C8A951]" />
            نوع زمینه کاری (WorkContext):
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setContextType('organization');
                setResult(null);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                contextType === 'organization'
                  ? 'bg-[#C8A951]/15 text-[#C8A951] border-[#C8A951]/40'
                  : 'bg-[#1F1F2C] text-[#868698] border-[#2C2C3D] hover:text-white'
              }`}
            >
              سازمانی (مجموعه/فروشگاه)
            </button>
            <button
              type="button"
              onClick={() => {
                setContextType('personal');
                setResult(null);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                contextType === 'personal'
                  ? 'bg-[#C8A951]/15 text-[#C8A951] border-[#C8A951]/40'
                  : 'bg-[#1F1F2C] text-[#868698] border-[#2C2C3D] hover:text-white'
              }`}
            >
              شخصی (Individual)
            </button>
          </div>
        </div>

        {/* Target Organization (if organizational) */}
        <div>
          <label className="block text-xs font-semibold text-[#A0A0B2] mb-1.5 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#C8A951]" />
            مجموعه سازمانی هدف:
          </label>
          {contextType === 'organization' ? (
            <select
              value={selectedOrgId}
              onChange={(e) => {
                setSelectedOrgId(e.target.value);
                setResult(null);
              }}
              className="w-full bg-[#1F1F2C] border border-[#2C2C3D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8A951]"
            >
              {organizations.map(org => {
                const hasMembership = userMemberships.some(m => m.organizationId === org.id);
                return (
                  <option key={org.id} value={org.id}>
                    {org.displayName} {hasMembership ? '✓ (عضویت دارد)' : '✗ (فاقد عضویت)'}
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="w-full bg-[#14141A] border border-[#262634] rounded-lg px-3 py-2 text-xs text-[#737385] italic">
              غیرفعال در زمینه شخصی
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Display */}
      {result ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#181822] border border-[#262634]">
              <span className="text-[11px] text-[#868698] block mb-1">تعداد نقش‌های فعال در این زمینه:</span>
              <strong className="text-xl font-bold text-white font-mono">{result.roles.length}</strong>
            </div>

            <div className="p-4 rounded-xl bg-[#181822] border border-[#262634]">
              <span className="text-[11px] text-[#868698] block mb-1">تعداد مجوزهای قطعی اعطاشده:</span>
              <strong className="text-xl font-bold text-[#3DD68C] font-mono">{result.permissions.length}</strong>
            </div>

            <div className="p-4 rounded-xl bg-[#181822] border border-[#262634]">
              <span className="text-[11px] text-[#868698] block mb-1">زمان دقیق اعتبارسنجی سرور:</span>
              <span className="text-xs font-mono text-[#C8A951]">
                {new Date(result.evaluatedAt).toLocaleTimeString('fa-IR')}
              </span>
            </div>
          </div>

          {/* Explanation logs */}
          <div className="p-4 rounded-xl bg-[#161620] border border-[#262638] space-y-1.5">
            <h4 className="text-xs font-bold text-[#C8A951] flex items-center gap-1.5 mb-2">
              <Info className="w-3.5 h-3.5" />
              ردپای استدلال ارزیابی امنیتی سرور (Deterministic Reasoning):
            </h4>
            {result.explanationFa.map((exp, idx) => (
              <p key={idx} className="text-xs text-[#B5B5C2] leading-relaxed flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A951]"></span>
                {exp}
              </p>
            ))}
          </div>

          {/* Active Roles in Context */}
          <div className="rounded-xl bg-[#181822] border border-[#262634] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#262634] bg-[#1C1C28]">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A951]" />
                نقش‌های معتبر در این زمینه کاری
              </h3>
            </div>
            {result.roles.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#777788]">
                هیچ نقش معتبری برای این شخص در این زمینه کاری ثبت نشده است.
              </div>
            ) : (
              <div className="divide-y divide-[#262634]">
                {result.roles.map((r, i) => (
                  <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white">{r.titleFa}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-[#868698]">{r.roleKey}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#242434] text-[#C8A951] border border-[#C8A951]/20">
                          محدوده: {r.scope.labelFa || r.scope.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#868698] flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>اعتبار از {r.validFrom?.split('T')[0] || 'هم‌اکنون'}</span>
                      {r.validTo && <span>تا {r.validTo?.split('T')[0]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Effective Permissions Table */}
          <div className="rounded-xl bg-[#181822] border border-[#262634] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#262634] bg-[#1C1C28] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3DD68C]" />
                مجوزهای عملیاتی مؤثر (Effective Permissions Matrix)
              </h3>
              <span className="text-[11px] font-mono text-[#3DD68C]">{result.permissions.length} مجوز فعال</span>
            </div>

            {result.permissions.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#777788]">
                هیچ مجوزی صادر نشده است. کلیه درخواست‌های عملیاتی در این زمینه توسط سرور رد خواهند شد (Default Deny).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs text-white">
                  <thead className="bg-[#14141B] text-[#868698] border-b border-[#262634]">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">کد مجوز (Permission Key)</th>
                      <th className="px-4 py-2.5 font-medium">عنوان اقدام</th>
                      <th className="px-4 py-2.5 font-medium">دامنه</th>
                      <th className="px-4 py-2.5 font-medium">حاصل از نقش</th>
                      <th className="px-4 py-2.5 font-medium">محدوده اعمال (Scope)</th>
                      <th className="px-4 py-2.5 font-medium">سطح حساسیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262634]">
                    {result.permissions.map((p, i) => (
                      <tr key={i} className="hover:bg-[#1E1E2C] transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#E5C365]">
                          {p.permissionKey}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-white">{p.titleFa}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#242434] text-[#A0A0B2]">
                            {p.domain}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-[#A0A0B2]">
                          {p.grantedViaRoles.join(', ')}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-[#C8A951]">
                          {p.scope.labelFa || `${p.scope.type} (${p.scope.ids?.join(', ')})`}
                        </td>
                        <td className="px-4 py-2.5">
                          {p.isSensitive ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              حساس (نیازمند ۴ چشم/MFA)
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] text-[#868698]">عادی</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 border border-dashed border-[#2B2B3C] rounded-xl flex flex-col items-center justify-center text-center p-6">
          <Eye className="w-8 h-8 text-[#555566] mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">داده‌ای محاسبه نشده است</h4>
          <p className="text-xs text-[#868698] max-w-md">
            شخص و زمینه کاری مورد نظر را از کنترل‌های بالا انتخاب نمایید و بر روی دکمه «محاسبه و ارزیابی زنده» کلیک کنید تا ماتریس اختیارات توسط سرور استخراج گردد.
          </p>
        </div>
      )}
    </div>
  );
};
