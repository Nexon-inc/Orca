import { gemini, groq } from '../ai/client';

/**
 * TrendAlertsService: Absorbed from Aria's services.
 * Handles trend discovery and platform monitoring.
 */
export class TrendAlertsService {
  async discoverTrends(keywords: string[]) {
    const prompt = `Discover current trending topics related to: ${keywords.join(', ')}. Provide insights for TikTok, LinkedIn, and X.`;
    const response = await gemini.invoke(prompt);
    return response.content.toString();
  }
}

/**
 * PitchAnalysisService: Absorbed from Eric's services.
 * Analyzes sales pitches for confidence, clarity, and effectiveness.
 */
export class PitchAnalysisService {
  async analyzePitch(transcript: string) {
    const prompt = `Analyze this sales pitch transcript for Confidence, Clarity, and Objections handling.
    
    TRANSCRIPT:
    ${transcript}`;
    const response = await groq.invoke(prompt);
    return response.content.toString();
  }
}

/**
 * BusinessScalingService: Absorbed from Purity's services.
 * Validates business ideas and models.
 */
export class BusinessScalingService {
  async validateModel(businessIdea: string) {
    const prompt = `Validate this business idea using the Business Model Canvas framework. Identify potential risks and scalability bottlenecks.
    
    IDEA:
    ${businessIdea}`;
    const response = await gemini.invoke(prompt);
    return response.content.toString();
  }
}

/**
 * ServiceRegistry: Central hub for all absorbed expert logic services.
 */
export class ServiceRegistry {
  public trends = new TrendAlertsService();
  public pitch = new PitchAnalysisService();
  public business = new BusinessScalingService();
  
  // More services to be added here as needed...
}

export const serviceRegistry = new ServiceRegistry();
