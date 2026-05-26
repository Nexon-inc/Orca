import { config } from 'dotenv';
config({ path: '.env.local' });

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

async function testGemini() {
  console.log('Testing gemini-1.5-pro-latest...');
  try {
    const gemini = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-pro-latest',
      apiKey: process.env.GEMINI_API_KEY,
    });
    const result = await gemini.invoke('Say "Hello"');
    console.log('SUCCESS:', result.content);
  } catch (error) {
    console.error('ERROR:', error);
  }
}

testGemini();
