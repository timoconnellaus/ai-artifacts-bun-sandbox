import { serve } from "bun";
import { createTailwindcss } from "@mhsdesign/jit-browser-tailwindcss";
import config from "../tailwind.config";
import { renderComponent } from "./utils/render-tsx";

const tailwind = createTailwindcss({
  tailwindConfig: config,
});

const globals = await Bun.file(`${import.meta.dirname}/globals.css`).text();

const server = serve({
  async fetch(req) {
    if (req.method === "POST") {
      try {
        const formData = await req.formData();
        const encodedTsxCode = formData.get("tsx") as string;

        // Decode the TSX content
        const tsxCode = decodeURIComponent(encodedTsxCode);

        const html = await renderComponent(tsxCode);
        const tailwindCss = await tailwind.generateStylesFromContent(globals, [
          html,
        ]);

        // Construct the full HTML
        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>${tailwindCss}</style>
            </head>
            <body>
              <div id="root">${html}</div>
            </body>
          </html>
        `;

        return new Response(fullHtml, {
          headers: { "Content-Type": "text/html" },
          status: 200,
        });
      } catch (error) {
        console.error("Error processing request:", error);
        return new Response(`Error rendering component: ${error.message}`, {
          status: 500,
        });
      }
    } else {
      return new Response("Method not allowed", { status: 405 });
    }
  },
  port: 3001,
});

console.log(
  `Bun direct HTML server running at http://localhost:${server.port}`,
);
