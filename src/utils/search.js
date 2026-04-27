// Calculate Levenshtein distance for typo tolerance
const levenshtein = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  return matrix[b.length][a.length];
};

// Check if queryTerm is a close match to targetWord
const isFuzzyMatch = (queryTerm, targetWord) => {
  // Direct substring match is always a success
  if (targetWord.includes(queryTerm)) return true;
  
  // Calculate typo distance
  const dist = levenshtein(queryTerm, targetWord);
  
  // Allow 1 typo for words 4-6 chars, 2 typos for words 7+ chars. No typos for <=3.
  if (queryTerm.length <= 3) return dist === 0;
  if (queryTerm.length <= 6) return dist <= 1;
  return dist <= 2;
};

export const smartSearch = (productName, query) => {
  if (!query) return true;
  
  // Normalize string: lower case, remove symbols/hyphens, normalize spaces
  const normalize = (str) => str.toLowerCase().replace(/[-_/:(),.]/g, ' ').replace(/\s+/g, ' ').trim();
  
  const name = normalize(productName);
  const q = normalize(query);
  
  // Exact phrase match (e.g. "arduino mega")
  if (name.includes(q)) return true;
  
  // Expanded Electronics Synonym Dictionary
  const synonyms = {
    'sensor': ['module', 'detector', 'reader', 'probe'],
    'module': ['sensor', 'board', 'shield'],
    'board': ['arduino', 'esp', 'module', 'uno', 'mega', 'pcb', 'shield'],
    'wire': ['cable', 'jumper', 'line'],
    'cable': ['wire', 'jumper', 'line'],
    'light': ['led', 'lamp', 'bulb', 'diode'],
    'led': ['light', 'diode'],
    'battery': ['cell', 'power', 'lipo', 'ion'],
    'screen': ['display', 'lcd', 'oled', 'monitor'],
    'display': ['screen', 'lcd', 'oled', 'monitor'],
    'ir': ['infrared', 'receiver', 'transmitter'],
    'infrared': ['ir'],
    'switch': ['button', 'relay', 'keypad'],
    'button': ['switch', 'keypad'],
    'motor': ['servo', 'stepper', 'pump', 'engine'],
    'servo': ['motor'],
    'power': ['supply', 'battery', 'adapter', 'converter', 'step', 'buck', 'boost'],
    'adapter': ['power', 'supply']
  };

  const queryTerms = q.split(' ');
  const productWords = name.split(' ');
  
  // Every term in the user's query must be accounted for in the product name
  return queryTerms.every(queryTerm => {
    
    // 1. Is there a fuzzy match for the query term in any product word?
    const hasDirectMatch = productWords.some(productWord => isFuzzyMatch(queryTerm, productWord));
    if (hasDirectMatch) return true;
    
    // 2. Is there a fuzzy match for ANY of the query term's synonyms in any product word?
    const termSynonyms = synonyms[queryTerm] || [];
    const hasSynonymMatch = termSynonyms.some(synonym => 
      productWords.some(productWord => isFuzzyMatch(synonym, productWord))
    );
    
    return hasSynonymMatch;
  });
};
