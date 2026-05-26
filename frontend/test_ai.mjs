import { config } from 'dotenv';
config({ path: '.env.local' });

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';

async function testAI() {
  console.log('--- STARTING AI CONNECTION TEST ---\n');

  try {
    console.log('[1/2] Testing Gemini API (Primary Engine)...');
    const gemini = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-pro',
      apiKey: process.env.GEMINI_API_KEY,
    });
    const result1 = await gemini.invoke('Reply with exactly ONE WORD: "Gemini-Online"');
    console.log('✅ Gemini Success:', result1.content);
  } catch (error) {
    console.error('❌ Gemini Failed:', error.message);
  }

  console.log('\n----------------------------------------\n');

  try {
    console.log('[2/2] Testing Groq API (Fallback Engine)...');
    const groq = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      apiKey: process.env.GROQ_API_KEY,
    });
    const result2 = await groq.invoke('Reply with exactly ONE WORD: "Groq-Online"');
    console.log('✅ Groq Success:', result2.content);
  } catch (error) {
    console.error('❌ Groq Failed:', error.message);
  }

  console.log('\n--- TESTS COMPLETED ---');
}

testAI();
