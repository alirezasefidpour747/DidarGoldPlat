/**
 * Didar Gold Platform - Kernel Domain K18 API Routes
 * After-sales Cases, Returns, Repairs & Warranty Routing
 */

import { Router, Request, Response } from 'express';
import { k18Storage } from '../storage-k18.js';

export const k18Router = Router();

// GET all K18 data payload
k18Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k18Storage.getData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /tickets/:id
k18Router.get('/tickets/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = k18Storage.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'پرونده مورد نظر یافت نشد.' });
    }
    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /tickets - Create new intake ticket
k18Router.post('/tickets', (req: Request, res: Response) => {
  try {
    const {
      itemUid,
      itemTitleFa,
      karatFa,
      karatPurity,
      consumerFullName,
      consumerMobile,
      consumerNationalId,
      consumerCity,
      intakeConditionNotesFa,
      intakeStaffNameFa,
      retailerNameFa,
      priority,
      serviceCategory,
      serviceCategoryFa,
      intakeGrossWeightGrams,
      intakeTareGrams,
      warrantyNumber
    } = req.body;

    if (!itemUid || !itemTitleFa || !consumerFullName || !consumerMobile || !intakeGrossWeightGrams) {
      return res.status(400).json({
        success: false,
        error: 'تکمیل فیلدهای شناسه کالا، عنوان، نام مشتری، موبایل و وزن الزامی است.'
      });
    }

    const ticket = k18Storage.createTicket({
      itemUid,
      itemTitleFa,
      karatFa,
      karatPurity,
      consumerFullName,
      consumerMobile,
      consumerNationalId: consumerNationalId || 'نامشخص',
      consumerCity,
      intakeConditionNotesFa: intakeConditionNotesFa || 'پذیرش استاندارد قطعه',
      intakeStaffNameFa: intakeStaffNameFa || 'کارشناس پذیرش دیدار',
      retailerNameFa: retailerNameFa || 'گالری طلای دیدار',
      priority,
      serviceCategory,
      serviceCategoryFa,
      intakeGrossWeightGrams: Number(intakeGrossWeightGrams),
      intakeTareGrams: intakeTareGrams ? Number(intakeTareGrams) : 0,
      warrantyNumber
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /tickets/:id/stage - Update stage & workshop/QC progression
k18Router.patch('/tickets/:id/stage', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nextStage, workshopId, operatorNameFa, notesFa, returnGrossWeightGrams, actualLaborCostToman, assayCert } =
      req.body;

    if (!nextStage) {
      return res.status(400).json({ success: false, error: 'تعیین مرحله بعدی الزامی است.' });
    }

    const updated = k18Storage.updateTicketStage(id, nextStage, {
      workshopId,
      operatorNameFa,
      notesFa,
      returnGrossWeightGrams: returnGrossWeightGrams ? Number(returnGrossWeightGrams) : undefined,
      actualLaborCostToman: actualLaborCostToman ? Number(actualLaborCostToman) : undefined,
      assayCert
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /workshops
k18Router.get('/workshops', (req: Request, res: Response) => {
  try {
    const workshops = k18Storage.getWorkshops();
    res.json({ success: true, data: workshops });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
