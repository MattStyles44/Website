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
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <button
        type="button"
        className="w-fit rounded border px-4 py-2"
        onClick={() => retry()}
      >
        Try again
      </button>
    </Container>
  );
}
