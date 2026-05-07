/**
 * Claude API에 메시지를 보내고 응답 텍스트를 반환
 * 사용자가 입력한 API 키를 직접 받아서 사용 (서버 불필요)
 *
 * @param {string} apiKey       - 사용자 Anthropic API 키
 * @param {string} systemPrompt - 캐릭터 system prompt
 * @param {Array}  history      - [{ role: "user"|"assistant", content: string }]
 * @returns {Promise<string>}   - 모델 응답 텍스트
 */
export async function sendMessageToAPI(apiKey, systemPrompt, history) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      system: systemPrompt,
      messages: history,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "응답을 받지 못했어요.";
}
