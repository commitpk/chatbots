/**
 * 한국어 받침 유무에 따라 조사를 자동 선택
 *
 * 원리: 한글 유니코드 = 가(0xAC00) + (초성 * 21 + 중성) * 28 + 종성
 *       종성 인덱스가 0이면 받침 없음, 1 이상이면 받침 있음
 */

/**
 * 마지막 글자의 받침 여부 반환
 * @param {string} word
 * @returns {boolean} 받침 있으면 true
 */
function hasFinalConsonant(word) {
  if (!word) return false;
  const last = word[word.length - 1];
  const code = last.charCodeAt(0);

  // 한글 범위 (가 ~ 힣)
  if (code < 0xac00 || code > 0xd7a3) {
    // 한글이 아닌 경우 (영문, 숫자 등) — 숫자별 예외 처리
    const numMap = { "0": false, "1": true, "2": false, "3": true, "4": false,
                     "5": true, "6": false, "7": true, "8": false, "9": true };
    return numMap[last] ?? false;
  }

  return (code - 0xac00) % 28 !== 0;
}

/**
 * 이/가 조사
 * @param {string} word
 * @returns {"이" | "가"}
 */
export function josa이가(word) {
  return hasFinalConsonant(word) ? "이" : "가";
}

/**
 * 은/는 조사
 * @param {string} word
 * @returns {"은" | "는"}
 */
export function josa은는(word) {
  return hasFinalConsonant(word) ? "은" : "는";
}

/**
 * 을/를 조사
 * @param {string} word
 * @returns {"을" | "를"}
 */
export function josa을를(word) {
  return hasFinalConsonant(word) ? "을" : "를";
}

/**
 * 이야/야 조사 (구어체 호칭 뒤)
 * @param {string} word
 * @returns {"이야" | "야"}
 */
export function josa이야야(word) {
  return hasFinalConsonant(word) ? "이야" : "야";
}

/**
 * 이에요/예요 조사
 * @param {string} word
 * @returns {"이에요" | "예요"}
 */
export function josa이에요예요(word) {
  return hasFinalConsonant(word) ? "이에요" : "예요";
}

/**
 * 과/와 조사
 * @param {string} word
 * @returns {"과" | "와"}
 */
export function josa과와(word) {
  return hasFinalConsonant(word) ? "과" : "와";
}

/**
 * (으)로 조사
 * @param {string} word
 * @returns {"으로" | "로"}
 */
export function josa으로(word) {
  // 받침이 'ㄹ'인 경우(종성 인덱스 8)도 "로"
  if (!word) return "로";
  const code = word[word.length - 1].charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return "로";
  const jongseong = (code - 0xac00) % 28;
  return jongseong === 0 || jongseong === 8 ? "로" : "으로";
}
