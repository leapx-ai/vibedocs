function normalizeForSimilarity(value) {
  return value
    .toLowerCase()
    .replace(/[`#>*_[\]()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCharacterShingles(value, size = 3) {
  const compact = normalizeForSimilarity(value).replace(/\s+/g, "");

  if (compact.length === 0) {
    return new Set();
  }

  if (compact.length <= size) {
    return new Set([compact]);
  }

  const shingles = new Set();

  for (let index = 0; index <= compact.length - size; index += 1) {
    shingles.add(compact.slice(index, index + size));
  }

  return shingles;
}

export function diceCoefficient(left, right) {
  const leftShingles = buildCharacterShingles(left);
  const rightShingles = buildCharacterShingles(right);

  if (leftShingles.size === 0 || rightShingles.size === 0) {
    return 0;
  }

  let overlap = 0;

  for (const shingle of leftShingles) {
    if (rightShingles.has(shingle)) {
      overlap += 1;
    }
  }

  return (2 * overlap) / (leftShingles.size + rightShingles.size);
}

export function normalizedLength(value) {
  return normalizeForSimilarity(value).length;
}
