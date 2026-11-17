import { Container } from "@/components/container";
import { env } from "@/env";

export default function Home() {
  return (
    <Container>
      <h1 className="text-3xl font-semibold tracking-tight">{env.APP_NAME}</h1>
      <p className="text-lg opacity-80">
        Next.js App Router, React, strict TypeScript and Tailwind CSS.
      </p>
      <p className="text-sm opacity-60">
        Health check:{" "}
        <a className="underline" href="/api/health">
          /api/health
        </a>
      </p>
    </Container>
  );
}
