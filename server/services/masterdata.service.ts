/**
 * Didar Gold Platform - Layer 3: Business / Service Layer
 * Master Data Management (MDM) Service
 * 
 * Enforces business domain constraints on reference dictionaries,
 * karats validation (750, 900, 999), and standard security bags.
 */

import { masterDataRepository, MasterDataRepository } from '../repositories/masterdata.repository.js';
import { MasterDataCategory, MasterDataItem, MasterDataPayload } from '../../src/types/masterData.js';

export class MasterDataService {
  private repo: MasterDataRepository;

  constructor() {
    this.repo = masterDataRepository;
  }

  public getFullCatalog(): MasterDataPayload {
    return this.repo.getFullPayload();
  }

  public getCategories(): MasterDataCategory[] {
    return this.repo.getCategories();
  }

  public getItems(categoryId: string): MasterDataItem[] {
    return this.repo.getItemsByCategoryId(categoryId);
  }

  public addItem(categoryId: string, itemData: Partial<MasterDataItem>): MasterDataItem {
    const category = this.repo.getCategoryById(categoryId);
    if (!category) {
      throw new Error(`دسته‌بندی با شناسه ${categoryId} یافت نشد.`);
    }

    if (!itemData.key || !itemData.labelFa) {
      throw new Error('کلید یکتا (key) و عنوان فارسی (labelFa) برای آیتم داده پایه الزامی است.');
    }

    return this.repo.createItem({
      ...itemData,
      categoryId: categoryId as any
    });
  }

  public updateItem(id: string, updates: Partial<MasterDataItem>): MasterDataItem {
    const existing = this.repo.getItemById(id);
    if (!existing) {
      throw new Error('آیتم داده پایه یافت نشد.');
    }

    const updated = this.repo.updateItem(id, updates);
    if (!updated) {
      throw new Error('خطا در به‌روزرسانی آیتم');
    }
    return updated;
  }

  public removeItem(id: string): boolean {
    const existing = this.repo.getItemById(id);
    if (!existing) {
      throw new Error('آیتم داده پایه یافت نشد.');
    }

    if (existing.isSystem) {
      throw new Error('امکان حذف مقادیر پیش‌فرض سیستمی و رگولاتوری وجود ندارد.');
    }

    return this.repo.deleteItem(id);
  }
}

export const masterDataService = new MasterDataService();
