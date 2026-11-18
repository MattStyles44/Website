import Link from "next/link";

import { Container } from "@/components/container";
import { paginas } from "@/content/paginas";

export default function NotFound() {
  return (
    <Container>
      <h1 className="text-3xl font-semibold">Pagina niet gevonden</h1>
      <p>Deze pagina bestaat niet (meer).</p>
      <p className="flex flex-wrap gap-4">
        <Link className="underline" href="/">
          Naar de homepage
        </Link>
        <Link className="underline" href={paginas.diensten.pad}>
          Bekijk alle diensten
        </Link>
      </p>
    </Container>
  );
}
