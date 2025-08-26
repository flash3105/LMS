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
      
      // Add title
      doc.fontSize(36)
         .font('Helvetica-Bold')
         .fillColor('#1a5276')
         .text('CERTIFICATE OF COMPLETION', doc.page.width/2, 120, { 
           align: 'center'
         });
      
      // Add body text
      doc.fontSize(18)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text('This is to certify that', doc.page.width/2, 200, {
           align: 'center'
         });
      
      // Add student name
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#1a5276')
         .text(certificateData.studentName, doc.page.width/2, 240, {
           align: 'center'
         });
      
      // Add course completion text
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text('has successfully completed all requirements of the course', doc.page.width/2, 290, {
           align: 'center'
         });
      
      // Add course name
      doc.fontSize(22)
         .font('Helvetica-Bold')
         .fillColor('#1a5276')
         .text(certificateData.courseName, doc.page.width/2, 330, {
           align: 'center'
         });
      
      // Add details
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text(`Grade: ${certificateData.grade}`, doc.page.width/2, 380, {
           align: 'center'
         })
         .text(`Date of Completion: ${new Date(certificateData.completionDate).toLocaleDateString()}`, doc.page.width/2, 410, {
           align: 'center'
         });
      
      // Add signature line
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text('_________________________', doc.page.width/2 - 150, 470)
         .text('Authorized Signature', doc.page.width/2 - 150, 490)
         .text('The NetworkCo', doc.page.width/2 - 150, 510);
      
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