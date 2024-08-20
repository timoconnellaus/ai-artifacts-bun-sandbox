import React from "react";
import { renderToString } from "react-dom/server";
import { $, file } from "bun";

const tmpPath = `${import.meta.dirname}/../../tmp`;

const transpiler = new Bun.Transpiler({
  loader: "tsx",
  tsconfig: { compilerOptions: { jsx: "react" } },
});

export async function renderComponent(code: string): Promise<string> {
  const tempFileName = `${tmpPath}/${Date.now()}.js`;

  try {
    const jsCode = await transpiler.transform(code, "tsx");

    await Bun.write(tempFileName, jsCode);

    // Dynamically import the component
    const dynamicModule = await import(tempFileName);
    const Component = dynamicModule.default || dynamicModule;

    // Render the React component to an HTML string
    const html = renderToString(React.createElement(Component));

    return html;
  } catch (error) {
    console.error("Error rendering component:", error);
    throw new Error(`Failed to render component: ${error.message}`);
  } finally {
    // Safe file removal
    try {
      if (await file(tempFileName).exists()) {
        await $`rm -f ${tempFileName}`.quiet();
      }
    } catch (rmError) {
      console.warn(
        `Warning: Failed to remove temporary file ${tempFileName}:`,
        rmError,
      );
    }
  }
}
