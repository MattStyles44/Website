import { site } from "@/content/site";
import {
  deelafbeeldingFormaat,
  maakDeelafbeelding,
} from "@/lib/seo/deelafbeelding";
import { standaardDeelafbeelding } from "@/lib/seo/standaard-deelafbeelding";

export const alt = standaardDeelafbeelding.alt;
export const size = deelafbeeldingFormaat;
export const contentType = "image/png";

export default function Deelafbeelding() {
  return maakDeelafbeelding({ titel: site.slogan });
}
