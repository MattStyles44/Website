import { Container } from "@/components/container";

export default function Loading() {
  return (
    <Container>
      <p className="animate-pulse opacity-60" role="status">
        Loading…
      </p>
    </Container>
  );
}
