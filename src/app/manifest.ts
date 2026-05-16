import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SrediST",
    short_name: "SrediST",
    description: "Građanske prijave i zelene akcije za Split",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f2df",
    theme_color: "#1f7a4a",
    icons: []
  };
}
