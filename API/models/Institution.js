const mongoose = require('mongoose');

const InstitutionSchema = new mongoose.Schema({
    institutionName: { type: String, required: true },
    institutionType: { type: String, enum: ['primary school', 'secondary school', 'college', 'university'], required: true },
    onboardingGrade: {type: String},
    province: { type: String, enum: [
        'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
        'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
    ], required: true},
    address: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String},
})

module.exports = mongoose.model('Institution', InstitutionSchema);