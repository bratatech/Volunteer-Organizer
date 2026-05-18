const express = require('express');
const PDFDocument = require('pdfkit');
const { readData } = require('../utils/fileHandler');

const router = express.Router();

// Download verified high-fidelity certificate PDF
router.get('/:certId/download', async (req, res) => {
  try {
    const { certId } = req.params;
    const volunteers = await readData('volunteers.json');

    let foundCertificate = null;
    let foundVolunteer = null;

    for (const vol of volunteers) {
      if (vol.certifications && vol.certifications.length > 0) {
        const cert = vol.certifications.find(c => c.id === certId);
        if (cert) {
          foundCertificate = cert;
          foundVolunteer = vol;
          break;
        }
      }
    }

    if (!foundCertificate) {
      return res.status(404).json({ message: 'Certificate not found or expired.' });
    }

    // Extract dynamic name from email for formal presentation
    const volunteerName = foundVolunteer.email
      .split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const role = foundCertificate.role || 'Volunteer';
    const activityName = foundCertificate.activityName || 'FestOps Event';
    const dateIssued = foundCertificate.dateIssued || new Date().toISOString().split('T')[0];
    const issuingOrganizer = foundCertificate.issuingOrganizer || 'FestOps Director';

    // Create a landscape orientation PDF (A4 size: 841.89 x 595.28 points)
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0
    });

    // Pipe PDF generation stream directly to HTTP Response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate-${certId}.pdf`);
    doc.pipe(res);

    // 1. Draw elegant background styling (soft cream finish)
    doc.rect(0, 0, 841.89, 595.28).fill('#FCFBF7');

    // 2. Draw dual gold/deep navy borders
    // Outer border (navy blue)
    doc.rect(30, 30, 781.89, 535.28)
      .lineWidth(4)
      .stroke('#0F172A'); // Slate 900

    // Inner accent border (gold/amber)
    doc.rect(40, 40, 761.89, 515.28)
      .lineWidth(1.5)
      .stroke('#D97706'); // Amber 600

    // Decorative corner brackets
    const drawCornerBracket = (x, y, dx, dy) => {
      doc.moveTo(x, y + dy)
        .lineTo(x, y)
        .lineTo(x + dx, y)
        .lineWidth(3)
        .stroke('#D97706');
    };
    drawCornerBracket(45, 45, 20, 20); // Top-Left
    drawCornerBracket(796.89, 45, -20, 20); // Top-Right
    drawCornerBracket(45, 550.28, 20, -20); // Bottom-Left
    drawCornerBracket(796.89, 550.28, -20, -20); // Bottom-Right

    // 3. Header Accent Star Line
    doc.fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#D97706')
      .text('★ ★ ★   F E S T O P S   ★ ★ ★', 0, 75, { align: 'center' });

    // 4. Certificate Header Title
    doc.fontSize(38)
      .font('Helvetica-Bold')
      .fillColor('#0F172A')
      .text('Certificate of Commendation', 0, 125, { align: 'center' });

    // 5. Presentation Text
    doc.fontSize(15)
      .font('Helvetica-Oblique')
      .fillColor('#475569')
      .text('This is proudly presented to', 0, 195, { align: 'center' });

    // 6. Volunteer Name
    doc.fontSize(32)
      .font('Helvetica-Bold')
      .fillColor('#1E3A8A') // Indigo 900
      .text(volunteerName, 0, 235, { align: 'center' });

    // Underline for name
    doc.moveTo(220, 275)
      .lineTo(621.89, 275)
      .lineWidth(1)
      .stroke('#CBD5E1');

    // 7. Citation Narrative Block
    doc.fontSize(14)
      .font('Helvetica')
      .fillColor('#334155')
      .text('for outstanding service as a ', { align: 'center', continued: true })
      .font('Helvetica-Bold')
      .text(`${role} `, { continued: true })
      .font('Helvetica')
      .text('during the')
      .moveDown(0.3);

    doc.fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#0F172A')
      .text(`"${activityName}"`, { align: 'center' })
      .moveDown(0.3);

    doc.fontSize(14)
      .font('Helvetica')
      .fillColor('#334155')
      .text('festival event in the academic year 2026.', { align: 'center' });

    // 8. Signatures & Metadata Columns at the bottom
    const bottomY = 430;

    // Column 1: Date Issued
    doc.moveTo(100, bottomY)
      .lineTo(260, bottomY)
      .lineWidth(1)
      .stroke('#94A3B8');
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#475569')
      .text('DATE ISSUED', 100, bottomY + 8, { width: 160, align: 'center' });
    doc.fontSize(11)
      .font('Helvetica')
      .fillColor('#0F172A')
      .text(dateIssued, 100, bottomY + 22, { width: 160, align: 'center' });

    // Column 2: Issuing Organizer
    doc.moveTo(340, bottomY)
      .lineTo(500, bottomY)
      .lineWidth(1)
      .stroke('#94A3B8');
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#475569')
      .text('ISSUING AUTHORITY', 340, bottomY + 8, { width: 160, align: 'center' });
    doc.fontSize(11)
      .font('Helvetica')
      .fillColor('#0F172A')
      .text(issuingOrganizer, 340, bottomY + 22, { width: 160, align: 'center' });

    // Column 3: Verification ID
    doc.moveTo(580, bottomY)
      .lineTo(740, bottomY)
      .lineWidth(1)
      .stroke('#94A3B8');
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#475569')
      .text('VERIFICATION KEY', 580, bottomY + 8, { width: 160, align: 'center' });
    doc.fontSize(9)
      .font('Courier-Bold')
      .fillColor('#D97706')
      .text(certId, 580, bottomY + 24, { width: 160, align: 'center' });

    // 9. Verified Ribbon Seal circle stamp
    doc.circle(420.94, 345, 18)
      .fill('#F59E0B')
      .stroke('#D97706');
    doc.fontSize(6)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text('VERIFIED', 400.94, 342, { width: 40, align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error generating PDF certificate:', error.stack || error);
    res.status(500).json({ message: 'Server error generating certificate PDF', error: error.message });
  }
});

module.exports = router;
