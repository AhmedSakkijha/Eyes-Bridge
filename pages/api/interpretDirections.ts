import type { NextApiRequest, NextApiResponse } from 'next';
import { VertexAI } from '@google-cloud/vertexai';

const projectId = process.env.GCP_PROJECT_ID;
const location = 'asia-nortwest1';
const model = 'gemini-1.5-flash-001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { directionsData } = req.body;

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
      Please translate the route information below into English instructions that are easy for visually impaired people to understand.
Include important turns, landmarks, and points of interest for pedestrian navigation.
Keep instructions concise, orderly, and safety-focused.
Each step should be explained in 50 characters or less.

Route information:
        ${JSON.stringify(directionsData, null, 2)}
      `;

      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const response = await result.response;
      const interpretation = response.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No text generated';

      res.status(200).json({ interpretation });
    } catch (error) {
      console.error('Error interpreting directions:', error);
      res.status(500).json({ error: 'Failed to interpret directions' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}