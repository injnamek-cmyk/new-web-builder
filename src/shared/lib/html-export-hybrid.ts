import { Element, Canvas } from '../types';
import {
  componentStyles,
  generateCSSVariables,
  stylesToCSS
} from '../design-system/tokens';

interface HTMLExportOptions {
  title?: string;
  includeBootstrap?: boolean;
  includeTailwind?: boolean;
  responsive?: boolean;
}

// Element를 HybridRenderer 호환 형태로 변환
function convertElementToHybridFormat(element: Element): Record<string, unknown> {
  const base = {
    id: element.id,
    type: element.type,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    padding: element.padding,
  };

  switch (element.type) {
    case 'text':
      return {
        ...base,
        content: element.content,
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        color: element.color,
        textAlign: element.textAlign,
        fontWeight: element.fontWeight,
        textDecoration: element.textDecoration,
        lineHeight: element.lineHeight,
      };

    case 'image':
      return {
        ...base,
        src: element.src,
        alt: element.alt,
        objectFit: element.objectFit,
        objectPosition: element.objectPosition,
        filter: element.filter,
      };

    case 'button':
      return {
        ...base,
        text: element.text,
        variant: element.variant,
        size: element.size,
        href: element.href,
        icon: element.icon,
        iconPosition: element.iconPosition,
      };

    case 'container':
      return {
        ...base,
        backgroundColor: element.backgroundColor,
        borderRadius: element.borderRadius,
        borderStyle: element.borderStyle,
        borderWidth: element.borderWidth,
        borderColor: element.borderColor,
        boxShadow: element.boxShadow,
        layoutMode: element.layoutMode,
        children: element.children,
        flex: element.flex,
        grid: element.grid,
        flow: element.flow,
        gap: element.gap,
      };

    case 'accordion':
      return {
        ...base,
        items: element.items,
        variant: element.variant,
        collapsible: element.collapsible,
        accordionType: element.accordionType,
        disabled: element.disabled,
      };

    case 'calendar':
      return {
        ...base,
        mode: element.mode,
        selectedDate: element.selectedDate,
        selectedDates: element.selectedDates,
        showOutsideDays: element.showOutsideDays,
        disabled: element.disabled,
        defaultMonth: element.defaultMonth,
        fixedWeeks: element.fixedWeeks,
        weekStartsOn: element.weekStartsOn,
      };

    case 'shape':
      return {
        ...base,
        shapeType: element.shapeType,
        backgroundColor: element.backgroundColor,
        borderColor: element.borderColor,
        borderWidth: element.borderWidth,
        borderStyle: element.borderStyle,
        borderRadius: element.borderRadius,
      };

    default:
      return base;
  }
}

// HybridRenderer 스타일 로직을 재사용하여 HTML CSS 생성
function generateElementStyles(element: Record<string, unknown>, isTopLevel: boolean = false): string {
  const styles: string[] = [];

  // Position styles
  const positionMode = isTopLevel ? "absolute" : (element.positionMode || "static");

  switch (positionMode) {
    case "absolute":
      styles.push("position: absolute");
      if (element.x !== undefined) styles.push(`left: ${element.x}px`);
      if (element.y !== undefined) styles.push(`top: ${element.y}px`);
      break;
    case "relative":
      styles.push("position: relative");
      if (element.x !== undefined) styles.push(`left: ${element.x}px`);
      if (element.y !== undefined) styles.push(`top: ${element.y}px`);
      break;
  }

  // Size styles
  if (element.width !== undefined && element.width !== "auto") {
    styles.push(`width: ${element.width}px`);
  }
  if (element.height !== undefined && element.height !== "auto") {
    styles.push(`height: ${element.height}px`);
  }

  // Z-index
  if (element.zIndex !== undefined) {
    styles.push(`z-index: ${element.zIndex}`);
  }

  // Padding
  if (element.padding && typeof element.padding === 'object') {
    const p = element.padding as { top?: number; right?: number; bottom?: number; left?: number };
    styles.push(`padding: ${p.top || 0}px ${p.right || 0}px ${p.bottom || 0}px ${p.left || 0}px`);
  }

  // Layout mode styles (for containers)
  if (element.type === 'container' && element.layoutMode) {
    switch (element.layoutMode) {
      case "flex":
        styles.push("display: flex");
        const flexProps = element.flex as { flexDirection?: string; justifyContent?: string; alignItems?: string; gap?: number } | undefined;
        if (flexProps?.flexDirection) styles.push(`flex-direction: ${flexProps.flexDirection}`);
        if (flexProps?.justifyContent) styles.push(`justify-content: ${flexProps.justifyContent}`);
        if (flexProps?.alignItems) styles.push(`align-items: ${flexProps.alignItems}`);
        const flexGap = (element.gap as number) ?? flexProps?.gap ?? 0;
        if (flexGap) styles.push(`gap: ${flexGap}px`);
        break;
      case "grid":
        styles.push("display: grid");
        const gridProps = element.grid as { gridTemplateColumns?: string; gridTemplateRows?: string; gap?: number } | undefined;
        if (gridProps?.gridTemplateColumns) styles.push(`grid-template-columns: ${gridProps.gridTemplateColumns}`);
        if (gridProps?.gridTemplateRows) styles.push(`grid-template-rows: ${gridProps.gridTemplateRows}`);
        const gridGap = (element.gap as number) ?? gridProps?.gap ?? 0;
        if (gridGap) styles.push(`gap: ${gridGap}px`);
        break;
      case "flow":
        const flowProps = element.flow as { display?: string; margin?: string | number } | undefined;
        styles.push(`display: ${flowProps?.display || 'block'}`);
        if (flowProps?.margin !== undefined) styles.push(`margin: ${flowProps.margin}`);
        break;
      default:
        styles.push("display: block");
        break;
    }
  }

  // Element-specific styles
  switch (element.type) {
    case 'text':
      if (element.fontSize) styles.push(`font-size: ${element.fontSize}px`);
      if (element.fontFamily) styles.push(`font-family: ${element.fontFamily}`);
      if (element.color) styles.push(`color: ${element.color}`);
      if (element.textAlign) styles.push(`text-align: ${element.textAlign}`);
      if (element.fontWeight) styles.push(`font-weight: ${element.fontWeight}`);
      if (element.textDecoration) styles.push(`text-decoration: ${element.textDecoration}`);
      if (element.lineHeight) styles.push(`line-height: ${element.lineHeight}`);
      break;

    case 'image':
      if (element.objectFit) styles.push(`object-fit: ${element.objectFit}`);
      if (element.objectPosition) styles.push(`object-position: ${element.objectPosition}`);
      if (element.filter) {
        const f = element.filter as { brightness?: number; contrast?: number; saturate?: number; blur?: number };
        const filterStr = [
          f.brightness !== undefined ? `brightness(${f.brightness})` : '',
          f.contrast !== undefined ? `contrast(${f.contrast})` : '',
          f.saturate !== undefined ? `saturate(${f.saturate})` : '',
          f.blur !== undefined ? `blur(${f.blur}px)` : ''
        ].filter(Boolean).join(' ');
        if (filterStr) styles.push(`filter: ${filterStr}`);
      }
      break;

    case 'container':
      if (element.backgroundColor) styles.push(`background-color: ${element.backgroundColor}`);
      if (element.borderRadius) styles.push(`border-radius: ${element.borderRadius}px`);
      if (element.borderStyle && element.borderStyle !== 'none') {
        styles.push(`border: ${element.borderWidth || 1}px ${element.borderStyle} ${element.borderColor || '#000000'}`);
      }
      if (element.boxShadow && element.boxShadow !== 'none') {
        styles.push(`box-shadow: ${getBoxShadow(element.boxShadow as string)}`);
      }
      break;

    case 'shape':
      if (element.backgroundColor) styles.push(`background-color: ${element.backgroundColor}`);
      if (element.borderWidth && element.borderStyle !== 'none') {
        styles.push(`border: ${element.borderWidth}px ${element.borderStyle} ${element.borderColor}`);
      }
      if (element.shapeType === 'rectangle' && element.borderRadius) {
        styles.push(`border-radius: ${element.borderRadius}px`);
      } else if (element.shapeType === 'circle') {
        styles.push('border-radius: 50%');
      }
      break;
  }

  return styles.join('; ');
}

function getBoxShadow(shadowType: string): string {
  const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };
  return shadows[shadowType as keyof typeof shadows] || '';
}

function generateElementHTML(element: Record<string, unknown>, elementMap: Map<string, Record<string, unknown>>, isTopLevel: boolean = false): string {
  const styles = generateElementStyles(element, isTopLevel);
  const styleAttr = styles ? ` style="${styles}"` : '';

  switch (element.type) {
    case 'text':
      return `<div id="${element.id}"${styleAttr}>${element.content || ''}</div>`;

    case 'image':
      return `<img id="${element.id}" src="${element.src || ''}" alt="${element.alt || ''}"${styleAttr} />`;

    case 'button':
      const content = element.text || '';
      const variant = element.variant || 'default';
      const size = element.size || 'default';
      const buttonClasses = `btn btn-${variant} btn-${size}`;

      if (element.href) {
        return `<a id="${element.id}" href="${element.href}" role="button" class="${buttonClasses}"${styleAttr}>${content}</a>`;
      } else {
        return `<button id="${element.id}" type="button" class="${buttonClasses}"${styleAttr}>${content}</button>`;
      }

    case 'container':
      // 자식 요소들 가져오기
      const childElements = (element.children as string[] || [])
        .map((childId) => elementMap.get(childId))
        .filter(Boolean) as Record<string, unknown>[];

      // 자식 요소들의 HTML 생성
      const childrenHTML = childElements.map(child => generateElementHTML(child, elementMap, false)).join('\n        ');

      return `<div id="${element.id}"${styleAttr}>
        ${childrenHTML}
      </div>`;

    case 'accordion':
      const items = (element.items as { title: string; content: string }[] || []).map((item, index: number) => `
        <div class="accordion-item">
          <button class="accordion-header" onclick="toggleAccordion('${element.id}-${index}')" aria-expanded="false">
            ${item.title}
          </button>
          <div id="${element.id}-${index}" class="accordion-content" style="display: none;">
            <div class="accordion-body">${item.content}</div>
          </div>
        </div>
      `).join('');

      return `<div id="${element.id}"${styleAttr}>
        ${items}
      </div>`;

    case 'calendar':
      return `<div id="${element.id}"${styleAttr}>
        <div class="calendar">
          <p>캘린더 컴포넌트</p>
          <p>선택된 날짜: ${element.selectedDate || '없음'}</p>
        </div>
      </div>`;

    case 'shape':
      let shapeStyle = styles;
      if (element.shapeType === 'triangle') {
        const size = Math.min(Number(element.width) || 100, Number(element.height) || 100);
        shapeStyle += `; width: 0; height: 0; border-left: ${size/2}px solid transparent; border-right: ${size/2}px solid transparent; border-bottom: ${size}px solid ${element.backgroundColor}; background-color: transparent`;
      }
      return `<div id="${element.id}" style="${shapeStyle}"></div>`;

    default:
      return `<div id="${element.id}"${styleAttr}>Unknown element: ${element.type}</div>`;
  }
}

export function exportToHTMLHybrid(canvas: Canvas, options: HTMLExportOptions = {}): string {
  const {
    title = 'Web Builder Export',
    includeBootstrap = false,
    includeTailwind = false,
    responsive = true
  } = options;

  // Element를 HybridRenderer 호환 형태로 변환
  const hybridElements = canvas.elements.map(convertElementToHybridFormat);

  // 요소들을 ID로 매핑
  const elementMap = new Map<string, Record<string, unknown>>();
  hybridElements.forEach((element) => {
    elementMap.set(element.id as string, element);
  });

  // 최상위 요소들 찾기 (다른 요소의 children에 포함되지 않은 요소들)
  const topLevelElements = hybridElements.filter((element) => {
    return !hybridElements.some((parent) => {
      const parentChildren = parent.children as string[] || [];
      return parentChildren.includes(element.id as string);
    });
  });

  // HTML 생성
  const htmlContent = topLevelElements.map(element => generateElementHTML(element, elementMap, true)).join('\n        ');

  // CSS 변수 생성
  const cssVariables = generateCSSVariables();

  const baseCSS = `
        /* CSS Reset & Base Styles */
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        /* CSS Variables (Design System Tokens) */
        :root {
            ${Object.entries(cssVariables).map(([key, value]) => `${key}: ${value};`).join('\n            ')}
        }

        body {
            ${stylesToCSS({
              fontFamily: componentStyles.button.base.fontFamily,
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              lineHeight: '1.5',
            })}
        }

        /* Canvas Container */
        .canvas-container {
            position: relative;
            width: ${canvas.width}px;
            height: ${canvas.height}px;
            margin: 0 auto;
            background: var(--background);
        }

        ${responsive ? `
        @media (max-width: ${canvas.width}px) {
            .canvas-container {
                width: 100%;
                height: auto;
                min-height: 100vh;
                transform-origin: top left;
                transform: scale(calc(100vw / ${canvas.width}));
            }
        }
        ` : ''}

        /* Button Base Styles */
        .btn {
            ${stylesToCSS(componentStyles.button.base)}
        }

        .btn:focus-visible {
            ${stylesToCSS(componentStyles.button.states.focus)}
        }

        .btn:disabled {
            ${stylesToCSS(componentStyles.button.states.disabled)}
        }

        /* Button Variants */
        .btn-default {
            ${stylesToCSS(componentStyles.button.variants.default)}
        }

        .btn-default:hover {
            ${stylesToCSS(componentStyles.button.states.hover.default)}
        }

        .btn-destructive {
            ${stylesToCSS(componentStyles.button.variants.destructive)}
        }

        .btn-destructive:hover {
            ${stylesToCSS(componentStyles.button.states.hover.destructive)}
        }

        .btn-outline {
            ${stylesToCSS(componentStyles.button.variants.outline)}
        }

        .btn-outline:hover {
            ${stylesToCSS(componentStyles.button.states.hover.outline)}
        }

        .btn-secondary {
            ${stylesToCSS(componentStyles.button.variants.secondary)}
        }

        .btn-secondary:hover {
            ${stylesToCSS(componentStyles.button.states.hover.secondary)}
        }

        .btn-ghost {
            ${stylesToCSS(componentStyles.button.variants.ghost)}
        }

        .btn-ghost:hover {
            ${stylesToCSS(componentStyles.button.states.hover.ghost)}
        }

        .btn-link {
            ${stylesToCSS(componentStyles.button.variants.link)}
        }

        .btn-link:hover {
            ${stylesToCSS(componentStyles.button.states.hover.link)}
        }

        /* Button Sizes */
        .btn-sm {
            ${stylesToCSS(componentStyles.button.sizes.sm)}
        }

        .btn-default, .btn-destructive, .btn-outline, .btn-secondary, .btn-ghost, .btn-link {
            ${stylesToCSS(componentStyles.button.sizes.default)}
        }

        .btn-lg {
            ${stylesToCSS(componentStyles.button.sizes.lg)}
        }

        .btn-icon {
            ${stylesToCSS(componentStyles.button.sizes.icon)}
        }

        /* Accordion Styles */
        .accordion-item {
            ${stylesToCSS(componentStyles.accordion.item)}
        }

        .accordion-item:last-child {
            border-bottom: none;
        }

        .accordion-header {
            ${stylesToCSS(componentStyles.accordion.trigger)}
        }

        .accordion-header:hover {
            ${stylesToCSS(componentStyles.accordion.states.hover)}
        }

        .accordion-header:focus-visible {
            ${stylesToCSS(componentStyles.accordion.states.focus)}
        }

        .accordion-header:disabled {
            ${stylesToCSS(componentStyles.accordion.states.disabled)}
        }

        .accordion-header::after {
            content: '▼';
            font-size: 0.75rem;
            color: var(--muted-foreground);
            transition: transform 0.2s ease;
        }

        .accordion-header[aria-expanded="true"]::after {
            transform: rotate(180deg);
        }

        .accordion-content {
            ${stylesToCSS(componentStyles.accordion.content)}
        }

        .accordion-body {
            ${stylesToCSS(componentStyles.accordion.body)}
        }

        /* Calendar Styles */
        .calendar {
            ${stylesToCSS(componentStyles.calendar.container)}
        }
    `;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${includeBootstrap ? '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">' : ''}
    ${includeTailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
    <style>
        ${baseCSS}
    </style>
</head>
<body>
    <div class="canvas-container">
        ${htmlContent}
    </div>
    ${includeBootstrap ? '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>' : ''}
    <script>
        function toggleAccordion(id) {
            const content = document.getElementById(id);
            const trigger = document.querySelector(\`[onclick="toggleAccordion('\${id}')"]\`);

            if (content && trigger) {
                const isHidden = content.style.display === 'none';
                content.style.display = isHidden ? 'block' : 'none';
                trigger.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
            }
        }
    </script>
</body>
</html>`;
}

export function downloadHTMLHybrid(canvas: Canvas, filename: string = 'web-builder-export.html', options?: HTMLExportOptions): void {
  const htmlContent = exportToHTMLHybrid(canvas, options);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}