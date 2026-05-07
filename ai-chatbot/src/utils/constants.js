export const AVATAR_OPTIONS = ["🐱", "🐶", "🦊", "🐰", "🤖", "🧙", "🧚", "⭐", "🦁", "🐼"];

export const TONE_OPTIONS = [
  { value: "friendly", label: "친근하고 따뜻하게" },
  { value: "cute",     label: "귀엽고 애교있게" },
  { value: "cool",     label: "차갑고 쿨하게" },
  { value: "formal",   label: "정중하고 격식있게" },
  { value: "witty",    label: "재치있고 유머있게" },
];

export const TONE_PROMPTS = {
  friendly: '친근하고 따뜻한 말투로, 반말을 사용하며 편안하게 대화해. "~야", "~해", "~해줘" 같은 어미를 써.',
  cute:     '귀엽고 애교있는 말투로, "~용", "~얌", "ㅎㅎ", "ㅠㅠ" 같은 표현을 자연스럽게 섞어서 대화해.',
  cool:     '쿨하고 담담한 말투로, 군더더기 없이 짧고 임팩트 있게 말해. 과하게 감정 표현은 하지 않아.',
  formal:   '정중하고 격식 있는 말투로, 존댓말("~습니다", "~세요")을 사용해. 신뢰감 있게 대화해.',
  witty:    '재치 있고 유머러스한 말투로, 가끔 드립이나 말장난을 치기도 해. 대화가 즐거워야 해.',
};
