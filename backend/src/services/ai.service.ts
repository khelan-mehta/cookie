import OpenAI from 'openai';
import { env } from '../config/env';
import { AIAnalysisRequest, AIAnalysisResponse } from '../types';
import { logger } from '../utils/logger';

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async analyzeDistress(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are a veterinary AI assistant helping users assess animal emergencies.
          Analyze the provided information and give helpful, immediate guidance.
          Always emphasize that this is advisory only and professional veterinary care should be sought.
          Respond in JSON format with the following structure:
          {
            "severity": "low" | "medium" | "high" | "critical",
            "suggestions": ["string array of general suggestions"],
            "possibleConditions": ["string array of possible conditions"],
            "immediateSteps": ["string array of immediate steps to take"]
          }`,
        },
        {
          role: 'user',
          content: this.buildPrompt(request),
        },
      ];

      if (request.imageUrl) {
        messages.push({
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: request.imageUrl,
                detail: 'high',
              },
            },
          ],
        });
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: 1000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Improved JSON parsing with validation
      let analysis;
      try {
        analysis = JSON.parse(content);
      } catch (parseError) {
        logger.error('Failed to parse AI response as JSON:', parseError);
        logger.error('AI raw response:', content);

        // Attempt to extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          try {
            analysis = JSON.parse(jsonMatch[1]);
            logger.info('Successfully extracted JSON from markdown block');
          } catch {
            throw new Error('Failed to parse extracted JSON');
          }
        } else {
          throw new Error('Invalid JSON response from AI');
        }
      }

      // Validate and normalize severity
      const validSeverities = ['low', 'medium', 'high', 'critical'];
      const severity = validSeverities.includes(analysis.severity)
        ? analysis.severity
        : 'medium';

      return {
        severity,
        suggestions: Array.isArray(analysis.suggestions)
          ? analysis.suggestions.filter((s: unknown) => typeof s === 'string')
          : [],
        possibleConditions: Array.isArray(analysis.possibleConditions)
          ? analysis.possibleConditions.filter((c: unknown) => typeof c === 'string')
          : [],
        immediateSteps: Array.isArray(analysis.immediateSteps)
          ? analysis.immediateSteps.filter((s: unknown) => typeof s === 'string')
          : [],
        disclaimer:
          'This AI analysis is advisory only and should not replace professional veterinary care. Please seek immediate help from a qualified veterinarian.',
      };
    } catch (error) {
      logger.error('AI analysis error:', error);
      return this.getFallbackResponse();
    }
  }

  private buildPrompt(request: AIAnalysisRequest): string {
    let prompt = 'Animal Emergency Assessment:\n\n';
    prompt += `Description: ${request.description}\n`;
    if (request.imageUrl) {
      prompt += '\nAn image has been provided for visual assessment.';
    }
    prompt += '\n\nPlease analyze this situation and provide guidance.';
    return prompt;
  }

  private getFallbackResponse(): AIAnalysisResponse {
    return {
      severity: 'medium',
      suggestions: [
        'Keep the animal calm and comfortable',
        'Do not give any medication without veterinary advice',
        'Monitor vital signs if possible',
      ],
      possibleConditions: ['Unable to determine - professional assessment needed'],
      immediateSteps: [
        'Contact a veterinarian immediately',
        'Keep the animal warm and stable',
        'Do not move the animal unless necessary for safety',
      ],
      disclaimer:
        'AI analysis unavailable. Please seek immediate professional veterinary care.',
    };
  }
}

export const aiService = new AIService();
