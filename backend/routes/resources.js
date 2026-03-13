import express from 'express';
import axios from 'axios';
import CampusResource from '../models/CampusResource.js';
import { protect, adminCheck } from '../middleware/auth.js';

const router = express.Router();

// Helper: sleep for ms
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

const getAIInsights = async (resourceData) => {
  const prompt = `Analyze the following campus resource utilization data and provide optimization recommendations.

Hostel Block: ${resourceData.blockName}
Total Rooms: ${resourceData.totalRooms}
Occupied Rooms: ${resourceData.occupiedRooms} (Occupancy: ${resourceData.occupancyPercentage}%)
Study Room Usage: ${resourceData.studyRoomUsage}%
Library Usage: ${resourceData.libraryUsage}%
Electricity Consumption: ${resourceData.electricityConsumption} kWh
Water Consumption: ${resourceData.waterConsumption} L
Mess Utilization: ${resourceData.messUtilization}%

Identify inefficiencies and suggest improvements for campus resource optimization. Keep the response concise and formatted as a list of 2-3 actionable insights.`;

  if (!process.env.GEMINI_API_KEY) {
    return "AI insights currently unavailable. Please provide a GEMINI_API_KEY in the environment.";
  }

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
            }
          },
          { timeout: 15000 }
        );
        if (response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return response.data.candidates[0].content.parts[0].text;
        }
      } catch (e) {
        if (e.response?.status === 429 && attempt === 0) {
          await sleep(2000);
          continue;
        }
        if (e.response?.status === 404) break;
        break;
      }
    }
  }

  return "AI systems are busy. Try analyzing again in a few minutes.";
};

// @route   POST /api/resources/add
// @desc    Add new campus resource data
router.post('/add', protect, adminCheck, async (req, res) => {
  try {
    const { 
      blockName, totalRooms, occupiedRooms, studyRoomUsage, 
      libraryUsage, electricityConsumption, waterConsumption, messUtilization 
    } = req.body;

    const occupancyPercentage = (occupiedRooms / totalRooms) * 100;

    const newResource = new CampusResource({
      blockName,
      totalRooms,
      occupiedRooms,
      occupancyPercentage,
      studyRoomUsage,
      libraryUsage,
      electricityConsumption,
      waterConsumption,
      messUtilization
    });

    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    console.error('Error adding resource data:', error);
    res.status(500).json({ message: 'Error saving resource data' });
  }
});

// @route   GET /api/resources
// @desc    Get all resource records
router.get('/', protect, adminCheck, async (req, res) => {
  try {
    const resources = await CampusResource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resource data' });
  }
});

// @route   POST /api/resources/analyze
// @desc    Trigger AI analysis for a resource record
router.post('/analyze', protect, adminCheck, async (req, res) => {
  try {
    const { resourceId } = req.body;
    const resource = await CampusResource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({ message: 'Resource record not found' });
    }

    const aiRecommendation = await getAIInsights(resource);
    resource.aiRecommendation = aiRecommendation;
    await resource.save();

    res.json({ aiRecommendation });
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ message: 'Error generating AI insights' });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete a resource record
router.delete('/:id', protect, adminCheck, async (req, res) => {
  try {
    const resource = await CampusResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    
    await resource.deleteOne();
    res.json({ message: 'Resource record removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resource data' });
  }
});

export default router;
