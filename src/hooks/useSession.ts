import { useState, useCallback } from 'react';
import { Message, ScenarioInfo, SessionEvaluation, ScenarioCategory } from '@/backend/types';

interface SessionState {
  sessionId: string;
  scenario: ScenarioInfo & { categoryName: string };
  messages: Message[];
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
}

export function useSession() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<SessionEvaluation | null>(null);

  // 新しいセッションを開始
  const startSession = useCallback(async (category?: ScenarioCategory, difficulty?: number) => {
    setLoading(true);
    setError(null);
    setEvaluation(null);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, difficulty }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setSession(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セッションの開始に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  // メッセージを送信
  const sendMessage = useCallback(async (message: string) => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: session.scenario,
          messages: session.messages,
          userMessage: message,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            data.data.userMessage,
            data.data.clientMessage,
          ],
        };
      });

      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メッセージの送信に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [session]);

  // セッションを評価
  const evaluateCurrentSession = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          scenario: session.scenario,
          messages: session.messages,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setEvaluation(data.data);
      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'completed',
        };
      });

      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '評価に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [session]);

  // セッションをリセット
  const resetSession = useCallback(() => {
    setSession(null);
    setEvaluation(null);
    setError(null);
  }, []);

  return {
    session,
    loading,
    error,
    evaluation,
    startSession,
    sendMessage,
    evaluateCurrentSession,
    resetSession,
  };
}
