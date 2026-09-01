import { Router } from 'express';
import { z } from 'zod';

import { requireRole } from '../middleware/rbac';
import { createSiwesApplication, listSiwesApplications, reviewSiwesApplication } from '../services/siwes.service';

const router = Router();

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(6),
  institutionName: z.string().min(1),
  courseOfStudy: z.string().min(1),
  matriculationNumber: z.string().min(1),
  attachmentDurationMonths: z.coerce.number().int().min(1).max(24),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  institutionLetterUrl: z.string().url().optional()
});

const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewedBy: z.string().optional(),
  notes: z.string().optional()
});

router.post('/siwes/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid SIWES registration payload' });
  }

  const application = createSiwesApplication(parsed.data);

  return res.status(201).json({
    message: 'SIWES onboarding application submitted successfully',
    application: {
      id: application.id,
      status: application.status,
      email: application.email,
      institutionName: application.institutionName,
      createdAt: application.createdAt
    }
  });
});

router.get('/siwes/applications', requireRole(['system_admin']), (_req, res) => {
  return res.json({ applications: listSiwesApplications() });
});

router.patch('/siwes/applications/:id/review', requireRole(['system_admin']), (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid review payload' });
  }

  const application = reviewSiwesApplication(req.params.id, parsed.data);
  if (!application) {
    return res.status(404).json({ error: 'SIWES application not found' });
  }

  return res.json({
    message: `SIWES application ${application.status}`,
    application,
    tokenIssued: Boolean(application.issuedToken)
  });
});

export default router;
