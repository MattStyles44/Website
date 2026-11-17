import Link from "next/link";

import { Container } from "@/components/container";

export default function NotFound() {
  return (
    <Container>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="opacity-80">The page you are looking for does not exist.</p>
      <Link className="underline" href="/">
        Go home
      </Link>
    </Container>
  );
}
