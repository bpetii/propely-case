import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { Task, TaskFilters } from './types';

export function exportPDF(tasks: Task[], filters: TaskFilters, propertyName?: string): void {
  const doc = createTaskPdf(tasks, filters, propertyName);
  const pdfBytes = doc.output('arraybuffer');
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);

  try {
    link.href = url;
    link.download = `vedlikeholdsoppgaver_${timestamp}.pdf`;
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    // Give the browser time to start the download before releasing the URL.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/** Export the supplied result snapshot, preserving the table's order. */
export function createTaskPdf(tasks: Task[], filters: TaskFilters, propertyName?: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setProperties({ title: 'Vedlikeholdsoppgaver' });
  doc.setFontSize(16);
  doc.text('Vedlikeholdsoppgaver', 10, 14);
  doc.setFontSize(9);
  doc.text(`${tasks.length} oppgaver | Alle treff for valgte filtre og søk`, 10, 21);

  const summary = [
    `Status: ${filters.status || 'Alle'}`,
    `Kategori: ${filters.category || 'Alle'}`,
    `Eiendom: ${propertyName || filters.property_id || 'Alle'}`,
    `Søk: ${filters.search.trim() || '-'}`,
  ].join(' | ');
  const lines: string[] = doc.splitTextToSize(summary, 277);
  // Keep an unusually long search from pushing the table off the first page.
  const visibleLines = lines.slice(0, 3);
  if (lines.length > 3) visibleLines[2] = `${visibleLines[2].slice(0, -3)}...`;
  doc.text(visibleLines, 10, 27);
  const startY = 30 + visibleLines.length * 4;

  if (tasks.length === 0) {
    doc.text('Ingen oppgaver matcher filtrene og søket.', 10, startY + 5);
  } else {
    autoTable(doc, {
      startY,
      margin: { top: 12, right: 10, bottom: 15, left: 10 },
      head: [['ID', 'Tittel', 'Beskrivelse', 'Kategori', 'Status', 'Eiendom', 'Opprettet', 'Frist', 'Kostnad (NOK)']],
      body: tasks.map((task) => [
        task.id, task.title, task.description, task.category, task.status,
        task.property_name, task.created_at, task.due_date ?? '-',
        task.cost_nok == null ? '-' : new Intl.NumberFormat('nb-NO').format(task.cost_nok),
      ]),
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2, overflow: 'linebreak', valign: 'top' },
      headStyles: { fillColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 18 }, 1: { cellWidth: 40 }, 2: { cellWidth: 65 },
        3: { cellWidth: 20 }, 4: { cellWidth: 22 }, 5: { cellWidth: 48 },
        6: { cellWidth: 21 }, 7: { cellWidth: 21 }, 8: { cellWidth: 22, halign: 'right' },
      },
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
    });
  }

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text(`Side ${page} av ${pages}`, 287, 203, { align: 'right' });
  }
  return doc;
}
