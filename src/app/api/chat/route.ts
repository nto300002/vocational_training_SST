import { NextRequest, NextResponse } from 'next/server';
import { generateClientResponse } from '@/backend/services/ai';
import { Message, ScenarioInfo } from '@/backend/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenario, messages, userMessage } = body as {
      scenario: ScenarioInfo;
      messages: Message[];
      userMessage: string;
    };

    if (!scenario || !userMessage) {
      return NextResponse.json(
        {
          success: false,
          error: 'シナリオとメッセージが必要です',
        },
        { status: 400 }
      );
    }

    // ユーザーメッセージを追加した履歴を作成
    const updatedMessages: Message[] = [
      ...messages,
      {
        id: uuidv4(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ];

    // クライアントの応答を生成
    const clientResponse = await generateClientResponse(scenario, updatedMessages);

    // クライアントメッセージを作成
    const clientMessage: Message = {
      id: uuidv4(),
      role: 'client',
      content: clientResponse.message,
      timestamp: new Date(),
      metadata: {
        intentDetected: clientResponse.emotion,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        userMessage: updatedMessages[updatedMessages.length - 1],
        clientMessage,
        emotion: clientResponse.emotion,
        hints: clientResponse.hints,
      },
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'メッセージの送信に失敗しました',
      },
      { status: 500 }
    );
  }
}
