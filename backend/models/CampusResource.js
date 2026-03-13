import mongoose from 'mongoose';

const campusResourceSchema = new mongoose.Schema({
  blockName: {
    type: String,
    required: true
  },
  totalRooms: {
    type: Number,
    required: true
  },
  occupiedRooms: {
    type: Number,
    required: true
  },
  occupancyPercentage: {
    type: Number,
    required: true
  },
  studyRoomUsage: {
    type: Number,
    required: true
  },
  libraryUsage: {
    type: Number,
    required: true
  },
  electricityConsumption: {
    type: Number,
    required: true
  },
  waterConsumption: {
    type: Number,
    required: true
  },
  messUtilization: {
    type: Number,
    required: true
  },
  aiRecommendation: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CampusResource = mongoose.model('CampusResource', campusResourceSchema);

export default CampusResource;
