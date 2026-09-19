import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import {
  Building2,
  User,
  ChevronDown,
  Check,
  Briefcase,
  ShieldAlert
} from 'lucide-react';

interface WorkspaceSwitcherProps {
  currentPartyId?: string;
  onWorkspaceChange?: (workspace: {
    type: 'personal' | 'organization';
    id: string;
    name: string;
  }) => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  currentPartyId = 'party-admin-001',
  onWorkspaceChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<{
    personal: { partyId: string; name: string };
    organizations: {
      organizationId: string;
      displayName: string;
      membershipId: string;
      title: string;
      activeRoleCount: number;
    }[];
  } | null>(null);

  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    type: 'personal' | 'organization';
    id: string;
    name: string;
  }>({
    type: 'organization',
    id: 'org-didar-core-001',
    name: 'هسته مرکزی پلتفرم دیدار'
  });

  useEffect(() => {
    loadWorkspaces();
  }, [currentPartyId]);

  const loadWorkspaces = async () => {
    try {
      const data = await api.getUserWorkspaces(currentPartyId);
      if (data) {
        setWorkspaces(data);
        if (data.organizations?.length > 0) {
          const firstOrg = data.organizations[0];
          const initial = {
            type: 'organization' as const,
            id: firstOrg.organizationId,
            name: firstOrg.displayName
          };
          setSelectedWorkspace(initial);
          if (onWorkspaceChange) onWorkspaceChange(initial);
        }
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    }
  };

  const handleSelect = (workspace: {
    type: 'personal' | 'organization';
    id: string;
    name: string;
  }) => {
    setSelectedWorkspace(workspace);
    setIsOpen(false);
    if (onWorkspaceChange) onWorkspaceChange(workspace);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E1E28] hover:bg-[#252534] border border-[#2F2F40] text-xs transition-colors cursor-pointer"
        title="تغییر زمینه کاری (WorkContext Switcher)"
      >
        {selectedWorkspace.type === 'organization' ? (
          <Building2 className="w-3.5 h-3.5 text-[#C8A951]" />
        ) : (
          <User className="w-3.5 h-3.5 text-[#3DD68C]" />
        )}
        <div className="text-right">
          <span className="text-[10px] text-[#868698] block leading-tight">
            {selectedWorkspace.type === 'organization' ? 'زمینه سازمانی:' : 'زمینه شخصی:'}
          </span>
          <span className="font-semibold text-white truncate max-w-[130px] block">
            {selectedWorkspace.name}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#868698] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#1A1A26] border border-[#2F2F42] shadow-2xl z-50 p-2 text-xs space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-[#868698] border-b border-[#252536] mb-1 flex items-center justify-between">
              <span>انتخاب زمینه کاری صریح (AT03 Multi-tenancy)</span>
              <Briefcase className="w-3 h-3 text-[#C8A951]" />
            </div>

            {/* Organizations list */}
            <div className="space-y-1">
              <span className="text-[10px] text-[#A0A0B2] px-2 font-medium">سازمان‌ها و فروشگاه‌ها:</span>
              {workspaces?.organizations?.map((org) => {
                const isSelected =
                  selectedWorkspace.type === 'organization' &&
                  selectedWorkspace.id === org.organizationId;

                return (
                  <button
                    key={org.organizationId}
                    type="button"
                    onClick={() =>
                      handleSelect({
                        type: 'organization',
                        id: org.organizationId,
                        name: org.displayName
                      })
                    }
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-right transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30'
                        : 'text-[#CECED8] hover:bg-[#232332]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-[#C8A951]" />
                      <div>
                        <div className="font-semibold text-white">{org.displayName}</div>
                        <div className="text-[10px] text-[#868698]">
                          {org.title} ({org.activeRoleCount} نقش فعال)
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#C8A951]" />}
                  </button>
                );
              })}
            </div>

            {/* Personal Workspace */}
            {workspaces?.personal && (
              <div className="pt-1 border-t border-[#252536]">
                <button
                  type="button"
                  onClick={() =>
                    handleSelect({
                      type: 'personal',
                      id: workspaces.personal.partyId,
                      name: `فضای شخصی (${workspaces.personal.name})`
                    })
                  }
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-right transition-colors cursor-pointer ${
                    selectedWorkspace.type === 'personal'
                      ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                      : 'text-[#CECED8] hover:bg-[#232332]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 shrink-0 text-[#3DD68C]" />
                    <div>
                      <div className="font-semibold text-white">فضای شخصی (Individual)</div>
                      <div className="text-[10px] text-[#868698]">{workspaces.personal.name}</div>
                    </div>
                  </div>
                  {selectedWorkspace.type === 'personal' && (
                    <Check className="w-3.5 h-3.5 text-[#3DD68C]" />
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
