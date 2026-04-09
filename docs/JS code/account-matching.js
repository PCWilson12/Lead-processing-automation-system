const allLeads = $("Code in JavaScript1").all();

// Guard: if this loop iteration exceeds the lead count, skip
if (!allLeads || $runIndex >= allLeads.length) {
  return [];
}

const lead = allLeads[$runIndex].json;
const candidates = $input.all().flatMap(c => c.json);
const uniqueCandidates = Array.from(new Map(candidates.map(a => [a.Id, a])).values());

// -----------------------------
// 🧰 Helper Functions
// -----------------------------
function cleanDomain(d) {
  if (!d) return null;
  return String(d)
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[\/?#]/)[0];
}

function sameDomainFamily(d1, d2) {
  if (!d1 || !d2) return false;
  const c1 = cleanDomain(d1);
  const c2 = cleanDomain(d2);
  if (!c1 || !c2) return false;
  return c1 === c2 || c1.endsWith(`.${c2}`) || c2.endsWith(`.${c1}`);
}

function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function jaroWinkler(s1, s2) {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  const maxDist = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1m = new Array(s1.length).fill(false);
  const s2m = new Array(s2.length).fill(false);
  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - maxDist);
    const end = Math.min(i + maxDist + 1, s2.length);
    for (let j = start; j < end; j++) {
      if (s2m[j]) continue;
      if (s1[i] === s2[j]) {
        s1m[i] = s2m[j] = true;
        matches++;
        break;
      }
    }
  }
  if (matches === 0) return 0;

  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (s1m[i]) {
      while (!s2m[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
  }

  const jaro = (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3;
  let prefix = 0;
  for (let i = 0; i < Math.min(4, s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

// -----------------------------
// 🔍 Matching Logic
// -----------------------------
const leadCompanyNorm = normalizeName(lead.company_norm);
const leadDomain = cleanDomain(lead.email_domain);
const leadCountry = (lead.Country || '').toLowerCase().trim();

let best = null;
let bestScore = 0;
let probableMatches = [];
let bestDebug = {};

for (const acc of uniqueCandidates) {
  const accNameNorm = normalizeName(acc.Name_Canonical__c || acc.Name);
  const accDomain = cleanDomain(acc.Company_Domain_Name__c || acc.Website_Domain__c || acc.Website);
  const accCountry = (acc.BillingCountry || '').toLowerCase().trim();

  const nameSim = jaroWinkler(leadCompanyNorm, accNameNorm);
  const domainMatch = sameDomainFamily(leadDomain, accDomain);
  const countryMatch = leadCountry && accCountry && leadCountry === accCountry;

  if (nameSim >= 0.75) {
    probableMatches.push({
      Id: acc.Id,
      Name: acc.Name,
      Score: nameSim,
      domainMatch,
      countryMatch,
    });
  }

  const exactDomainMatch = leadDomain && accDomain && (leadDomain === accDomain);
  const domainFamilyMatch = sameDomainFamily(leadDomain, accDomain);

  if (exactDomainMatch) {
    best = acc;
    bestScore = 1; 
    bestDebug = { accId: acc.Id, accName: acc.Name, reason: 'Exact domain match override', leadDomain, accDomain };
    break; 
  }

  let threshold = 0.92;
  if (domainFamilyMatch) threshold = 0.80;

  if (nameSim >= threshold && nameSim > bestScore) {
    best = acc;
    bestScore = nameSim;
    bestDebug = { accId: acc.Id, accName: acc.Name, nameSim, domainFamilyMatch, countryMatch, leadDomain, accDomain };
  }
}

// Output and final decision routing follows in the original node...
