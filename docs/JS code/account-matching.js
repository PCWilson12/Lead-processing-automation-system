function cleanDomain(d) {
  if (!d) return null;
  return d.toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
}

function generateDomainVariants(domain, companyNorm) {
  const variations = new Set();

  if (!domain) return [];

  variations.add(domain);

  const base = domain.split('.')[0];
  const tld = domain.split('.').pop();

  if (companyNorm) {
    const cleanCompany = companyNorm.replace(/\s/g, '').replace(/-/g, '');
    ['com', 'co', 'net', 'org', 'io'].forEach(tld => {
      variations.add(`${cleanCompany}.${tld}`);
    });
  }

  return Array.from(variations);
}
