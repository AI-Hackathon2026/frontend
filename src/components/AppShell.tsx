import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  api,
  clearRole,
  clearUsername,
  loadUsername,
  saveRole,
  withAuthRetry,
} from "../api/client";
import { AdminTab } from "./AdminTab";
import { ChatTab } from "./ChatTab";
import { KnhanesPage } from "./KnhanesPage";
import { HealthStatusForm } from "./routine/HealthStatusForm";
import { RoutineTab } from "./routine/RoutineTab";
import { MainLayout } from "./MainLayout";
import { HeAIthLogo } from "./HeAIthLogo";
import { ScreenTransition } from "./ScreenTransition";
import type { AppTab } from "../types";

type HealthGateState = "loading" | "required" | "ready";

function appShellScreenKey(
  isAdmin: boolean,
  healthGate: HealthGateState,
): string {
  if (!isAdmin && healthGate === "loading") return "health-loading";
  if (!isAdmin && healthGate === "required") return "health-form";
  return isAdmin ? "app-admin" : "app-main";
}

export function AppShell() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [booting, setBooting] = useState(true);
  const [healthGate, setHealthGate] = useState<HealthGateState>("loading");
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
          setHealthGate("ready");
        } catch {
          clearRole();
          applyRole(false);
          const record = await withAuthRetry(() => api.getHealthRecordMe());
          setHealthGate(record ? "ready" : "required");
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
      setHealthGate("loading");
      navigate("/", { replace: true });
    }
  }

  if (booting || !username) {
    return null;
  }

  const displayName = username;

  function renderShellContent() {
    if (!isAdmin && healthGate === "loading") {
      return (
        <div className="health-status-gate">
          <div className="routine-gate">
            <div className="spinner" />
            <p>건강 정보 확인 중...</p>
          </div>
        </div>
      );
    }

    if (!isAdmin && healthGate === "required") {
      return (
        <div className="health-status-gate">
          <header className="health-status-gate-header">
            <HeAIthLogo size="sm" />
            <p className="health-status-gate-intro">
              맞춤 건강 루틴을 위해 먼저 건강 정보를 입력해 주세요.
            </p>
          </header>
          <HealthStatusForm
            onComplete={() => {
              setHealthGate("ready");
              setActiveTab("routine");
            }}
          />
        </div>
      );
    }

    return (
      <MainLayout
        username={displayName}
        activeTab={activeTab}
        isAdmin={isAdmin}
        onTabChange={setActiveTab}
        onSignOut={() => void handleSignOut()}
      >
        <ScreenTransition
          screenKey={activeTab}
          className="main-tab-transition"
        >
          {activeTab === "admin" && isAdmin ? (
            <AdminTab />
          ) : activeTab === "knhanes" && !isAdmin ? (
            <KnhanesPage />
          ) : activeTab === "routine" && !isAdmin ? (
            <RoutineTab />
          ) : !isAdmin ? (
            <ChatTab username={displayName} />
          ) : (
            <AdminTab />
          )}
        </ScreenTransition>
      </MainLayout>
    );
  }

  return (
    <ScreenTransition
      screenKey={appShellScreenKey(isAdmin, healthGate)}
      className="app-shell-transition"
    >
      {renderShellContent()}
    </ScreenTransition>
  );
}
