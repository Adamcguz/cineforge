export interface BudgetLineItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  notes?: string;
  actuals?: number;
  sourceTagId?: string;
}

export const ABOVE_THE_LINE_CATEGORIES = [
  'Development',
  'Above-the-Line',
  'Equipment & Camera',
  'Post-Production',
  'Music & Licensing',
  'Marketing & Deliverables',
  'Contingency',
] as const;
