import { supabase } from "./supabase";

/** 대화 기록 불러오기 */
export async function loadHistory(chatbotId) {
  if (!chatbotId) return { history: [], messages: [] };

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return { history: [], messages: [] };

  const { data, error } = await supabase
    .from("chat_histories")
    .select("messages, history")
    .eq("user_id", userId)
    .eq("chatbot_id", chatbotId)
    .maybeSingle();

  if (error || !data) return { history: [], messages: [] };
  return { history: data.history, messages: data.messages };
}

/** 대화 기록 저장 (upsert) */
export async function saveHistory(chatbotId, history, messages) {
  if (!chatbotId) return;

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return;

  await supabase
    .from("chat_histories")
    .upsert(
      { user_id: userId, chatbot_id: chatbotId, history, messages, updated_at: new Date().toISOString() },
      { onConflict: "user_id,chatbot_id" }
    );
}

/** 대화 기록 초기화 */
export async function clearHistory(chatbotId) {
  if (!chatbotId) return;

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return;

  await supabase
    .from("chat_histories")
    .delete()
    .eq("user_id", userId)
    .eq("chatbot_id", chatbotId);
}
