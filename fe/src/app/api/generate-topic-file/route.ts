// Install deps (once):
// npm i docx pdf-lib

// =====================================================
// 1) API route: app/api/generate-topic-file/route.ts
//    - Returns .docx or .pdf depending on `format`
// =====================================================
import { NextRequest } from 'next/server';
import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const runtime = 'nodejs';

type Member = { fullName: string; lecturerId: string; note?: string };

type Body = {
  docDateStr: string;
  university: string; // fixed on UI
  formTitle: string;  // fixed on UI
  topicTitle: string;
  piFullName: string;
  piLecturerId: string;
  description: string;
  members: Member[];
  format?: 'docx' | 'pdf';
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;
  const {
    docDateStr,
    university,
    formTitle,
    topicTitle,
    piFullName,
    piLecturerId,
    description = '',
    members = [],
    format = 'docx',
  } = body || ({} as Body);

  if (format === 'pdf') {
    const pdfBytes = await buildPdf({
      docDateStr,
      university,
      formTitle,
      topicTitle,
      piFullName,
      piLecturerId,
      description,
      members,
    });

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="dang_ky_de_tai.pdf"',
      },
    });
  }

  // default: DOCX
  const buffer = await buildDocx({
    docDateStr,
    university,
    formTitle,
    topicTitle,
    piFullName,
    piLecturerId,
    description,
    members,
  });

  return new Response(Buffer.from(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="dang_ky_de_tai.docx"',
    },
  });
}

async function buildDocx(data: Omit<Body, 'format'>) {
  const headerLines = [
    'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
    'Độc lập - Tự do - Hạnh phúc',
    '',
    data.university.toUpperCase(),
    '',
    data.docDateStr || '',
  ];

  const headerParagraphs = headerLines.map((line) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: line,
          bold:
            line.includes('CỘNG HÒA') ||
            line.includes('Độc lập') ||
            line === data.university.toUpperCase(),
        }),
      ],
    })
  );

  const formTitlePara = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: data.formTitle.toUpperCase(), bold: true })],
  });

  const infoParas = [
    new Paragraph({ children: [new TextRun({ text: 'Tên đề tài: ', bold: true }), new TextRun({ text: data.topicTitle || '' })] }),
    new Paragraph({ children: [new TextRun({ text: 'Họ và Tên chủ nhiệm đề tài: ', bold: true }), new TextRun({ text: data.piFullName || '' })] }),
    new Paragraph({ children: [new TextRun({ text: 'Mã số giảng viên (chủ nhiệm): ', bold: true }), new TextRun({ text: data.piLecturerId || '' })] }),
  ];

  const tableHeader = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'STT', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Họ và tên', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mã số giảng viên', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Ghi chú', bold: true })] })] }),
    ],
  });

  const memberRows = (data.members && data.members.length
    ? data.members
    : [{ fullName: '', lecturerId: '', note: '' }]
  ).map((m, idx) =>
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(String(idx + 1))] }),
        new TableCell({ children: [new Paragraph(m.fullName || '')] }),
        new TableCell({ children: [new Paragraph(m.lecturerId || '')] }),
        new TableCell({ children: [new Paragraph(m.note || '')] }),
      ],
    })
  );

  const membersTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [tableHeader, ...memberRows],
  });

  const descTitle = new Paragraph({ children: [new TextRun({ text: 'Mô tả đề tài', bold: true })] });
  const descParas = (data.description || '').split(/\r?\n/).map((line) => new Paragraph({ children: [new TextRun({ text: line })] }));

  const doc = new Document({
    sections: [
      { properties: {}, children: [...headerParagraphs, formTitlePara, ...infoParas, membersTable, descTitle, ...descParas] },
    ],
  });

  return await Packer.toBuffer(doc);
}

async function buildPdf(data: Omit<Body, 'format'>) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait in points
  const { width } = page.getSize();
  const margin = 48;

  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  let y = 800;
  const lineHeight = 16;

  const center = (text: string, bold = false, dy = lineHeight) => {
    const f = bold ? fontBold : font;
    const size = 12;
    const textWidth = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y, size, font: f });
    y -= dy;
  };

  center('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', true);
  center('Độc lập - Tự do - Hạnh phúc');
  y -= 6;
  page.drawLine({ start: { x: width / 2 - 90, y }, end: { x: width / 2 + 90, y }, thickness: 0.5, color: rgb(0, 0, 0) });
  y -= 18;
  center(data.university.toUpperCase(), true);
  center(data.docDateStr);
  y -= 8;
  center(data.formTitle.toUpperCase(), true, 22);
  y -= 10;

  // Left-aligned content
  const drawLabelValue = (label: string, value: string) => {
    const size = 12;
    page.drawText(label, { x: margin, y, size, font: fontBold });
    const tx = margin + fontBold.widthOfTextAtSize(label, size) + 2;
    page.drawText(value || '', { x: tx, y, size, font });
    y -= lineHeight;
  };

  drawLabelValue('Tên đề tài: ', data.topicTitle);
  drawLabelValue('Họ và Tên chủ nhiệm đề tài: ', data.piFullName);
  drawLabelValue('Mã số giảng viên (chủ nhiệm): ', data.piLecturerId);
  y -= 8;

  // Members table header
  const tableX = margin;
  const colWidths = [40, 220, 150, 120];
  const tableYStart = y;
  const rowHeight = 20;

  const drawCell = (tx: number, ty: number, w: number, h: number, text: string, bold = false, centerText = false) => {
    page.drawRectangle({ x: tx, y: ty - h, width: w, height: h, borderWidth: 0.5, borderColor: rgb(0, 0, 0) });
    const f = bold ? fontBold : font;
    const size = 11;
    const padding = 4;
    let textX = tx + padding;
    if (centerText) {
      const tw = f.widthOfTextAtSize(text, size);
      textX = tx + (w - tw) / 2;
    }
    page.drawText(text, { x: textX, y: ty - h + (h - size) / 2, size, font: f });
  };

  // Header row
  let tx = tableX;
  let ty = tableYStart;
  const headers = ['STT', 'Họ và tên', 'Mã số giảng viên', 'Ghi chú'];
  colWidths.forEach((w, i) => {
    drawCell(tx, ty, w, rowHeight, headers[i], true, i === 0);
    tx += w;
  });
  ty -= rowHeight;

  const list = data.members && data.members.length ? data.members : [{ fullName: '', lecturerId: '', note: '' }];
  list.forEach((m, idx) => {
    tx = tableX;
    drawCell(tx, ty, colWidths[0], rowHeight, String(idx + 1), false, true); tx += colWidths[0];
    drawCell(tx, ty, colWidths[1], rowHeight, m.fullName || ''); tx += colWidths[1];
    drawCell(tx, ty, colWidths[2], rowHeight, m.lecturerId || ''); tx += colWidths[2];
    drawCell(tx, ty, colWidths[3], rowHeight, m.note || '');
    ty -= rowHeight;
  });

  y = ty - 14;
  page.drawText('Mô tả đề tài', { x: margin, y, size: 12, font: fontBold });
  y -= lineHeight;

  // Simple word-wrap for description
  const maxWidth = width - margin * 2;
  const words = (data.description || '').split(/\s+/);
  let line = '';
  words.forEach((w) => {
    const test = line ? line + ' ' + w : w;
    if (font.widthOfTextAtSize(test, 12) > maxWidth) {
      page.drawText(line, { x: margin, y, size: 12, font });
      y -= lineHeight;
      line = w;
    } else {
      line = test;
    }
  });
  if (line) {
    page.drawText(line, { x: margin, y, size: 12, font });
    y -= lineHeight;
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
