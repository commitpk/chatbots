/**
 * POST /api/chat
 * 로그인한 방문자가 공개 봇과 대화할 때 제작자 키로 Claude API 호출
 * body: { chatbotId, system, messages, accessToken }
 */
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ENCRYPT_KEY = process.env.ENCRYPTION_KEY;

function decrypt(encryptedText) {
  const [ivHex, encHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const key = Buffer.from(ENCRYPT_KEY, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { chatbotId, system, messages, accessToken } = req.body;
  if (!chatbotId || !messages || !accessToken) {
    return res.status(400).json({ error: "필수 값 누락" });
  }

  // 방문자 로그인 확인
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
  if (authError || !user) return res.status(401).json({ error: "로그인이 필요해요." });

  // 봇이 공개 상태인지 확인
  const { data: bot } = await supabaseAdmin
    .from("chatbots")
    .select("is_public")
    .eq("id", chatbotId)
    .single();

  if (!bot?.is_public) return res.status(403).json({ error: "공개 봇이 아니에요." });

  // DB에서 암호화된 키 가져오기
  const { data: keyRow } = await supabaseAdmin
    .from("bot_api_keys")
    .select("encrypted_key")
    .eq("chatbot_id", chatbotId)
    .single();

  if (!keyRow) {
    return res.status(404).json({ error: "이 봇에 등록된 API 키가 없어요. 제작자에게 문의하세요." });
  }

  // 복호화
  let botApiKey;
  try {
    botApiKey = decrypt(keyRow.encrypted_key);
  } catch {
    return res.status(500).json({ error: "API 키 복호화 실패" });
  }

  // Claude API 호출
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": botApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      system,
      messages,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    return res.status(response.status).json({ error: data?.error?.message || "Claude API 오류" });
  }

  res.status(200).json(data);
}