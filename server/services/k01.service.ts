import { randomUUID } from 'crypto';
import { withTransaction } from '../database/client.js';
import {
  k01Repository,
  mapDocument,
  mapMembership,
  mapOrganization,
  mapParty
} from '../repositories/k01-service.repository.js';
import type {
  AuditEvent,
  EntityStatus,
  K01DataPayload,
  Membership,
  Organization,
  Party,
  PartyDocument,
  VerificationStatus
} from '../../src/types/k01.js';

const entityStatuses = new Set<EntityStatus>(['active', 'pending', 'suspended', 'archived']);
const verificationStatuses = new Set<VerificationStatus>(['unverified', 'pending', 'verified', 'rejected']);

export class K01ServiceError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

function normalizeMobile(value: unknown): string {
  const mobile = String(value ?? '').replace(/\D/g, '');
  if (mobile.length < 10) throw new K01ServiceError('VALIDATION_FAILED', 400, 'شماره همراه معتبر الزامی است.');
  return mobile;
}

function timestamp(value?: string): Date {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) throw new K01ServiceError('VALIDATION_FAILED', 400, 'تاریخ نامعتبر است.');
  return date;
}

function translateDatabaseError(error: unknown): never {
  if (error instanceof K01ServiceError) throw error;
  const candidate = error as { code?: string; cause?: { code?: string } };
  const code = candidate.code ?? candidate.cause?.code;
  if (code === '23505') throw new K01ServiceError('CONFLICT', 409, 'رکوردی با شناسه یکتا یا مقدار یکتای مشابه وجود دارد.');
  if (code === '23503') throw new K01ServiceError('FOREIGN_KEY_CONFLICT', 409, 'رابطه به شخص یا سازمان معتبر نیاز دارد.');
  if (code === '23514' || code === '23502') throw new K01ServiceError('VALIDATION_FAILED', 400, 'داده با محدودیت‌های K01 سازگار نیست.');
  throw new K01ServiceError('DATABASE_UNAVAILABLE', 503, 'ذخیره‌سازی PostgreSQL در دسترس نیست.');
}

function auditValues(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
  return {
    actorId: event.actorId,
    actorName: event.actorName,
    action: event.action,
    targetType: event.targetType,
    targetId: event.targetId,
    targetName: event.targetName,
    description: event.description,
    changes: event.changes
  };
}

export class K01Service {
  async getPayload(): Promise<K01DataPayload> {
    try {
      return await k01Repository.getPayload();
    } catch (error) {
      return translateDatabaseError(error);
    }
  }

  async createPerson(data: Partial<Party>, actorName: string): Promise<Party> {
    try {
      const mobile = normalizeMobile(data.mobile);
      if (data.partyType === 'field_agent' && !data.agentProfile?.agentCode) {
        throw new K01ServiceError('VALIDATION_FAILED', 400, 'کد یکتای عامل برای پرسونای عامل میدانی الزامی است.');
      }
      if (data.partyType === 'internal_user' && !data.internalProfile?.personnelCode) {
        throw new K01ServiceError('VALIDATION_FAILED', 400, 'کد پرسنلی برای کاربر داخلی الزامی است.');
      }
      return await withTransaction(async (transaction) => {
        const row = await k01Repository.insertParty(
          {
            partyType: data.partyType ?? 'consumer',
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            nationalId: data.nationalId || null,
            mobile,
            email: data.email || null,
            status: data.status ?? 'pending',
            verificationStatus: data.verificationStatus ?? 'unverified',
            notes: data.notes || null,
            consumerProfile: data.consumerProfile,
            agentProfile: data.agentProfile,
            internalProfile: data.internalProfile,
            representativeProfile: data.representativeProfile
          },
          transaction
        );
        await k01Repository.insertAudit(
          auditValues({
            actorId: 'actor-admin',
            actorName,
            action: 'create',
            targetType: 'party',
            targetId: row.id,
            targetName: `${row.firstName} ${row.lastName}`,
            description: `ثبت شخص جدید با عنوان «${row.firstName} ${row.lastName}» و نوع «${row.partyType}»`
          }),
          transaction
        );
        return mapParty(row);
      });
    } catch (error) {
      return translateDatabaseError(error);
    }
  }

  async createOrganization(data: Partial<Organization>, actorName: string): Promise<Organization> {
    try {
      if (!data.legalName || !data.displayName) {
        throw new K01ServiceError('VALIDATION_FAILED', 400, 'نام رسمی و نام تابلویی سازمان الزامی است.');
      }
      if (data.organizationType === 'manufacturer' && (!data.manufacturerProfile?.supplierCode || !data.manufacturerProfile.monthlyCapacityGrams)) {
        throw new K01ServiceError('VALIDATION_FAILED', 400, 'کد سازنده و ظرفیت تولید ماهانه الزامی است.');
      }
      if (data.organizationType === 'retailer' && (!data.retailerProfile?.retailerCode || !data.retailerProfile.guildLicenseNumber)) {
        throw new K01ServiceError('VALIDATION_FAILED', 400, 'کد خرده‌فروشی و شماره جواز کسب الزامی است.');
      }
      if (data.organizationType === 'wholesaler' && !data.wholesalerProfile?.supplierCode) {
        throw new K01ServiceError('VALIDATION_FAILED', 400, 'کد بنکداری الزامی است.');
      }
      return await withTransaction(async (transaction) => {
        const row = await k01Repository.insertOrganization(
          {
            legalName: data.legalName!,
            displayName: data.displayName!,
            organizationType: data.organizationType ?? 'retailer',
            registrationNumber: data.registrationNumber || null,
            nationalLegalId: data.nationalLegalId || null,
            economicCode: data.economicCode || null,
            website: data.website || null,
            phone: data.phone ?? '',
            email: data.email || null,
            province: data.province || null,
            city: data.city || null,
            address: data.address || null,
            postalCode: data.postalCode || null,
            status: data.status ?? 'pending',
            verificationStatus: data.verificationStatus ?? 'unverified',
            notes: data.notes || null,
            retailerProfile: data.retailerProfile,
            manufacturerProfile: data.manufacturerProfile,
            wholesalerProfile: data.wholesalerProfile,
            supplierProfile: data.supplierProfile,
            agentOfficeProfile: data.agentOfficeProfile,
            servicePartnerProfile: data.servicePartnerProfile
          },
          transaction
        );
        await k01Repository.insertAudit(
          auditValues({
            actorId: 'actor-admin',
            actorName,
            action: 'create',
            targetType: 'organization',
            targetId: row.id,
            targetName: row.displayName,
            description: `تعریف سازمان جدید با عنوان «${row.displayName}» و نوع «${row.organizationType}»`
          }),
          transaction
        );
        return mapOrganization(row);
      });
    } catch (error) {
      return translateDatabaseError(error);
    }
  }

  async createMembership(data: Partial<Membership>, actorName: string): Promise<Membership> {
    try {
      if (!data.partyId || !data.organizationId) {
        throw new K01ServiceError('VALIDATION_FAILED', 400, 'مشخص کردن شخص و سازمان الزامی است.');
      }
      if (data.validFrom && data.validTo && data.validTo < data.validFrom) {
        throw new K01ServiceError('VALIDATION_FAILED', 400, 'تاریخ پایان اعتبار نمی‌تواند قبل از تاریخ شروع اعتبار باشد.');
      }
      return await withTransaction(async (transaction) => {
        const party = await k01Repository.findParty(data.partyId!, transaction);
        const organization = await k01Repository.findOrganization(data.organizationId!, transaction);
        if (!party) throw new K01ServiceError('NOT_FOUND', 404, 'شخص انتخاب‌شده وجود ندارد.');
        if (!organization) throw new K01ServiceError('NOT_FOUND', 404, 'سازمان انتخاب‌شده وجود ندارد.');
        const row = await k01Repository.insertMembership(
          {
            partyId: party.id,
            organizationId: organization.id,
            roleKey: data.roleKey ?? 'staff',
            title: data.title ?? 'عضو سازمانی',
            authorities: data.authorities ?? [],
            isPrimary: Boolean(data.isPrimary),
            status: data.status ?? 'active',
            validFrom: data.validFrom ?? new Date().toISOString().slice(0, 10),
            validTo: data.validTo,
            notes: data.notes || null
          },
          transaction
        );
        await k01Repository.insertAudit(
          auditValues({
            actorId: 'actor-admin',
            actorName,
            action: 'membership_link',
            targetType: 'membership',
            targetId: row.id,
            targetName: `${party.firstName} ${party.lastName} -> ${organization.displayName}`,
            description: `برقراری پیوند عضویت با نقش «${row.roleKey}»`
          }),
          transaction
        );
        return mapMembership(row, `${party.firstName} ${party.lastName}`, organization.displayName);
      });
    } catch (error) {
      return translateDatabaseError(error);
    }
  }

  async createDocument(data: Partial<PartyDocument>, actorName: string): Promise<PartyDocument> {
    try {
      if (!data.targetType || !data.targetId || !data.fileName) {
        throw new K01ServiceError('VALIDATION_FAILED', 400, 'اطلاعات مدرک ارسالی ناقص است.');
      }
      return await withTransaction(async (transaction) => {
        const target = data.targetType === 'party'
          ? await k01Repository.findParty(data.targetId!, transaction)
          : await k01Repository.findOrganization(data.targetId!, transaction);
        if (!target) throw new K01ServiceError('NOT_FOUND', 404, 'موجودیت هدف مدرک یافت نشد.');
        const row = await k01Repository.insertDocument(
          {
            targetType: data.targetType!,
            targetId: data.targetId!,
            documentType: data.documentType ?? 'other',
            fileName: data.fileName!,
            fileSize: data.fileSize ?? 50 * 1024,
            mimeType: data.mimeType ?? 'application/pdf',
            fileUri: data.fileUri ?? `secure://party-documents/${data.targetId}/${data.fileName}`,
            verificationStatus: data.verificationStatus ?? 'pending',
            uploadedBy: data.uploadedBy ?? 'actor-admin',
            notes: data.notes || null
          },
          transaction
        );
        await k01Repository.insertAudit(
          auditValues({
            actorId: 'actor-admin',
            actorName,
            action: 'document_upload',
            targetType: 'document',
            targetId: row.id,
            targetName: row.fileName,
            description: `بارگذاری مدرک «${row.fileName}» برای موجودیت ${row.targetType}`
          }),
          transaction
        );
        return mapDocument(row);
      });
    } catch (error) {
      return translateDatabaseError(error);
    }
  }

  async updatePerson(id: string, updates: Partial<Party>, actorName: string): Promise<Party> {
    try {
      return await withTransaction(async (transaction) => {
        const existing = await k01Repository.findParty(id, transaction);
        if (!existing) throw new K01ServiceError('NOT_FOUND', 404, 'شخص مورد نظر یافت نشد.');
        if (updates.version !== undefined && updates.version !== existing.version) {
          throw new K01ServiceError('CONCURRENT_EDIT', 409, 'تعارض در نسخه رکورد رخ داده است.');
        }
        const row = await k01Repository.updateParty(
          id,
          existing.version,
          {
            ...(updates.partyType !== undefined && { partyType: updates.partyType }),
            ...(updates.firstName !== undefined && { firstName: updates.firstName }),
            ...(updates.lastName !== undefined && { lastName: updates.lastName }),
            ...(updates.nationalId !== undefined && { nationalId: updates.nationalId || null }),
            ...(updates.mobile !== undefined && { mobile: normalizeMobile(updates.mobile) }),
            ...(updates.email !== undefined && { email: updates.email || null }),
            ...(updates.status !== undefined && { status: updates.status }),
            ...(updates.verificationStatus !== undefined && { verificationStatus: updates.verificationStatus }),
            ...(updates.notes !== undefined && { notes: updates.notes || null }),
            ...(updates.consumerProfile !== undefined && { consumerProfile: updates.consumerProfile }),
            ...(updates.agentProfile !== undefined && { agentProfile: updates.agentProfile }),
            ...(updates.internalProfile !== undefined && { internalProfile: updates.internalProfile }),
            ...(updates.representativeProfile !== undefined && { representativeProfile: updates.representativeProfile }),
            updatedAt: new Date(),
            version: existing.version + 1
          },
          transaction
        );
        if (!row) throw new K01ServiceError('CONCURRENT_EDIT', 409, 'تعارض همزمان در ویرایش رکورد رخ داده است.');
        await k01Repository.insertAudit(
          auditValues({
            actorId: 'actor-admin',
            actorName,
            action: 'update',
            targetType: 'party',
            targetId: row.id,
            targetName: `${row.firstName} ${row.lastName}`,
            description: `ویرایش اطلاعات پرونده شخص «${row.firstName} ${row.lastName}»`
          }),
          transaction
        );
        return mapParty(row);
      });
    } catch (error) {
      return translateDatabaseError(error);
    }
  }

  async updateOrganization(id: string, updates: Partial<Organization>, actorName: string): Promise<Organization> {
    try {
      return await withTransaction(async (transaction) => {
        const existing = await k01Repository.findOrganization(id, transaction);
        if (!existing) throw new K01ServiceError('NOT_FOUND', 404, 'سازمان مورد نظر یافت نشد.');
        if (updates.version !== undefined && updates.version !== existing.version) {
          throw new K01ServiceError('CONCURRENT_EDIT', 409, 'تعارض در نسخه رکورد رخ داده است.');
        }
        const values: Record<string, unknown> = { updatedAt: new Date(), version: existing.version + 1 };
        for (const key of [
          'legalName', 'displayName', 'organizationType', 'registrationNumber', 'nationalLegalId', 'economicCode',
          'website', 'phone', 'email', 'province', 'city', 'address', 'postalCode', 'status', 'verificationStatus',
          'notes', 'retailerProfile', 'manufacturerProfile', 'wholesalerProfile', 'supplierProfile', 'agentOfficeProfile',
          'servicePartnerProfile'
        ] as const) {
          if (updates[key] !== undefined) values[key] = updates[key] || null;
        }
        const row = await k01Repository.updateOrganization(id, existing.version, values, transaction);
        if (!row) throw new K01ServiceError('CONCURRENT_EDIT', 409, 'تعارض همزمان در ویرایش رکورد رخ داده است.');
        await k01Repository.insertAudit(
          auditValues({
            actorId: 'actor-admin', actorName, action: 'update', targetType: 'organization', targetId: row.id,
            targetName: row.displayName, description: `ویرایش اطلاعات پرونده سازمان «${row.displayName}»`
          }),
          transaction
        );
        return mapOrganization(row);
      });
    } catch (error) {
      return translateDatabaseError(error);
    }
  }

  async updateMembership(id: string, updates: Partial<Membership>): Promise<Membership> {
    try {
      return await withTransaction(async (transaction) => {
        const existing = await k01Repository.findMembership(id, transaction);
        if (!existing) throw new K01ServiceError('NOT_FOUND', 404, 'عضویت مورد نظر یافت نشد.');
        const row = await k01Repository.updateMembership(
          id,
          {
            ...(updates.roleKey !== undefined && { roleKey: updates.roleKey }),
            ...(updates.title !== undefined && { title: updates.title }),
            ...(updates.authorities !== undefined && { authorities: updates.authorities }),
            ...(updates.isPrimary !== undefined && { isPrimary: updates.isPrimary }),
            ...(updates.status !== undefined && { status: updates.status }),
            ...(updates.validFrom !== undefined && { validFrom: updates.validFrom }),
            ...(updates.validTo !== undefined && { validTo: updates.validTo }),
            ...(updates.notes !== undefined && { notes: updates.notes || null }),
            updatedAt: new Date()
          },
          transaction
        );
        const party = await k01Repository.findParty(existing.partyId, transaction);
        const organization = await k01Repository.findOrganization(existing.organizationId, transaction);
        return mapMembership(row!, party ? `${party.firstName} ${party.lastName}` : undefined, organization?.displayName);
      });
    } catch (error) {
      return translateDatabaseError(error);
    }
  }

  async updateDocument(id: string, updates: Partial<PartyDocument>): Promise<PartyDocument> {
    try {
      const existing = await k01Repository.findDocument(id);
      if (!existing) throw new K01ServiceError('NOT_FOUND', 404, 'مدرک مورد نظر یافت نشد.');
      const row = await k01Repository.updateDocument(id, {
        ...(updates.documentType !== undefined && { documentType: updates.documentType }),
        ...(updates.fileName !== undefined && { fileName: updates.fileName }),
        ...(updates.fileSize !== undefined && { fileSize: updates.fileSize }),
        ...(updates.mimeType !== undefined && { mimeType: updates.mimeType }),
        ...(updates.fileUri !== undefined && { fileUri: updates.fileUri }),
        ...(updates.verificationStatus !== undefined && { verificationStatus: updates.verificationStatus }),
        ...(updates.uploadedBy !== undefined && { uploadedBy: updates.uploadedBy }),
        ...(updates.notes !== undefined && { notes: updates.notes || null })
      });
      return mapDocument(row!);
    } catch (error) {
      return translateDatabaseError(error);
    }
  }

  async changeStatus(
    resource: string,
    id: string,
    input: { status?: EntityStatus; verificationStatus?: VerificationStatus; reason?: string },
    actorName: string
  ): Promise<Party | Organization | Membership> {
    if (input.status && !entityStatuses.has(input.status)) throw new K01ServiceError('VALIDATION_FAILED', 400, 'وضعیت نامعتبر است.');
    if (input.verificationStatus && !verificationStatuses.has(input.verificationStatus)) throw new K01ServiceError('VALIDATION_FAILED', 400, 'وضعیت راستی‌آزمایی نامعتبر است.');
    if (resource === 'person' || resource === 'persons') {
      const existing = await k01Repository.findParty(id);
      if (!existing) throw new K01ServiceError('NOT_FOUND', 404, 'شخص یافت نشد.');
      return this.updatePerson(id, { status: input.status, verificationStatus: input.verificationStatus }, actorName);
    }
    if (resource === 'organization' || resource === 'organizations') {
      const existing = await k01Repository.findOrganization(id);
      if (!existing) throw new K01ServiceError('NOT_FOUND', 404, 'سازمان یافت نشد.');
      return this.updateOrganization(id, { status: input.status, verificationStatus: input.verificationStatus }, actorName);
    }
    if (resource === 'membership' || resource === 'memberships') {
      return this.updateMembership(id, { status: input.status });
    }
    throw new K01ServiceError('INVALID_RESOURCE', 400, 'منبع نامعتبر است.');
  }
}

export const k01Service = new K01Service();
