import express from 'express';
import Assessment from '../models/Assessment.js';
import { protect, adminCheck } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/risk-summary
router.get('/risk-summary', protect, adminCheck, async (req, res) => {
  try {
    const highRisk = await Assessment.countDocuments({ riskLevel: 'High Risk' });
    const mediumRisk = await Assessment.countDocuments({ riskLevel: 'Medium Risk' });
    const lowRisk = await Assessment.countDocuments({ riskLevel: 'Low Risk' });

    res.json({
      highRisk,
      mediumRisk,
      lowRisk,
      total: highRisk + mediumRisk + lowRisk
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching risk summary' });
  }
});

// @route   GET /api/admin/alerts
router.get('/alerts', protect, adminCheck, async (req, res) => {
  try {
    const alerts = await Assessment.find({ riskLevel: 'High Risk' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    // Transform data flat for frontend table
    const alertData = alerts.map(alert => ({
      _id: alert._id,
      userId: alert.userId._id,
      name: alert.userId.name,
      email: alert.userId.email,
      riskLevel: alert.riskLevel,
      recommendation: alert.recommendation,
      action: alert.action,
      status: alert.status,
      createdAt: alert.createdAt
    }));
    
    res.json(alertData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

// @route   PUT /api/admin/alerts/:id
router.put('/alerts/:id', protect, adminCheck, async (req, res) => {
  try {
    const { action, status } = req.body;
    const assessment = await Assessment.findById(req.params.id);
    
    if (assessment) {
      assessment.action = action || assessment.action;
      assessment.status = status || assessment.status;
      const updatedAlert = await assessment.save();
      res.json(updatedAlert);
    } else {
      res.status(404).json({ message: 'Alert not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating alert' });
  }
});

// @route   GET /api/admin/resource-usage
router.get('/resource-usage', protect, adminCheck, async (req, res) => {
  try {
    // Generate mock campus resource utilization data for the dashboard
    // In a production system, this would come from IoT sensors or booking databases
    const data = {
      metrics: {
        hostelOccupancyRate: 85, // percentage
        studyRoomUsage: 63, // percentage
        libraryUtilization: 70, // percentage
        electricityUsage: 540, // kWh
      },
      hostelBlocks: [
        { name: 'Block A', occupancy: 95 },
        { name: 'Block B', occupancy: 42 },
        { name: 'Block C', occupancy: 88 },
        { name: 'Block D', occupancy: 75 }
      ],
      aiInsights: [
        "Hostel Block B occupancy is low (42%). Recommendation: Reallocate students from Block A to balance room utilization.",
        "Study rooms underutilized during morning hours. Recommendation: Introduce study group booking incentives in the mornings.",
        "Electricity consumption is 12% above average. Recommendation: Check automated AC schedules in the library and empty classrooms."
      ]
    };

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resource data' });
  }
});

export default router;
