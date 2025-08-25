const { VertexAI } = require('@google-cloud/vertexai');
const cors = require('cors')({origin: true});

const projectId = process.env.GCP_PROJECT_ID;
const location = 'asia-northwest1'; 
const model = 'gemini-1.5-flash-001';

if (!projectId) {
  throw new Error('GCP_PROJECT_ID environment variable is not set');
}

function createPromptForMode(mode, previousAnalysis) {
  const basePrompt = `previous analysis: "${previousAnalysis || 'initial analysis'}"\n\n`;
  
 const commonInstructions = `
You are a visual support AI assistant for visually impaired people. Follow the instructions below to analyze the given image and generate concise and clear voice feedback.

- Prioritize the most important information (safety, elements related to movement). (Examples: traffic signals, pedestrians, vehicles).
- Focus on changes in the environment or newly detected objects, and clearly indicate differences from the previous analysis. (Example: The traffic light changed from green to red.)
- Use specific expressions that help the user's spatial awareness, including location information. (Example: “2 meters ahead,” “to the right front.”)
- Communicate each piece of information in short sentences of 15 characters or less.
- Emphasize dangerous situations or obstacles in particular.
- Include important visual information such as people, text, and signs.
- Do not include any false information (hallucinations).

**Answer format**:

- Output up to three items in order of importance as bullet points.
- Describe each item in natural Japanese in 15 characters or less.

**Example**:
A person is approaching 2 meters to the right.
A bicycle is approaching from the left.
The traffic light has changed from green to red. Please stop.
There is an obstacle ahead. Please be careful.
input: A photo of a city at night. It shows traffic lights and intersections.
output: The traffic light on the right is red.
Approaching an intersection.
There is a crosswalk ahead.

Generate voice feedback according to the above instructions. Output in bullet points in order of importance.
`;

 switch (mode) {
    case 'normal':
      return basePrompt + commonInstructions;
    case 'detailed':
      return basePrompt + `
You are a detailed visual support AI assistant for visually impaired people. Please provide detailed analysis and explanations of images taken specifically by users, following the instructions below:

- Describe the overall composition and main elements of the image.
- If people are in the image, describe their number, position, posture, facial expressions, and clothing.
- Describe the visual characteristics of objects and backgrounds, such as color, shape, and texture.
- If there is text or signage in the image, accurately convey its content and location.  
- Do not provide false information (hallucinations).  
- Emphasize safety-related elements (obstacles, dangerous situations, etc.) in particular.  
- Describe spatial relationships and distances in specific terms.  
- If text is detected, explain its meaning in Japanese.  

**Response format**:

- Output up to three items in order of importance as bullet points.
- Each item should be described in natural Japanese within 20 characters.

**Example**:
There is a white spray bottle held by a man. - The spray bottle has the words “Avène” and “Eau Thermale” on it. In Japanese, this means “Avène Thermal Water.”

Follow the above instructions to analyze the given image and generate voice feedback.
`;
    default:
     return basePrompt + commonInstructions;
  }
}

exports.analyzeImage = (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { imageData, analysisMode, previousAnalysis } = req.body;

      const vertexAi = new VertexAI({
        project: projectId,
        location: location,
      });

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

      const prompt = createPromptForMode(analysisMode, previousAnalysis);

      const result = await generativeModel.generateContent({
        contents: [
          { role: 'user', parts: [{ text: prompt }] },
          { role: 'user', parts: [{ inlineData: { mimeType: 'image/jpeg', data: imageData.split(',')[1] } }] },
        ],
      });

      const response = await result.response;
      const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No text generated';

      res.status(200).json({ analysis: generatedText });
    } catch (error) {
      console.error('Error analyzing image with Vertex AI Gemini:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: 'Image analysis failed', details: errorMessage });
    }
  });
};