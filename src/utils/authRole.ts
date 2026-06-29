import { api, clearRole, saveRole } from "../api/client";

export async function verifyIsAdmin(): Promise<boolean> {
  try {
    await api.listFiles();
    saveRole("admin");
    return true;
  } catch {
    clearRole();
    return false;
  }
}
