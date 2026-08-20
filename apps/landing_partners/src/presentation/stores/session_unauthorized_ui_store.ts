import { create } from "zustand";

let gateActive = false;

type SessionUnauthorizedUiState = {
  modalOpen: boolean;
};

export const useSessionUnauthorizedUiStore = create<SessionUnauthorizedUiState>(() => ({
  modalOpen: false,
}));

/** Primera apertura tras 401; posteriores no-op hasta reset. */
export function activateSessionUnauthorizedModal(): void {
  if (gateActive) return;
  gateActive = true;
  useSessionUnauthorizedUiStore.setState({ modalOpen: true });
}

export function resetSessionUnauthorizedGate(): void {
  gateActive = false;
  useSessionUnauthorizedUiStore.setState({ modalOpen: false });
}
