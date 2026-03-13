import express from 'express';
import axios from 'axios';
import ChatHistory from '../models/ChatHistory.js';
import Assessment from '../models/Assessment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper: sleep for ms
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Gemini models to try in order
const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

// OpenRouter free models to try
const OPENROUTER_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'qwen/qwen3-8b:free',
  'mistralai/mistral-7b-instruct:free',
];

const getAIResponse = async (userMessage, chatHistory, latestAssessment) => {
  const assessmentContext = latestAssessment
    ? `\nThe student's latest mental health assessment shows:
    - Risk Level: ${latestAssessment.riskLevel} (Score: ${(latestAssessment.riskScore * 100).toFixed(0)}%)
    - Stress Level: ${(latestAssessment.stressLevel * 100).toFixed(0)}%
    - Sleep Quality: ${(latestAssessment.sleepQuality * 100).toFixed(0)}% (higher = worse)
    - Academic Workload: ${(latestAssessment.academicWorkload * 100).toFixed(0)}%
    - Social Activity: ${(latestAssessment.socialActivity * 100).toFixed(0)}% (higher = more isolated)
    - Mood: ${(latestAssessment.mood * 100).toFixed(0)}% (higher = more depressed)
    - Attendance: ${latestAssessment.attendancePercentage}%
    - Academic Performance: ${latestAssessment.academicPerformance}%
    Use this data to personalize your advice.`
    : '\nNo assessment data is available yet for this student.';

  const systemPrompt = `You are CampusGuardian AI, a supportive and empathetic virtual mental health assistant for college students.
Your goals:
- Provide empathetic, non-judgmental emotional support
- Suggest healthy study habits, stress management techniques, and relaxation exercises
- Keep responses concise (2-3 paragraphs max)
- If a student expresses intention for self-harm, instruct them to seek immediate emergency help (call 988 Suicide & Crisis Lifeline)
- Personalize your responses based on the student's assessment data when available
${assessmentContext}`;

  // Build Gemini-format contents
  const contents = [];
  chatHistory.slice(-5).forEach(hist => {
    contents.push({ role: 'user', parts: [{ text: hist.message }] });
    contents.push({ role: 'model', parts: [{ text: hist.response }] });
  });
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  // Build OpenAI-format messages
  const openaiMessages = [{ role: 'system', content: systemPrompt }];
  chatHistory.slice(-5).forEach(hist => {
    openaiMessages.push({ role: 'user', content: hist.message });
    openaiMessages.push({ role: 'assistant', content: hist.response });
  });
  openaiMessages.push({ role: 'user', content: userMessage });

  // ========== 1. Try Gemini API (multiple models with retry) ==========
  if (process.env.GEMINI_API_KEY) {
    for (const model of GEMINI_MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          console.log(`Trying Gemini model: ${model} (attempt ${attempt + 1})`);
          const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 512,
              }
            },
            { timeout: 15000 }
          );
          if (response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.log(`Gemini ${model} succeeded!`);
            return response.data.candidates[0].content.parts[0].text;
          }
        } catch (e) {
          const status = e.response?.status;
          console.error(`Gemini ${model} attempt ${attempt + 1} failed: ${status} - ${e.response?.data?.error?.message || e.message}`);
          // If rate limited (429), wait and retry
          if (status === 429 && attempt === 0) {
            console.log('Rate limited, waiting 2s before retry...');
            await sleep(2000);
            continue;
          }
          // If 404, model doesn't exist, skip to next model
          if (status === 404) break;
          break;
        }
      }
    }
  }

  // ========== 2. Try OpenRouter (multiple models) ==========
  if (process.env.OPENROUTER_API_KEY) {
    for (const model of OPENROUTER_MODELS) {
      try {
        console.log(`Trying OpenRouter model: ${model}`);
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          { model, messages: openaiMessages, max_tokens: 512 },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:5174',
              'X-Title': 'CampusGuardian AI'
            },
            timeout: 15000
          }
        );
        if (response.data.choices?.[0]?.message?.content) {
          console.log(`OpenRouter ${model} succeeded!`);
          return response.data.choices[0].message.content;
        }
      } catch (e) {
        console.error(`OpenRouter ${model} failed:`, e.response?.data?.error?.message || e.message);
      }
    }
  }

  // ========== 3. Smart Local Fallback ==========
  console.log('All AI APIs failed, using smart local fallback');
  return getLocalFallbackResponse(userMessage, latestAssessment);
};

// Intelligent local fallback that provides contextual responses
const getLocalFallbackResponse = (message, assessment) => {
  const msg = message.toLowerCase();

  // Self-harm detection (highest priority)
  if (msg.includes('kill myself') || msg.includes('end my life') || msg.includes('suicide') || msg.includes('self-harm') || msg.includes('don\'t want to live')) {
    return `I'm deeply concerned about what you're sharing. Please know that you are not alone and help is available right now.\n\n🆘 **Immediate Help:**\n- **988 Suicide & Crisis Lifeline**: Call or text **988** (available 24/7)\n- **Crisis Text Line**: Text **HOME** to **741741**\n- **Campus Counseling**: Please visit your campus counseling center immediately\n\nYour life matters, and trained professionals are ready to support you through this.`;
  }

  // Stress-related
  if (msg.includes('stress') || msg.includes('overwhelm') || msg.includes('pressure') || msg.includes('anxious') || msg.includes('anxiety')) {
    const tips = assessment && assessment.stressLevel > 0.6
      ? `Based on your assessment, your stress levels are quite high (${(assessment.stressLevel * 100).toFixed(0)}%). Here are some evidence-based techniques:`
      : `Here are some evidence-based techniques to manage stress:`;
    return `I hear you, and it's completely valid to feel stressed. ${tips}\n\n🧘 **Quick Relief:** Try the 4-7-8 breathing technique — breathe in for 4 seconds, hold for 7, exhale for 8. Repeat 3 times.\n📋 **Planning:** Break your tasks into smaller, manageable chunks. Focus on just one thing at a time.\n🚶 **Movement:** Even a 10-minute walk can significantly reduce stress hormones.\n\nRemember, reaching out is a sign of strength. Consider visiting your campus counseling services for ongoing support.`;
  }

  // Sleep-related
  if (msg.includes('sleep') || msg.includes('insomnia') || msg.includes('tired') || msg.includes('exhausted') || msg.includes('rest')) {
    return `Sleep is crucial for both mental and academic performance. Here are some tips to improve your sleep quality:\n\n🌙 **Sleep Hygiene Tips:**\n- Set a consistent sleep schedule (even on weekends)\n- Avoid screens 30 minutes before bed\n- Keep your room cool and dark\n- Try a relaxation technique like progressive muscle relaxation\n- Limit caffeine after 2 PM\n\nIf sleep issues persist for more than 2 weeks, please consider visiting your campus health center — they can provide specialized support.`;
  }

  // Academic concerns
  if (msg.includes('study') || msg.includes('exam') || msg.includes('grade') || msg.includes('academic') || msg.includes('fail') || msg.includes('homework') || msg.includes('assignment')) {
    const academicNote = assessment
      ? `Your current academic performance is at ${assessment.academicPerformance}% with ${assessment.attendancePercentage}% attendance. `
      : '';
    return `${academicNote}Academic pressure is one of the most common challenges students face. You're not alone in this.\n\n📚 **Study Strategies:**\n- Use the Pomodoro Technique: 25 minutes of focused study, then 5-minute break\n- Active recall is more effective than re-reading notes\n- Study in different locations to improve memory retention\n- Form or join a study group for accountability\n\n💡 Don't hesitate to reach out to your professors during office hours or use campus tutoring services. Asking for help is smart, not weak.`;
  }

  // Loneliness / social isolation
  if (msg.includes('lonely') || msg.includes('alone') || msg.includes('friend') || msg.includes('social') || msg.includes('isolated') || msg.includes('nobody')) {
    return `Feeling lonely is more common on campus than you might think. Many students experience this, especially during transitions.\n\n🤝 **Ways to Connect:**\n- Join a campus club or organization that aligns with your interests\n- Attend campus events — even going alone can lead to new connections\n- Consider volunteering — helping others naturally builds bonds\n- Visit common areas like the library or student center regularly\n\nBuilding meaningful connections takes time. Be patient with yourself, and remember that campus counseling services can also help with social anxiety or adjustment challenges.`;
  }

  // Depression / sadness
  if (msg.includes('depress') || msg.includes('sad') || msg.includes('hopeless') || msg.includes('down') || msg.includes('unhappy') || msg.includes('dispressed') || msg.includes('feeling low')) {
    return `I'm sorry you're going through this. Your feelings are valid, and it takes courage to express them.\n\n💙 **Things that may help:**\n- Try to maintain a basic routine, even on difficult days\n- Gentle physical activity (a walk, stretching) can boost mood\n- Stay connected with at least one person you trust\n- Practice gratitude — write down 3 small positive things each day\n- Limit social media if it makes you feel worse\n\nIf these feelings persist for more than two weeks, please reach out to your campus counseling center. Depression is treatable, and you deserve support.`;
  }

  // Greeting
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('good morning') || msg.includes('good evening')) {
    return `Hello! 👋 I'm your CampusGuardian AI wellness assistant. I'm here to support you with:\n\n• 🧠 Mental health and emotional well-being\n• 📚 Academic stress management\n• 😴 Sleep and lifestyle tips\n• 🤝 Social connection guidance\n\nHow are you feeling today? Feel free to share anything on your mind — this is a safe, judgment-free space.`;
  }

  // Default contextual response
  const assessmentNote = assessment
    ? `\n\nBased on your latest assessment, your risk level is ${assessment.riskLevel} with a score of ${(assessment.riskScore * 100).toFixed(0)}%. I'd recommend focusing on the areas where you scored highest and considering campus counseling for personalized support.`
    : '';

  return `Thank you for reaching out. I'm here to listen and support you.${assessmentNote}\n\n💡 **General Wellness Tips:**\n- Take regular breaks during study sessions\n- Stay hydrated and maintain regular meals\n- Practice mindfulness or deep breathing for 5 minutes daily\n- Connect with friends, family, or campus support services\n\nWould you like to talk about something specific? I can help with stress, sleep, academics, social connections, or emotional well-being.`;
};

router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Fetch recent history
    const history = await ChatHistory.find({ userId: req.user._id })
      .sort({ createdAt: 1 })
      .limit(10);

    // Fetch latest assessment for context
    const latestAssessment = await Assessment.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 });

    const aiResponse = await getAIResponse(message, history, latestAssessment);

    const newChat = await ChatHistory.create({
      userId: req.user._id,
      message,
      response: aiResponse
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ message: 'Error processing chat message' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const history = await ChatHistory.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

export default router;
