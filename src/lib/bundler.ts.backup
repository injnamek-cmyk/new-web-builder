import { readFile } from "fs/promises";
import { join } from "path";
import { build } from "esbuild";

interface BundledComponent {
  name: string;
  css: string;
  js: string;
}

export async function bundleAllComponents(): Promise<BundledComponent[]> {
  const components = ["Accordion", "Button", "Calendar"];

  const bundledComponents: BundledComponent[] = [];

  for (const componentName of components) {
    try {
      const bundled = await bundleComponent(componentName);
      bundledComponents.push(bundled);
    } catch (error) {
      console.error(`Failed to bundle ${componentName}:`, error);
      // 빈 컴포넌트로 대체
      bundledComponents.push({
        name: componentName,
        css: "",
        js: "",
      });
    }
  }

  return bundledComponents;
}

async function bundleComponent(
  componentName: string
): Promise<BundledComponent> {
  const componentPath = join(
    process.cwd(),
    "src",
    "bundled-components",
    `${componentName}.tsx`
  );

  try {
    const componentCode = await readFile(componentPath, "utf-8");

    // CSS 추출 (간단한 정규식 사용)
    const cssMatch = componentCode.match(/\.css\`([\s\S]*?)\`/);
    const css = cssMatch ? cssMatch[1] : "";

    // JS 번들링 (esbuild 사용)
    const result = await build({
      entryPoints: [componentPath],
      bundle: true,
      write: false,
      format: "iife",
      globalName: componentName,
      target: "es2015",
      jsx: "automatic",
      external: ["react", "react-dom"],
      define: {
        "process.env.NODE_ENV": '"production"',
      },
    });

    const js = result.outputFiles[0]?.text || "";

    return {
      name: componentName,
      css,
      js,
    };
  } catch (error) {
    console.error(`Error bundling ${componentName}:`, error);
    return {
      name: componentName,
      css: "",
      js: "",
    };
  }
}
