
export interface ColorData {
  name: string;
  value: number;
  hex: string;
}

export interface MetricData {
  subject: string;
  A: number;
  fullMark: number;
}

export interface ComparisonItem {
  dataset: string;
  similarity: number;
  styleMatch: string;
}

export interface AnalysisResult {
  id: string;
  thumbnail: string;
  colorDistribution: ColorData[];
  sharpness: number;
  complexity: number;
  saturation: number;
  styleFeatures: string[];
  clipSimilarity: ComparisonItem[];
  uniquenessScore: number;
  description: string;
}

export interface CollectionSummary {
  coreFeatures: string[];
  promptFormula: string;
}

export interface GlobalReportData {
  avgSharpness: number;
  avgComplexity: number;
  avgUniqueness: number;
  topStyles: string[];
  dominantColors: ColorData[];
  recommendations: string[];
  summary?: CollectionSummary;
}
