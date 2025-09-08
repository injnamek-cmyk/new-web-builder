import { Element } from "@/shared/types";
import { bundleAllComponents } from "./bundler";

export async function generateHTML(elements: Element[]): Promise<string> {
  // 번들된 컴포넌트들 가져오기
  const bundledComponents = await bundleAllComponents();

  // CSS와 JS 코드 수집
  const allCSS = bundledComponents.map((comp) => comp.css).join("\n");
  const allJS = bundledComponents.map((comp) => comp.js).join("\n");

  const htmlContent = elements
    .sort((a, b) => a.zIndex - b.zIndex)
    .map(elementToHTML)
    .join("\n");

  return `<!DOCTYPE html>
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
        
        /* 번들된 컴포넌트 CSS */
        ${allCSS}
    </style>
</head>
<body>
    <div class="container">
        ${htmlContent}
    </div>
    
    <script>
        // React 없이 컴포넌트 렌더링을 위한 간단한 함수들
        function createElement(tag, props, ...children) {
            const element = document.createElement(tag);
            
            if (props) {
                Object.keys(props).forEach(key => {
                    if (key === 'className') {
                        element.className = props[key];
                    } else if (key === 'onClick') {
                        element.addEventListener('click', props[key]);
                    } else if (key === 'style' && typeof props[key] === 'object') {
                        Object.assign(element.style, props[key]);
                    } else if (key.startsWith('data-')) {
                        element.setAttribute(key, props[key]);
                    } else {
                        element[key] = props[key];
                    }
                });
            }
            
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child) {
                    element.appendChild(child);
                }
            });
            
            return element;
        }
        
        // React.forwardRef 대체
        function forwardRef(render) {
            return function(props, ref) {
                return render(props, ref);
            };
        }
        
        // React.useState 대체
        function useState(initialValue) {
            let state = initialValue;
            const listeners = [];
            
            function setState(newValue) {
                if (typeof newValue === 'function') {
                    state = newValue(state);
                } else {
                    state = newValue;
                }
                listeners.forEach(listener => listener(state));
            }
            
            function getState() {
                return state;
            }
            
            return [getState, setState];
        }
        
        // React.useEffect 대체
        function useEffect(callback, deps) {
            if (deps === undefined) {
                // 컴포넌트 마운트 시 실행
                callback();
            }
        }
        
        // React.useRef 대체
        function useRef(initialValue) {
            return { current: initialValue };
        }
        
        // React.useContext 대체
        function createContext(defaultValue) {
            let value = defaultValue;
            const listeners = [];
            
            return {
                Provider: function(props) {
                    value = props.value;
                    listeners.forEach(listener => listener(value));
                    return props.children;
                },
                Consumer: function(props) {
                    return props.children(value);
                }
            };
        }
        
        // React.isValidElement 대체
        function isValidElement(element) {
            return element && typeof element === 'object' && element.nodeType === 1;
        }
        
        // React.cloneElement 대체
        function cloneElement(element, props, ...children) {
            const newElement = element.cloneNode(true);
            
            if (props) {
                Object.keys(props).forEach(key => {
                    if (key === 'className') {
                        newElement.className = props[key];
                    } else if (key === 'onClick') {
                        newElement.addEventListener('click', props[key]);
                    } else if (key === 'style' && typeof props[key] === 'object') {
                        Object.assign(newElement.style, props[key]);
                    } else if (key.startsWith('data-')) {
                        newElement.setAttribute(key, props[key]);
                    } else {
                        newElement[key] = props[key];
                    }
                });
            }
            
            return newElement;
        }
        
        // React 객체 생성
        const React = {
            createElement,
            forwardRef,
            useState,
            useEffect,
            useRef,
            createContext,
            isValidElement,
            cloneElement
        };
        
        // 번들된 컴포넌트 JS 실행
        ${allJS}
        
        // 컴포넌트 렌더링 함수
        function renderComponent(componentName, props, container) {
            const component = window[componentName];
            if (component) {
                const element = component(props);
                if (element) {
                    container.appendChild(element);
                }
            }
        }
        
        // 페이지 로드 시 컴포넌트들 렌더링
        document.addEventListener('DOMContentLoaded', function() {
            // 각 요소에 대해 해당하는 컴포넌트 렌더링
            const elements = document.querySelectorAll('.element');
            elements.forEach(element => {
                const elementType = element.className.split(' ')[0].replace('-element', '');
                const componentName = elementType.charAt(0).toUpperCase() + elementType.slice(1);
                
                // 요소의 데이터 속성에서 props 추출
                const props = {};
                Array.from(element.attributes).forEach(attr => {
                    if (attr.name.startsWith('data-')) {
                        const propName = attr.name.replace('data-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                        props[propName] = attr.value;
                    }
                });
                
                // 컴포넌트 렌더링
                renderComponent(componentName, props, element);
            });
        });
    </script>
</body>
</html>`;
}

function elementToHTML(element: Element): string {
  const style = generateElementStyle(element);
  const className = `${element.type}-element element`;

  switch (element.type) {
    case "text":
      return `<div class="${className}" style="${style}">${escapeHtml(
        element.content
      )}</div>`;

    case "image":
      return `<img class="${className}" style="${style}" src="${element.src}" alt="${element.alt}" />`;

    case "button":
      const buttonTag = element.href ? "a" : "button";
      const hrefAttr = element.href ? ` href="${element.href}"` : "";
      return `<${buttonTag} class="${className}" style="${style}"${hrefAttr}>${escapeHtml(
        element.text
      )}</${buttonTag}>`;

    case "container":
      return `<div class="${className}" style="${style}"></div>`;

    case "accordion":
      const accordionItems = element.items
        .map(
          (item) => `
        <div class="accordion-item">
          <button class="accordion-header">${escapeHtml(item.title)}</button>
          <div class="accordion-content">${escapeHtml(item.content)}</div>
        </div>
      `
        )
        .join("");
      return `<div class="${className}" style="${style}">${accordionItems}</div>`;

    case "calendar":
      return generateCalendarHTML(element, className, style);

    default:
      return "";
  }
}

function generateElementStyle(element: Element): string {
  const styles: string[] = [
    `left: ${element.x}px`,
    `top: ${element.y}px`,
    `width: ${element.width === "auto" ? "auto" : element.width + "px"}`,
    `height: ${element.height === "auto" ? "auto" : element.height + "px"}`,
    `z-index: ${element.zIndex}`,
    `padding: ${element.padding.top}px ${element.padding.right}px ${element.padding.bottom}px ${element.padding.left}px`,
  ];

  // 타입별 특별 스타일
  switch (element.type) {
    case "text":
      styles.push(
        `font-size: ${element.fontSize}px`,
        `font-family: ${element.fontFamily}`,
        `color: ${element.color}`,
        `text-align: ${element.textAlign}`,
        `font-weight: ${element.fontWeight}`
      );
      break;

    case "image":
      styles.push(`object-fit: ${element.objectFit}`);
      break;

    case "button":
      styles.push(
        `background-color: ${element.backgroundColor}`,
        `color: ${element.textColor}`,
        `border-radius: ${element.borderRadius}px`
      );
      break;

    case "container":
      styles.push(
        `background-color: ${element.backgroundColor}`,
        `border-radius: ${element.borderRadius}px`
      );
      break;
  }

  return styles.join("; ");
}

function generateCalendarHTML(
  element: Element,
  className: string,
  style: string
): string {
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
      `<div style="text-align: center; font-weight: bold; padding: 8px;">${day}</div>`
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

    days.push(`<div class="${dayClass}">${date.getDate()}</div>`);
  }

  days.push("</div>");

  return `
    <div class="${className}" style="${style}">
      <div class="calendar-header">
        <h3>${currentYear}년 ${currentMonth + 1}월</h3>
      </div>
      ${days.join("")}
    </div>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function downloadHTML(
  html: string,
  filename: string = "website.html"
): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
