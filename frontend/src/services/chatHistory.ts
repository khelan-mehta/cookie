import api from './api';

export interface SimilarQuery {
  id: string;
  query: string;
  severity: string;
  resolved: boolean;
  createdAt: string;
  vetContact: {
    clinicName: string;
    userId: string;
  } | null;
  matchScore: number;
}

export interface SimilarQueriesResponse {
  success: boolean;
  suggestions: SimilarQuery[];
  message: string;
}

export const chatHistoryService = {
  async getSimilarQueries(query: string): Promise<SimilarQueriesResponse> {
    const response = await api.get<SimilarQueriesResponse>('/chat-history/similar', {
      params: { query },
    });
    return response.data;
  },

  async addChatMessage(query: string, severity: string, resolved: boolean): Promise<void> {
    await api.post('/chat-history', {
      query,
      severity,
      resolved,
    });
  },
};
