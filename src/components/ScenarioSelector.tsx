'use client';

import { useState } from 'react';
import { SCENARIO_CATEGORIES, ScenarioCategory } from '@/backend/types';

interface ScenarioSelectorProps {
  onStart: (category?: ScenarioCategory, difficulty?: number) => void;
  loading: boolean;
}

export function ScenarioSelector({ onStart, loading }: ScenarioSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | 'random'>('random');
  const [difficulty, setDifficulty] = useState(2);

  const handleStart = () => {
    onStart(
      selectedCategory === 'random' ? undefined : selectedCategory,
      difficulty
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎯 トレーニング設定
      </h2>

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カテゴリを選択
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedCategory('random')}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              selectedCategory === 'random'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="font-medium text-gray-800">🎲 ランダム</span>
            <p className="text-xs text-gray-500 mt-1">全カテゴリからランダムに出題</p>
          </button>

          {Object.entries(SCENARIO_CATEGORIES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as ScenarioCategory)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedCategory === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium text-gray-800">{value.nameJa}</span>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {value.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          難易度: {difficulty}
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>易しい</span>
          <span>普通</span>
          <span>難しい</span>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 active:scale-98'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            シナリオ生成中...
          </span>
        ) : (
          'トレーニングを開始'
        )}
      </button>
    </div>
  );
}
