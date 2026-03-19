import { Node } from 'slate';
import type { Descendant } from 'slate';
import type { ScriptElement } from '@/types';
import { createScreenplayPDF, PAGE } from './pdfEngine';

interface ScriptPdfOptions {
  title: string;
  author: string;
  draftColor: string;
  showSceneNumbers?: boolean;
}

export function exportScriptPDF(document: Descendant[], options: ScriptPdfOptions): void {
  const doc = createScreenplayPDF();
  const lh = PAGE.lineHeight;

  // Title page
  doc.setFontSize(24);
  doc.text(options.title.toUpperCase(), PAGE.width / 2, 4, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Written by', PAGE.width / 2, 5, { align: 'center' });
  doc.text(options.author || 'Author', PAGE.width / 2, 5.4, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`${options.draftColor} Draft`, PAGE.width / 2, 6.5, { align: 'center' });

  // Script pages
  let pageNum = 1;
  let y = PAGE.marginTop;

  function newPage() {
    doc.addPage();
    pageNum++;
    y = PAGE.marginTop;
    // Page number top-right from page 2
    doc.setFontSize(10);
    doc.text(`${pageNum}.`, PAGE.width - PAGE.marginRight, 0.5, { align: 'right' });
    doc.setFontSize(12);
  }

  function checkSpace(lines: number) {
    if (y + lines * lh > PAGE.height - PAGE.marginBottom) {
      newPage();
    }
  }

  function wrapText(text: string, charsPerLine: number): string[] {
    if (!text) return [''];
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if (current.length + word.length + 1 > charsPerLine) {
        lines.push(current);
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [''];
  }

  doc.addPage();
  pageNum++;
  y = PAGE.marginTop;
  doc.setFontSize(10);
  doc.text(`${pageNum}.`, PAGE.width - PAGE.marginRight, 0.5, { align: 'right' });
  doc.setFontSize(12);

  let sceneNum = 0;

  for (const node of document) {
    const el = node as ScriptElement;
    const text = Node.string(node as Descendant);

    switch (el.type) {
      case 'scene-heading': {
        sceneNum++;
        checkSpace(3);
        y += lh; // blank line before
        doc.setFont('Courier', 'bold');
        const heading = text.toUpperCase();
        if (options.showSceneNumbers) {
          const num = el.sceneNumber || String(sceneNum);
          doc.text(num, PAGE.marginLeft - 0.4, y);
        }
        doc.text(heading, PAGE.marginLeft, y);
        doc.setFont('Courier', 'normal');
        y += lh;
        y += lh; // blank line after
        break;
      }

      case 'action': {
        const lines = wrapText(text, 60);
        checkSpace(lines.length);
        for (const line of lines) {
          doc.text(line, PAGE.marginLeft, y);
          y += lh;
        }
        break;
      }

      case 'character': {
        checkSpace(2);
        y += lh; // blank line before
        doc.text(text.toUpperCase(), PAGE.marginLeft + 2.2, y); // centered-ish
        y += lh;
        break;
      }

      case 'parenthetical': {
        const lines = wrapText(text, 25);
        checkSpace(lines.length);
        for (const line of lines) {
          doc.text(line, PAGE.marginLeft + 1.8, y);
          y += lh;
        }
        break;
      }

      case 'dialogue': {
        const lines = wrapText(text, 35);
        checkSpace(lines.length);
        for (const line of lines) {
          doc.text(line, PAGE.marginLeft + 1.2, y);
          y += lh;
        }
        break;
      }

      case 'transition': {
        checkSpace(2);
        y += lh;
        doc.text(text.toUpperCase(), PAGE.width - PAGE.marginRight, y, {
          align: 'right',
        });
        y += lh;
        break;
      }

      case 'shot': {
        checkSpace(1);
        doc.text(text.toUpperCase(), PAGE.marginLeft, y);
        y += lh;
        break;
      }

      default: {
        const lines = wrapText(text, 60);
        checkSpace(lines.length);
        for (const line of lines) {
          doc.text(line, PAGE.marginLeft, y);
          y += lh;
        }
        break;
      }
    }
  }

  const filename = `${options.title} - ${options.draftColor} Draft.pdf`;
  doc.save(filename);
}
