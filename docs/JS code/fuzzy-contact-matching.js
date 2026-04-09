// 1. Access the single original Lead item (with normalized fields) using an external reference.
const lead = $("Code in JavaScript1").item.json; 

// 2. Access the contact candidates from the direct input (Find Contacts by Prefixes).
const contacts = $input.all().flatMap(connection => connection.json);

// --- Debugging Setup ---
const debugLog = [];
const requiredThreshold = 0.93; 

// --- Fast Jaro-Winkler similarity ---
function jaroWinkler(s1, s2) {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  const maxDist = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1m = new Array(s1.length).fill(false);
  const s2m = new Array(s2.length).fill(false);
  let matches = 0, transpositions = 0;

  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - maxDist);
    const end = Math.min(i + maxDist + 1, s2.length);
    for (let j = start; j < end; j++) {
      if (s2m[j]) continue;
      if (s1[i] === s2[j]) { s1m[i] = s2m[j] = true; matches++; break; }
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
  const jaro = (matches / s1.length + matches / s2.length +
               (matches - transpositions / 2) / matches) / 3;
  const prefix = Math.min(4, [...s1].findIndex((ch, i) => ch !== s2[i]) || 0);
  return jaro + prefix * 0.1 * (1 - jaro);
}

function cleanDomain(d) {
  if (!d) return null;
  return d.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
}

function sameDomainFamily(d1, d2) {
  if (!d1 || !d2) return false;
  const c1 = cleanDomain(d1);
  const c2 = cleanDomain(d2);
  if (c1 === c2) return true; 
  return false; 
}

// --- Compare lead vs. contacts ---
const leadFirstName = lead.FirstName || '';
const leadLastName = lead.LastName || '';
const leadName = `${leadFirstName} ${leadLastName}`.trim().toLowerCase();
const leadDomain = lead.email_domain; 

let best = null, bestScore = 0;

for (const c of contacts) {
    const candidateFirstName = c.FirstName || '';
    const candidateLastName = c.LastName || '';
    const cDomainRaw = c.Email?.split('@')[1] || c.Account?.Website || null; 
    
    let nameToCompare = `${candidateFirstName} ${candidateLastName}`.trim().toLowerCase();
    if (leadFirstName.length === 1 && candidateFirstName.length > 1) {
        // Lead is 'K', Contact is 'Karl' -> compare 'K' vs 'K'
        nameToCompare = `${candidateFirstName.slice(0, 1)} ${candidateLastName}`.trim().toLowerCase();
    }
    
    const nameSim = jaroWinkler(nameToCompare, leadName);
    const domainMatch = sameDomainFamily(leadDomain, cDomainRaw);
    
    debugLog.push({
        name: candidateFirstName + ' ' + candidateLastName,
        name_compared: nameToCompare,
        id: c.Id,
        score: nameSim,
        domain_check: domainMatch,
    });

    if (nameSim >= requiredThreshold && domainMatch && nameSim > bestScore) {
        best = c; 
        bestScore = nameSim;
    }
}

const out = { ...lead };
out.Debug_Log = debugLog;

if (best) {
  out.Match_Score__c = Math.round(bestScore * 100);
  out.Match_Confidence__c = 'Probable';
  out.Matched_Contact__c = best.Id;
  out.Matched_Account__c = best.AccountId;
}
return [{ json: out }];
