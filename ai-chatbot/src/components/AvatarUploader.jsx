import { useState, useRef } from "react";
import { supabase } from "../utils/supabase";

export default function AvatarUploader({ avatarUrl, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 검증
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("2MB 이하 이미지만 가능해요.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      onUpload(data.publicUrl);
    } catch (e) {
      setError("업로드 실패: " + e.message);
    } finally {
      setUploading(false);
      // input 초기화 (같은 파일 재선택 가능하게)
      inputRef.current.value = "";
    }
  };

  return (
    <div className="avatar-uploader">
      {/* 미리보기 */}
      <div
        className="avatar-preview"
        onClick={() => !uploading && inputRef.current.click()}
        title="클릭해서 이미지 변경"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="캐릭터 아바타" className="avatar-img" />
        ) : (
          <div className="avatar-placeholder">
            <span className="avatar-icon">🖼️</span>
            <span className="avatar-hint">이미지 선택</span>
          </div>
        )}

        {/* 업로드 중 오버레이 */}
        {uploading && (
          <div className="avatar-uploading">
            <span>업로드 중...</span>
          </div>
        )}

        {/* 호버 오버레이 */}
        {!uploading && avatarUrl && (
          <div className="avatar-hover-overlay">
            <span>변경</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {error && <p className="avatar-error">{error}</p>}

      <p className="avatar-guide">JPG, PNG, GIF · 최대 2MB</p>
    </div>
  );
}
