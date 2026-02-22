const mongoose = require('mongoose');
const Medicine = require('./schema/Medicine');
const Prescription = require('./schema/Prescription');
const SafetyAgent = require('./Agents/SafetyAgent');
const dotenv = require('dotenv');

dotenv.config();

// Test to check what's happening with Metformin
async function testSafetyAgent() {
  console.log('🧪 Testing SafetyAgent for Metformin...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to database');
    
    // Check if Metformin exists and its prescriptionRequired status
    const medicine = await Medicine.findOne({ name: /Metformin/i });
    console.log('📋 Medicine Info:', medicine ? {
      name: medicine.name,
      stock: medicine.stock,
      prescriptionRequired: medicine.prescriptionRequired
    } : 'Metformin not found');
    
    // Check if user has a prescription for Metformin
    const testUserId = "YOUR_TEST_USER_ID_HERE"; // Replace with actual user ID
    const prescription = await Prescription.findOne({
      userId: testUserId,
      validTill: { $gt: new Date() }
    }).populate('medicineId');
    
    console.log('📋 Active Prescription found:', prescription ? {
      medicineName: prescription.medicineId?.name || prescription.medicineId,
      validTill: prescription.validTill
    } : 'No valid prescription found');
    
    // Test SafetyAgent directly
    const testItems = [{ medicine_name: "Metformin", quantity: 1 }];
    const result = await SafetyAgent.validateOrder(testUserId, testItems);
    
    console.log('\n🛡️ SafetyAgent Result:');
    console.log('Approved:', result.isApproved);
    console.log('Reasons:', result.reasons);
    console.log('Details:', result.details);
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSafetyAgent();