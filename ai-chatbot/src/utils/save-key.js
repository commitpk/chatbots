/**
 * POST /api/save-key
 * 봇 제작자 API 키를 암호화해서 DB에 저장
 * body: { chatbotId, apiKey, accessToken }
 */
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 암호화 키는 Vercel 환경변수에서 (32바이트 hex 문자열)
const ENCRYPT_KEY = process.env.ENCRYPTION_KEY;

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPT_KEY, "hex");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { chatbotId, apiKey, accessToken } = req.body;
  if (!chatbotId || !apiKey || !accessToken) {
    return res.status(400).json({ error: "필수 값 누락" });
  }

  // 유저 인증 확인
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
  if (authError || !user) return res.status(401).json({ error: "인증 실패" });

  // 본인 봇인지 확인
  const { data: bot } = await supabaseAdmin
    .from("chatbots")
    .select("user_id")
    .eq("id", chatbotId)
    .single();

  if (!bot || bot.user_id !== user.id) {
    return res.status(403).json({ error: "권한 없음" });
  }

  // 암호화 후 저장
  const encryptedKey = encrypt(apiKey);
  const { error } = await supabaseAdmin
    .from("bot_api_keys")
    .upsert({ chatbot_id: chatbotId, encrypted_key: encryptedKey });

  if (error) return res.status(500).json({ error: "키 저장 실패: " + error.message });

  res.status(200).json({ ok: true });
}
