import { NextRequest, NextResponse } from 'next/server';
import { evaluateSession } from '@/backend/services/ai';
import { Message, ScenarioInfo } from '@/backend/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, scenario, messages } = body as {
      sessionId: string;
      scenario: ScenarioInfo;
      messages: Message[];
    };

    if (!scenario || !messages || messages.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: '評価には十分な会話履歴が必要です',
        },
        { status: 400 }
      );
    }

    // セッションを評価
    const evaluation = await evaluateSession(scenario, messages);
    evaluation.sessionId = sessionId;

    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    console.error('Error evaluating session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'セッションの評価に失敗しました',
      },
      { status: 500 }
    );
  }
}
