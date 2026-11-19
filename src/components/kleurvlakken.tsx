import { cn } from "@/lib/utils";

/**
 * Een collage van vlakke kleurvlakken, op de plek waar later projectfoto's
 * kunnen komen. Alleen decoratie: verborgen voor schermlezers.
 */
export function Kleurvlakken({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("grid grid-cols-6 grid-rows-6 gap-3", className)}
    >
      <div className="col-span-4 col-start-1 row-span-4 row-start-1 rounded-kaart bg-navy" />
      <div className="col-span-2 col-start-5 row-span-3 row-start-1 rounded-kaart bg-blauw" />
      <div className="col-span-2 col-start-5 row-span-3 row-start-4 rounded-kaart bg-vlak" />
      <div className="col-span-4 col-start-1 row-span-2 row-start-5 rounded-kaart bg-vlak" />
    </div>
  );
}
