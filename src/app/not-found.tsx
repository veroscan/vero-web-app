import "@/styles/pages-c.css";
import { pageMetadata } from "@/lib/metadata";
import { NotFoundHero } from "@/components/sections/not-found/NotFoundHero";

export const metadata = pageMetadata({
  title: "Page not found | Vero Scan",
  description: "We could not find that page. Go to the home page, see the product or contact Code & Clause.",
  indexing: "framework",
});

export default function NotFound() {
  return (
    <>
      <main>
        <NotFoundHero />
      </main>
    </>
  );
}
