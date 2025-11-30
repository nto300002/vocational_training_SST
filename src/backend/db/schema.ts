import { pgTable, uuid, text, timestamp, integer, jsonb, boolean } from 'drizzle-orm/pg-core';

// シナリオカテゴリ
export const scenarioCategories = pgTable('scenario_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  nameJa: text('name_ja').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// シナリオテンプレート
export const scenarios = pgTable('scenarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => scenarioCategories.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  difficulty: integer('difficulty').notNull().default(1), // 1-5
  clientPersona: text('client_persona').notNull(), // クライアントのペルソナ
  projectContext: text('project_context').notNull(), // プロジェクト背景
  hiddenRequirements: jsonb('hidden_requirements').$type<string[]>(), // 隠れた要件
  evaluationCriteria: jsonb('evaluation_criteria').$type<EvaluationCriteria>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ユーザー（拡張性のため）
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// トレーニングセッション
export const trainingSessions = pgTable('training_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  scenarioId: uuid('scenario_id').references(() => scenarios.id),
  status: text('status').notNull().default('in_progress'), // in_progress, completed, abandoned
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  finalScore: integer('final_score'),
  feedback: jsonb('feedback').$type<SessionFeedback>(),
});

// 会話履歴
export const conversationMessages = pgTable('conversation_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => trainingSessions.id).notNull(),
  role: text('role').notNull(), // user, client, system
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<MessageMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 評価結果
export const evaluationResults = pgTable('evaluation_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => trainingSessions.id).notNull(),
  criteriaType: text('criteria_type').notNull(), // requirement_decomposition, sharing, alignment, etc.
  score: integer('score').notNull(), // 0-100
  feedback: text('feedback').notNull(),
  examples: jsonb('examples').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 型定義
export interface EvaluationCriteria {
  requirementDecomposition: {
    weight: number;
    checkpoints: string[];
  };
  technicalTranslation: {
    weight: number;
    checkpoints: string[];
  };
  ambiguityStructuring: {
    weight: number;
    checkpoints: string[];
  };
  responsibilityClarity: {
    weight: number;
    checkpoints: string[];
  };
  consensusBuilding: {
    weight: number;
    checkpoints: string[];
  };
}

export interface SessionFeedback {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export interface MessageMetadata {
  tokensUsed?: number;
  responseTime?: number;
  intentDetected?: string;
}
