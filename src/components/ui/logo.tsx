import Image from "next/image";

const bestanden = {
  donker: "/brand/signup-logo.svg",
  licht: "/brand/signup-logo-wit.svg",
} as const;

export interface LogoProps {
  /** `donker` is het logo in kleur, `licht` het witte logo voor navy vlakken. */
  toon?: keyof typeof bestanden;
  /** Bepaalt de breedte; standaard 10rem. */
  className?: string;
}

/** Het logo uit public/brand/. SVG, dus zonder optimalisatie van next/image. */
export function Logo({ toon = "donker", className }: LogoProps) {
  return (
    <Image
      src={bestanden[toon]}
      alt="SignUp Reclame"
      width={147}
      height={38}
      unoptimized
      className={className ?? "h-auto w-40"}
    />
  );
}
