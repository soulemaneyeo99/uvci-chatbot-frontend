'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@/types';
import { chatAPI } from '@/lib/api';
import { speechService } from '@/lib/speech';
import { MarkdownMessage } from '@/components/chat/MarkdownMessage';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  History, 
  Settings, 
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioSupport, setAudioSupport] = useState({ recognition: false, synthesis: false });
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const support = speechService.isSupported();
    setAudioSupport(support);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    const tempMessageId = `temp-${Date.now()}`;
    setStreamingMessageId(tempMessageId);
    setStreamingContent('');

    // Variable locale pour accumuler le contenu
    let accumulatedContent = '';

    try {
      await chatAPI.sendMessageStream(
        {
          message: currentMessage,
          conversation_id: conversationId,
        },
        // onChunk
        (chunk: string) => {
          accumulatedContent += chunk;
          setStreamingContent(accumulatedContent);
        },
        // onComplete
        (metadata: { conversation_id: string; message_id: string; timestamp: string }) => {
          if (!conversationId) {
            setConversationId(metadata.conversation_id);
          }

          const assistantMessage: Message = {
            id: metadata.message_id,
            role: 'assistant',
            content: accumulatedContent, // Utiliser la variable locale
            timestamp: new Date(metadata.timestamp),
            sources: [],
          };

          setMessages(prev => [...prev, assistantMessage]);
          setStreamingMessageId(null);
          setStreamingContent('');
          setIsLoading(false);
        },
        // onError
        (error: string) => {
          console.error('Erreur streaming:', error);
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: '⚠️ **Erreur de connexion**\n\nImpossible de contacter le serveur.\n\n📧 Contact : courrier@uvci.edu.ci',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
          setStreamingMessageId(null);
          setStreamingContent('');
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⚠️ **Erreur de connexion**\n\nVeuillez réessayer.\n\n📧 Contact : courrier@uvci.edu.ci',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreamingMessageId(null);
      setStreamingContent('');
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!audioSupport.recognition) {
      alert('❌ La reconnaissance vocale n\'est pas supportée.\nUtilisez Chrome, Edge ou Safari.');
      return;
    }

    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      speechService.startListening(
        (transcript) => {
          setInputMessage(prev => prev + ' ' + transcript);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  const handleSpeak = (text: string) => {
    if (!audioSupport.synthesis) {
      alert('❌ La synthèse vocale n\'est pas supportée.');
      return;
    }

    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      speechService.speak(text);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 10000);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(undefined);
    setStreamingMessageId(null);
    setStreamingContent('');
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleSuggestionClick = (text: string) => {
    setInputMessage(text);
  };

  const suggestions = [
    { emoji: '��', text: 'Comment s\'inscrire à l\'UVCI ?' },
    { emoji: '📚', text: 'Quels sont les programmes disponibles ?' },
    { emoji: '💰', text: 'Quels sont les frais d\'inscription ?' },
    { emoji: '��', text: 'Quel est le calendrier académique ?' },
    { emoji: '✉️', text: 'Comment contacter l\'administration ?' },
    { emoji: '💼', text: 'Quels sont les débouchés professionnels ?' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-uvci-purple to-uvci-green rounded-2xl blur-md opacity-40"></div>
                <div className="relative bg-gradient-to-r from-uvci-purple to-uvci-purpleLight p-3 rounded-2xl shadow-lg">
                  <GraduationCap className="text-white" size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-uvci-purple to-uvci-purpleLight bg-clip-text text-transparent">
                  Assistant UVCI
                </h1>
                <p className="text-xs text-gray-500">
                  Votre assistant intelligent
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleNewChat} 
                className="btn btn-secondary text-sm"
              >
                <MessageSquare size={18} />
                <span className="hidden sm:inline">Nouveau</span>
              </button>
              
              <Link href="/history">
                <button className="btn btn-secondary text-sm">
                  <History size={18} />
                  <span className="hidden md:inline">Historique</span>
                </button>
              </Link>

              <Link href="/admin">
                <button className="btn btn-secondary text-sm">
                  <Settings size={18} />
                  <span className="hidden md:inline">Admin</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 && !streamingMessageId ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-280px)]">
              <div className="text-center mb-12">
                <div className="inline-block mb-6 animate-bounce-slow">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-uvci-purple to-uvci-green rounded-full blur-2xl opacity-30"></div>
                    <div className="relative text-7xl">🎓</div>
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-uvci-purple via-uvci-purpleLight to-uvci-green bg-clip-text text-transparent">
                  Bienvenue sur l'Assistant UVCI
                </h2>
                
                <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Posez toutes vos questions sur l'<span className="font-semibold text-uvci-purple">Université Virtuelle de Côte d'Ivoire</span>
                </p>
              </div>

              <div className="w-full max-w-3xl">
                <p className="text-center text-sm font-medium text-gray-500 mb-4">
                  Questions fréquentes
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {suggestions.map((sugg, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(sugg.text)}
                      className="suggestion-card group"
                    >
                      <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform duration-300">{sugg.emoji}</span>
                      <span className="text-sm text-gray-700 font-medium leading-tight">{sugg.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="space-y-6 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-purple-100">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-uvci-purple to-uvci-green flex items-center justify-center shadow-md">
                          <GraduationCap className="text-white" size={16} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-semibold text-uvci-purple">
                          Assistant UVCI
                        </span>
                      </div>
                    )}
                    
                    <MarkdownMessage 
                      content={message.content} 
                      isUser={message.role === 'user'}
                    />

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-purple-100">
                        <p className="text-xs font-semibold mb-2 text-uvci-purple">
                          📚 Sources
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {message.sources.map((source, idx) => (
                            <span key={idx} className="source-badge text-xs">
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-100">
                      <span className={`text-xs ${message.role === 'user' ? 'text-purple-100' : 'text-gray-400'}`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {message.role === 'assistant' && (
                        <button
                          onClick={() => handleSpeak(message.content)}
                          className="text-gray-400 hover:text-uvci-purple transition-colors p-1.5 rounded-xl hover:bg-purple-50"
                        >
                          {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Message en streaming */}
              {streamingMessageId && (
                <div className="flex justify-start">
                  <div className="chat-message-assistant max-w-[85%]">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-purple-100">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-uvci-purple to-uvci-green flex items-center justify-center shadow-md animate-pulse">
                        <GraduationCap className="text-white" size={16} />
                      </div>
                      <span className="text-xs font-semibold text-uvci-purple">
                        Assistant UVCI
                      </span>
                    </div>
                    
                    <MarkdownMessage 
                      content={streamingContent} 
                      isUser={false}
                    />
                  </div>
                </div>
              )}

              {isLoading && !streamingMessageId && (
                <div className="flex justify-start">
                  <div className="chat-message-assistant max-w-[85%]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-uvci-purple to-uvci-green flex items-center justify-center animate-pulse">
                        <GraduationCap className="text-white" size={16} />
                      </div>
                      <span className="text-xs font-semibold text-uvci-purple">Assistant UVCI</span>
                    </div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`btn-icon ${isRecording ? 'recording-pulse bg-red-500' : ''}`}
              disabled={!audioSupport.recognition || isLoading}
            >
              {isRecording ? (
                <MicOff size={20} className="text-white" />
              ) : (
                <Mic size={20} />
              )}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Posez votre question sur l'UVCI..."
              disabled={isLoading}
              className="input-modern flex-1"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  <span className="hidden sm:inline">Envoyer</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400">
              <a href="https://uvci.online" target="_blank" rel="noopener noreferrer" className="hover:text-uvci-purple font-medium transition-colors">
                uvci.online
              </a>
              {' • '}
              <span>Assistant intelligent</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
