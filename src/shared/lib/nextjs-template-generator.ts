import { Element, Canvas } from "@/shared/types";

interface NextjsProjectConfig {
  projectName: string;
  elements: Element[];
  canvas: Canvas;
  domain?: string;
  analytics?: boolean;
  theme?: "light" | "dark" | "system";
}

interface GeneratedFile {
  path: string;
  content: string;
}

export class NextjsTemplateGenerator {
  private config: NextjsProjectConfig;
  private usedComponents: Set<string> = new Set();

  constructor(config: NextjsProjectConfig) {
    this.config = {
      ...config,
      projectName: this.sanitizeProjectName(config.projectName)
    };
    this.analyzeUsedComponents();
  }

  // Vercel 프로젝트명 규칙에 맞게 변환
  private sanitizeProjectName(name: string): string {
    if (!name || typeof name !== 'string') {
      return 'web-project';
    }

    let sanitized = name
      .toLowerCase() // 소문자로 변환
      .trim() // 앞뒤 공백 제거
      .replace(/[^a-z0-9.\-_]/g, '-') // 허용되지 않는 문자를 '-'로 변경
      .replace(/^[-._]+|[-._]+$/g, '') // 시작/끝 특수문자 제거
      .replace(/-{2,}/g, '-') // 2개 이상 연속 '-'를 하나로 변경
      .replace(/_{2,}/g, '_') // 2개 이상 연속 '_'를 하나로 변경
      .replace(/\.{2,}/g, '.') // 2개 이상 연속 '.'를 하나로 변경
      .slice(0, 100); // 100자 제한

    // 빈 문자열이거나 특수문자만 남은 경우
    if (!sanitized || /^[-._]*$/.test(sanitized)) {
      return 'web-project';
    }

    // 숫자로만 시작하는 경우 앞에 접두사 추가
    if (/^\d/.test(sanitized)) {
      sanitized = 'project-' + sanitized;
    }

    return sanitized;
  }

  // 정제된 프로젝트명 반환
  public getProjectName(): string {
    return this.config.projectName;
  }

  // 사용된 컴포넌트 분석
  private analyzeUsedComponents(): void {
    this.config.elements.forEach((element) => {
      switch (element.type) {
        case "button":
          this.usedComponents.add("button");
          break;
        case "calendar":
          this.usedComponents.add("calendar");
          break;
        case "accordion":
          this.usedComponents.add("accordion");
          break;
        case "container":
          // 컨테이너가 사용하는 자식 컴포넌트들도 분석
          break;
        case "image":
          // Next.js Image 컴포넌트 사용
          break;
        case "text":
          // 기본 HTML 사용
          break;
        case "shape":
          this.usedComponents.add("shape");
          break;
      }
    });
  }

  // 전체 프로젝트 생성
  public generateProject(): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // 1. package.json 생성
    files.push(this.generatePackageJson());

    // 2. Next.js 설정 파일들
    files.push(this.generateNextConfig());
    files.push(this.generateTailwindConfig());
    files.push(this.generateTsConfig());

    // 3. 페이지 생성
    files.push(this.generateMainPage());
    files.push(this.generateLayout());

    // 4. 사용된 UI 컴포넌트들 복사
    files.push(...this.generateUIComponents());

    // 5. 유틸리티 파일들
    files.push(this.generateUtils());
    files.push(this.generateGlobalsCSS());

    return files;
  }

  private generatePackageJson(): GeneratedFile {
    const dependencies: Record<string, string> = {
      "next": "15.5.2",
      "react": "19.1.0",
      "react-dom": "19.1.0",
    };

    const devDependencies: Record<string, string> = {
      "typescript": "^5.6.0",
      "@types/node": "^22.10.1",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      "tailwindcss": "^4.0.0",
      "postcss": "^8.4.49",
      "autoprefixer": "^10.4.20",
      "eslint": "^8.57.1",
      "eslint-config-next": "15.5.2",
    };

    // 사용된 컴포넌트에 따라 의존성 추가
    if (this.usedComponents.has("button") ||
        this.usedComponents.has("calendar") ||
        this.usedComponents.has("accordion")) {
      dependencies["@radix-ui/react-slot"] = "^1.1.0";
      dependencies["class-variance-authority"] = "^0.7.0";
      dependencies["clsx"] = "^2.1.1";
      dependencies["tailwind-merge"] = "^2.5.5";
    }

    if (this.usedComponents.has("calendar")) {
      dependencies["react-day-picker"] = "^9.9.0";
      dependencies["date-fns"] = "^4.1.0";
    }

    if (this.usedComponents.has("accordion")) {
      dependencies["@radix-ui/react-accordion"] = "^1.2.12";
    }

    if (this.config.analytics) {
      dependencies["@vercel/analytics"] = "^1.3.1";
    }

    const packageJson = {
      name: this.config.projectName,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies,
      devDependencies,
    };

    return {
      path: "package.json",
      content: JSON.stringify(packageJson, null, 2),
    };
  }

  private generateNextConfig(): GeneratedFile {
    const config = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;
`;

    return {
      path: "next.config.js",
      content: config,
    };
  }

  private generateTailwindConfig(): GeneratedFile {
    return {
      path: "tailwind.config.ts",
      content: `import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
`,
    };
  }

  private generateTsConfig(): GeneratedFile {
    return {
      path: "tsconfig.json",
      content: JSON.stringify({
        compilerOptions: {
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [
            {
              name: "next",
            },
          ],
          baseUrl: ".",
          paths: {
            "@/*": ["./src/*"],
          },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"],
      }, null, 2),
    };
  }

  private generateMainPage(): GeneratedFile {
    const pageContent = this.generatePageContent();

    return {
      path: "src/app/page.tsx",
      content: `'use client';

import React from 'react';
${this.generateImports()}

export default function HomePage() {
  return (
    <div
      className="relative"
      style={{
        width: ${this.config.canvas.width},
        height: ${this.config.canvas.height},
        background: "#ffffff",
      }}
    >
      ${pageContent}
    </div>
  );
}
`,
    };
  }

  private generateLayout(): GeneratedFile {
    return {
      path: "src/app/layout.tsx",
      content: `import type { Metadata } from 'next';
import './globals.css';
${this.config.analytics ? "import { Analytics } from '@vercel/analytics/react';" : ""}

export const metadata: Metadata = {
  title: '${this.config.projectName}',
  description: 'Generated by Web Builder',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        ${this.config.analytics ? "<Analytics />" : ""}
      </body>
    </html>
  );
}
`,
    };
  }

  private generateImports(): string {
    const imports: string[] = [];

    if (this.usedComponents.has("button")) {
      imports.push("import { Button } from '@/components/ui/button';");
    }
    if (this.usedComponents.has("calendar")) {
      imports.push("import { Calendar } from '@/components/ui/calendar';");
    }
    if (this.usedComponents.has("accordion")) {
      imports.push(`import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';`);
    }
    if (this.usedComponents.has("shape")) {
      imports.push("import { Shape } from '@/components/ui/shape';");
    }

    // Image 요소가 있는 경우
    if (this.config.elements.some(el => el.type === "image")) {
      imports.push("import Image from 'next/image';");
    }

    return imports.join('\n');
  }

  private generatePageContent(): string {
    return this.config.elements.map(element => this.generateElementJSX(element)).join('\n      ');
  }

  private generateElementJSX(element: Element): string {
    const style = this.generateElementStyle(element);

    switch (element.type) {
      case "text":
        return `<div style={${JSON.stringify(style)}}>${element.content}</div>`;

      case "image":
        return `<div style={${JSON.stringify({...style, position: 'relative'})}}>
        <Image
          src="${element.src || ''}"
          alt="${element.alt || ''}"
          fill
          style={{ objectFit: "${element.objectFit || 'fill'}" }}
        />
      </div>`;

      case "button":
        return `<Button
        variant="${element.variant || 'default'}"
        size="${element.size || 'default'}"
        style={${JSON.stringify(style)}}
        ${element.href ? `onClick={() => window.open('${element.href}', '_blank')}` : ''}
      >
        ${element.text || 'Button'}
      </Button>`;

      case "shape":
        return `<Shape
        shapeType="${element.shapeType || 'rectangle'}"
        width={${element.width === 'auto' ? 100 : element.width}}
        height={${element.height === 'auto' ? 100 : element.height}}
        backgroundColor="${element.backgroundColor || '#000000'}"
        borderColor="${element.borderColor || '#000000'}"
        borderWidth={${element.borderWidth || 0}}
        borderStyle="${element.borderStyle || 'solid'}"
        borderRadius={${element.borderRadius || 0}}
        style={${JSON.stringify(style)}}
      />`;

      case "container":
        return `<div style={${JSON.stringify(style)}}>
        {/* Container children would be rendered here */}
      </div>`;

      default:
        return `<div style={${JSON.stringify(style)}}>Unknown element</div>`;
    }
  }

  private generateElementStyle(element: Element): React.CSSProperties {
    const baseStyle: React.CSSProperties = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width === 'auto' ? 'auto' : element.width,
      height: element.height === 'auto' ? 'auto' : element.height,
      zIndex: element.zIndex,
    };

    // 요소 타입별 추가 스타일
    if (element.type === 'text') {
      return {
        ...baseStyle,
        fontSize: (element as any).fontSize,
        fontFamily: (element as any).fontFamily,
        color: (element as any).color,
        textAlign: (element as any).textAlign,
        fontWeight: (element as any).fontWeight,
      };
    }

    if ('backgroundColor' in element) {
      baseStyle.backgroundColor = (element as any).backgroundColor;
    }
    if ('borderRadius' in element) {
      baseStyle.borderRadius = (element as any).borderRadius;
    }
    if ('borderStyle' in element) {
      baseStyle.borderStyle = (element as any).borderStyle;
    }
    if ('borderWidth' in element) {
      baseStyle.borderWidth = (element as any).borderWidth;
    }
    if ('borderColor' in element) {
      baseStyle.borderColor = (element as any).borderColor;
    }

    return baseStyle;
  }

  private generateUIComponents(): GeneratedFile[] {
    const components: GeneratedFile[] = [];

    // 필요한 shadcn 컴포넌트들을 현재 프로젝트에서 복사
    if (this.usedComponents.has("button")) {
      components.push(this.copyComponentFromSource("button"));
    }
    if (this.usedComponents.has("calendar")) {
      components.push(this.copyComponentFromSource("calendar"));
    }
    if (this.usedComponents.has("accordion")) {
      components.push(this.copyComponentFromSource("accordion"));
    }
    if (this.usedComponents.has("shape")) {
      components.push(this.copyComponentFromSource("shape"));
    }

    return components;
  }

  private copyComponentFromSource(componentName: string): GeneratedFile {
    // 실제 컴포넌트 파일 읽기
    const fs = require('fs');
    const path = require('path');

    const componentPath = path.join(process.cwd(), 'src', 'components', 'ui', `${componentName}.tsx`);

    if (fs.existsSync(componentPath)) {
      const content = fs.readFileSync(componentPath, 'utf-8');
      return {
        path: `src/components/ui/${componentName}.tsx`,
        content: content,
      };
    }

    // 파일이 없는 경우 기본 컴포넌트 생성
    return {
      path: `src/components/ui/${componentName}.tsx`,
      content: `// Component ${componentName} not found, using placeholder`,
    };
  }

  private generateUtils(): GeneratedFile {
    // 실제 utils 파일 읽기
    const fs = require('fs');
    const path = require('path');

    const utilsPath = path.join(process.cwd(), 'src', 'lib', 'utils.ts');

    if (fs.existsSync(utilsPath)) {
      const content = fs.readFileSync(utilsPath, 'utf-8');
      return {
        path: "src/lib/utils.ts",
        content: content,
      };
    }

    // 파일이 없는 경우 기본 utils 생성
    return {
      path: "src/lib/utils.ts",
      content: `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
    };
  }

  private generateGlobalsCSS(): GeneratedFile {
    return {
      path: "src/app/globals.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`,
    };
  }
}

export default NextjsTemplateGenerator;