/**
 * Creative Name Standardization Utility
 * 
 * This utility helps standardize creative names between different data sources
 * to ensure proper data alignment and consistency across charts and tables.
 */

export interface CreativeNameMapping {
  originalName: string;
  standardizedName: string;
  source: 'insights' | 'sales';
}

/**
 * Standardize creative names by cleaning and normalizing them
 */
export const standardizeCreativeName = (name: string): string => {
  if (!name || name.trim() === '') return 'Nome Desconhecido';
  
  return name
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s\-_]/g, '') // Remove special characters except hyphens and underscores
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Title case
    .join(' ');
};

/**
 * Create a mapping between original names and standardized names
 */
export const createCreativeNameMapping = (
  insightsNames: string[],
  salesNames: string[]
): Map<string, CreativeNameMapping[]> => {
  const mappingMap = new Map<string, CreativeNameMapping[]>();
  
  // Process insights names
  insightsNames.forEach(name => {
    if (!name || name.trim() === '') return;
    
    const standardized = standardizeCreativeName(name);
    if (!mappingMap.has(standardized)) {
      mappingMap.set(standardized, []);
    }
    mappingMap.get(standardized)!.push({
      originalName: name,
      standardizedName: standardized,
      source: 'insights'
    });
  });
  
  // Process sales names
  salesNames.forEach(name => {
    if (!name || name.trim() === '') return;
    
    const standardized = standardizeCreativeName(name);
    if (!mappingMap.has(standardized)) {
      mappingMap.set(standardized, []);
    }
    mappingMap.get(standardized)!.push({
      originalName: name,
      standardizedName: standardized,
      source: 'sales'
    });
  });
  
  return mappingMap;
};

/**
 * Find the best matching creative name between insights and sales data
 */
export const findBestMatch = (
  creativeName: string,
  alternativeNames: string[]
): string => {
  const standardizedTarget = standardizeCreativeName(creativeName);
  
  // Try exact match first
  const exactMatch = alternativeNames.find(name => 
    standardizeCreativeName(name) === standardizedTarget
  );
  
  if (exactMatch) return exactMatch;
  
  // Try partial match
  const partialMatch = alternativeNames.find(name => {
    const standardizedName = standardizeCreativeName(name);
    return standardizedTarget.includes(standardizedName) || 
           standardizedName.includes(standardizedTarget);
  });
  
  return partialMatch || creativeName;
};

/**
 * Get insights for a creative name, trying different name variations
 */
export const getInsightsForCreative = (
  creativeName: string,
  insightsMap: Map<string, any[]>
): any[] => {
  // Try exact match first
  if (insightsMap.has(creativeName)) {
    return insightsMap.get(creativeName) || [];
  }
  
  // Try standardized match
  const standardized = standardizeCreativeName(creativeName);
  const matchingKey = Array.from(insightsMap.keys()).find(key => 
    standardizeCreativeName(key) === standardized
  );
  
  if (matchingKey) {
    return insightsMap.get(matchingKey) || [];
  }
  
  return [];
};

/**
 * Get sales for a creative name, trying different name variations
 */
export const getSalesForCreative = (
  creativeName: string,
  salesMap: Map<string, any[]>
): any[] => {
  // Try exact match first
  if (salesMap.has(creativeName)) {
    return salesMap.get(creativeName) || [];
  }
  
  // Try standardized match
  const standardized = standardizeCreativeName(creativeName);
  const matchingKey = Array.from(salesMap.keys()).find(key => 
    standardizeCreativeName(key) === standardized
  );
  
  if (matchingKey) {
    return salesMap.get(matchingKey) || [];
  }
  
  return [];
};