"use client";

import { useEffect } from "react";

import { Container } from "@/components/container";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container>
      <h1 className="text-3xl font-semibold">Er ging iets mis</h1>
      <p>Probeer het opnieuw. Lukt het niet, bel of WhatsApp ons dan.</p>
      <button
        type="button"
        className="w-fit rounded border px-4 py-2"
        onClick={() => retry()}
      >
        Opnieuw proberen
      </button>
    </Container>
  );
}
