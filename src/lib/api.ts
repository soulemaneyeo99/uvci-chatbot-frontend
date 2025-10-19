import axios from 'axios';
import { ChatRequest, ChatResponse, Conversation, Document } from '@/types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 secondes
});

export const chatAPI = {
  /**
   * Envoie un message avec streaming + fallback automatique
   */
  sendMessageStream: async (
    data: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: (metadata: { conversation_id: string; message_id: string; timestamp: string }) => void,
    onError: (error: string) => void
  ): Promise<void> => {
    try {
      const cleanUrl = `${API_URL.replace(/\/$/, '')}/api/chat/stream`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s timeout
      
      const response = await fetch(cleanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let conversationId = data.conversation_id;
      let messageId = '';
      let timestamp = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              
              if (jsonData.type === 'conversation_id') {
                conversationId = jsonData.conversation_id;
              } else if (jsonData.type === 'chunk') {
                onChunk(jsonData.content);
              } else if (jsonData.type === 'done') {
                messageId = jsonData.message_id;
                timestamp = jsonData.timestamp;
              } else if (jsonData.type === 'error') {
                onError(jsonData.message);
                return;
              }
            } catch (e) {
              // Ignorer les lignes keep-alive
            }
          }
        }
      }

      if (conversationId && messageId) {
        onComplete({ conversation_id: conversationId, message_id: messageId, timestamp });
      }

    } catch (error) {
      console.warn('Streaming échoué, fallback sur méthode classique...', error);
      
      // FALLBACK : Utiliser l'endpoint classique
      try {
        const response = await chatAPI.sendMessage(data);
        
        // Simuler le streaming progressif
        const words = response.response.split(' ');
        for (let i = 0; i < words.length; i++) {
          onChunk(words[i] + ' ');
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        
        onComplete({
          conversation_id: response.conversation_id,
          message_id: response.message_id,
          timestamp: response.timestamp.toString(),
        });
      } catch (fallbackError) {
        onError('Impossible de se connecter au serveur');
      }
    }
  },

  /**
   * Endpoint classique sans streaming
   */
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/api/chat/', data);
    return response.data;
  },

  getSuggestions: async (): Promise<string[]> => {
    const response = await api.get('/api/chat/suggestions');
    return response.data.suggestions;
  },
};

export const historyAPI = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/api/history/conversations');
    return response.data;
  },

  getConversationDetail: async (conversationId: string): Promise<Conversation> => {
    const response = await api.get(`/api/history/conversations/${conversationId}`);
    return response.data;
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await api.delete(`/api/history/conversations/${conversationId}`);
  },
};

export const documentsAPI = {
  uploadDocument: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getDocuments: async (): Promise<Document[]> => {
    const response = await api.get('/api/documents/');
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<void> => {
    await api.delete(`/api/documents/${documentId}`);
  },

  reindexDocument: async (documentId: string): Promise<void> => {
    await api.post(`/api/documents/${documentId}/reindex`);
  },
};

export default api;
