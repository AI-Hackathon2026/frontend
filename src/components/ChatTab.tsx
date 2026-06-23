import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, matchModelToList, withAuthRetry } from "../api/client";
import { ChatSidebar } from "./ChatSidebar";
import { MessageList } from "./MessageList";
import { ModelSelector } from "./ModelSelector";
import type { ChatHistory, ChatSummary } from "../types";

interface ChatTabProps {
  username: string;
}

export function ChatTab({ username }: ChatTabProps) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
  const [chatTitle, setChatTitle] = useState("");
  const [input, setInput] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [currentModel, setCurrentModel] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadChats = useCallback(async () => {
    const data = await withAuthRetry(() => api.listChats());
    setChats(data);
    return data;
  }, []);

  const loadModels = useCallback(async () => {
    const [available, currentRaw] = await Promise.all([
      withAuthRetry(() => api.getAvailableModels()),
      withAuthRetry(() => api.getCurrentModel()),
    ]);
    setModels(available);
    setCurrentModel(matchModelToList(String(currentRaw), available));
  }, []);

  const loadChatHistory = useCallback(async (chatId: string) => {
    const history = await withAuthRetry(() => api.getChatHistory(chatId));
    setChatHistory(history);
    setChatTitle(history.title);
    return history;
  }, []);

  useEffect(() => {
    Promise.all([loadChats(), loadModels()])
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "채팅 데이터를 불러올 수 없습니다.",
        );
      })
      .finally(() => setLoading(false));
  }, [loadChats, loadModels]);

  useEffect(() => {
    if (!activeChatId) {
      setChatHistory(null);
      setChatTitle("");
      return;
    }
    loadChatHistory(activeChatId).catch((err) => {
      setError(
        err instanceof Error ? err.message : "대화를 불러올 수 없습니다.",
      );
    });
  }, [activeChatId, loadChatHistory]);

  async function handleCreateChat() {
    setError("");
    const created = await withAuthRetry(() => api.createChat("새 대화"));
    const updated = await loadChats();
    setActiveChatId(created.id ?? updated[0]?.id ?? null);
  }

  async function handleDeleteChat(chatId: string) {
    if (!confirm("이 대화를 삭제하시겠습니까?")) return;
    setError("");
    await withAuthRetry(() => api.deleteChat(chatId));
    const updated = await loadChats();
    if (activeChatId === chatId) {
      setActiveChatId(updated[0]?.id ?? null);
    }
  }

  async function handleRenameChat(event: FormEvent) {
    event.preventDefault();
    if (!activeChatId || !chatTitle.trim()) return;
    setRenaming(true);
    setError("");
    try {
      await withAuthRetry(() =>
        api.updateChat(activeChatId, chatTitle.trim()),
      );
      await loadChats();
      if (chatHistory) {
        setChatHistory({ ...chatHistory, title: chatTitle.trim() });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "제목 변경 실패");
    } finally {
      setRenaming(false);
    }
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!activeChatId || !input.trim() || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);
    setError("");

    try {
      await withAuthRetry(() => api.sendToChatbot(activeChatId, text));
      await loadChatHistory(activeChatId);
      await loadChats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "메시지 전송 실패");
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  async function handleEditMessage(messageId: string, text: string) {
    if (!activeChatId) return;
    await withAuthRetry(() => api.updateMessage(activeChatId, messageId, text));
    await loadChatHistory(activeChatId);
  }

  async function handleDeleteMessage(messageId: string) {
    if (!activeChatId) return;
    if (!confirm("이 메시지를 삭제하시겠습니까?")) return;
    await withAuthRetry(() => api.deleteMessage(activeChatId, messageId));
    await loadChatHistory(activeChatId);
  }

  async function handleModelChange(model: string) {
    setError("");
    try {
      await withAuthRetry(() => api.changeModel(model));
      setCurrentModel(model);
    } catch (err) {
      setError(err instanceof Error ? err.message : "모델 변경 실패");
    }
  }

  if (loading) {
    return (
      <div className="tab-loading">
        <div className="spinner" />
        <p>채팅 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        username={username}
        onSelectChat={setActiveChatId}
        onCreateChat={handleCreateChat}
        onDeleteChat={handleDeleteChat}
      />

      <main className="chat-main">
        <header className="chat-header">
          <form className="title-form" onSubmit={handleRenameChat}>
            <input
              type="text"
              value={chatTitle}
              onChange={(e) => setChatTitle(e.target.value)}
              placeholder="대화 제목"
              disabled={!activeChatId}
            />
            <button type="submit" disabled={!activeChatId || renaming}>
              제목 저장
            </button>
          </form>
          <ModelSelector
            models={models}
            currentModel={currentModel}
            onChange={handleModelChange}
          />
        </header>

        {error && <div className="banner-error">{error}</div>}

        {!activeChatId ? (
          <div className="welcome-panel">
            <h2>AI 챗봇</h2>
            <p>왼쪽에서 새 대화를 만들거나 기존 대화를 선택하세요.</p>
            <button
              type="button"
              className="primary-btn"
              onClick={handleCreateChat}
            >
              새 대화 시작
            </button>
          </div>
        ) : (
          <>
            <MessageList
              messages={chatHistory?.messages ?? []}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
            />

            <form className="composer" onSubmit={handleSend}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지를 입력하세요..."
                rows={2}
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend(e);
                  }
                }}
              />
              <button
                type="submit"
                className="primary-btn"
                disabled={sending || !input.trim()}
              >
                {sending ? "전송 중..." : "전송"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
