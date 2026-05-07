import { supabase } from "./supabase";

const toSnake = (obj) => ({
  name:                 obj.name,
  alias:                obj.alias,
  emoji:                obj.emoji,
  avatar_url:           obj.avatarUrl,
  source:               obj.source,
  appearance:           obj.appearance,
  personality_keywords: obj.personalityKeywords,
  personality_desc:     obj.personalityDesc,
  background:           obj.background,
  speech_level:         obj.speechLevel,
  user_title:           obj.userTitle,
  endings:              obj.endings,
  habits:               obj.habits,
  forbidden:            obj.forbidden,
  sample_greeting:      obj.sampleGreeting,
  sample_warm:          obj.sampleWarm,
  sample_flustered:     obj.sampleFlustered,
  sample_angry:         obj.sampleAngry,
  sample_vulnerable:    obj.sampleVulnerable,
  knowledge_knows:      obj.knowledgeKnows,
  knowledge_not:        obj.knowledgeNot,
  sensitive_topic:      obj.sensitiveTopic,
  user_position:        obj.userPosition,
  char_view_user:       obj.charViewUser,
  default_mood:         obj.defaultMood,
  user_call_name:       obj.userCallName,
  is_public:            obj.isPublic ?? false,
  room_password:        obj.roomPassword ?? '',
});

const toCamel = (row) => ({
  id:                   row.id,
  name:                 row.name,
  alias:                row.alias,
  emoji:                row.emoji,
  avatarUrl:            row.avatar_url,
  source:               row.source,
  appearance:           row.appearance,
  personalityKeywords:  row.personality_keywords,
  personalityDesc:      row.personality_desc,
  background:           row.background,
  speechLevel:          row.speech_level,
  userTitle:            row.user_title,
  endings:              row.endings,
  habits:               row.habits,
  forbidden:            row.forbidden,
  sampleGreeting:       row.sample_greeting,
  sampleWarm:           row.sample_warm,
  sampleFlustered:      row.sample_flustered,
  sampleAngry:          row.sample_angry,
  sampleVulnerable:     row.sample_vulnerable,
  knowledgeKnows:       row.knowledge_knows,
  knowledgeNot:         row.knowledge_not,
  sensitiveTopic:       row.sensitive_topic,
  userPosition:         row.user_position,
  charViewUser:         row.char_view_user,
  defaultMood:          row.default_mood,
  userCallName:         row.user_call_name,
  isPublic:             row.is_public,
  roomPassword:         row.room_password,
  created_at:           row.created_at,
});

export async function fetchChatbots() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("chatbots")
    .select("*")
    .eq("user_id", user.id)   // 내 것만
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toCamel);
}

export async function createChatbot(character) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("chatbots").insert({ user_id: user.id, ...toSnake(character) })
    .select().single();
  if (error) throw error;
  return toCamel(data);
}

export async function updateChatbot(id, character) {
  const { data, error } = await supabase
    .from("chatbots").update(toSnake(character)).eq("id", id)
    .select().single();
  if (error) throw error;
  return toCamel(data);
}

export async function deleteChatbot(id) {
  const { error } = await supabase.from("chatbots").delete().eq("id", id);
  if (error) throw error;
}
