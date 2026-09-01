import { PrismaClient } from '../client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const DEFAULT_PASSWORD_HASH = hashPassword('Password123!');

async function main() {
  console.log('====================================================');
  console.log('🌱 STARTING STARTUP JIGAWA DATABASE SEEDING ENGINE');
  console.log('====================================================');

  // ----------------------------------------------------
  // 1. SEED ROLES & PERMISSIONS
  // ----------------------------------------------------
  console.log('1. Seeding System Roles & Permissions...');

  const roleDefinitions = [
    { name: 'system_admin', description: 'System Administrator - Full Access & Governance (Tier 5 Executive)' },
    { name: 'governance_officer', description: 'Governance Officer - Oversight & Policy Verification' },
    { name: 'partner', description: 'Ecosystem Partner & Investor - Strategic Access' },
    { name: 'stakeholder', description: 'Executive Stakeholder & Portfolio Oversight' },
    { name: 'mda_official', description: 'State Ministry, Department & Agency Official' },
    { name: 'project_manager', description: 'Project & Initiative Manager - Operational Control' },
    { name: 'student', description: 'Skill Acquisition & Digital Literacy Trainee' },
    { name: 'siwes_trainee', description: 'SIWES Institutional Student Trainee' },
    { name: 'farmer', description: 'AgriFinTech & Cluster Smallholder Beneficiary' },
    { name: 'citizen', description: 'General Resident & Civic Participant' },
    { name: 'beneficiary', description: 'General Platform Beneficiary' },
  ];

  const roleMap: Record<string, string> = {};

  for (const r of roleDefinitions) {
    const roleRecord = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description },
    });
    roleMap[r.name] = roleRecord.id;
  }

  const permissions = [
    { name: 'users:read', description: 'Read user directory' },
    { name: 'users:write', description: 'Create and edit users' },
    { name: 'users:delete', description: 'Deactivate or delete users' },
    { name: 'users:manage_roles', description: 'Override global user roles' },
    { name: 'projects:read', description: 'Read project tracker portfolios' },
    { name: 'projects:write', description: 'Create and update projects and RAG statuses' },
    { name: 'projects:manage_kpis', description: 'Manage project KPI metrics and targets' },
    { name: 'audit:read', description: 'View ecosystem audit log streams' },
    { name: 'documents:read', description: 'Access institutional state documents' },
    { name: 'documents:write', description: 'Upload and classify state documents' },
  ];

  for (const p of permissions) {
    const permRecord = await prisma.permission.upsert({
      where: { name: p.name },
      update: { description: p.description },
      create: { name: p.name, description: p.description },
    });

    // Assign to system_admin
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roleMap['system_admin'],
          permissionId: permRecord.id,
        },
      },
      update: {},
      create: {
        roleId: roleMap['system_admin'],
        permissionId: permRecord.id,
      },
    });
  }

  // ----------------------------------------------------
  // 2. SEED USERS & MULTI-TIER ROLES
  // ----------------------------------------------------
  console.log('2. Seeding Multi-Tier User Accounts...');

  const userFixtures = [
    {
      id: 'usr-admin-001',
      email: 'admin@startupjigawa.ng',
      phoneNumber: '+2348030000001',
      firstName: 'System',
      lastName: 'Administrator',
      roles: ['system_admin', 'governance_officer'],
      metadata: { lga: 'Dutse', department: 'Executive Office', clearanceLevel: 5 },
    },
    {
      id: 'usr-gov-002',
      email: 'gov@jigawastate.gov.ng',
      phoneNumber: '+2348030000002',
      firstName: 'Governance',
      lastName: 'Officer',
      roles: ['governance_officer', 'mda_official'],
      metadata: { lga: 'Dutse', department: 'Ministry of Special Duties', clearanceLevel: 4 },
    },
    {
      id: 'usr-partner-003',
      email: 'partner@startupjigawa.ng',
      phoneNumber: '+2348030000003',
      firstName: 'Alhaji Aminu',
      lastName: 'Dantata',
      roles: ['partner', 'stakeholder'],
      metadata: { lga: 'Dutse', organization: 'Jigawa Investment Promotion Agency (JIPA)' },
    },
    {
      id: 'usr-partner-jica',
      email: 'partner@jica.org',
      phoneNumber: '+2348030000013',
      firstName: 'Kenji',
      lastName: 'Takahashi',
      roles: ['partner', 'stakeholder'],
      metadata: { lga: 'Dutse', organization: 'Japan International Cooperation Agency (JICA)' },
    },
    {
      id: 'usr-pm-004',
      email: 'pm@startupjigawa.ng',
      phoneNumber: '+2348030000004',
      firstName: 'Fatima',
      lastName: 'Suleiman',
      roles: ['project_manager'],
      metadata: { lga: 'Dutse', unit: 'Program Delivery & M&E' },
    },
    {
      id: 'usr-mda-005',
      email: 'mda@startupjigawa.ng',
      phoneNumber: '+2348030000005',
      firstName: 'Bello',
      lastName: 'Hassan',
      roles: ['mda_official'],
      metadata: { lga: 'Hadejia', mdaCode: 'MDA-JIG-ICT' },
    },
    {
      id: 'usr-student-006',
      email: 'student@startupjigawa.ng',
      phoneNumber: '+2348030000006',
      firstName: 'Ibrahim',
      lastName: 'Usman',
      roles: ['student', 'siwes_trainee'],
      metadata: {
        lga: 'Birnin Kudu',
        matriculationNumber: 'FUD/2024/CS/1042',
        institutionName: 'Federal University Dutse',
        courseOfStudy: 'Computer Science',
        track: 'Software Engineering',
      },
    },
    {
      id: 'usr-farmer-007',
      email: 'farmer@startupjigawa.ng',
      phoneNumber: '+2348030000007',
      firstName: 'Kabiru',
      lastName: 'Garba',
      roles: ['farmer', 'beneficiary'],
      metadata: {
        lga: 'Hadejia',
        ward: 'Atafi',
        clusterId: 'CLUST-HAD-001',
        cropType: 'Rice & Wheat',
        farmSizeHectares: 4.5,
      },
    },
    {
      id: 'usr-citizen-008',
      email: 'citizen@startupjigawa.ng',
      phoneNumber: '+2348030000008',
      firstName: 'Zainab',
      lastName: 'Abubakar',
      roles: ['citizen'],
      metadata: { lga: 'Gumel', ward: 'Garu' },
    },
    {
      id: 'user-stake-99',
      email: 'stakeholder@startupjigawa.ng',
      phoneNumber: '+2348030000099',
      firstName: 'Executive',
      lastName: 'Stakeholder',
      roles: ['stakeholder', 'partner'],
      metadata: { lga: 'Dutse', department: 'State Oversight Board' },
    },
  ];

  for (const u of userFixtures) {
    const userRecord = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        phoneNumber: u.phoneNumber,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        metadata: u.metadata,
      },
      create: {
        id: u.id,
        email: u.email,
        phoneNumber: u.phoneNumber,
        passwordHash: DEFAULT_PASSWORD_HASH,
        firstName: u.firstName,
        lastName: u.lastName,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        metadata: u.metadata,
      },
    });

    // Assign roles cleanly
    for (const roleName of u.roles) {
      const roleId = roleMap[roleName];
      if (roleId) {
        await prisma.userRole.upsert({
          where: {
            userId_roleId_tenantId: {
              userId: userRecord.id,
              roleId: roleId,
              tenantId: '',
            },
          },
          update: {},
          create: {
            userId: userRecord.id,
            roleId: roleId,
            tenantId: '',
          },
        });
      }
    }
  }

  // ----------------------------------------------------
  // 3. SEED JIGAWA STATE ADMINISTRATIVE BOUNDARIES
  // ----------------------------------------------------
  console.log('3. Seeding Jigawa State Administrative Boundaries (27 LGAs & Wards)...');

  const jigawaLGAs = [
    { name: 'Dutse', type: 'State Capital', wardCount: 11, wards: ['Limawa', 'Kachi', 'Sakwaya', 'Kudai', 'Madobi', 'Chamo', 'Dundubus', 'Karnaya', 'Kyaran', 'Miga', 'Dutse Ultra'] },
    { name: 'Hadejia', type: 'Commercial Hub', wardCount: 11, wards: ['Atafi', 'Dubantu', 'Gagulmari', 'Kasawar Awo', 'Majema', 'Matsaro', 'Rumfa', 'Sabon Garu', 'Yankoli', 'Yayari', 'Kofar Mai Mirra'] },
    { name: 'Birnin Kudu', type: 'Agrarian / Education Center', wardCount: 11, wards: ['Birnin Kudu', 'Kangire', 'Kantoga', 'Lafiya', 'Wurno', 'Yalwan Damai', 'Surko', 'Unguwar Ya', 'Sundimina', 'Kiyawa', 'Kwanar Huguma'] },
    { name: 'Gumel', type: 'Emirate Center', wardCount: 11, wards: ['Baikarya', 'Dan Zomo', 'Garu', 'Gusau', 'Hammado', 'Kofar Arewa', 'Kofar Yamma', 'Zango', 'Dantanoma', 'Galagamma', 'Zaidu'] },
    { name: 'Kazaure', type: 'Industrial Center', wardCount: 11, wards: ['Ba\'auzini', 'Daba', 'Dabaza', 'Dandi', 'Kazaure', 'Marte', 'Sabaru', 'Unguwar Jibrin', 'Dutsen Rukuki', 'Gada', 'Kuyavva'] },
    { name: 'Ringim', type: 'Agricultural Hub', wardCount: 10, wards: ['Chai-Chai', 'Sankara', 'Ringim', 'Dabi', 'Karshi', 'Tous', 'Yandutse', 'Kafin Babus', 'Amaguwa', 'Majiyawa'] },
    { name: 'Jahun', type: 'Irrigation & Farming', wardCount: 10, wards: ['Jahun', 'Harbo Tudu', 'Harbo Sabuwa', 'Gauza', 'Aujara', 'Gangawa', 'Gunka', 'Kale', 'Kanwa', 'Tigimawa'] },
    { name: 'Kafin Hausa', type: 'Grain Market', wardCount: 11, wards: ['Kafin Hausa', 'Jabo', 'Mezan', 'Balangu', 'Sarawa', 'Bulangu', 'Ruwan Kwato', 'Kazalewa', 'Majiya', 'Dumadumi', 'Gafaya'] },
    { name: 'Babura', type: 'Border Trade', wardCount: 11, wards: ['Babura', 'Garu', 'Insharuwa', 'Kanya', 'Kyambo', 'Gasakoli', 'Takwasa', 'Jigawa', 'Batu', 'Kuzunzumi', 'Dorawa'] },
    { name: 'Gwaram', type: 'Solid Minerals & Agriculture', wardCount: 11, wards: ['Gwaram', 'Farin Ruwa', 'Zandam', 'Kila', 'Marini', 'Sara', 'Tsunge', 'Basirka', 'Dingaya', 'Fagam', 'Kwandiko'] },
    { name: 'Auyo', type: 'Irrigation Scheme', wardCount: 10, wards: ['Auyo', 'Auyakayi', 'Gatafa', 'Gamafoi', 'Kafur', 'Tsadir', 'Unik', 'Ayan', 'Gwarai', 'Ayama'] },
    { name: 'Buji', type: 'Agriculture', wardCount: 10, wards: ['Buji', 'Ahoto', 'Gantsa', 'Kawaya', 'Kukuma', 'Langa', 'Madabe', 'Yayarin Buji', 'Lafiya', 'Yalleman'] },
    { name: 'Gagarawa', type: 'Agro-Processing', wardCount: 10, wards: ['Gagarawa', 'Garin Chiroma', 'Gada', 'Maiaduwa', 'Medu', 'Yalawa', 'Zarada', 'Kore', 'Madaka', 'Madu'] },
    { name: 'Garki', type: 'Livestock & Trade', wardCount: 11, wards: ['Garki', 'Gwarzo', 'Jirima', 'Kargo', 'Kore', 'Makarfi', 'Mu\'adu', 'Siyori', 'Yahi', 'Buduru', 'Doko'] },
    { name: 'Guri', type: 'Wetlands & Rice Production', wardCount: 10, wards: ['Guri', 'Abunabo', 'Adiyani', 'Dawa', 'Gadbama', 'Kadira', 'Lafiya', 'Margadu', 'Matara Baba', 'Musari'] },
    { name: 'Gwiwa', type: 'Cereal Crops', wardCount: 10, wards: ['Gwiwa', 'Buntusu', 'Daruwana', 'Fasha', 'Guntha', 'Korayel', 'Ruba', 'Shafe', 'Yola', 'Zauma'] },
    { name: 'Kiri Kasama', type: 'Fisheries & Agriculture', wardCount: 10, wards: ['Kiri Kasama', 'Bataraba', 'Bula', 'Dole', 'Fagi', 'Gayin', 'Kanzanna', 'Madachi', 'Marma', 'Saleri'] },
    { name: 'Kiyawa', type: 'Cereal & Grain Production', wardCount: 11, wards: ['Kiyawa', 'Andaza', 'Fakai', 'Gargawo', 'Guriya', 'Katuka', 'Kwanda', 'Mazojie', 'Tsirma', 'Yako', 'Zakarawa'] },
    { name: 'Maigatari', type: 'International Livestock Market', wardCount: 11, wards: ['Maigatari', 'Balarabe', 'Dankumbo', 'Fulai', 'Galadi', 'Jalkami', 'Kukayaku', 'Madana', 'Matoya', 'Turbus', 'Zaid'] },
    { name: 'Malam Madori', type: 'Cotton & Wheat', wardCount: 11, wards: ['Malam Madori', 'Arki', 'Dunari', 'Fateka', 'Garin Gabas', 'Mairakumi', 'Makaddari', 'Shaiya', 'Tashena', 'Tonikutara', 'Tora'] },
    { name: 'Miga', type: 'Farming', wardCount: 10, wards: ['Miga', 'Dangayat', 'Garbo', 'Hantsu', 'Koya', 'Sankara', 'Sansani', 'Takanebu', 'Tsakuwawa', 'Zareku'] },
    { name: 'Roni', type: 'Granite & Mining', wardCount: 10, wards: ['Roni', 'Ammorawa', 'Baragumi', 'Dansa', 'Fara', 'Gora', 'Kwiwa', 'Sankau', 'Yanzaki', 'Zugai'] },
    { name: 'Sule Tankarkar', type: 'Border Trade & Agriculture', wardCount: 10, wards: ['Sule Tankarkar', 'Amanga', 'Danladin Majiya', 'Danzomo', 'Jeke', 'Albasu', 'Muku', 'Sabon Garin Sule', 'Yadachi', 'Shabaru'] },
    { name: 'Taura', type: 'Sugarcane & Rice', wardCount: 10, wards: ['Taura', 'Ajaura', 'Chakaikai', 'Cukuto', 'Garki', 'Gujungu', 'Kwalalam', 'Majiya', 'Sura', 'Yalleman'] },
    { name: 'Yankwashi', type: 'Farming & Education', wardCount: 10, wards: ['Yankwashi', 'Achilafiya', 'Belas', 'Karkarna', 'Kuda', 'Rauda', 'Ringim', 'Zungumba', 'Gurjiya', 'Kwarin Kalgo'] },
  ];

  // ----------------------------------------------------
  // 4. SEED STATE MDAs & INSTITUTIONAL DOCUMENTS
  // ----------------------------------------------------
  console.log('4. Seeding State MDAs & Institutional Governance Documents...');

  const mdaFixtures = [
    {
      code: 'MDA-JIG-ICT',
      name: 'Jigawa State Ministry of Information & Communication Technology',
      sector: 'Technology & Digital Economy',
      contactEmail: 'info@ict.jigawastate.gov.ng',
    },
    {
      code: 'MDA-JIG-AGRI',
      name: 'Jigawa State Ministry of Agriculture & Natural Resources',
      sector: 'Agriculture & Natural Resources',
      contactEmail: 'agriculture@jigawastate.gov.ng',
    },
    {
      code: 'MDA-JIG-COMM',
      name: 'Jigawa State Ministry of Commerce, Industry & Cooperatives',
      sector: 'Commerce & Industry',
      contactEmail: 'commerce@jigawastate.gov.ng',
    },
    {
      code: 'MDA-JIG-EXEC',
      name: 'Jigawa State Executive Council & Governor\'s Office',
      sector: 'Executive Governance',
      contactEmail: 'executive@jigawastate.gov.ng',
    },
  ];

  const mdaMap: Record<string, string> = {};

  for (const mda of mdaFixtures) {
    const record = await prisma.stateMDA.upsert({
      where: { code: mda.code },
      update: {
        name: mda.name,
        sector: mda.sector,
        contactEmail: mda.contactEmail,
      },
      create: mda,
    });
    mdaMap[mda.code] = record.id;
  }

  // Seed Institutional Documents
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@startupjigawa.ng' } });

  const documentFixtures = [
    {
      id: 'doc-blueprint-2025',
      title: 'Jigawa State Digital Transformation & Innovation Charter 2025-2030',
      description: 'Comprehensive policy roadmap for state-wide broadband, 3MTT digital skills, and startup ecosystem growth.',
      documentType: 'Policy Framework',
      classification: 'PUBLIC',
      fileUrl: 'https://docs.startupjigawa.ng/policies/digital-charter-2025.pdf',
      fileSize: 4520000,
      mimeType: 'application/pdf',
      mdaId: mdaMap['MDA-JIG-ICT'],
      uploadedById: adminUser?.id,
    },
    {
      id: 'doc-agri-audit-2026',
      title: 'AgriFinTech Closed-Loop Escrow Audit & Beneficiary Disbursement Report Q2 2026',
      description: 'Audited disbursement records covering 18,500 smallholder rice farmers in the Hadejia river basin.',
      documentType: 'Audit Report',
      classification: 'RESTRICTED',
      fileUrl: 'https://docs.startupjigawa.ng/audits/agri-escrow-q2-2026.pdf',
      fileSize: 8900000,
      mimeType: 'application/pdf',
      mdaId: mdaMap['MDA-JIG-AGRI'],
      uploadedById: adminUser?.id,
    },
  ];

  for (const doc of documentFixtures) {
    await prisma.institutionalDocument.upsert({
      where: { id: doc.id },
      update: {
        title: doc.title,
        description: doc.description,
        classification: doc.classification,
        fileUrl: doc.fileUrl,
      },
      create: doc,
    });
  }

  // ----------------------------------------------------
  // 5. SEED EDTECH COURSES, COHORTS & ENROLLMENTS
  // ----------------------------------------------------
  console.log('5. Seeding EdTech Courses, Cohorts & Student Submissions...');

  const courseFixtures = [
    {
      code: 'CRS-3MTT-DEV',
      title: 'Fullstack Web & Cloud Systems Engineering',
      description: 'Prisma, Node.js, Express, React, and PostgreSQL cloud deployment architecture.',
      track: 'Software Engineering',
      level: 'Intermediate',
      durationWeeks: 16,
      instructorName: 'Dr. Kabir Aliyu',
      isPublished: true,
    },
    {
      code: 'CRS-3MTT-AGRI',
      title: 'IoT & Precision AgriTech Engineering',
      description: 'Sensor arrays, microgrid solar pumps, and USSD telemetry integration for smallholder farms.',
      track: 'AgriTech Engineering',
      level: 'Advanced',
      durationWeeks: 12,
      instructorName: 'Engr. Fatima Bello',
      isPublished: true,
    },
  ];

  const courseMap: Record<string, string> = {};

  for (const c of courseFixtures) {
    const record = await prisma.course.upsert({
      where: { code: c.code },
      update: {
        title: c.title,
        description: c.description,
        instructorName: c.instructorName,
      },
      create: c,
    });
    courseMap[c.code] = record.id;
  }

  const cohortRecord = await prisma.cohort.upsert({
    where: { code: 'COHORT-2026-3MTT' },
    update: { name: 'Jigawa 3MTT Pioneer Cohort (2026)', active: true },
    create: {
      code: 'COHORT-2026-3MTT',
      name: 'Jigawa 3MTT Pioneer Cohort (2026)',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-06-30'),
      maxStudents: 5000,
      active: true,
    },
  });

  const studentUser = await prisma.user.findUnique({ where: { email: 'student@startupjigawa.ng' } });

  if (studentUser) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId_cohortId: {
          userId: studentUser.id,
          courseId: courseMap['CRS-3MTT-DEV'],
          cohortId: cohortRecord.id,
        },
      },
      update: { progressPercent: 75, status: 'active' },
      create: {
        userId: studentUser.id,
        courseId: courseMap['CRS-3MTT-DEV'],
        cohortId: cohortRecord.id,
        status: 'active',
        progressPercent: 75,
      },
    });
  }

  // ----------------------------------------------------
  // 6. SEED PROJECT TRACKER PORTFOLIOS, MILESTONES & KPIS
  // ----------------------------------------------------
  console.log('6. Seeding Project Tracker Portfolios (RAG Health Statuses & KPI Counts)...');

  const projectFixtures = [
    {
      id: 'proj-101',
      code: 'proj-101',
      slug: 'jigawa-digital-literacy-3mtt',
      title: 'Jigawa Digital Literacy 3MTT Initiative',
      description: 'Statewide 3,000 Technical Talent (3MTT) digital skills deployment and tech ecosystem incubator.',
      category: 'EdTech / Digital Literacy',
      sector: 'EdTech',
      visibility: 'PUBLIC',
      lga: 'Dutse',
      leadAgency: 'Startup Jigawa Ltd',
      budget: 150000000.0,
      status: 'Active',
      ragStatus: 'GREEN',
      progressPercent: 75,
      milestones: [
        { title: 'Trainee Application & Biometric Verification Phase', targetDate: new Date('2026-02-15'), isCompleted: true, completedAt: new Date('2026-02-14'), status: 'Completed' },
        { title: 'LGA Digital Learning Center Hubs Activation (27 LGAs)', targetDate: new Date('2026-05-01'), isCompleted: true, completedAt: new Date('2026-04-28'), status: 'Completed' },
        { title: 'Commercial Industry Internship & Placement Clearance', targetDate: new Date('2026-11-30'), isCompleted: false, status: 'In Progress' },
      ],
      kpis: [
        { name: 'Trainees Enrolled', targetValue: 10000, currentValue: 8500, unit: 'count', category: 'Enrollment' },
        { name: 'Certifications Issued', targetValue: 8000, currentValue: 6250, unit: 'count', category: 'Output' },
        { name: 'Female Participation Rate', targetValue: 40, currentValue: 42, unit: 'percent', category: 'Inclusivity' },
      ],
      updates: [
        {
          title: '3MTT Cohort 1 Mid-Term Assessment Finalized',
          content: 'Over 8,500 trainees across all 27 Jigawa LGA learning centers successfully completed core software engineering module evaluations.',
          ragStatus: 'GREEN',
        },
      ],
    },
    {
      id: 'proj-102',
      code: 'proj-102',
      slug: 'agrifintech-closed-loop-escrow',
      title: 'AgriFinTech Closed-Loop Escrow & Input Voucher Pilot',
      description: 'Blockchain-guaranteed smart contract escrow for seed and fertilizer disbursement to smallholder farmers.',
      category: 'AgriTech / FinTech',
      sector: 'AgriTech',
      visibility: 'PUBLIC',
      lga: 'Hadejia',
      leadAgency: 'Jigawa Agricultural Development Project (JARDA)',
      budget: 250000000.0,
      status: 'Active',
      ragStatus: 'GREEN',
      progressPercent: 60,
      milestones: [
        { title: 'Smallholder Farmer Cluster Biometric Registration', targetDate: new Date('2026-03-30'), isCompleted: true, completedAt: new Date('2026-03-25'), status: 'Completed' },
        { title: 'Smart Contract Seed & Fertilizer Voucher Issuance', targetDate: new Date('2026-06-15'), isCompleted: true, completedAt: new Date('2026-06-10'), status: 'Completed' },
        { title: 'Harvest Off-Take Buyback & Escrow Liquidation', targetDate: new Date('2026-12-15'), isCompleted: false, status: 'Pending' },
      ],
      kpis: [
        { name: 'Smallholder Farmers Onboarded', targetValue: 25000, currentValue: 18500, unit: 'count', category: 'Beneficiaries' },
        { name: 'Average Crop Yield Increase', targetValue: 35, currentValue: 28.5, unit: 'percent', category: 'Impact' },
        { name: 'Smart Contract Voucher Settlement', targetValue: 100, currentValue: 88, unit: 'percent', category: 'Financial' },
      ],
      updates: [
        {
          title: 'Hadejia River Basin Fertilizer Distribution Complete',
          content: '18,500 registered rice smallholders successfully redeemed digital input vouchers via USSD offline tokens.',
          ragStatus: 'GREEN',
        },
      ],
    },
    {
      id: 'proj-103',
      code: 'proj-103',
      slug: 'mutaru-mu-gyara-emergency-grid',
      title: 'Mutaru Mu Gyara Civic Emergency Response Grid',
      description: 'Automated civic infrastructure alert grid with SLA escalation business-hour tracking engine.',
      category: 'Civic Infrastructure',
      sector: 'Civic Infrastructure',
      visibility: 'PUBLIC',
      lga: 'Birnin Kudu',
      leadAgency: 'Jigawa State Works & Housing Bureau',
      budget: 180000000.0,
      status: 'Active',
      ragStatus: 'AMBER',
      progressPercent: 45,
      milestones: [
        { title: 'Civic SLA Command Center & Dispatch Engine Launch', targetDate: new Date('2026-02-01'), isCompleted: true, completedAt: new Date('2026-01-29'), status: 'Completed' },
        { title: 'Tier 1-3 Field Maintenance Unit Mobile Integration', targetDate: new Date('2026-05-15'), isCompleted: true, completedAt: new Date('2026-05-10'), status: 'Completed' },
        { title: 'Tier 4-5 Executive Oversight Clearance Bifurcation', targetDate: new Date('2026-10-31'), isCompleted: false, status: 'In Progress' },
      ],
      kpis: [
        { name: 'Average Incident Dispatch Time', targetValue: 2, currentValue: 3.4, unit: 'hours', category: 'Service Level' },
        { name: 'Emergency Incidents Resolved', targetValue: 5000, currentValue: 3420, unit: 'count', category: 'Operations' },
        { name: 'SLA Business Hour Compliance Rate', targetValue: 95, currentValue: 87.2, unit: 'percent', category: 'Compliance' },
      ],
      updates: [
        {
          title: 'SLA Response Advisory — Seasonal Rain Delays',
          content: 'Average dispatch time in rural Birnin Kudu sector increased to 3.4 hours during heavy rainfall. Rapid response crews deployed.',
          ragStatus: 'AMBER',
        },
      ],
    },
    {
      id: 'proj-104',
      code: 'proj-104',
      slug: 'jigawa-solar-agro-industrial-hub',
      title: 'Jigawa Solar Agro-Industrial Power Hub',
      description: 'Microgrid solar installation powering cold-storage facilities for perishable produce clusters.',
      category: 'Renewable Energy',
      sector: 'Renewable Energy',
      visibility: 'PUBLIC',
      lga: 'Gumel',
      leadAgency: 'Jigawa Rural Electrification Board',
      budget: 320000000.0,
      status: 'Planning',
      ragStatus: 'RED',
      progressPercent: 20,
      milestones: [
        { title: 'Land Title Acquisition & Environmental Impact Clearance', targetDate: new Date('2026-04-15'), isCompleted: true, completedAt: new Date('2026-04-10'), status: 'Completed' },
        { title: 'Solar Array Procurement & Inverter Shipment', targetDate: new Date('2026-08-01'), isCompleted: false, status: 'Delayed' },
        { title: 'Cold-Storage Inverter Grid Interconnection', targetDate: new Date('2026-12-01'), isCompleted: false, status: 'Pending' },
      ],
      kpis: [
        { name: 'Clean Energy Capacity Installed', targetValue: 15, currentValue: 3, unit: 'MW', category: 'Capacity' },
        { name: 'Cold-Storage Processing Units', targetValue: 12, currentValue: 2, unit: 'count', category: 'Infrastructure' },
      ],
      updates: [
        {
          title: 'Supply Chain Procurement Delay Advisory',
          content: 'Port clearance delays for industrial inverter shipments have temporarily delayed microgrid assembly in Gumel hub.',
          ragStatus: 'RED',
        },
      ],
    },
  ];

  const pmUser = await prisma.user.findUnique({ where: { email: 'pm@startupjigawa.ng' } });

  for (const p of projectFixtures) {
    const projectRecord = await prisma.project.upsert({
      where: { code: p.code },
      update: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        category: p.category,
        sector: p.sector,
        visibility: p.visibility,
        lga: p.lga,
        leadAgency: p.leadAgency,
        budget: p.budget,
        status: p.status,
        ragStatus: p.ragStatus,
        progressPercent: p.progressPercent,
      },
      create: {
        id: p.id,
        code: p.code,
        slug: p.slug,
        title: p.title,
        description: p.description,
        category: p.category,
        sector: p.sector,
        visibility: p.visibility,
        lga: p.lga,
        leadAgency: p.leadAgency,
        budget: p.budget,
        status: p.status,
        ragStatus: p.ragStatus,
        progressPercent: p.progressPercent,
      },
    });

    // Seed Milestones
    for (const m of p.milestones) {
      const existingMilestones = await prisma.milestone.findMany({
        where: { projectId: projectRecord.id, title: m.title },
      });

      if (existingMilestones.length === 0) {
        await prisma.milestone.create({
          data: {
            projectId: projectRecord.id,
            title: m.title,
            targetDate: m.targetDate,
            isCompleted: m.isCompleted,
            completedAt: m.completedAt || null,
            status: m.status,
          },
        });
      }
    }

    // Seed KPI Metrics
    for (const k of p.kpis) {
      const existingKpi = await prisma.kPIMetric.findFirst({
        where: { projectId: projectRecord.id, name: k.name },
      });

      if (!existingKpi) {
        await prisma.kPIMetric.create({
          data: {
            projectId: projectRecord.id,
            name: k.name,
            targetValue: k.targetValue,
            currentValue: k.currentValue,
            unit: k.unit,
            category: k.category,
          },
        });
      } else {
        await prisma.kPIMetric.update({
          where: { id: existingKpi.id },
          data: {
            targetValue: k.targetValue,
            currentValue: k.currentValue,
            unit: k.unit,
          },
        });
      }
    }

    // Seed Project Updates
    for (const u of p.updates) {
      const existingUpdate = await prisma.projectUpdate.findFirst({
        where: { projectId: projectRecord.id, title: u.title },
      });

      if (!existingUpdate) {
        await prisma.projectUpdate.create({
          data: {
            projectId: projectRecord.id,
            authorId: pmUser?.id || null,
            title: u.title,
            content: u.content,
            ragStatus: u.ragStatus,
          },
        });
      }
    }
  }

  // ----------------------------------------------------
  // 7. SEED CONTROL PLANE FEATURE FLAGS & SYSTEM AUDIT LOGS
  // ----------------------------------------------------
  console.log('7. Seeding Control Plane Feature Flags & System Audit Logs...');

  const featureFlags = [
    { key: 'ENABLE_SMS_OTP', description: 'Toggle SMS/USSD OTP 2FA challenge during user login', isEnabled: false, environment: 'production' },
    { key: 'ENABLE_AGRI_ESCROW', description: 'Enable AgriFinTech smart contract closed-loop escrow cluster features', isEnabled: true, environment: 'production' },
    { key: 'ENABLE_PUBLIC_METRICS_MODAL', description: 'Expose NDPR/NDPA compliant privacy telemetry modal on landing pages', isEnabled: true, environment: 'production' },
    { key: 'MAINTENANCE_MODE', description: 'Restrict platform access to system administrators during system updates', isEnabled: false, environment: 'production' },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {
        description: flag.description,
        isEnabled: flag.isEnabled,
        environment: flag.environment,
      },
      create: flag,
    });
  }

  // Global Role Override
  if (adminUser && studentUser) {
    const existingOverride = await prisma.globalRoleOverride.findFirst({
      where: { userId: studentUser.id },
    });

    if (!existingOverride) {
      await prisma.globalRoleOverride.create({
        data: {
          userId: studentUser.id,
          grantedRole: 'siwes_trainee',
          assignedBy: adminUser.id,
          reason: 'Verified institutional clearance from Federal University Dutse',
          expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
        },
      });
    }
  }

  // System Audit Logs
  const auditFixtures = [
    {
      actorId: adminUser?.id || 'sys-001',
      actorEmail: adminUser?.email || 'admin@startupjigawa.ng',
      action: 'SYSTEM_INITIALIZED',
      resource: 'database-seeder',
      subdomain: 'admin',
      ipAddress: '127.0.0.1',
      details: JSON.stringify({ event: 'Production Database Seeder Engine Execution', status: 'SUCCESS', timestamp: new Date().toISOString() }),
    },
    {
      actorId: adminUser?.id || 'sys-001',
      actorEmail: adminUser?.email || 'admin@startupjigawa.ng',
      action: 'ROLE_MATRIX_CONFIGURED',
      resource: 'rbac-engine',
      subdomain: 'admin',
      ipAddress: '127.0.0.1',
      details: JSON.stringify({ rolesSeeded: roleDefinitions.length, permissionsSeeded: permissions.length }),
    },
    {
      actorId: adminUser?.id || 'sys-001',
      actorEmail: adminUser?.email || 'admin@startupjigawa.ng',
      action: 'PRIVACY_COMPLIANCE_ASSERTED',
      resource: 'project-tracker',
      subdomain: 'tracker',
      ipAddress: '127.0.0.1',
      details: JSON.stringify({ framework: 'NDPR/NDPA 2023', policy: 'Zero Public PII Exposure Guaranteed' }),
    },
  ];

  for (const log of auditFixtures) {
    await prisma.systemAuditLog.create({
      data: log,
    });
  }

  console.log('====================================================');
  console.log('🎉 DATABASE SEEDING ENGINE EXECUTED SUCCESSFULLY!');
  console.log('====================================================');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ SEEDING ENGINE ERROR:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
