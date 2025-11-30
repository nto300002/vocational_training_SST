'use client';

import { useState } from 'react';
import { SessionEvaluation } from '@/backend/types';

interface EvaluationResultProps {
  evaluation: SessionEvaluation;
  onNewSession: () => void;
}

export function EvaluationResult({ evaluation, onNewSession }: EvaluationResultProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    return '💪';
  };

  // 評価結果をテキスト形式でフォーマット
  const formatEvaluationText = () => {
    let text = `📊 評価結果\n\n`;
    text += `総合スコア: ${evaluation.overallScore}/100\n\n`;

    text += `📈 項目別評価\n`;
    evaluation.results.forEach((result) => {
      text += `\n${result.criteriaName}: ${result.score}点\n`;
      text += `フィードバック: ${result.feedback}\n`;
      if (result.examples && result.examples.length > 0) {
        text += `具体例:\n`;
        result.examples.forEach((example) => {
          text += `  - ${example}\n`;
        });
      }
    });

    if (evaluation.strengths && evaluation.strengths.length > 0) {
      text += `\n✅ 良かった点\n`;
      evaluation.strengths.forEach((strength) => {
        text += `  - ${strength}\n`;
      });
    }

    if (evaluation.improvements && evaluation.improvements.length > 0) {
      text += `\n📝 改善点\n`;
      evaluation.improvements.forEach((improvement) => {
        text += `  - ${improvement}\n`;
      });
    }

    if (evaluation.recommendations && evaluation.recommendations.length > 0) {
      text += `\n💡 次回へのアドバイス\n`;
      evaluation.recommendations.forEach((rec) => {
        text += `  - ${rec}\n`;
      });
    }

    return text;
  };

  // クリップボードにコピー
  const copyToClipboard = async () => {
    try {
      const text = formatEvaluationText();
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // CSV形式でダウンロード
  const downloadAsCSV = () => {
    let csv = '\uFEFF'; // BOM for UTF-8
    csv += '評価項目,スコア,フィードバック,具体例\n';
    csv += `総合スコア,${evaluation.overallScore},,\n`;

    evaluation.results.forEach((result) => {
      const examples = result.examples ? result.examples.join('；') : '';
      csv += `${result.criteriaName},${result.score},"${result.feedback}","${examples}"\n`;
    });

    csv += '\n良かった点,,,\n';
    if (evaluation.strengths) {
      evaluation.strengths.forEach((strength) => {
        csv += `,"${strength}",,\n`;
      });
    }

    csv += '\n改善点,,,\n';
    if (evaluation.improvements) {
      evaluation.improvements.forEach((improvement) => {
        csv += `,"${improvement}",,\n`;
      });
    }

    csv += '\n次回へのアドバイス,,,\n';
    if (evaluation.recommendations) {
      evaluation.recommendations.forEach((rec) => {
        csv += `,"${rec}",,\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

    link.setAttribute('href', url);
    link.setAttribute('download', `評価結果_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
      {/* Overall Score */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 評価結果</h2>
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="text-center">
            <span className="text-4xl font-bold text-white">
              {evaluation.overallScore}
            </span>
            <span className="text-white text-lg">/100</span>
          </div>
        </div>
        <p className="mt-3 text-lg font-medium text-gray-600">
          {getScoreEmoji(evaluation.overallScore)}{' '}
          {evaluation.overallScore >= 80
            ? '素晴らしい！'
            : evaluation.overallScore >= 60
            ? '良い調子です！'
            : 'さらに練習しましょう！'}
        </p>
      </div>

      {/* Criteria Scores */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 項目別評価</h3>
        <div className="space-y-4">
          {evaluation.results.map((result) => (
            <div key={result.criteriaType} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">
                  {result.criteriaName}
                </span>
                <span className={`text-xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}点
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    result.score >= 80
                      ? 'bg-green-500'
                      : result.score >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{result.feedback}</p>
              {result.examples && result.examples.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">具体例:</p>
                  <ul className="text-xs text-gray-500 list-disc list-inside">
                    {result.examples.map((example, idx) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {evaluation.strengths && evaluation.strengths.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">✅ 良かった点</h3>
          <ul className="space-y-2">
            {evaluation.strengths.map((strength, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 bg-green-50 rounded-lg p-3"
              >
                <span className="text-green-500 mt-0.5">●</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {evaluation.improvements && evaluation.improvements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📝 改善点</h3>
          <ul className="space-y-2">
            {evaluation.improvements.map((improvement, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 bg-yellow-50 rounded-lg p-3"
              >
                <span className="text-yellow-500 mt-0.5">●</span>
                <span className="text-gray-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {evaluation.recommendations && evaluation.recommendations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-3">💡 次回へのアドバイス</h3>
          <ul className="space-y-2">
            {evaluation.recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 bg-blue-50 rounded-lg p-3"
              >
                <span className="text-blue-500 mt-0.5">●</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Export Buttons */}
      <div className="mb-4 flex gap-3">
        <button
          onClick={copyToClipboard}
          className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
        >
          {copySuccess ? (
            <>
              <span>✓</span>
              <span>コピーしました！</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>テキストをコピー</span>
            </>
          )}
        </button>
        <button
          onClick={downloadAsCSV}
          className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
        >
          <span>📥</span>
          <span>CSV保存</span>
        </button>
      </div>

      {/* New Session Button */}
      <button
        onClick={onNewSession}
        className="w-full py-3 px-4 rounded-lg font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all"
      >
        新しいトレーニングを始める
      </button>
    </div>
  );
}
