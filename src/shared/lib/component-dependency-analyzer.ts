import * as fs from 'fs';
import * as path from 'path';
import { Element } from "@/shared/types";

export interface ComponentDependency {
  name: string;
  path: string;
  content: string;
  dependencies: string[];
  npmPackages: string[];
}

export class ComponentDependencyAnalyzer {
  private componentsPath: string;
  private analyzedComponents = new Map<string, ComponentDependency>();

  constructor(componentsPath: string = '/src/components/ui') {
    this.componentsPath = componentsPath;
  }

  // 사용된 요소들을 기반으로 필요한 컴포넌트 분석
  public analyzeRequiredComponents(elements: Element[]): ComponentDependency[] {
    const requiredComponents = new Set<string>();

    // 1. 요소 타입별 필요한 컴포넌트 추출
    elements.forEach(element => {
      switch (element.type) {
        case 'button':
          requiredComponents.add('button');
          break;
        case 'calendar':
          requiredComponents.add('calendar');
          break;
        case 'accordion':
          requiredComponents.add('accordion');
          break;
        case 'shape':
          requiredComponents.add('shape');
          break;
        case 'container':
          // 컨테이너 내부 자식 요소들도 분석 필요
          if (element.children) {
            element.children.forEach(childId => {
              const childElement = elements.find(el => el.id === childId);
              if (childElement) {
                const childComponents = this.analyzeRequiredComponents([childElement]);
                childComponents.forEach(comp => requiredComponents.add(comp.name));
              }
            });
          }
          break;
      }
    });

    // 2. 각 컴포넌트의 의존성 재귀적으로 분석
    const allDependencies = new Set<string>();
    requiredComponents.forEach(componentName => {
      this.collectDependencies(componentName, allDependencies);
    });

    // 3. 분석된 모든 컴포넌트 반환
    return Array.from(allDependencies).map(name => this.analyzedComponents.get(name)!);
  }

  // 특정 컴포넌트의 의존성을 재귀적으로 수집
  private collectDependencies(componentName: string, collected: Set<string>): void {
    if (collected.has(componentName)) return;

    const dependency = this.analyzeComponent(componentName);
    if (!dependency) return;

    collected.add(componentName);
    this.analyzedComponents.set(componentName, dependency);

    // 의존성 컴포넌트들도 재귀적으로 수집
    dependency.dependencies.forEach(dep => {
      this.collectDependencies(dep, collected);
    });
  }

  // 단일 컴포넌트 분석
  private analyzeComponent(componentName: string): ComponentDependency | null {
    if (this.analyzedComponents.has(componentName)) {
      return this.analyzedComponents.get(componentName)!;
    }

    const componentPath = this.getComponentPath(componentName);
    if (!fs.existsSync(componentPath)) {
      console.warn(`Component not found: ${componentPath}`);
      return null;
    }

    const content = fs.readFileSync(componentPath, 'utf-8');
    const dependencies = this.extractDependencies(content);
    const npmPackages = this.extractNpmPackages(content);

    return {
      name: componentName,
      path: componentPath,
      content,
      dependencies,
      npmPackages
    };
  }

  // 컴포넌트 파일 경로 생성
  private getComponentPath(componentName: string): string {
    const basePath = process.cwd();
    return path.join(basePath, this.componentsPath, `${componentName}.tsx`);
  }

  // 컴포넌트 파일에서 다른 UI 컴포넌트 의존성 추출
  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];

    // @/components/ui/ 에서 import하는 컴포넌트들 찾기
    const importRegex = /import\s+.*from\s+["']@\/components\/ui\/([^"']+)["']/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const componentName = match[1];
      if (!dependencies.includes(componentName)) {
        dependencies.push(componentName);
      }
    }

    // 상대 경로 import도 체크
    const relativeImportRegex = /import\s+.*from\s+["']\.\/([^"']+)["']/g;
    while ((match = relativeImportRegex.exec(content)) !== null) {
      const componentName = match[1].replace('.tsx', '').replace('.ts', '');
      if (!dependencies.includes(componentName)) {
        dependencies.push(componentName);
      }
    }

    return dependencies;
  }

  // NPM 패키지 의존성 추출
  private extractNpmPackages(content: string): string[] {
    const packages: string[] = [];

    // 외부 패키지 import 찾기 (@ 또는 알파벳으로 시작하고 / 포함하지 않는 것들)
    const packageRegex = /import\s+.*from\s+["']([^@\.][\w\-@\/]+)["']/g;
    let match;

    while ((match = packageRegex.exec(content)) !== null) {
      const packageName = match[1];
      // 내부 경로가 아닌 실제 npm 패키지만 추출
      if (!packageName.startsWith('.') && !packageName.startsWith('@/')) {
        const basePackage = packageName.split('/')[0];
        if (!packages.includes(basePackage)) {
          packages.push(basePackage);
        }
      }
    }

    return packages;
  }

  // 패키지별 버전 정보 매핑
  public getPackageVersions(): Record<string, string> {
    return {
      "@radix-ui/react-slot": "^1.1.0",
      "@radix-ui/react-accordion": "^1.2.1",
      "@radix-ui/react-calendar": "^1.0.0",
      "@radix-ui/react-popover": "^1.1.2",
      "class-variance-authority": "^0.7.0",
      "clsx": "^2.1.1",
      "tailwind-merge": "^2.5.5",
      "date-fns": "^4.1.0",
      "lucide-react": "^0.462.0",
    };
  }

  // 최적화된 package.json 의존성 생성
  public generateOptimizedDependencies(requiredComponents: ComponentDependency[]): Record<string, string> {
    const allPackages = new Set<string>();
    const packageVersions = this.getPackageVersions();

    requiredComponents.forEach(comp => {
      comp.npmPackages.forEach(pkg => allPackages.add(pkg));
    });

    const dependencies: Record<string, string> = {};
    allPackages.forEach(pkg => {
      if (packageVersions[pkg]) {
        dependencies[pkg] = packageVersions[pkg];
      }
    });

    return dependencies;
  }

  // shadcn 컴포넌트를 독립 실행 가능한 형태로 변환
  public transformToStandalone(component: ComponentDependency): string {
    let transformedContent = component.content;

    // @/ 경로를 상대 경로로 변경
    transformedContent = transformedContent.replace(
      /@\/components\/ui\/([^"']+)/g,
      './$1'
    );

    // @/lib/utils를 인라인으로 변경
    if (transformedContent.includes('@/lib/utils')) {
      const utilsContent = this.getUtilsContent();
      transformedContent = transformedContent.replace(
        /import\s+.*from\s+["']@\/lib\/utils["'];?\n/g,
        ''
      );
      transformedContent = utilsContent + '\n\n' + transformedContent;
    }

    return transformedContent;
  }

  private getUtilsContent(): string {
    return `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`;
  }
}

export default ComponentDependencyAnalyzer;