/**
 * Didar Gold Platform - Kernel Domain K12 API Routes
 * Agents, Territories & Field Operations (عامل، قلمرو و عملیات میدانی)
 */

import { Router, Request, Response } from 'express';
import { k12Storage } from '../storage-k12.js';

export const k12Router = Router();

// GET all K12 payload (summary, agents, territories, visits, showcaseItems)
k12Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k12Storage.getAllData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new agent
k12Router.post('/agents', (req: Request, res: Response) => {
  try {
    const agent = k12Storage.createAgent(req.body);
    res.status(201).json({ success: true, data: agent });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST toggle agent active/inactive
k12Router.post('/agents/:id/toggle-active', (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    const agent = k12Storage.toggleAgentActive(req.params.id, isActive);
    res.json({ success: true, data: agent });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST update agent duty status
k12Router.post('/agents/:id/status', (req: Request, res: Response) => {
  try {
    const { dutyStatus } = req.body;
    if (!dutyStatus) {
      return res.status(400).json({ success: false, error: 'وضعیت شیفت جدید الزامی است.' });
    }
    const agent = k12Storage.updateAgentStatus(req.params.id, dutyStatus);
    res.json({ success: true, data: agent });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST assign territory to agent
k12Router.post('/agents/:id/territory', (req: Request, res: Response) => {
  try {
    const { territoryId } = req.body;
    if (!territoryId) {
      return res.status(400).json({ success: false, error: 'شناسه قلمرو جدید الزامی است.' });
    }
    const agent = k12Storage.assignAgentTerritory(req.params.id, territoryId);
    res.json({ success: true, data: agent });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST assign bag to agent
k12Router.post('/agents/:id/bag', (req: Request, res: Response) => {
  try {
    const { bagId, bagCode, weightGrams } = req.body;
    const agent = k12Storage.assignBagToAgent(req.params.id, bagId, bagCode, weightGrams || 0);
    res.json({ success: true, data: agent });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST create new territory
k12Router.post('/territories', (req: Request, res: Response) => {
  try {
    const territory = k12Storage.createTerritory(req.body);
    res.status(201).json({ success: true, data: territory });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST add store to territory
k12Router.post('/territories/:id/stores', (req: Request, res: Response) => {
  try {
    const store = k12Storage.addStoreToTerritory(req.params.id, req.body);
    res.status(201).json({ success: true, data: store });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST schedule new visit
k12Router.post('/visits', (req: Request, res: Response) => {
  try {
    const visit = k12Storage.scheduleVisit(req.body);
    res.status(201).json({ success: true, data: visit });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST check-in to visit with geofencing coordinates
k12Router.post('/visits/:id/checkin', (req: Request, res: Response) => {
  try {
    const { lat, lng, distanceMeters } = req.body;
    const visit = k12Storage.checkInVisit(req.params.id, lat || 35.6745, lng || 51.4190, distanceMeters || 10);
    res.json({ success: true, data: visit });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST complete visit with outcome feedback
k12Router.post('/visits/:id/complete', (req: Request, res: Response) => {
  try {
    const visit = k12Storage.completeVisit(req.params.id, req.body);
    res.json({ success: true, data: visit });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST record visit outcome & invoice verification (went or not, invoiced or not)
k12Router.post('/visits/:id/outcome', (req: Request, res: Response) => {
  try {
    const visit = k12Storage.recordVisitOutcome(req.params.id, req.body);
    res.json({ success: true, data: visit });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST submit proxy order on behalf of retailer
k12Router.post('/proxy-order', (req: Request, res: Response) => {
  try {
    const result = k12Storage.submitProxyOrder(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
