import { useEffect, useState } from "react";
import {
  api,
  clearRole,
  clearUsername,
  loadUsername,
  saveRole,
  saveUsername,
} from "./api/client";
import { AuthPage } from "./components/AuthPage";
import { AdminTab } from "./components/AdminTab";
import { ChatTab } from "./components/ChatTab";
import { KnhanesPage } from "./components/KnhanesPage";
import { MainLayout } from "./components/MainLayout";
import type { AppTab } from "./types";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [booting, setBooting] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>("chat");

  function applyRole(admin: boolean) {
    setIsAdmin(admin);
    if (admin) {
      setActiveTab("admin");
    } else {
      setActiveTab("chat");
    }
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        await api.listChats();
        setUsername(loadUsername() ?? "사용자");

        try {
          await api.listFiles();
          saveRole("admin");
          applyRole(true);
        } catch {
          clearRole();
          applyRole(false);
        }
      } catch {
        setUsername(null);
        clearUsername();
        clearRole();
      } finally {
        setBooting(false);
      }
    }
    bootstrap();
  }, []);

  async function handleAuthenticated(name: string) {
    saveUsername(name);
    setUsername(name);

    try {
      await api.listFiles();
      saveRole("admin");
      applyRole(true);
    } catch {
      clearRole();
      applyRole(false);
    }
  }

  async function handleSignOut() {
    try {
      await api.signOut();
    } finally {
      clearUsername();
      clearRole();
      setUsername(null);
      setIsAdmin(false);
      setActiveTab("chat");
      clearRole();
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
      isAdmin={isAdmin}
      onTabChange={setActiveTab}
      onSignOut={handleSignOut}
    >
      {activeTab === "admin" && isAdmin ? (
        <AdminTab />
      ) : activeTab === "knhanes" && !isAdmin ? (
        <KnhanesPage />
      ) : !isAdmin ? (
        <ChatTab username={username} />
      ) : (
        <AdminTab />
      )}
    </MainLayout>
  );
}
