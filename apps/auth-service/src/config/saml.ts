export type SamlRequest = {
  requestId: string;
  issuer: string;
  acsUrl: string;
};

export type SamlAssertionProfile = {
  subject: string;
  roles: string[];
  issuer: string;
  attributes: Record<string, string | string[]>;
  audience: string;
};

export const samlPartnerConfigs = [
  {
    entityId: 'https://mda.jigawa.gov.ng',
    acsUrl: 'https://auth.startupjigawa.com/saml/v2/acs',
    roles: ['admin', 'mda_partner', 'public']
  },
  {
    entityId: 'https://portal.nitda.gov.ng',
    acsUrl: 'https://auth.startupjigawa.com/saml/v2/acs',
    roles: ['admin', 'trainer', 'public']
  }
];

export function buildSamlRequest(payload: SamlRequest) {
  return {
    id: payload.requestId,
    issuer: payload.issuer,
    acsUrl: payload.acsUrl,
    destination: payload.acsUrl,
    signature: 'mock-signature',
    status: 'pending'
  };
}

function extractXmlValue(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : null;
}

function extractAttributeValues(xml: string) {
  const attributes: Record<string, string | string[]> = {};
  const matches = xml.matchAll(/<Attribute[^>]*Name="([^"]+)"[^>]*>([\s\S]*?)<\/Attribute>/g);

  for (const match of matches) {
    const [, name, valueSection] = match;
    const values = [...valueSection.matchAll(/<AttributeValue[^>]*>([\s\S]*?)<\/AttributeValue>/g)].map((entry) => entry[1].trim());
    attributes[name] = values.length > 1 ? values : values[0] ?? '';
  }

  return attributes;
}

export function validateSamlAssertion(assertion: string): SamlAssertionProfile | null {
  if (!assertion || !assertion.includes('<Assertion') || !assertion.includes('<Signature')) {
    return null;
  }

  const issuer = extractXmlValue(assertion, 'Issuer') ?? 'government-partner';
  const subject = extractXmlValue(assertion, 'NameID') ?? 'external-user';
  const audience = extractXmlValue(assertion, 'Audience') ?? 'https://auth.startupjigawa.com';
  const roleNames = extractAttributeValues(assertion)['Role'] ?? 'public';
  const mappedRoles = Array.isArray(roleNames) ? roleNames : [roleNames];

  const allowedRoles = ['public', 'student', 'trainer', 'admin', 'mda_partner', 'siwes_trainee'];
  const roles = mappedRoles
    .map((role) => String(role).trim())
    .filter((role) => allowedRoles.includes(role))
    .map((role) => role);

  return {
    subject,
    roles: roles.length > 0 ? roles : ['public'],
    issuer,
    audience,
    attributes: {
      email: extractAttributeValues(assertion).email ?? `${subject}@partner.gov`,
      role: mappedRoles[0] ?? 'public',
      institution: extractAttributeValues(assertion).institution ?? 'government-partner'
    }
  };
}
