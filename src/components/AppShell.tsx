import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  api,
  clearRole,
  clearUsername,
  loadUsername,
  saveRole,
} from "../api/client";
import { AdminTab } from "./AdminTab";
import { ChatTab } from "./ChatTab";
import { KnhanesPage } from "./KnhanesPage";
import { MainLayout } from "./MainLayout";
import type { AppTab } from "../types";

export function AppShell() {
  const navigate = useNavigate();
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
        navigate("/login", { replace: true });
      } finally {
        setBooting(false);
      }
    }
    void bootstrap();
  }, [navigate]);

  async function handleSignOut() {
    try {
      await api.signOut();
    } finally {
      clearUsername();
      clearRole();
      setUsername(null);
      setIsAdmin(false);
      setActiveTab("chat");
      navigate("/", { replace: true });
    }
  }

  if (booting || !username) {
    return null;
  }

  return (
    <MainLayout
      username={username}
      activeTab={activeTab}
      isAdmin={isAdmin}
      onTabChange={setActiveTab}
      onSignOut={() => void handleSignOut()}
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
