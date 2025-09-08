import { NextRequest, NextResponse } from "next/server";
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

    try {
      // Vercel 배포를 위한 프로젝트 생성
      const deployResult = await deployToVercel(elements, safeProjectName);

      if (!deployResult.success) {
        throw new Error(`배포 실패: ${deployResult.error}`);
      }

      return NextResponse.json({
        success: true,
        projectName: safeProjectName,
        url: deployResult.url,
        message: "웹사이트가 성공적으로 배포되었습니다.",
      });
    } catch (error) {
      console.error("배포 중 오류:", error);
      return NextResponse.json(
        {
          error: "배포 중 오류가 발생했습니다.",
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

async function deployToVercel(elements: any[], projectName: string) {
  try {
    // 임시 디렉토리 생성
    const tempDir = join(process.cwd(), "temp-deploy", projectName);
    await mkdir(tempDir, { recursive: true });

    try {
      // Vercel 프로젝트 파일들 생성
      await createVercelProject(tempDir, elements, projectName);

      // Vercel CLI로 배포
      const { stdout: deployOutput, stderr: deployError } = await execAsync(
        `npx vercel --prod --yes --name ${projectName}`,
        { cwd: tempDir }
      );

      if (deployError && !deployError.includes("warn")) {
        return { success: false, error: deployError };
      }

      // 배포 URL 추출
      const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
      const url = urlMatch
        ? urlMatch[0]
        : "https://" + projectName + ".vercel.app";

      return { success: true, url, output: deployOutput };
    } finally {
      // 임시 파일 정리
      await rm(tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 배포 오류",
    };
  }
}

async function createVercelProject(
  projectDir: string,
  elements: any[],
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

  // index.js 생성 - HTML 생성 로직 포함
  const indexJs = `
import { generateHTML } from './lib/html-generator';

export default function Home() {
  const elements = ${JSON.stringify(elements)};
  const htmlContent = generateHTML(elements);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  )
}
`;

  await writeFile(join(pagesDir, "index.js"), indexJs);

  // lib 디렉토리 생성
  const libDir = join(projectDir, "lib");
  await mkdir(libDir, { recursive: true });

  // html-generator.js 생성 (클라이언트 사이드용)
  const htmlGenerator = `
export function generateHTML(elements) {
  const htmlContent = elements
    .sort((a, b) => a.zIndex - b.zIndex)
    .map(elementToHTML)
    .join("\\n");

  return \`<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <style>
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
    </style>
</head>
<body>
    <div class="container">
        \${htmlContent}
    </div>
</body>
</html>\`;
}

function elementToHTML(element) {
  const style = generateElementStyle(element);
  const className = \`\${element.type}-element element\`;

  switch (element.type) {
    case "text":
      return \`<div class="\${className}" style="\${style}">\${escapeHtml(element.content)}</div>\`;

    case "image":
      return \`<img class="\${className}" style="\${style}" src="\${element.src}" alt="\${element.alt}" />\`;

    case "button":
      const buttonTag = element.href ? "a" : "button";
      const hrefAttr = element.href ? \` href="\${element.href}"\` : "";
      return \`<\${buttonTag} class="\${className}" style="\${style}"\${hrefAttr}>\${escapeHtml(element.text)}</\${buttonTag}>\`;

    case "container":
      return \`<div class="\${className}" style="\${style}"></div>\`;

    case "accordion":
      const accordionItems = element.items
        .map(
          (item) => \`
        <div class="accordion-item">
          <button class="accordion-header">\${escapeHtml(item.title)}</button>
          <div class="accordion-content">\${escapeHtml(item.content)}</div>
        </div>
      \`
        )
        .join("");
      return \`<div class="\${className}" style="\${style}">\${accordionItems}</div>\`;

    case "calendar":
      return generateCalendarHTML(element, className, style);

    default:
      return "";
  }
}

function generateElementStyle(element) {
  const styles = [
    \`left: \${element.x}px\`,
    \`top: \${element.y}px\`,
    \`width: \${element.width === "auto" ? "auto" : element.width + "px"}\`,
    \`height: \${element.height === "auto" ? "auto" : element.height + "px"}\`,
    \`z-index: \${element.zIndex}\`,
    \`padding: \${element.padding.top}px \${element.padding.right}px \${element.padding.bottom}px \${element.padding.left}px\`,
  ];

  // 타입별 특별 스타일
  switch (element.type) {
    case "text":
      styles.push(
        \`font-size: \${element.fontSize}px\`,
        \`font-family: \${element.fontFamily}\`,
        \`color: \${element.color}\`,
        \`text-align: \${element.textAlign}\`,
        \`font-weight: \${element.fontWeight}\`
      );
      break;

    case "image":
      styles.push(\`object-fit: \${element.objectFit}\`);
      break;

    case "button":
      styles.push(
        \`background-color: \${element.backgroundColor}\`,
        \`color: \${element.textColor}\`,
        \`border-radius: \${element.borderRadius}px\`
      );
      break;

    case "container":
      styles.push(
        \`background-color: \${element.backgroundColor}\`,
        \`border-radius: \${element.borderRadius}px\`
      );
      break;
  }

  return styles.join("; ");
}

function generateCalendarHTML(element, className, style) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days = [];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  // 요일 헤더
  days.push('<div class="calendar-grid">');
  dayNames.forEach((day) => {
    days.push(
      \`<div style="text-align: center; font-weight: bold; padding: 8px;">\${day}</div>\`
    );
  });

  // 날짜들
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const isCurrentMonth = date.getMonth() === currentMonth;
    const isToday = date.toDateString() === today.toDateString();

    let dayClass = "calendar-day";
    if (!isCurrentMonth) dayClass += " other-month";
    if (isToday) dayClass += " selected";

    days.push(\`<div class="\${dayClass}">\${date.getDate()}</div>\`);
  }

  days.push("</div>");

  return \`
    <div class="\${className}" style="\${style}">
      <div class="calendar-header">
        <h3>\${currentYear}년 \${currentMonth + 1}월</h3>
      </div>
      \${days.join("")}
    </div>
  \`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
`;

  await writeFile(join(libDir, "html-generator.js"), htmlGenerator);

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

  // vercel.json 생성
  const vercelConfig = {
    version: 2,
    builds: [
      {
        src: "package.json",
        use: "@vercel/next",
      },
    ],
  };

  await writeFile(
    join(projectDir, "vercel.json"),
    JSON.stringify(vercelConfig, null, 2)
  );
}
