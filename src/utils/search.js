export const smartSearch = (productName, query) => {
  if (!query) return true;
  
  const name = productName.toLowerCase();
  const q = query.toLowerCase().trim();
  
  // Exact or simple match
  if (name.includes(q)) return true;
  
  const synonyms = {
    'sensor': ['module', 'detector', 'reader'],
    'module': ['sensor', 'board'],
    'board': ['arduino', 'esp', 'module', 'uno', 'mega', 'pcb'],
    'wire': ['cable', 'jumper'],
    'cable': ['wire', 'jumper'],
    'light': ['led', 'lamp', 'bulb'],
    'led': ['light'],
    'battery': ['cell', 'power', 'lipo'],
    'screen': ['display', 'lcd', 'oled'],
    'display': ['screen', 'lcd', 'oled'],
    'ir': ['infrared'],
    'infrared': ['ir'],
    'switch': ['button', 'relay'],
    'button': ['switch']
  };

  const queryTerms = q.split(/\s+/);
  
  // Every term in the query must match either directly or via a synonym
  return queryTerms.every(term => {
    if (name.includes(term)) return true;
    
    // Check if any synonym of the term matches
    const termSynonyms = synonyms[term] || [];
    return termSynonyms.some(syn => name.includes(syn));
  });
};
