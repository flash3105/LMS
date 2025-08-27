const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generateCertificatePDF(certificateData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4'
      });
      
      // Create directory if it doesn't exist
      const certDir = path.join(__dirname, '../public/certificates');
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }
      
      const filename = `certificate-${certificateData.certificateId}.pdf`;
      const filepath = path.join(certDir, filename);
      const writeStream = fs.createWriteStream(filepath);
      
      doc.pipe(writeStream);
      
      // Add background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');
      
      // Add border
      doc.strokeColor('#1a5276')
         .lineWidth(20)
         .rect(10, 10, doc.page.width - 20, doc.page.height - 20)
         .stroke();

      // === Add Logo ===
      const logoPath = path.join(__dirname, '../images/networkco.logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width / 2 - 50, 30, { width: 100 }); 
        // centers logo at the top, 100px wide
      }
      
      // Add title
      doc.fontSize(36)
         .font('Helvetica-Bold')
         .fillColor('#1a5276')
         .text('CERTIFICATE OF COMPLETION', 0, 120, { 
           align: 'center',
           width: doc.page.width
         });
      
      // Add body text
      doc.fontSize(18)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text('This is to certify that', 0, 200, {
           align: 'center',
           width: doc.page.width
         });
      
      //  student name
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#1a5276')
         .text(certificateData.studentName, 0, 240, {
           align: 'center',
           width: doc.page.width
         });
      
      // course completion text
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text('has successfully completed all requirements of the course', 0, 290, {
           align: 'center',
           width: doc.page.width
         });
      
      // Add course name
      doc.fontSize(22)
         .font('Helvetica-Bold')
         .fillColor('#1a5276')
         .text(certificateData.courseName, 0, 330, {
           align: 'center',
           width: doc.page.width
         });
      
      // Add details
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text(`Grade: ${certificateData.grade}`, 0, 380, {
           align: 'center',
           width: doc.page.width
         })
         .text(`Date of Completion: ${new Date(certificateData.completionDate).toLocaleDateString()}`, 0, 410, {
           align: 'center',
           width: doc.page.width
         });
      
      // Add signature line
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text('_________________________', doc.page.width/2 - 150, 470)
         .text('Authorized Signature', doc.page.width/2 - 150, 490);
      
      doc.end();
      
      writeStream.on('finish', () => {
        resolve(`/certificates/${filename}`);
      });
      
      writeStream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateCertificatePDF
};
