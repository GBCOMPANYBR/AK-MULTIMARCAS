"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  confirmMessage = "Tem certeza? Essa ação não pode ser desfeita.",
  label = "Excluir",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <form
        action={action}
        className="flex items-center gap-2"
        onSubmit={() => setConfirming(false)}
      >
        <span className="text-xs text-ak-red-glow">{confirmMessage}</span>
        <Button type="submit" variant="danger" size="sm">
          Confirmar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Cancelar
        </Button>
      </form>
    );
  }

  return (
    <Button type="button" variant="danger" size="sm" onClick={() => setConfirming(true)}>
      {label}
    </Button>
  );
}
