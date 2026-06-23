import { useEffect, useState } from "react";
import {
  api,
  clearUsername,
  loadUsername,
  saveUsername,
} from "./api/client";
import { AuthPage } from "./components/AuthPage";
import { ChatTab } from "./components/ChatTab";
import { KnhanesPage } from "./components/KnhanesPage";
import { MainLayout } from "./components/MainLayout";
import type { AppTab } from "./types";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>("chat");

  useEffect(() => {
    async function bootstrap() {
      try {
        await api.listChats();
        setUsername(loadUsername() ?? "사용자");
      } catch {
        setUsername(null);
        clearUsername();
      } finally {
        setBooting(false);
      }
    }
    bootstrap();
  }, []);

  async function handleAuthenticated(name: string) {
    saveUsername(name);
    setUsername(name);
  }

  async function handleSignOut() {
    try {
      await api.signOut();
    } finally {
      clearUsername();
      setUsername(null);
    }
  }

  if (booting) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>불러오는 중...</p>
      </div>
    );
  }

  if (!username) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <MainLayout
      username={username}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSignOut={handleSignOut}
    >
      {activeTab === "chat" ? (
        <ChatTab username={username} />
      ) : (
        <KnhanesPage />
      )}
    </MainLayout>
  );
}
