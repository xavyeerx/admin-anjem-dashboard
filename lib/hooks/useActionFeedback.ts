"use client";

import { useCallback, useRef, useState } from "react";
import type { OverlayState } from "@/components/ActionOverlay";
import type { ConfirmOptions } from "@/components/ConfirmDialog";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface RunActionOptions {
  loading: string;
  success: string;
  action: () => Promise<void>;
  minLoadingMs?: number;
  successMs?: number;
}

export function useActionFeedback() {
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const confirmResolve = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      confirmResolve.current = resolve;
      setConfirmOptions(options);
      setConfirmOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirmOpen(false);
    setConfirmOptions(null);
    confirmResolve.current?.(true);
    confirmResolve.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmOpen(false);
    setConfirmOptions(null);
    confirmResolve.current?.(false);
    confirmResolve.current = null;
  }, []);

  const runAction = useCallback(async ({
    loading,
    success,
    action,
    minLoadingMs = 450,
    successMs = 1100,
  }: RunActionOptions) => {
    const started = Date.now();
    setOverlay({ mode: "loading", message: loading });

    try {
      await action();
      const elapsed = Date.now() - started;
      if (elapsed < minLoadingMs) await sleep(minLoadingMs - elapsed);

      setOverlay({ mode: "success", message: success });
      await sleep(successMs);
      setOverlay(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
      setOverlay({ mode: "error", message: msg });
      await sleep(1800);
      setOverlay(null);
      throw e;
    }
  }, []);

  return {
    overlay,
    confirmOpen,
    confirmOptions,
    confirm,
    handleConfirm,
    handleCancel,
    runAction,
  };
}
