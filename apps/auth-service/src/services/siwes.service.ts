import { randomUUID } from 'crypto';

import { buildJwtClaims, createSignedJwt } from '../config/jwt';

export type SiwesApplicationStatus = 'pending' | 'approved' | 'rejected';

export type SiwesApplication = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  institutionName: string;
  courseOfStudy: string;
  matriculationNumber: string;
  attachmentDurationMonths: number;
  startDate?: string;
  endDate?: string;
  institutionLetterUrl?: string;
  status: SiwesApplicationStatus;
  notes?: string;
  reviewedBy?: string;
  createdAt: string;
  approvedAt?: string;
  issuedToken?: string;
};

const siwesApplications = new Map<string, SiwesApplication>();

export function createSiwesApplication(input: Omit<SiwesApplication, 'id' | 'status' | 'createdAt' | 'issuedToken'>) {
  const application: SiwesApplication = {
    ...input,
    id: `siwes-${randomUUID()}`,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  siwesApplications.set(application.id, application);
  return application;
}

export function listSiwesApplications(status?: SiwesApplicationStatus) {
  const items = Array.from(siwesApplications.values());
  if (!status) return items;
  return items.filter((item) => item.status === status);
}

export function reviewSiwesApplication(
  id: string,
  review: { status: 'approved' | 'rejected'; reviewedBy?: string; notes?: string }
) {
  const application = siwesApplications.get(id);
  if (!application) return null;

  application.status = review.status;
  application.reviewedBy = review.reviewedBy ?? 'admin-approver';
  application.notes = review.notes ?? (review.status === 'approved' ? 'Approved by administrative review queue.' : 'Rejected by administrative review queue.');

  if (review.status === 'approved') {
    application.approvedAt = new Date().toISOString();
    application.issuedToken = createSignedJwt(
      buildJwtClaims({
        sub: application.email,
        aud: 'academy-client',
        roles: ['siwes_trainee'],
        tenantId: application.institutionName,
        email: application.email,
        scope: 'siwes academy tracker'
      })
    );
  }

  siwesApplications.set(id, application);
  return application;
}

export function getSiwesApplication(id: string) {
  return siwesApplications.get(id) ?? null;
}
