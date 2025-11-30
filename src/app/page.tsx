'use client';

import { useSession } from '@/hooks/useSession';
import { ScenarioSelector } from '@/components/ScenarioSelector';
import { ChatInterface } from '@/components/ChatInterface';
import { EvaluationResult } from '@/components/EvaluationResult';

export default function Home() {
  const {
    session,
    loading,
    error,
    evaluation,
    startSession,
    sendMessage,
    evaluateCurrentSession,
    resetSession,
  } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💬</span>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  コミュニケーションSST
                </h1>
                <p className="text-xs text-gray-500">
                  Web受託開発のコミュニケーションスキルトレーニング
                </p>
              </div>
            </div>
            {session && !evaluation && (
              <button
                onClick={resetSession}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                トレーニングを中断
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!session && !evaluation && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Web受託開発の
                <br />
                <span className="text-blue-600">コミュニケーション力</span>を
                鍛えよう
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                このアプリでは、AIがクライアント役となり、受託開発でよくあるコミュニケーション場面を
                シミュレーションできます。要件定義、技術説明、合意形成など、
                実践的なスキルを身につけましょう。
              </p>
            </div>

            {/* Key Skills */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {[
                { icon: '📋', title: '要件確認', desc: '要望を具体化する' },
                { icon: '🔄', title: '技術翻訳', desc: '非エンジニアに説明' },
                { icon: '🧩', title: '曖昧さの構造化', desc: '抽象を具体に' },
                { icon: '📝', title: '責任範囲', desc: '役割を明確に' },
                { icon: '🤝', title: '合意形成', desc: '認識を合わせる' },
              ].map((skill) => (
                <div
                  key={skill.title}
                  className="bg-white rounded-lg p-4 text-center shadow-sm"
                >
                  <span className="text-2xl">{skill.icon}</span>
                  <h3 className="font-medium text-green-800 mt-2">{skill.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{skill.desc}</p>
                </div>
              ))}
            </div>

            {/* Scenario Selector */}
            <ScenarioSelector onStart={startSession} loading={loading} />
          </div>
        )}

        {session && !evaluation && (
          <div className="h-[calc(100vh-200px)]">
            <ChatInterface
              scenario={session.scenario}
              messages={session.messages}
              onSendMessage={sendMessage}
              onFinish={evaluateCurrentSession}
              loading={loading}
            />
          </div>
        )}

        {evaluation && (
          <EvaluationResult
            evaluation={evaluation}
            onNewSession={resetSession}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-500">
            業務特化型SSTアプリ - 未経験からのトレーニング
          </p>
        </div>
      </footer>
    </div>
  );
}
