import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";
import fs from "fs";

function generateHonoClientComponents() {
  const virtualModuleId = "virtual:hono-client-components";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  const clients: string[] = [];

  return {
    name: "generate-client",
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }

      if (/-hono-client\.tsx$/.test(id) && !/hc-/.test(id)) {
        return "hc-" + id;
      }
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) {
        const m = id.match(/(?:hc-)?(.*)-hono-client\.tsx$/);

        const file = fs.readFileSync(m ? m[1] : id, "utf-8");
        if (!/^\s*"use client"/.test(file)) {
          return null;
        }

        if (m) {
          // pusedo import
          return file;
        }

        clients.push(id);

        // assign honoFunctionId automatically
        return `
        export * from '${id}-hono-client.tsx'
        import * as Module from '${id}-hono-client.tsx'
        Object.keys(Module).forEach((key) => {
          if (!typeof Module[key] === 'function') {
            return;
          }
          Module[key].honoFunctionId ||= \`${id}-\${key}\`.replace(/[^a-zA-Z0-9]/g, "_");
        });
        `;
      }

      return `
      ${clients
        .map(
          (c) => `import * as ${c.replace(/[^a-zA-Z0-9]/g, "_")} from "${c}"`
        )
        .join("\n")}
      import { jsx } from "hono/jsx";
      import { render } from "hono/jsx/dom";
      
      const components = {};
      ${clients
        .map((c) => {
          const id = c.replace(/[^a-zA-Z0-9]/g, "_");
          return `
        Object.keys(${id}).forEach((key) => {
          if (!${id}[key].honoFunctionId) {
            return;
          }
          components[${id}[key].honoFunctionId] = ${id}[key];
        });`;
        })
        .join("\n")}
      
      document
        .querySelectorAll("[data-hono-function]")
        .forEach((el) => {
          const data = JSON.parse(el.dataset.honoFunction);;
          el.innerHTML = "";
          render(jsx(components[data.id], data.props), el);
        });
      `;
    },
  };
}

export default defineConfig(({ mode }) => {
  return {
    ssr: {
      noExternal: true,
    },
    plugins: [
      generateHonoClientComponents(),
      devServer({
        entry: "./app/server.tsx",
      }),
    ],
  };
});
