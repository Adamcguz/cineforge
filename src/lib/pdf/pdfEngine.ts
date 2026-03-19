import { jsPDF } from 'jspdf';

/**
 * Creates a configured jsPDF instance for screenplay PDFs.
 * Uses Courier (built-in PDF font, closest to Courier Prime).
 * US Letter: 8.5" x 11" with industry-standard margins:
 *   Left: 1.5", Right: 1", Top: 1", Bottom: 1"
 */
export function createScreenplayPDF(): jsPDF {
  const doc = new jsPDF({
    unit: 'in',
    format: 'letter',
  });
  doc.setFont('Courier');
  doc.setFontSize(12);
  return doc;
}

/**
 * Creates a configured jsPDF instance for table-based PDFs (breakdown, schedule, etc.).
 */
export function createTablePDF(title: string): jsPDF {
  const doc = new jsPDF({
    unit: 'in',
    format: 'letter',
  });
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(16);
  doc.text(title, 0.75, 0.75);
  doc.setFontSize(10);
  return doc;
}

// Page dimensions in inches
export const PAGE = {
  width: 8.5,
  height: 11,
  marginLeft: 1.5,
  marginRight: 1,
  marginTop: 1,
  marginBottom: 1,
  usableWidth: 6, // 8.5 - 1.5 - 1
  lineHeight: 12 / 72, // 12pt in inches
  charsPerLine: 60,
} as const;
