import { serve, $, Transpiler } from "bun";
import { randomUUID } from "crypto";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { createTailwindcss } from "@mhsdesign/jit-browser-tailwindcss";
import config from "../tailwind.config";

const serverUrl = "http://localhost:3001";

const pagesPath = `${import.meta.dirname}/../pages`;
await $`mkdir -p ${pagesPath}`.catch((error) =>
  console.error("Error creating pages directory:", error),
);

const transpiler = new Bun.Transpiler({
  loader: "tsx",
  tsconfig: { compilerOptions: { jsx: "react" } },
});

const transpileTsx = async (tsx: string) => {
  const js = await transpiler.transform(tsx);
  return js;
};

const tailwind = createTailwindcss({
  tailwindConfig: config,
});

const globals = await Bun.file(`${import.meta.dirname}/globals.css`).text();

const server = serve({
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/get-url") {
      const tsxCode = await req.text();
      const pathName = `${randomUUID()}`;
      const fileName = `${pathName}.js`;
      const filePath = `${pagesPath}/${fileName}`;

      try {
        const jsCode = await transpileTsx(tsxCode);
        await Bun.write(filePath, jsCode);
        const url = `${serverUrl}/${pathName}`;
        return new Response(JSON.stringify({ url }), { status: 200 });
      } catch (error) {
        console.error("Error processing request:", error);
        return new Response(`Error rendering component: ${error.message}`, {
          status: 500,
        });
      }
    }

    const uuid = url.pathname.split("/").pop();
    const filePath = `${pagesPath}/${uuid}.js`;

    try {
      const importedModule = await import(filePath);
      const Component = importedModule.default;
      const html = renderToString(React.createElement(Component));
      const tailwindCss = await tailwind.generateStylesFromContent(globals, [
        html,
      ]);

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
  },
  port: 3001,
});

console.log(`Bun artefact server running at http://localhost:${server.port}`);
