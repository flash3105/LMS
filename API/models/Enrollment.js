const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Changed from 'MyCourses' to 'User'
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { 
    type: String, 
    enum: ['enrolled', 'in progress', 'completed'], 
    default: 'enrolled' 
  },
  progress: { type: Number, default: 0 },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  certificateId: { type: String },
});

// Add pre-save middleware to check for completion
EnrollmentSchema.pre('save', async function (next) {
  try {
    // Only act if progress was updated and enrollment is not already completed
    if (this.isModified('progress') && this.progress >= 100 && this.status !== 'completed') {
      this.status = 'completed';
      this.completedAt = new Date();

      // Only generate a certificate if one doesn’t exist yet
      if (!this.certificateId) {
        // Ensure user and course are populated
        if (!this.populated('user')) {
          await this.populate('user');
        }
        if (!this.populated('course')) {
          await this.populate('course');
        }

        await this.generateCertificate();
      }
    }
    // If progress > 0 but < 100
    else if (this.isModified('progress') && this.progress > 0 && this.progress < 100) {
      this.status = 'in progress';
    }
    // If progress = 0
    else if (this.isModified('progress') && this.progress === 0) {
      this.status = 'enrolled';
    }

    next();
  } catch (error) {
    console.error('Error in Enrollment pre-save middleware:', error);
    next(error);
  }
});


// Method to generate certificate
EnrollmentSchema.methods.generateCertificate = async function() {
  try {
    // Use mongoose to get models to avoid circular dependencies
    const Profile = mongoose.model('Profile');
    const { generateCertificatePDF } = require('../Utils/certificateGenerator');
    
    // Ensure user and course are populated
    if (typeof this.user === 'string' || !this.user.email) {
      await this.populate('user');
    }
    if (typeof this.course === 'string' || !this.course.courseName) {
      await this.populate('course');
    }
    
    if (!this.user || !this.course) {
      throw new Error('User or course details not found');
    }
    
    // Generate certificate ID
    this.certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate PDF certificate
    const certificateUrl = await generateCertificatePDF({
      certificateId: this.certificateId,
      studentName: this.user.name,
      courseName: this.course.courseName,
      grade: "Grade 10",
      completionDate: this.completedAt || new Date(),
      status: 'completed'
    });
    
    // Add certificate to user's profile
    let profile = await Profile.findOne({ email: this.user.email });
    if (!profile) {
      profile = new Profile({
        email: this.user.email,
        certificates: []
      });
    }
    
    // Check if certificate already exists to avoid duplicates
    const existingCertificate = profile.certificates.find(
      cert => cert.certificateId === this.certificateId
    );
    
    if (!existingCertificate) {
      profile.certificates.push({
        certificateId: this.certificateId,
        title: `${this.course.courseName} Certificate`,
        courseId: this.course._id,
        courseName: this.course.courseName,
        grade: "Grade 10",
        issueDate: new Date(),
        completionDate: this.completedAt || new Date(),
        certificateUrl,
        status: 'completed'
      });
      
      await profile.save();
      console.log(`Certificate added to profile for: ${this.user.email}`);
    }
    
    return certificateUrl;
  } catch (error) {
    console.error('Error generating certificate:', error);
    
    return null;
  }
};

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
