const { generateText } = require('ai');
const { createGroq } = require('@ai-sdk/groq');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

// We simulate the NVIDIA client creation
function createNvidiaClient(apiKey) {
  const { createOpenAI } = require('@ai-sdk/openai');
  return createOpenAI({
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKey: apiKey || process.env.NVIDIA_NIM_API_KEY
  });
}

async function testKeys() {
  console.log('--- Probing LLM Credentials ---');
  
  // 1. Google Gemini
  try {
    const geminiClient = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    const res = await generateText({
      model: geminiClient('gemini-1.5-flash'),
      prompt: 'Reply with: ok',
      maxTokens: 5,
      maxRetries: 0
    });
    console.log('✅ Gemini: SUCCESS ->', res.text.trim());
  } catch (e) {
    console.log('❌ Gemini: FAILED ->', e.message);
  }

  // 2. Groq
  try {
    const groqClient = createGroq({ apiKey: process.env.GROQ_API_KEY });
    const res = await generateText({
      model: groqClient('llama-3.3-70b-versatile'),
      prompt: 'Reply with: ok',
      maxTokens: 5,
      maxRetries: 0
    });
    console.log('✅ Groq: SUCCESS ->', res.text.trim());
  } catch (e) {
    console.log('❌ Groq: FAILED ->', e.message);
  }

  // 3. NVIDIA NIM
  try {
    const nvidiaClient = createNvidiaClient();
    const res = await generateText({
      model: nvidiaClient('meta/llama-3.3-70b-instruct'), // default executive model ID
      prompt: 'Reply with: ok',
      maxTokens: 5,
      maxRetries: 0
    });
    console.log('✅ NVIDIA NIM: SUCCESS ->', res.text.trim());
  } catch (e) {
    console.log('❌ NVIDIA NIM: FAILED ->', e.message);
  }
}

testKeys();
