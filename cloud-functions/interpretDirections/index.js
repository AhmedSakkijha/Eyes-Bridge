const { VertexAI } = require('@google-cloud/vertexai');
const cors = require('cors')({
  origin: true,
  credentials: true
});
const projectId = process.env.GCP_PROJECT_ID;
const location = 'asia-northeast1';
const model = 'gemini-1.5-flash-001';

exports.interpretDirections = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Credentials', 'true');
  return cors(req, res, async () => {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { directionsData } = req.body;
      console.log('Received directionsData:', JSON.stringify(directionsData, null, 2));

      
      const processedData = processDirectionsData(directionsData);

      const vertexAi = new VertexAI({
        project: projectId,
        location: location,
      });

      const generativeModel = vertexAi.preview.getGenerativeModel({
        model: model,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.2,
          topP: 1,
          topK: 32,
        },
      });

      const prompt = `
      Please convert the following route information into Japanese explanations that are easy for visually impaired people to understand.
1. Report the total distance to the destination and the estimated time required.
2. Include the following information for pedestrian navigation:
- Major turns
- Landmarks such as buildings and facilities
- Areas requiring caution (intersections, steps, etc.)
        3. Keep the explanation concise, organized, and focused on safety.
        4. Each step should be explained in 50 characters or less.
        5. For safety reasons, do not use hallucinations under any circumstances.

        Route information:

Translated with DeepL.com (free version)ingify(processedData, null, 2)}
      `;

      console.log('Sending prompt to Vertex AI:', prompt);

      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      console.log('Received result from Vertex AI:', JSON.stringify(result, null, 2));

      const response = await result.response;
      const interpretation = response.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No text generated';

      res.status(200).json({ interpretation });
    } catch (error) {
      console.error('Error interpreting directions:', error);
      res.status(500).json({ error: 'Failed to interpret directions', details: error.message });
    }
  });
};

function processDirectionsData(data) {

  const route = data.routes[0];
  const leg = route.legs[0];
  return {
    distance: leg.distance.text,
    duration: leg.duration.text,
    steps: leg.steps.map(step => ({
      instructions: step.instructions,
      distance: step.distance.text,
      duration: step.duration.text
    }))
  };
}