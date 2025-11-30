// シナリオカテゴリ
export type ScenarioCategory = 
  | 'requirement_confirmation'      // 要件確認
  | 'technical_translation'         // 技術と非技術の翻訳
  | 'ambiguity_structuring'        // 曖昧さの構造化
  | 'responsibility_clarification' // 責任範囲の明文化
  | 'consensus_building';          // 合意形成

export const SCENARIO_CATEGORIES: Record<ScenarioCategory, { name: string; nameJa: string; description: string }> = {
  requirement_confirmation: {
    name: 'Requirement Confirmation',
    nameJa: '要件確認',
    description: 'クライアントの要望を正確に把握し、具体的な要件に落とし込む練習',
  },
  technical_translation: {
    name: 'Technical Translation',
    nameJa: '技術と非技術の翻訳',
    description: '技術的な内容を非エンジニアに分かりやすく説明する、または非技術的な要望を技術要件に変換する練習',
  },
  ambiguity_structuring: {
    name: 'Ambiguity Structuring',
    nameJa: '曖昧さの構造化',
    description: '曖昧な要望から具体的な仕様を引き出し、構造化する練習',
  },
  responsibility_clarification: {
    name: 'Responsibility Clarification',
    nameJa: '責任範囲の明文化',
    description: 'プロジェクトにおける責任範囲を明確にし、文書化する練習',
  },
  consensus_building: {
    name: 'Consensus Building',
    nameJa: '合意形成',
    description: 'クライアントとの合意を形成し、文書で確認する練習',
  },
};

// メッセージ
export interface Message {
  id: string;
  role: 'user' | 'client' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intentDetected?: string;
  };
}

// セッション状態
export interface SessionState {
  sessionId: string;
  scenarioId: string;
  scenario: ScenarioInfo;
  messages: Message[];
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
}

// シナリオ情報
export interface ScenarioInfo {
  id: string;
  title: string;
  description: string;
  category: ScenarioCategory;
  difficulty: number;
  clientPersona: string;
  projectContext: string;
}

// 評価結果
export interface EvaluationResult {
  criteriaType: string;
  criteriaName: string;
  score: number;
  feedback: string;
  examples: string[];
}

// セッション評価
export interface SessionEvaluation {
  sessionId: string;
  overallScore: number;
  results: EvaluationResult[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

// APIレスポンス
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// クライアントレスポンス（AI生成）
export interface ClientResponse {
  message: string;
  emotion: 'neutral' | 'satisfied' | 'confused' | 'frustrated' | 'pleased';
  hints?: string[];
}
