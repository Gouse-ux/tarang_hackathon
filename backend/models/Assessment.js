import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stressLevel: { type: Number, required: true }, // 0.0 to 1.0 (e.g. 0.0=Low, 0.5=Medium, 1.0=High)
  sleepQuality: { type: Number, required: true }, // 0.0 to 1.0 (e.g. 0.0=Good, 1.0=Poor)
  academicWorkload: { type: Number, required: true }, // 0.0 to 1.0 (e.g. 0.0=Low, 1.0=High)
  socialActivity: { type: Number, required: true }, // 0.0 to 1.0 (e.g. 0.0=Active, 1.0=Isolated)
  mood: { type: Number, required: true }, // 0.0 to 1.0 (e.g. 0.0=Happy, 1.0=Stressed)
  attendancePercentage: { type: Number, required: true }, // 0 to 100
  academicPerformance: { type: Number, required: true }, // 0 to 100
  riskScore: { type: Number, required: true }, // Computed 0.0 to 1.0
  riskLevel: { type: String, enum: ['Low Risk', 'Medium Risk', 'High Risk'], required: true },
  recommendation: { type: String, required: true },
  action: { type: String, default: 'Pending Review' }, // For Early Intervention tracking
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Assessment', assessmentSchema);
