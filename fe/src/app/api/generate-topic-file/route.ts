// Install deps (once):
// npm i docx pdf-lib

// =====================================================
// 1) API route: app/api/generate-topic-file/route.ts
//    - Returns .docx or .pdf depending on `format`
//    - Match với form create topic (email thay vì lecturerId)
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

type Member = { fullName: string; email: string; note?: string };

type Body = {
  docDateStr: string;
  university: string; // fixed on UI
  formTitle: string;  // fixed on UI
  topicTitle: string;
  piFullName: string;
  piEmail: string;
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
    piEmail,
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
      piEmail,
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
    piEmail,
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
  // Header: left and right aligned in center for each side
  const leftHeaderPara = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: 'BỘ GIÁO DỤC VÀ ĐÀO TẠO', bold: true }),
      new TextRun({ text: '\n', break: 1 }),
      new TextRun({ text: 'TRƯỜNG ĐẠI HỌC FPT', bold: true }),
    ],
  });

  const rightHeaderPara = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true }),
      new TextRun({ text: '\n', break: 1 }),
      new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: false }),
    ],
  });

  // Use table for left-right layout
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: 'none', size: 0, color: 'FFFFFF' },
      bottom: { style: 'none', size: 0, color: 'FFFFFF' },
      left: { style: 'none', size: 0, color: 'FFFFFF' },
      right: { style: 'none', size: 0, color: 'FFFFFF' },
      insideHorizontal: { style: 'none', size: 0, color: 'FFFFFF' },
      insideVertical: { style: 'none', size: 0, color: 'FFFFFF' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [leftHeaderPara],
            borders: {
              top: { style: 'none', size: 0 },
              bottom: { style: 'none', size: 0 },
              left: { style: 'none', size: 0 },
              right: { style: 'none', size: 0 },
            },
          }),
          new TableCell({
            children: [rightHeaderPara],
            borders: {
              top: { style: 'none', size: 0 },
              bottom: { style: 'none', size: 0 },
              left: { style: 'none', size: 0 },
              right: { style: 'none', size: 0 },
            },
          }),
        ],
      }),
    ],
  });

  const spacer = new Paragraph({ text: '' });

  const formTitlePara = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: data.formTitle.toUpperCase(), bold: true, size: 28 })],
  });

  // Kính gửi section
  const kinhGuiPara = new Paragraph({
    children: [
      new TextRun({ text: 'Kính gửi: ', bold: true }),
      new TextRun({ text: 'Ban chủ nhiệm Trường Đại học FPT' }),
    ],
  });

  const kinhGuiDetail1 = new Paragraph({
    children: [
      new TextRun({ text: '            - Ban lãnh đạo Công nghệ Thông tin' }),
    ],
  });

  const kinhGuiDetail2 = new Paragraph({
    children: [new TextRun({ text: '            - Khoa ........................................' })],
  });

  // Topic info
  const tenGVPara = new Paragraph({
    children: [
      new TextRun({ text: 'Tên giảng viên hướng dẫn: ', bold: true }),
      new TextRun({ text: data.piFullName || '' }),
    ],
  });

  const emailGVPara = new Paragraph({
    children: [
      new TextRun({ text: 'Email giảng viên hướng dẫn: ', bold: true }),
      new TextRun({ text: data.piEmail || '' }),
    ],
  });

  const tenDeTaiPara = new Paragraph({
    children: [
      new TextRun({ text: 'Tên đề tài: ', bold: true }),
      new TextRun({ text: data.topicTitle || '' }),
    ],
  });

  const moTaTitle = new Paragraph({
    children: [
      new TextRun({ text: 'Mô tả đề tài:', bold: true }),
    ],
  });

  // Description paragraphs
  const descParas = (data.description || '').split(/\r?\n/).map((line) => 
    new Paragraph({ 
      children: [new TextRun({ text: line || '' })] 
    })
  );

  // Co-supervisor table
  const coSupervisorTitle = new Paragraph({
    children: [
      new TextRun({ text: 'Giảng viên hướng dẫn hợp tác:', bold: true }),
    ],
  });

  const tableHeader = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'STT', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Họ và tên', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Email', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Ghi chú', bold: true })] })] }),
    ],
  });

  const memberRows = (data.members && data.members.length
    ? data.members
    : [{ fullName: '', email: '', note: '' }]
  ).map((m, idx) =>
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(String(idx + 1))] }),
        new TableCell({ children: [new Paragraph(m.fullName || '')] }),
        new TableCell({ children: [new Paragraph(m.email || '')] }),
        new TableCell({ children: [new Paragraph(m.note || '')] }),
      ],
    })
  );

  const membersTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [tableHeader, ...memberRows],
  });

  // Footer section
  const camOnPara = new Paragraph({
    children: [
      new TextRun({ text: 'Rất mong được chấp thuận của Viện và cũng như Giảng viên.' }),
    ],
  });

  const camOnPara2 = new Paragraph({
    children: [
      new TextRun({ text: 'Tôi xin chân thành cảm ơn!' }),
    ],
  });

  const footerSpacer = new Paragraph({ text: '' });

  // Signature table with 2 columns
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: 'none', size: 0, color: 'FFFFFF' },
      bottom: { style: 'none', size: 0, color: 'FFFFFF' },
      left: { style: 'none', size: 0, color: 'FFFFFF' },
      right: { style: 'none', size: 0, color: 'FFFFFF' },
      insideHorizontal: { style: 'none', size: 0, color: 'FFFFFF' },
      insideVertical: { style: 'none', size: 0, color: 'FFFFFF' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'XÁC NHẬN CỦA KHOA', bold: true })],
              }),
            ],
            borders: {
              top: { style: 'none', size: 0 },
              bottom: { style: 'none', size: 0 },
              left: { style: 'none', size: 0 },
              right: { style: 'none', size: 0 },
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: data.docDateStr || 'ngày....tháng.....năm....', italics: true })],
              }),
            ],
            borders: {
              top: { style: 'none', size: 0 },
              bottom: { style: 'none', size: 0 },
              left: { style: 'none', size: 0 },
              right: { style: 'none', size: 0 },
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
            ],
            borders: {
              top: { style: 'none', size: 0 },
              bottom: { style: 'none', size: 0 },
              left: { style: 'none', size: 0 },
              right: { style: 'none', size: 0 },
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'GIẢNG VIÊN HƯỚNG DẪN', bold: true })],
              }),
            ],
            borders: {
              top: { style: 'none', size: 0 },
              bottom: { style: 'none', size: 0 },
              left: { style: 'none', size: 0 },
              right: { style: 'none', size: 0 },
            },
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      { 
        properties: {}, 
        children: [
          headerTable,
          spacer,
          formTitlePara,
          spacer,
          kinhGuiPara,
          kinhGuiDetail1,
          kinhGuiDetail2,
          spacer,
          tenGVPara,
          emailGVPara,
          tenDeTaiPara,
          spacer,
          moTaTitle,
          ...descParas,
          spacer,
          coSupervisorTitle,
          membersTable,
          spacer,
          camOnPara,
          camOnPara2,
          footerSpacer,
          signatureTable,
        ] 
      },
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
    // FIX: Ensure text is a valid string
    const safeText = String(text || '');
    const textWidth = f.widthOfTextAtSize(safeText, size);
    page.drawText(safeText, { x: (width - textWidth) / 2, y, size, font: f, color: rgb(0, 0, 0) });
    y -= dy;
  };

  // Left side header
  const leftX = margin;
  let leftY = y;
  const size = 12;
  
  page.drawText('BỘ GIÁO DỤC VÀ ĐÀO TẠO', { x: leftX, y: leftY, size, font: fontBold, color: rgb(0, 0, 0) });
  leftY -= lineHeight;
  page.drawText('TRƯỜNG ĐẠI HỌC FPT', { x: leftX, y: leftY, size, font: fontBold, color: rgb(0, 0, 0) });
  
  // Right side header (aligned to the right)
  let rightY = y;
  const rightText1 = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
  const rightText2 = 'Độc lập - Tự do - Hạnh phúc';
  
  page.drawText(rightText1, { 
    x: width - margin - fontBold.widthOfTextAtSize(rightText1, size), 
    y: rightY, 
    size, 
    font: fontBold, 
    color: rgb(0, 0, 0) 
  });
  rightY -= lineHeight;
  page.drawText(rightText2, { 
    x: width - margin - font.widthOfTextAtSize(rightText2, size), 
    y: rightY, 
    size, 
    font, 
    color: rgb(0, 0, 0) 
  });
  
  // Underline for "Độc lập - Tự do - Hạnh phúc"
  const underlineY = rightY - 3;
  const underlineStart = width - margin - font.widthOfTextAtSize(rightText2, size);
  const underlineEnd = width - margin;
  page.drawLine({ 
    start: { x: underlineStart, y: underlineY }, 
    end: { x: underlineEnd, y: underlineY }, 
    thickness: 0.5, 
    color: rgb(0, 0, 0) 
  });
  
  // Move y down to continue with title
  y = Math.min(leftY, rightY) - 20;
  
  center(data.formTitle.toUpperCase(), true, 22);
  y -= 10;

  // Left-aligned content
  const drawLabelValue = (label: string, value: string) => {
    const size = 12;
    const safeLabel = String(label || '');
    const safeValue = String(value || '');
    page.drawText(safeLabel, { x: margin, y, size, font: fontBold, color: rgb(0, 0, 0) });
    const tx = margin + fontBold.widthOfTextAtSize(safeLabel, size) + 2;
    page.drawText(safeValue, { x: tx, y, size, font, color: rgb(0, 0, 0) });
    y -= lineHeight;
  };

  // Kính gửi section
  page.drawText('Kính gửi: ', { x: margin, y, size: 12, font: fontBold, color: rgb(0, 0, 0) });
  page.drawText('Ban chủ nhiệm Trường Đại học FPT', { x: margin + fontBold.widthOfTextAtSize('Kính gửi: ', 12), y, size: 12, font, color: rgb(0, 0, 0) });
  y -= lineHeight;
  page.drawText('            - Ban lãnh đạo Công nghệ Thông tin', { x: margin, y, size: 12, font, color: rgb(0, 0, 0) });
  y -= lineHeight;
  page.drawText('            - Khoa ........................................', { x: margin, y, size: 12, font, color: rgb(0, 0, 0) });
  y -= lineHeight + 8;

  drawLabelValue('Tên chủ nhiệm: ', data.piFullName || '');
  drawLabelValue('Email chủ nhiệm: ', data.piEmail || '');
  drawLabelValue('Tên đề tài: ', data.topicTitle || '');
  y -= 8;

  page.drawText('Mô tả đề tài:', { x: margin, y, size: 12, font: fontBold, color: rgb(0, 0, 0) });
  y -= lineHeight;

  // Simple word-wrap for description
  const maxWidth = width - margin * 2;
  const safeDescription = String(data.description || '');
  const words = safeDescription.split(/\s+/).filter(w => w.length > 0);
  let line = '';
  words.forEach((w) => {
    const test = line ? line + ' ' + w : w;
    if (font.widthOfTextAtSize(test, 12) > maxWidth) {
      if (line) {
        page.drawText(line, { x: margin, y, size: 12, font, color: rgb(0, 0, 0) });
        y -= lineHeight;
      }
      line = w;
    } else {
      line = test;
    }
  });
  if (line) {
    page.drawText(line, { x: margin, y, size: 12, font, color: rgb(0, 0, 0) });
    y -= lineHeight;
  }

  y -= 10;

  // Co-supervisor table
  page.drawText('Giảng viên hướng dẫn hợp tác:', { x: margin, y, size: 12, font: fontBold, color: rgb(0, 0, 0) });
  y -= lineHeight + 4;

  const tableX = margin;
  const colWidths = [40, 220, 150, 120];
  const tableYStart = y;
  const rowHeight = 20;

  const drawCell = (tx: number, ty: number, w: number, h: number, text: string, bold = false, centerText = false) => {
    const safeText = String(text || '');
    page.drawRectangle({ x: tx, y: ty - h, width: w, height: h, borderWidth: 0.5, borderColor: rgb(0, 0, 0) });
    const f = bold ? fontBold : font;
    const size = 11;
    const padding = 4;
    let textX = tx + padding;
    if (centerText) {
      const tw = f.widthOfTextAtSize(safeText, size);
      textX = tx + (w - tw) / 2;
    }
    page.drawText(safeText, { x: textX, y: ty - h + (h - size) / 2, size, font: f, color: rgb(0, 0, 0) });
  };

  // Header row
  let tx = tableX;
  let ty = tableYStart;
  const headers = ['STT', 'Họ và tên', 'Email', 'Ghi chú'];
  colWidths.forEach((w, i) => {
    drawCell(tx, ty, w, rowHeight, headers[i], true, i === 0);
    tx += w;
  });
  ty -= rowHeight;

  const list = data.members && data.members.length ? data.members : [{ fullName: '', email: '', note: '' }];
  list.forEach((m, idx) => {
    tx = tableX;
    drawCell(tx, ty, colWidths[0], rowHeight, String(idx + 1), false, true); 
    tx += colWidths[0];
    drawCell(tx, ty, colWidths[1], rowHeight, m.fullName || ''); 
    tx += colWidths[1];
    drawCell(tx, ty, colWidths[2], rowHeight, m.email || ''); 
    tx += colWidths[2];
    drawCell(tx, ty, colWidths[3], rowHeight, m.note || '');
    ty -= rowHeight;
  });

  y = ty - 14;

  // Footer section
  y -= 10;
  page.drawText('Rất mong được chấp thuận của Chủ nhiệm và cũng như Giảng viên.', { x: margin, y, size: 12, font, color: rgb(0, 0, 0) });
  y -= lineHeight;
  page.drawText('Tôi xin chân thành cảm ơn!', { x: margin, y, size: 12, font, color: rgb(0, 0, 0) });
  y -= lineHeight + 10;

  // Two-column signature section
  const leftSignatureX = margin + 80;
  const rightSignatureX = width - margin - 100;
  
  // Left side - Chủ nhiệm signature
  let leftSigY = y;
  const khoaText = 'XÁC NHẬN CỦA CHỦ NHIỆM';
  const khoaWidth = fontBold.widthOfTextAtSize(khoaText, 12);
  page.drawText(khoaText, { x: leftSignatureX - khoaWidth / 2, y: leftSigY, size: 12, font: fontBold, color: rgb(0, 0, 0) });
  
  // Right side - Date and instructor signature
  let rightSigY = y;
  const dateText = data.docDateStr || 'ngày....tháng.....năm....';
  const dateWidth = font.widthOfTextAtSize(dateText, 11);
  page.drawText(dateText, { x: rightSignatureX - dateWidth / 2, y: rightSigY, size: 11, font, color: rgb(0, 0, 0) });
  rightSigY -= lineHeight + 10;
  
  const gvText = 'CHỦ NHIỆM ĐỀ TÀI';
  const gvWidth = fontBold.widthOfTextAtSize(gvText, 12);
  page.drawText(gvText, { x: rightSignatureX - gvWidth / 2, y: rightSigY, size: 12, font: fontBold, color: rgb(0, 0, 0) });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
