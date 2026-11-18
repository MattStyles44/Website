import { site } from "@/content/site";
import {
  deelafbeeldingFormaat,
  maakDeelafbeelding,
} from "@/lib/seo/deelafbeelding";

export const alt = `${site.naam}: ${site.slogan}`;
export const size = deelafbeeldingFormaat;
export const contentType = "image/png";

export default function Deelafbeelding() {
  return maakDeelafbeelding({ titel: site.slogan });
}
