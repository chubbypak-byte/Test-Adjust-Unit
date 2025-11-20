export interface AnalysisInput {
  cause: string;
  discoveryDate: string;
  fixDate: string;
  additionalInfo: string;
  electricityData: any[];
  productionData: any[];
}

export interface AnalysisResult {
  failureStartMonth: string;
  confidenceScore: number;
  reasoning: string[];
  anomalyType: 'DROP' | 'SPIKE' | 'ERRATIC' | 'NORMAL';
  summary: string;
}

export interface ChartDataPoint {
  month: string;
  usage: number;
  production: number;
  isAfterFailure?: boolean;
}
