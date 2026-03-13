import express from 'express';
import axios from 'axios';
import Assessment from '../models/Assessment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const calculateLocalRisk = (data) => {
  // Formula: 0.3 * Stress + 0.2 * Sleep + 0.2 * Academic + 0.2 * Attendance + 0.1 * Mood
  // Note: All inputs should be normalized to 0.0 - 1.0 where higher is worse.
  // Assuming attendance is 0-100%, lower is worse, so we invert it: (100 - attendance)/100
  // Assuming academic is 0-100%, lower is worse: (100 - academic)/100

  const invAttendance = (100 - data.attendancePercentage) / 100;
  const invAcademic = (100 - data.academicPerformance) / 100;

  let riskScore = (0.3 * data.stressLevel) +
                  (0.2 * data.sleepQuality) +
                  (0.2 * data.academicWorkload) +
                  (0.2 * invAttendance) +
                  (0.1 * data.mood);

  let riskLevel = 'Low Risk';
  if (riskScore >= 0.7) riskLevel = 'High Risk';
  else if (riskScore >= 0.3) riskLevel = 'Medium Risk';

  let recommendation = 'Keep up the good work and maintain healthy habits.';
  if (riskLevel === 'High Risk') recommendation = 'Immediate counseling suggested. Please reach out to student support.';
  else if (riskLevel === 'Medium Risk') recommendation = 'Consider scheduling a check-in with an academic advisor or using wellness resources.';

  return { riskScore, riskLevel, recommendation };
};

const getAIAnalysis = async (assessmentData) => {
  const prompt = `Analyze this college student's well-being data and predict their dropout/distress risk.
  Data:
  Stress Level: ${assessmentData.stressLevel}/1.0 (Higher is more stress)
  Sleep Quality: ${assessmentData.sleepQuality}/1.0 (Higher is worse sleep)
  Academic Workload: ${assessmentData.academicWorkload}/1.0 (Higher is heavier workload)
  Social Isolation/Activity: ${assessmentData.socialActivity}/1.0 (Higher is more isolated)
  Negative Mood: ${assessmentData.mood}/1.0 (Higher is worse mood)
  Attendance: ${assessmentData.attendancePercentage}%
  Academic Performance: ${assessmentData.academicPerformance}%

  Respond STRICTLY in JSON format with exactly 3 keys:
  "riskLevel": Must be "Low Risk", "Medium Risk", or "High Risk"
  "riskScore": A float between 0.0 and 1.0 representing the exact risk probability
  "recommendation": A short, actionable 1-2 sentence recommendation.`;

  // 1. Try Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }
      );
      const text = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(text);
    } catch (e) {
      console.warn('Gemini API failed, falling back to OpenRouter...', e.message);
    }
  }

  // 2. Try OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const text = response.data.choices[0].message.content;
      return JSON.parse(text);
    } catch (e) {
      console.warn('OpenRouter API failed, falling back to local heuristic...', e.message);
    }
  }

  // 3. Fallback to Local Heuristic
  console.log('Using local AI fallback logic for risk prediction.');
  return calculateLocalRisk(assessmentData);
};

// @route   POST /api/assessment
router.post('/', protect, async (req, res) => {
  try {
    const {
      stressLevel, sleepQuality, academicWorkload,
      socialActivity, mood, attendancePercentage, academicPerformance
    } = req.body;

    const analysis = await getAIAnalysis(req.body);

    const assessment = await Assessment.create({
      userId: req.user._id,
      stressLevel,
      sleepQuality,
      academicWorkload,
      socialActivity,
      mood,
      attendancePercentage,
      academicPerformance,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      recommendation: analysis.recommendation,
      action: analysis.riskLevel === 'High Risk' ? 'Action Required' : 'Not Required',
      status: analysis.riskLevel === 'High Risk' ? 'Pending' : 'Completed'
    });

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Assessment Error:', error);
    res.status(500).json({ message: 'Error processing assessment' });
  }
});

// @route   GET /api/assessment/me
router.get('/me', protect, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assessments' });
  }
});

export default router;
