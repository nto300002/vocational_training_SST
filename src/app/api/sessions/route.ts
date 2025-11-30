import { NextRequest, NextResponse } from 'next/server';
import { generateScenario, generateInitialClientMessage } from '@/backend/services/ai';
import { SCENARIO_CATEGORIES, ScenarioCategory } from '@/backend/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, difficulty = 2 } = body as {
      category?: ScenarioCategory;
      difficulty?: number;
    };

    // カテゴリがない場合はランダムに選択
    const categories = Object.keys(SCENARIO_CATEGORIES) as ScenarioCategory[];
    const selectedCategory = category || categories[Math.floor(Math.random() * categories.length)];

    // 難易度のバリデーション
    const validDifficulty = Math.min(Math.max(difficulty, 1), 5);

    // シナリオを生成
    const generatedScenario = await generateScenario(selectedCategory, validDifficulty);

    const sessionId = uuidv4();
    const scenarioId = uuidv4();

    const scenario = {
      id: scenarioId,
      title: generatedScenario.title,
      description: generatedScenario.description,
      category: selectedCategory,
      categoryName: SCENARIO_CATEGORIES[selectedCategory].nameJa,
      difficulty: validDifficulty,
      clientPersona: generatedScenario.clientPersona,
      projectContext: generatedScenario.projectContext,
    };

    // クライアントの初期メッセージを生成
    const initialClientMessage = await generateInitialClientMessage(scenario);

    const session = {
      sessionId,
      scenario,
      messages: [
        {
          id: uuidv4(),
          role: 'system' as const,
          content: `【シナリオ開始】\n\n${generatedScenario.description}`,
          timestamp: new Date(),
        },
        {
          id: uuidv4(),
          role: 'client' as const,
          content: initialClientMessage,
          timestamp: new Date(),
        },
      ],
      status: 'in_progress' as const,
      startedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error starting session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'セッションの開始に失敗しました',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // カテゴリ一覧を返す
  const categories = Object.entries(SCENARIO_CATEGORIES).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  return NextResponse.json({
    success: true,
    data: { categories },
  });
}
