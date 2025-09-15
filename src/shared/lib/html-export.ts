import { Element, Canvas } from '../types';

interface HTMLExportOptions {
  title?: string;
  includeBootstrap?: boolean;
  includeTailwind?: boolean;
  responsive?: boolean;
}

export function exportToHTML(canvas: Canvas, options: HTMLExportOptions = {}): string {
  const {
    title = 'Web Builder Export',
    includeBootstrap = false,
    includeTailwind = false,
    responsive = true
  } = options;

  const cssStyles = generateCSS(canvas.elements, responsive);
  const htmlContent = generateHTML(canvas.elements);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${includeBootstrap ? '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">' : ''}
    ${includeTailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
    <style>
        ${cssStyles}
    </style>
</head>
<body>
    <div class="canvas-container">
        ${htmlContent}
    </div>
    ${includeBootstrap ? '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>' : ''}
</body>
</html>`;
}

function generateCSS(elements: Element[], responsive: boolean): string {
  let css = `
        .canvas-container {
            position: relative;
            width: 1920px;
            height: 1080px;
            margin: 0 auto;
            background: #ffffff;
        }

        .element {
            position: absolute;
            box-sizing: border-box;
        }

        ${responsive ? `
        @media (max-width: 1920px) {
            .canvas-container {
                width: 100%;
                height: auto;
                min-height: 100vh;
                transform-origin: top left;
                transform: scale(calc(100vw / 1920));
            }
        }
        ` : ''}
    `;

  elements.forEach(element => {
    css += generateElementCSS(element);
  });

  return css;
}

function generateElementCSS(element: Element): string {
  const baseStyles = `
        #${element.id} {
            left: ${element.x}px;
            top: ${element.y}px;
            width: ${element.width === 'auto' ? 'auto' : `${element.width}px`};
            height: ${element.height === 'auto' ? 'auto' : `${element.height}px`};
            z-index: ${element.zIndex};
            padding: ${element.padding.top}px ${element.padding.right}px ${element.padding.bottom}px ${element.padding.left}px;
        }
    `;

  let specificStyles = '';

  switch (element.type) {
    case 'text':
      specificStyles = `
            #${element.id} {
                font-size: ${element.fontSize}px;
                font-family: ${element.fontFamily};
                color: ${element.color};
                text-align: ${element.textAlign};
                font-weight: ${element.fontWeight};
                text-decoration: ${element.textDecoration || 'none'};
                line-height: ${element.lineHeight || 1.2};
            }
        `;
      break;

    case 'image':
      specificStyles = `
            #${element.id} {
                object-fit: ${element.objectFit};
                object-position: ${element.objectPosition || 'center'};
                ${element.filter ? `filter: brightness(${element.filter.brightness}) contrast(${element.filter.contrast}) saturate(${element.filter.saturate}) blur(${element.filter.blur}px);` : ''}
            }
        `;
      break;

    case 'button':
      const buttonStyles = getButtonStyles(element.variant, element.size);
      specificStyles = `
            #${element.id} {
                ${buttonStyles}
                cursor: pointer;
                border: none;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
        `;
      break;

    case 'container':
      specificStyles = `
            #${element.id} {
                background-color: ${element.backgroundColor};
                border-radius: ${element.borderRadius}px;
                ${element.borderStyle && element.borderStyle !== 'none' ? `
                    border: ${element.borderWidth || 1}px ${element.borderStyle} ${element.borderColor || '#000000'};
                ` : ''}
                ${element.boxShadow && element.boxShadow !== 'none' ? `box-shadow: ${getBoxShadow(element.boxShadow)};` : ''}
                ${element.layoutMode === 'flex' ? generateFlexStyles(element) : ''}
                ${element.layoutMode === 'grid' ? generateGridStyles(element) : ''}
                ${element.gap ? `gap: ${element.gap}px;` : ''}
            }
        `;
      break;

    case 'shape':
      specificStyles = `
            #${element.id} {
                background-color: ${element.backgroundColor};
                border: ${element.borderWidth}px ${element.borderStyle} ${element.borderColor};
                ${element.shapeType === 'rectangle' ? `border-radius: ${element.borderRadius || 0}px;` : ''}
                ${element.shapeType === 'circle' ? 'border-radius: 50%;' : ''}
                ${element.shapeType === 'triangle' ? generateTriangleCSS(element) : ''}
            }
        `;
      break;
  }

  return baseStyles + specificStyles;
}

function generateHTML(elements: Element[]): string {
  return elements.map(element => generateElementHTML(element)).join('\n        ');
}

function generateElementHTML(element: Element): string {
  const className = `element element-${element.type}`;

  switch (element.type) {
    case 'text':
      return `<div id="${element.id}" class="${className}">${element.content}</div>`;

    case 'image':
      return `<img id="${element.id}" class="${className}" src="${element.src}" alt="${element.alt}" />`;

    case 'button':
      const content = element.icon ?
        `${element.iconPosition === 'left' ? `<span class="icon">${element.icon}</span>` : ''}${element.text}${element.iconPosition === 'right' ? `<span class="icon">${element.icon}</span>` : ''}` :
        element.text;

      if (element.href) {
        return `<a id="${element.id}" class="${className}" href="${element.href}" role="button">${content}</a>`;
      } else {
        return `<button id="${element.id}" class="${className}" type="button">${content}</button>`;
      }

    case 'container':
      return `<div id="${element.id}" class="${className}"></div>`;

    case 'accordion':
      return generateAccordionHTML(element);

    case 'calendar':
      return `<div id="${element.id}" class="${className}">
        <p>캘린더 컴포넌트 (JavaScript 필요)</p>
      </div>`;

    case 'shape':
      return `<div id="${element.id}" class="${className}"></div>`;

    default:
      return `<div id="${element.id}" class="${className}"></div>`;
  }
}

function generateAccordionHTML(element: Element & { type: 'accordion' }): string {
  const items = element.items.map((item, index) => `
    <div class="accordion-item">
      <button class="accordion-header" onclick="toggleAccordion('${element.id}-${index}')">
        ${item.title}
      </button>
      <div id="${element.id}-${index}" class="accordion-content">
        <div class="accordion-body">${item.content}</div>
      </div>
    </div>
  `).join('');

  return `<div id="${element.id}" class="element element-accordion">
    ${items}
    <script>
      function toggleAccordion(id) {
        const content = document.getElementById(id);
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
      }
    </script>
  </div>`;
}

function getButtonStyles(variant: string, size: string): string {
  const variants = {
    default: 'background-color: #000000; color: #ffffff;',
    destructive: 'background-color: #ef4444; color: #ffffff;',
    outline: 'background-color: transparent; color: #000000; border: 1px solid #d1d5db;',
    secondary: 'background-color: #f3f4f6; color: #374151;',
    ghost: 'background-color: transparent; color: #374151;',
    link: 'background-color: transparent; color: #2563eb; text-decoration: underline;'
  };

  const sizes = {
    default: 'padding: 8px 16px; font-size: 14px;',
    sm: 'padding: 4px 12px; font-size: 12px;',
    lg: 'padding: 12px 24px; font-size: 16px;',
    icon: 'padding: 8px; width: 36px; height: 36px;'
  };

  return (variants[variant as keyof typeof variants] || variants.default) +
         (sizes[size as keyof typeof sizes] || sizes.default);
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

function generateFlexStyles(element: Element & { type: 'container' }): string {
  if (!element.flex) return 'display: flex;';

  return `
    display: flex;
    flex-direction: ${element.flex.flexDirection || 'row'};
    justify-content: ${element.flex.justifyContent || 'flex-start'};
    align-items: ${element.flex.alignItems || 'stretch'};
    flex-wrap: ${element.flex.flexWrap || 'nowrap'};
  `;
}

function generateGridStyles(element: Element & { type: 'container' }): string {
  if (!element.grid) return 'display: grid;';

  return `
    display: grid;
    grid-template-columns: ${element.grid.gridTemplateColumns || `repeat(${element.grid.gridColumns || 1}, 1fr)`};
    grid-template-rows: ${element.grid.gridTemplateRows || `repeat(${element.grid.gridRows || 'auto'}, 1fr)`};
    gap: ${element.grid.gridGap || 0}px;
  `;
}

function generateTriangleCSS(element: Element & { type: 'shape' }): string {
  const size = Math.min(typeof element.width === 'number' ? element.width : 100,
                       typeof element.height === 'number' ? element.height : 100);
  return `
    width: 0;
    height: 0;
    border-left: ${size/2}px solid transparent;
    border-right: ${size/2}px solid transparent;
    border-bottom: ${size}px solid ${element.backgroundColor};
    background-color: transparent;
  `;
}

export function downloadHTML(canvas: Canvas, filename: string = 'web-builder-export.html', options?: HTMLExportOptions): void {
  const htmlContent = exportToHTML(canvas, options);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}