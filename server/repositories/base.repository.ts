/**
 * Didar Gold Platform - Layer 4: Data Access / Repository Base
 * 
 * Abstract interface and base class establishing standard repository patterns:
 * - Isolation between domain services and underlying database storage
 * - Typed query operations, caching, and atomic persistence
 */

import { databaseEngine, DatabaseEngine } from '../database/database.engine.js';

export interface IRepository<T, ID = string> {
  findAll(): Promise<T[]> | T[];
  findById(id: ID): Promise<T | null> | T | null;
  save(entity: T): Promise<T> | T;
  deleteById(id: ID): Promise<boolean> | boolean;
}

export abstract class BaseRepository<T, ID = string> implements IRepository<T, ID> {
  protected collectionName: string;
  protected db: DatabaseEngine;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.db = databaseEngine;
  }

  abstract findAll(): Promise<T[]> | T[];
  abstract findById(id: ID): Promise<T | null> | T | null;
  abstract save(entity: T): Promise<T> | T;
  abstract deleteById(id: ID): Promise<boolean> | boolean;

  /**
   * Health ping of repository access to storage layer
   */
  public async pingStorage(): Promise<{ collection: string; status: 'ok'; latencyMs: number }> {
    const start = Date.now();
    await this.db.acquireLock(this.collectionName).then(release => release());
    return {
      collection: this.collectionName,
      status: 'ok',
      latencyMs: Date.now() - start
    };
  }
}
