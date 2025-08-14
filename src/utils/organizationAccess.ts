// Organization access control utilities

export const ALLOWED_DOMAINS = ['clientascension.com'];

export function validateOrganizationEmail(email: string): boolean {
  if (!email) return false;
  
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}

export function getOrganizationFromEmail(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain) ? domain : null;
}

export function isAuthorizedDomain(email: string): boolean {
  return validateOrganizationEmail(email);
}

export function getOrganizationDisplayName(domain: string): string {
  const orgNames: Record<string, string> = {
    'clientascension.com': 'Client Ascension'
  };
  
  return orgNames[domain] || domain;
}