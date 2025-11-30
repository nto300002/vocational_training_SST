import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, ClientResponse, SessionEvaluation, ScenarioInfo } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// クライアント役としてのレスポンス生成
export async function generateClientResponse(
  scenario: ScenarioInfo,
  messages: Message[],
): Promise<ClientResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  const conversationHistory = messages
    .map((m) => `${m.role === 'user' ? '開発者' : 'クライアント'}: ${m.content}`)
    .join('\n');

  const prompt = `あなたはWeb受託開発のクライアント役です。以下の設定に基づいてロールプレイしてください。

【クライアントのペルソナ】
${scenario.clientPersona}

【プロジェクト背景】
${scenario.projectContext}

【これまでの会話】
${conversationHistory}

【指示】
- クライアントとして自然に返答してください
- 必要に応じて曖昧な返答をしたり、追加の要望を出したりしてください
- ただし、開発者が適切な質問をした場合は具体的に答えてください
- 感情(emotion)は会話の流れに応じて設定してください

【出力形式】
以下のJSON形式で返答してください：
{
  "message": "クライアントとしての返答",
  "emotion": "neutral" | "satisfied" | "confused" | "frustrated" | "pleased",
  "hints": ["開発者へのヒント（省略可）"]
}

JSON形式のみで返答し、他のテキストは含めないでください。`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // JSONを抽出（コードブロックがある場合も対応）
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    return JSON.parse(jsonMatch[0]) as ClientResponse;
  } catch (error) {
    console.error('Error generating client response:', error);
    return {
      message: 'すみません、もう少し詳しく説明していただけますか？',
      emotion: 'confused',
    };
  }
}

// セッションの評価
export async function evaluateSession(
  scenario: ScenarioInfo,
  messages: Message[],
): Promise<SessionEvaluation> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  const conversationHistory = messages
    .map((m) => {
      const role = m.role === 'user' ? '開発者' : m.role === 'client' ? 'クライアント' : 'システム';
      return `${role}: ${m.content}`;
    })
    .join('\n');

  const prompt = `あなたはWeb受託開発のコミュニケーションスキルを評価する専門家です。
以下の会話を評価し、開発者のコミュニケーション能力を採点してください。

【シナリオ】
タイトル: ${scenario.title}
説明: ${scenario.description}
クライアントペルソナ: ${scenario.clientPersona}
プロジェクト背景: ${scenario.projectContext}

【会話履歴】
${conversationHistory}

【評価基準】
以下の5つの観点から0-100点で評価してください：

1. 要件分解・具体化 (requirement_decomposition)
   - 要件を適切に分解できているか
   - 具体的な質問で詳細を引き出せているか

2. 技術と非技術の翻訳 (technical_translation)
   - 技術的な内容を分かりやすく説明できているか
   - クライアントの言葉を技術要件に変換できているか

3. 曖昧さの構造化 (ambiguity_structuring)
   - 曖昧な要望を明確化できているか
   - 選択肢を提示して確認できているか

4. 責任範囲の明文化 (responsibility_clarification)
   - 誰が何を担当するか明確にできているか
   - スコープを適切に管理できているか

5. 合意形成 (consensus_building)
   - 合意事項を確認・文書化できているか
   - 認識のずれを防ぐ工夫ができているか

【出力形式】
以下のJSON形式で評価結果を返してください：
{
  "overallScore": 総合点(0-100),
  "results": [
    {
      "criteriaType": "評価基準の英語名",
      "criteriaName": "評価基準の日本語名",
      "score": 点数(0-100),
      "feedback": "具体的なフィードバック",
      "examples": ["会話中の良い例または改善点の例"]
    }
  ],
  "strengths": ["良かった点"],
  "improvements": ["改善点"],
  "recommendations": ["次回への具体的なアドバイス"]
}

JSON形式のみで返答し、他のテキストは含めないでください。`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const evaluation = JSON.parse(jsonMatch[0]);
    return {
      sessionId: '',
      ...evaluation,
    } as SessionEvaluation;
  } catch (error) {
    console.error('Error evaluating session:', error);
    throw new Error('Failed to evaluate session');
  }
}

// クライアントの初期メッセージを生成
export async function generateInitialClientMessage(
  scenario: ScenarioInfo,
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  const prompt = `あなたはWeb受託開発のクライアント役です。以下の設定に基づいて、開発者に対する最初の相談・要望を述べてください。

【クライアントのペルソナ】
${scenario.clientPersona}

【プロジェクト背景】
${scenario.projectContext}

【指示】
- これからプロジェクトについて開発者と話し合います
- クライアントとして、プロジェクトの要望や課題を自然に伝えてください
- 最初の段階では具体的すぎず、ある程度曖昧な表現を含めてください
- 開発者が質問したくなるような内容にしてください
- 200文字程度で簡潔に述べてください

テキストのみで返答してください（JSON形式は不要）。`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return response.trim();
  } catch (error) {
    console.error('Error generating initial client message:', error);
    return 'よろしくお願いします。プロジェクトについてご相談したいことがあるのですが...';
  }
}

// シナリオ生成
export async function generateScenario(
  category: string,
  difficulty: number,
): Promise<{
  title: string;
  description: string;
  clientPersona: string;
  projectContext: string;
  hiddenRequirements: string[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  const categoryDescriptions: Record<string, string> = {
    requirement_confirmation: '要件確認のシナリオ。クライアントの曖昧な要望から具体的な要件を引き出す',
    technical_translation: '技術翻訳のシナリオ。技術的な内容を非エンジニアに説明する',
    ambiguity_structuring: '曖昧さの構造化シナリオ。抽象的な要望を具体化する',
    responsibility_clarification: '責任範囲の明確化シナリオ。誰が何を担当するか明確にする',
    consensus_building: '合意形成のシナリオ。クライアントとの合意を文書化する',
  };

  const prompt = `Web受託開発におけるコミュニケーション訓練用のシナリオを生成してください。

【カテゴリ】${categoryDescriptions[category] || category}
【難易度】${difficulty}/5 (1が易しい、5が難しい)

【要件】
- 日本のWeb受託開発でよくある状況を想定
- クライアントは非エンジニアの事業担当者
- リアリティのある設定にする
- 難易度に応じて複雑さを調整

【出力形式】
以下のJSON形式で返してください：
{
  "title": "シナリオタイトル（日本語、20文字以内）",
  "description": "シナリオの概要（日本語、100文字以内）",
  "clientPersona": "クライアントの人物像・性格・背景（日本語、200文字程度）",
  "projectContext": "プロジェクトの背景・状況（日本語、300文字程度）",
  "hiddenRequirements": ["開発者が引き出すべき隠れた要件のリスト"]
}

JSON形式のみで返答してください。`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating scenario:', error);
    throw new Error('Failed to generate scenario');
  }
}
