import { NextRequest, NextResponse } from "next/server";
import { generateHTML } from "@/lib/html-generator";
import { writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { elements, projectName } = await request.json();

    if (!elements || !Array.isArray(elements)) {
      return NextResponse.json(
        { error: "요소 데이터가 필요합니다." },
        { status: 400 }
      );
    }

    // 프로젝트 이름 생성
    const timestamp = Date.now();
    const safeProjectName = projectName
      ? projectName.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase()
      : `website-${timestamp}`;

    // 임시 프로젝트 디렉토리 생성
    const tempDir = join(process.cwd(), "temp-builds", safeProjectName);
    const projectDir = join(tempDir, "website");

    try {
      // 기존 디렉토리가 있으면 삭제
      await rm(tempDir, { recursive: true, force: true });

      // 디렉토리 생성
      await mkdir(projectDir, { recursive: true });

      // HTML 생성
      const htmlContent = await generateHTML(elements);

      // Next.js 프로젝트 파일들 생성
      await createNextJSProject(projectDir, htmlContent, safeProjectName);

      // 프로젝트 빌드
      const buildResult = await buildProject(projectDir);

      if (!buildResult.success) {
        throw new Error(`빌드 실패: ${buildResult.error}`);
      }

      // 빌드된 파일들을 정적 파일로 복사
      const staticDir = join(projectDir, "out");
      await mkdir(staticDir, { recursive: true });

      // HTML 파일을 정적 파일로 저장
      await writeFile(join(staticDir, "index.html"), htmlContent);

      // 빌드 결과 반환
      return NextResponse.json({
        success: true,
        projectName: safeProjectName,
        buildPath: staticDir,
        message: "웹사이트가 성공적으로 빌드되었습니다.",
      });
    } catch (error) {
      console.error("빌드 중 오류:", error);
      return NextResponse.json(
        {
          error: "빌드 중 오류가 발생했습니다.",
          details: error instanceof Error ? error.message : "알 수 없는 오류",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

async function createNextJSProject(
  projectDir: string,
  htmlContent: string,
  projectName: string
) {
  // package.json 생성
  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      export: "next build && next export",
    },
    dependencies: {
      next: "15.5.2",
      react: "19.1.0",
      "react-dom": "19.1.0",
    },
  };

  await writeFile(
    join(projectDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // next.config.js 생성
  const nextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
`;

  await writeFile(join(projectDir, "next.config.js"), nextConfig);

  // pages 디렉토리 생성
  const pagesDir = join(projectDir, "pages");
  await mkdir(pagesDir, { recursive: true });

  // _app.js 생성
  const appJs = `
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
`;

  await writeFile(join(pagesDir, "_app.js"), appJs);

  // index.js 생성
  const indexJs = `
export default function Home() {
  return (
    <div dangerouslySetInnerHTML={{ __html: \`${htmlContent.replace(
      /`/g,
      "\\`"
    )}\` }} />
  )
}
`;

  await writeFile(join(pagesDir, "index.js"), indexJs);

  // styles 디렉토리 생성
  const stylesDir = join(projectDir, "styles");
  await mkdir(stylesDir, { recursive: true });

  // globals.css 생성
  const globalsCss = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.element {
  position: absolute;
}

.text-element {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.image-element {
  display: block;
}

.container-element {
  display: block;
}
`;

  await writeFile(join(stylesDir, "globals.css"), globalsCss);
}

async function buildProject(projectDir: string) {
  try {
    // npm install 실행
    const { stdout: installOutput, stderr: installError } = await execAsync(
      "npm install",
      { cwd: projectDir }
    );

    if (installError && !installError.includes("warn")) {
      return { success: false, error: installError };
    }

    // next build 실행
    const { stdout: buildOutput, stderr: buildError } = await execAsync(
      "npm run build",
      { cwd: projectDir }
    );

    if (buildError && !buildError.includes("warn")) {
      return { success: false, error: buildError };
    }

    return { success: true, output: buildOutput };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 빌드 오류",
    };
  }
}
