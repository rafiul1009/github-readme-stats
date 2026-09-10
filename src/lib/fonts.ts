/**
 * Font choices offered for the card's `font` option (dashboard dropdown +
 * docs). Every widget that accepts `font` falls back to `Ubuntu, sans-serif`
 * (see e.g. StatsCard.tsx) if the chosen name isn't available wherever the
 * card ends up rendered, so this list is a curated shortlist of names that
 * render well across GitHub's own SVG viewer and `format=png` alike — not an
 * introspection of fonts literally installed on any one machine, which
 * varies per browser/OS and isn't something a server can enumerate.
 */
export const FONTS = [
  "Inter",
  "Ubuntu",
  "Roboto",
  "Open Sans",
  "Noto Sans",
  "Segoe UI",
  "Helvetica",
  "Arial",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Poppins",
  "Rubik",
  "Nunito",
  "Karla",
  "Work Sans",
  "Source Sans Pro",
  "PT Sans",
  "Fira Sans",
  "Cantarell",
  "Space Grotesk",
  "Montserrat",
  "Lato",
  "Raleway",
  "Merriweather",
  "Georgia",
  "Times New Roman",
  "Courier New",
] as const;

export const DEFAULT_FONT = "Inter";
