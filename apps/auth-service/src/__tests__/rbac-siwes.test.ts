import test from 'node:test';
import assert from 'node:assert/strict';

import { requireRole, userHasPermission } from '../middleware/rbac';
import { createSiwesApplication, reviewSiwesApplication } from '../services/siwes.service';

const mockReq = (authHeader?: string) => ({ headers: authHeader ? { authorization: authHeader } : {} }) as any;
const mockRes = () => ({
  status(code: number) {
    this.code = code;
    return this;
  },
  json(payload: unknown) {
    this.payload = payload;
    return this;
  }
}) as any;

test('blocks unauthorized access for restricted roles', () => {
  const req = mockReq('Bearer ' + Buffer.from(JSON.stringify({ sub: 'u-1', roles: ['siwes_trainee'] })).toString('base64url') + '.signature');
  const res = mockRes();
  const next = () => {
    res.calledNext = true;
  };

  requireRole(['system_admin'])(req, res, next);

  assert.equal(res.code, 403);
});

test('allows approved SIWES role to access permitted faculty scopes', () => {
  assert.equal(userHasPermission({ roles: ['siwes_trainee'] }, 'siwes:view:dashboard'), true);
  assert.equal(userHasPermission({ roles: ['siwes_trainee'] }, 'tracker:view:logbook'), true);
  assert.equal(userHasPermission({ roles: ['siwes_trainee'] }, 'admin:*'), false);
});

test('simulates SIWES onboarding approval flow and token issuance', () => {
  const application = createSiwesApplication({
    firstName: 'Ada',
    lastName: 'Zubair',
    email: 'ada@student.jigawa.edu.ng',
    phoneNumber: '+2348123456789',
    institutionName: 'Federal University Dutse',
    courseOfStudy: 'Computer Science',
    matriculationNumber: 'FUD/CS/2023/001',
    attachmentDurationMonths: 6,
    institutionLetterUrl: 'https://storage.startupjigawa.com/letters/ada.pdf',
    notes: 'Awaiting approval',
    reviewedBy: 'pending'
  });

  const reviewed = reviewSiwesApplication(application.id, { status: 'approved', reviewedBy: 'admin-supervisor', notes: 'Letter verified' });

  assert.ok(reviewed);
  assert.equal(reviewed?.status, 'approved');
  assert.ok(reviewed?.issuedToken && reviewed.issuedToken.includes('.'));
  assert.equal(reviewed?.reviewedBy, 'admin-supervisor');
});
