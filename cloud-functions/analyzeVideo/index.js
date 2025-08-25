const { VertexAI } = require('@google-cloud/vertexai');
const cors = require('cors')({
  origin: true,
  credentials: true  
});
const projectId = process.env.GCP_PROJECT_ID;
const location = 'asia-northwest1';
const model = 'gemini-1.5-flash-001';

if (!projectId) {
  throw new Error('GCP_PROJECT_ID environment variable is not set');
}

const vertexAi = new VertexAI({ project: projectId, location: location });

function createPromptForVideo(previousAnalysis) {
  return `You are a visual support AI assistant for visually impaired people. Follow the instructions below to convert video analysis results into concise and clear voice feedback:

1. Prioritize the most important information (safety, movement-related elements) and convey it first. (Examples: traffic signals, pedestrians, vehicles).
2. Focus on changes in the environment or newly detected objects, clearly highlighting differences from the previous analysis. (Example: The traffic light changed from green to red.)
3. Use specific expressions that help the user's spatial awareness, including location information. (Example: “2 meters ahead,” “to the right front.”)
4. Communicate each piece of information in short sentences of 15 characters or fewer.
5. Emphasize dangerous situations and obstacles in particular.
6. Include important visual information such as people, text, and signs.
7. For safety reasons, do not use hallucinations under any circumstances.
8. Describe the direction and speed of moving objects in detail.
9. Report sudden changes in the scene or important events immediately.

previous analysis: "${previousAnalysis || 'initial analysis'}"

Example:
'Pedestrian walking quickly from right to left.
Be careful of the chair 2 meters ahead.
Car approaching from behind, be careful.
Exit sign flashing in the upper right corner of the screen.'

Follow the above instructions to analyze the given video and generate real-time audio feedback for visually impaired people. Output in order of importance as a bulleted list.`;
}

exports.analyzeVideo = (req, res) => {
  return cors(req, res, async () => {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Allow-Credentials', 'true');
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { videoData, previousAnalysis } = req.body;
      if (!videoData) {
        console.error('No video data received');
        return res.status(400).json({ error: 'No video data provided' });
      }

      console.log('Received video data type:', typeof videoData);
      console.log('Received video data length:', videoData.length);

      const generativeModel = vertexAi.preview.getGenerativeModel({
        model: model,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 1,
          topP: 0.95,
        },
        safetySettings: [
          {
            'category': 'HARM_CATEGORY_HATE_SPEECH',
            'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
            'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            'category': 'HARM_CATEGORY_HARASSMENT',
            'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ],
      });

      const prompt = createPromptForVideo(previousAnalysis);

      const result = await generativeModel.generateContent({
        contents: [
          { role: 'user', parts: [{ text: prompt }] },
          { role: 'user', parts: [{ inlineData: { mimeType: 'video/mp4', data: videoData.split(',')[1] } }] },
        ],
      });

      const response = await result.response;
      const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No text generated';

      res.status(200).json({ analysis: generatedText });
    } catch (error) {
      console.error('Error in video analysis:', error);
      res.status(500).json({ error: 'Video analysis failed', details: error.message });
    }
  });
};