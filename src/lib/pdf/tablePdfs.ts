import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BreakdownTag, Shot, ShootDay, BudgetLineItem, Character } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import type { ScenePageInfo } from '@/lib/breakdownSync';
import { formatEighths } from '@/lib/breakdownSync';

function createDoc(title: string): jsPDF {
  const doc = new jsPDF({ unit: 'in', format: 'letter' });
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(16);
  doc.text(title, 0.75, 0.75);
  doc.setFontSize(10);
  return doc;
}

// --- Breakdown PDF ---
export function exportBreakdownPDF(
  title: string,
  tags: BreakdownTag[],
  scenes: ScenePageInfo[]
): void {
  const doc = createDoc(`${title} — Breakdown Report`);

  const sceneMap = new Map(scenes.map((s) => [s.sceneId, s]));
  const rows = tags.map((t) => {
    const scene = sceneMap.get(t.sceneId);
    return [
      scene?.sceneNumber || '?',
      CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] || t.category,
      t.text,
    ];
  });

  autoTable(doc, {
    startY: 1.1,
    head: [['Scene', 'Category', 'Item']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255 },
    alternateRowStyles: { fillColor: [40, 40, 40] },
    theme: 'grid',
  });

  doc.save(`${title} - Breakdown.pdf`);
}

// --- Schedule PDF ---
export function exportSchedulePDF(
  title: string,
  schedule: ShootDay[],
  scenePages: Map<string, ScenePageInfo>
): void {
  const doc = createDoc(`${title} — Shooting Schedule`);

  const rows: string[][] = [];
  for (const day of schedule) {
    for (const sid of day.sceneIds) {
      const info = scenePages.get(sid);
      rows.push([
        day.label,
        day.date || '',
        info?.sceneNumber || '?',
        info?.heading || '',
        formatEighths(info?.pageCount || 0),
      ]);
    }
  }

  autoTable(doc, {
    startY: 1.1,
    head: [['Day', 'Date', 'Scene', 'Heading', 'Pages']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255 },
    theme: 'grid',
  });

  doc.save(`${title} - Schedule.pdf`);
}

// --- Shot List PDF ---
export function exportShotListPDF(
  title: string,
  scenes: ScenePageInfo[],
  shotsByScene: Map<string, Shot[]>
): void {
  const doc = createDoc(`${title} — Shot List`);

  const rows: string[][] = [];
  for (const scene of scenes) {
    const shots = shotsByScene.get(scene.sceneId) || [];
    for (const shot of shots) {
      rows.push([
        scene.sceneNumber,
        shot.number,
        shot.type,
        shot.angle,
        shot.movement,
        shot.frame,
        shot.completed ? 'Y' : '',
      ]);
    }
  }

  autoTable(doc, {
    startY: 1.1,
    head: [['Scene', 'Shot', 'Type', 'Angle', 'Movement', 'Description', 'Done']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255 },
    theme: 'grid',
  });

  doc.save(`${title} - Shot List.pdf`);
}

// --- Characters PDF ---
export function exportCharactersPDF(
  title: string,
  characters: Character[]
): void {
  const doc = createDoc(`${title} — Character Bible`);

  let y = 1.2;
  for (const char of characters) {
    if (y > 9) {
      doc.addPage();
      y = 0.75;
    }
    doc.setFontSize(14);
    doc.text(char.name, 0.75, y);
    y += 0.3;
    doc.setFontSize(9);

    const fields: [string, string | undefined][] = [
      ['Age', char.age],
      ['Occupation', char.occupation],
      ['Backstory', char.backstory],
      ['Wants', char.wants],
      ['Needs', char.needs],
      ['Arc', [char.arcStart, char.arcChange, char.arcEnd].filter(Boolean).join(' → ')],
      ['Notes', char.notes],
    ];

    for (const [label, value] of fields) {
      if (!value) continue;
      doc.text(`${label}: ${value}`, 0.75, y);
      y += 0.2;
    }
    y += 0.3;
  }

  doc.save(`${title} - Characters.pdf`);
}

// --- Budget PDF ---
export function exportBudgetPDF(
  title: string,
  lineItems: BudgetLineItem[]
): void {
  const doc = createDoc(`${title} — Budget`);

  const grandTotal = lineItems.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  doc.setFontSize(12);
  doc.text(
    `Grand Total: $${grandTotal.toLocaleString()}`,
    0.75,
    1.1
  );

  const rows = lineItems.map((i) => [
    i.category,
    i.name,
    String(i.quantity),
    `$${i.unitCost.toLocaleString()}`,
    `$${(i.quantity * i.unitCost).toLocaleString()}`,
    i.notes || '',
  ]);

  autoTable(doc, {
    startY: 1.4,
    head: [['Category', 'Item', 'Qty', 'Unit Cost', 'Total', 'Notes']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255 },
    theme: 'grid',
  });

  doc.save(`${title} - Budget.pdf`);
}
