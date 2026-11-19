"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";

import {
  BerichtPictogram,
  MenuPictogram,
  PijlPictogram,
  SluitPictogram,
  TelefoonPictogram,
} from "@/components/pictogrammen";
import { Knop } from "@/components/ui/knop";
import type { NavItem } from "@/content/navigatie";
import { huidigeLink } from "@/lib/weergave";

/** Het id van het uitklapmenu, voor `aria-controls` op de menuknop. */
export const menuPaneelId = "menu-paneel";

interface MenuLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

/**
 * Een link in het hoofdmenu die de huidige pagina markeert met
 * `aria-current`. Kan het pad bij het vooraf bouwen nog niet gelezen worden,
 * dan staat er tot het laden een gewone link.
 */
export function MenuLink(props: MenuLinkProps) {
  const { href, className, children, onClick } = props;
  return (
    <Suspense
      fallback={
        <Link href={href} className={className} onClick={onClick}>
          {children}
        </Link>
      }
    >
      <HuidigeMenuLink {...props} />
    </Suspense>
  );
}

function HuidigeMenuLink({
  href,
  className,
  children,
  onClick,
}: MenuLinkProps) {
  const pad = usePathname();
  return (
    <Link
      href={href}
      className={className}
      aria-current={huidigeLink(pad, href)}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export interface MobielMenuProps {
  items: readonly NavItem[];
  offerte: NavItem;
  telefoon: { weergave: string; link: string };
  whatsapp: string;
}

/**
 * Het menu voor kleine schermen: een knop die een paneel opent met het
 * hoofdmenu, de offerteknop, bellen en WhatsApp.
 *
 * - Het paneel staat altijd in de HTML, dicht met het `hidden`-attribuut.
 * - Escape sluit het paneel en zet de focus terug op de knop.
 * - Een link kiezen, buiten het menu tikken of de focus eruit halen sluit het.
 */
export function MobielMenu({
  items,
  offerte,
  telefoon,
  whatsapp,
}: MobielMenuProps) {
  const [open, setOpen] = useState(false);
  const houder = useRef<HTMLDivElement>(null);
  const knop = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function bijToets(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      knop.current?.focus();
    }
    function bijAanraking(event: PointerEvent) {
      if (!houder.current?.contains(event.target as Node)) setOpen(false);
    }
    // Wordt het scherm breed genoeg voor het gewone menu, dan gaat het paneel dicht.
    const breed = window.matchMedia("(min-width: 64rem)");
    function bijBreedte() {
      if (breed.matches) setOpen(false);
    }

    document.addEventListener("keydown", bijToets);
    document.addEventListener("pointerdown", bijAanraking);
    breed.addEventListener("change", bijBreedte);
    return () => {
      document.removeEventListener("keydown", bijToets);
      document.removeEventListener("pointerdown", bijAanraking);
      breed.removeEventListener("change", bijBreedte);
    };
  }, [open]);

  function bijFocusWeg(event: FocusEvent<HTMLDivElement>) {
    const naar = event.relatedTarget;
    if (naar instanceof Node && !event.currentTarget.contains(naar)) {
      setOpen(false);
    }
  }

  const sluit = () => setOpen(false);

  return (
    <div ref={houder} onBlur={bijFocusWeg} className="lg:hidden">
      <button
        ref={knop}
        type="button"
        aria-controls={menuPaneelId}
        aria-expanded={open}
        onClick={() => setOpen((huidig) => !huidig)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border-2 border-navy px-4 font-semibold text-navy transition-colors duration-150 ease-out hover:bg-navy hover:text-wit aria-expanded:bg-navy aria-expanded:text-wit motion-reduce:transition-none"
      >
        {open ? <SluitPictogram /> : <MenuPictogram />}
        <span>Menu</span>
      </button>

      <div
        id={menuPaneelId}
        hidden={!open}
        className="absolute inset-x-0 top-full h-[calc(100dvh-4.25rem)] overflow-y-auto overscroll-contain bg-wit lg:hidden"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-2 pb-8 sm:px-6">
          <nav aria-label="Hoofdmenu">
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.href} className="border-b-2 border-vlak">
                  <MenuLink
                    href={item.href}
                    onClick={sluit}
                    className="flex min-h-14 items-center justify-between gap-4 py-3 font-display text-2xl leading-kop font-bold text-navy hover:text-blauw [&[aria-current]]:text-blauw"
                  >
                    {item.label}
                    <PijlPictogram className="size-6 text-blauw" />
                  </MenuLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <Knop href={offerte.href} grootte="groot" onClick={sluit}>
              {offerte.label}
            </Knop>
            <div className="grid gap-3 sm:grid-cols-2">
              <Knop href={telefoon.link} variant="secundair" onClick={sluit}>
                <TelefoonPictogram />
                Bel {telefoon.weergave}
              </Knop>
              <Knop href={whatsapp} variant="secundair" onClick={sluit}>
                <BerichtPictogram />
                Stuur een WhatsApp
              </Knop>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
