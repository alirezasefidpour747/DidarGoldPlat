/**
 * Didar Gold Platform - Layer 4: Data Access / Repository
 * Master Data Management (MDM) Repository
 */

import { BaseRepository } from './base.repository.js';
import { masterDataStorage } from '../storage-masterdata.js';
import { MasterDataCategory, MasterDataItem, MasterDataPayload } from '../../src/types/masterData.js';

export class MasterDataRepository extends BaseRepository<MasterDataCategory> {
  constructor() {
    super('master_data_dictionaries');
  }

  public getFullPayload(): MasterDataPayload {
    return masterDataStorage.getPayload();
  }

  public getCategories(): MasterDataCategory[] {
    return masterDataStorage.getCategories();
  }

  public getCategoryById(id: string): MasterDataCategory | null {
    const categories = masterDataStorage.getCategories();
    return categories.find(c => c.id === id) || null;
  }

  public getItemsByCategoryId(categoryId: string): MasterDataItem[] {
    return masterDataStorage.getItemsByCategory(categoryId);
  }

  public getItemById(id: string): MasterDataItem | null {
    const allItems = masterDataStorage.getPayload().items;
    return allItems.find(i => i.id === id) || null;
  }

  public createItem(itemData: Partial<MasterDataItem>): MasterDataItem {
    const item = masterDataStorage.createItem(itemData);
    this.db.writeCollection('master_data_dictionaries', masterDataStorage.getPayload());
    return item;
  }

  public updateItem(id: string, updates: Partial<MasterDataItem>): MasterDataItem | null {
    const item = masterDataStorage.updateItem(id, updates);
    if (item) {
      this.db.writeCollection('master_data_dictionaries', masterDataStorage.getPayload());
    }
    return item;
  }

  public deleteItem(id: string): boolean {
    const res = masterDataStorage.deleteItem(id);
    if (res.success) {
      this.db.writeCollection('master_data_dictionaries', masterDataStorage.getPayload());
    }
    return res.success;
  }

  public findAll(): MasterDataCategory[] {
    return masterDataStorage.getCategories();
  }

  public findById(id: string): MasterDataCategory | null {
    return this.getCategoryById(id);
  }

  public save(entity: MasterDataCategory): MasterDataCategory {
    return entity;
  }

  public deleteById(id: string): boolean {
    return false;
  }
}

export const masterDataRepository = new MasterDataRepository();
