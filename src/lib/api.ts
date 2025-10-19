// lib/api.ts

import axios from 'axios';
import { ChatRequest, ChatResponse, Conversation, Document } from '@/types';

// ✅ Nettoyer l'URL pour éviter les doubles slashes
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  /**
   * 🚀 NOUVELLE MÉTHODE - Envoie un message avec streaming en temps réel
   * Utilise Server-Sent Events (SSE) pour recevoir les chunks progressivement
   */
  sendMessageStream: async (
    data: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: (metadata: { conversation_id: string; message_id: string; timestamp: string }) => void,
    onError: (error: string) => void
  ): Promise<void> => {
    try {
      // Nettoyer l'URL pour éviter les doubles slashes
      const cleanUrl = `${API_URL.replace(/\/$/, '')}/api/chat/stream`;
      const response = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let conversationId = data.conversation_id;
      let messageId = '';
      let timestamp = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // Décoder le chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Parser les Server-Sent Events (format: "data: {...}\n\n")
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              
              // Gérer les différents types de messages
              if (jsonData.type === 'conversation_id') {
                conversationId = jsonData.conversation_id;
              } else if (jsonData.type === 'chunk') {
                // ✨ Envoyer le chunk au frontend pour affichage progressif
                onChunk(jsonData.content);
              } else if (jsonData.type === 'done') {
                messageId = jsonData.message_id;
                timestamp = jsonData.timestamp;
              } else if (jsonData.type === 'error') {
                onError(jsonData.message);
                return;
              }
            } catch (e) {
              console.error('Error parsing SSE:', e);
            }
          }
        }
      }

      // Appeler onComplete avec les métadonnées
      if (conversationId && messageId) {
        onComplete({
          conversation_id: conversationId,
          message_id: messageId,
          timestamp: timestamp,
        });
      }

    } catch (error) {
      console.error('Streaming error:', error);
      onError(error instanceof Error ? error.message : 'Unknown error');
    }
  },

  /**
   * 📦 ANCIENNE MÉTHODE - Envoie un message sans streaming (pour compatibilité)
   */
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/api/chat/', data);
    return response.data;
  },

  /**
   * 💡 Récupère les suggestions de questions
   */
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
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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