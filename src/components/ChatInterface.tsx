'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Message, ScenarioInfo } from '@/backend/types';
import { ChatMessage } from './ChatMessage';

interface ChatInterfaceProps {
  scenario: ScenarioInfo & { categoryName: string };
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  onFinish: () => void;
  loading: boolean;
}

export function ChatInterface({
  scenario,
  messages,
  onSendMessage,
  onFinish,
  loading,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput('');
    await onSendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const userMessageCount = messages.filter((m) => m.role === 'user').length;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Scenario Header */}
      <div className="bg-white rounded-t-xl shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
              {scenario.categoryName}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              難易度: {'⭐'.repeat(scenario.difficulty)}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            メッセージ数: {userMessageCount}
          </span>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mt-2">{scenario.title}</h2>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center gap-2 bg-gray-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-gray-500 text-sm">クライアントが入力中...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-b-xl shadow-sm border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="クライアントへのメッセージを入力... (Shift+Enterで改行)"
              className="text-gray-500 w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              input.trim() && !loading
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            送信
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500">
            💡 ヒント: 具体的な質問をしてクライアントの本当の要望を引き出しましょう
          </p>
          <button
            onClick={onFinish}
            disabled={userMessageCount < 3 || loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              userMessageCount >= 3 && !loading
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {userMessageCount < 3
              ? `評価まであと${3 - userMessageCount}回の会話`
              : '会話を終了して評価'}
          </button>
        </div>
      </div>
    </div>
  );
}
