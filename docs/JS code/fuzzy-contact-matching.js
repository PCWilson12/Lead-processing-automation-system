// Jaro-Winkler similarity function
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

  const jaro = (
    matches / s1.length +
    matches / s2.length +
    (matches - transpositions / 2) / matches
  ) / 3;

  const prefix = Math.min(4, [...s1].findIndex((ch, i) => ch !== s2[i]) || 0);
  return jaro + prefix * 0.1 * (1 - jaro);
}
