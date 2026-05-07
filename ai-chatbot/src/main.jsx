import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./utils/AuthContext";
import { supabase } from "./utils/supabase";
import "./index.css";

// 이메일 인증 후 URL 해시에 토큰이 있으면 세션으로 교환하고 해시 제거
if (window.location.hash.includes("access_token")) {
  supabase.auth.getSession().then(() => {
    window.history.replaceState(null, "", window.location.pathname);
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
