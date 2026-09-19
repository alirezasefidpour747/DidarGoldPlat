/**
 * Didar Gold Platform - Master Data Management API Routes
 */

import { Router, Request, Response } from 'express';
import { masterDataStorage } from '../storage-masterdata.js';

export const masterDataRouter = Router();

// GET all master data payload
masterDataRouter.get('/', (req: Request, res: Response) => {
  try {
    const data = masterDataStorage.getPayload();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET categories
masterDataRouter.get('/categories', (req: Request, res: Response) => {
  try {
    const categories = masterDataStorage.getCategories();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new category
masterDataRouter.post('/categories', (req: Request, res: Response) => {
  try {
    const category = masterDataStorage.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE custom category
masterDataRouter.delete('/categories/:id', (req: Request, res: Response) => {
  try {
    const result = masterDataStorage.deleteCategory(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET items by category
masterDataRouter.get('/items', (req: Request, res: Response) => {
  try {
    const { categoryId, activeOnly } = req.query;
    if (!categoryId) {
      return res.status(400).json({ success: false, error: 'پارامتر categoryId الزامی است.' });
    }

    const items = activeOnly === 'true'
      ? masterDataStorage.getActiveItemsByCategory(String(categoryId))
      : masterDataStorage.getItemsByCategory(String(categoryId));

    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new item
masterDataRouter.post('/items', (req: Request, res: Response) => {
  try {
    const item = masterDataStorage.createItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT update item
masterDataRouter.put('/items/:id', (req: Request, res: Response) => {
  try {
    const item = masterDataStorage.updateItem(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST toggle active
masterDataRouter.post('/items/:id/toggle-active', (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    const item = masterDataStorage.toggleItemActive(req.params.id, isActive);
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE item
masterDataRouter.delete('/items/:id', (req: Request, res: Response) => {
  try {
    const result = masterDataStorage.deleteItem(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST reorder items
masterDataRouter.post('/reorder', (req: Request, res: Response) => {
  try {
    const { categoryId, orderedIds } = req.body;
    if (!categoryId || !Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: 'پارامترهای categoryId و orderedIds الزامی هستند.' });
    }
    const items = masterDataStorage.reorderItems(categoryId, orderedIds);
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
