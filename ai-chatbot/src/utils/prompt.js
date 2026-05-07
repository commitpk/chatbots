/**
 * 캐릭터 전체 설정 → Claude system prompt 변환
 */
export function buildSystemPrompt(c) {
  const lines = [];

  lines.push(`당신은 지금부터 "${c.name}"${c.alias ? ` (애칭: ${c.alias})` : ""} 으로서 역할극을 합니다.`);
  lines.push(`절대로 AI임을 밝히거나 캐릭터에서 벗어나지 마세요.`);
  lines.push(``);

  // ── 캐릭터 ──
  lines.push(`## 캐릭터 정보`);
  if (c.source)      lines.push(`- 출처: ${c.source}`);
  if (c.appearance)  lines.push(`- 외형: ${c.appearance}`);
  if (c.personalityKeywords) lines.push(`- 성격 키워드: ${c.personalityKeywords}`);
  if (c.personalityDesc)     lines.push(`- 성격 상세:\n${c.personalityDesc}`);
  if (c.background)          lines.push(`- 배경/과거사:\n${c.background}`);
  lines.push(``);

  // ── 말투 ──
  lines.push(`## 말투 규칙`);
  if (c.speechLevel) lines.push(`- 존댓말/반말: ${c.speechLevel}`);
  if (c.userTitle)   lines.push(`- 상대 호칭: ${c.userTitle}`);
  if (c.endings)     lines.push(`- 자주 쓰는 어미: ${c.endings}`);
  if (c.habits)      lines.push(`- 말버릇/추임새: ${c.habits}`);
  if (c.forbidden)   lines.push(`- 절대 쓰지 않는 표현: ${c.forbidden}`);
  lines.push(``);

  // ── 대사 샘플 ──
  const samples = [
    ["평범한 인사/일상", c.sampleGreeting],
    ["감동/따뜻한 순간", c.sampleWarm],
    ["당황/곤란한 순간", c.sampleFlustered],
    ["화남/단호한 순간", c.sampleAngry],
    ["취약한 순간",      c.sampleVulnerable],
  ].filter(([, v]) => v);

  if (samples.length > 0) {
    lines.push(`## 대사 샘플 (이 톤과 문체를 반드시 따르세요)`);
    samples.forEach(([label, text]) => lines.push(`[${label}]\n${text}`));
    lines.push(``);
  }

  // ── 세계관 ──
  lines.push(`## 세계관 지식 범위`);
  if (c.knowledgeKnows) lines.push(`- 알고 있는 것: ${c.knowledgeKnows}`);
  if (c.knowledgeNot)   lines.push(`- 모르는 것 (말하면 안 됨): ${c.knowledgeNot}`);
  if (c.sensitiveTopic) lines.push(`- 민감한 주제: ${c.sensitiveTopic}`);
  lines.push(``);

  // ── 모드 ──
  lines.push(`## 역할극 모드`);
  if (c.userPosition)  lines.push(`- 유저 포지션: ${c.userPosition}`);
  if (c.charViewUser)  lines.push(`- 유저를 바라보는 시선: ${c.charViewUser}`);
  if (c.defaultMood)   lines.push(`- 기본 분위기: ${c.defaultMood}`);
  if (c.userCallName)  lines.push(`- 유저 호칭: ${c.userCallName}`);
  lines.push(``);

  lines.push(`## 중요 지침`);
  lines.push(`- 항상 캐릭터의 관점과 말투로만 대답하세요.`);
  lines.push(`- 대사 샘플의 문체와 어미를 최대한 그대로 유지하세요.`);
  lines.push(`- 답변이 너무 길어지지 않게, 자연스러운 대화 흐름을 유지하세요.`);
  lines.push(`- 금지 표현은 어떤 상황에서도 사용하지 마세요.`);

  return lines.join("\n");
}
