// 중앙화된 디자인 토큰 - shadcn/ui와 HTML 내보내기에서 공유

export const colorTokens = {
  // Primary colors
  background: 'oklch(1 0 0)',
  foreground: 'oklch(0.145 0 0)',

  // Card colors
  card: 'oklch(1 0 0)',
  cardForeground: 'oklch(0.145 0 0)',

  // Popover colors
  popover: 'oklch(1 0 0)',
  popoverForeground: 'oklch(0.145 0 0)',

  // Primary button colors
  primary: 'oklch(0.205 0 0)',
  primaryForeground: 'oklch(0.985 0 0)',

  // Secondary colors
  secondary: 'oklch(0.97 0 0)',
  secondaryForeground: 'oklch(0.205 0 0)',

  // Muted colors
  muted: 'oklch(0.97 0 0)',
  mutedForeground: 'oklch(0.556 0 0)',

  // Accent colors
  accent: 'oklch(0.97 0 0)',
  accentForeground: 'oklch(0.205 0 0)',

  // Destructive colors
  destructive: 'oklch(0.577 0.245 27.325)',
  destructiveForeground: 'white',

  // Border and input
  border: 'oklch(0.922 0 0)',
  input: 'oklch(0.922 0 0)',
  ring: 'oklch(0.708 0 0)',
};

export const spacingTokens = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
};

export const radiusTokens = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.625rem',   // 10px (기본 --radius 값)
  xl: '0.75rem',    // 12px
};

export const shadowTokens = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export const fontTokens = {
  size: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
  },
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  family: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },
};

export const transitionTokens = {
  fast: 'all 0.15s ease',
  medium: 'all 0.2s ease',
  slow: 'all 0.3s ease',
};

// 컴포넌트별 스타일 정의
export const componentStyles = {
  button: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacingTokens.sm,
      whiteSpace: 'nowrap' as const,
      borderRadius: `calc(${radiusTokens.lg} - 2px)`,
      fontSize: fontTokens.size.sm,
      fontWeight: fontTokens.weight.medium,
      fontFamily: fontTokens.family.sans,
      transition: transitionTokens.fast,
      outline: 'none',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'none',
      userSelect: 'none' as const,
    },
    variants: {
      default: {
        backgroundColor: colorTokens.primary,
        color: colorTokens.primaryForeground,
        boxShadow: shadowTokens.xs,
      },
      destructive: {
        backgroundColor: colorTokens.destructive,
        color: colorTokens.destructiveForeground,
        boxShadow: shadowTokens.xs,
      },
      outline: {
        border: `1px solid ${colorTokens.border}`,
        backgroundColor: colorTokens.background,
        color: colorTokens.foreground,
        boxShadow: shadowTokens.xs,
      },
      secondary: {
        backgroundColor: colorTokens.secondary,
        color: colorTokens.secondaryForeground,
        boxShadow: shadowTokens.xs,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colorTokens.foreground,
      },
      link: {
        color: colorTokens.primary,
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
        backgroundColor: 'transparent',
      },
    },
    sizes: {
      sm: {
        height: '2rem',
        borderRadius: `calc(${radiusTokens.lg} - 2px)`,
        padding: `0 ${spacingTokens.md}`,
        fontSize: fontTokens.size.xs,
      },
      default: {
        height: '2.25rem',
        padding: `${spacingTokens.sm} ${spacingTokens.lg}`,
      },
      lg: {
        height: '2.5rem',
        borderRadius: `calc(${radiusTokens.lg} - 2px)`,
        padding: `0 ${spacingTokens.xl}`,
      },
      icon: {
        width: '2.25rem',
        height: '2.25rem',
        padding: '0',
      },
    },
    states: {
      hover: {
        default: {
          backgroundColor: `color-mix(in srgb, ${colorTokens.primary} 90%, transparent)`,
        },
        destructive: {
          backgroundColor: `color-mix(in srgb, ${colorTokens.destructive} 90%, transparent)`,
        },
        outline: {
          backgroundColor: colorTokens.accent,
          color: colorTokens.accentForeground,
        },
        secondary: {
          backgroundColor: `color-mix(in srgb, ${colorTokens.secondary} 80%, transparent)`,
        },
        ghost: {
          backgroundColor: colorTokens.accent,
          color: colorTokens.accentForeground,
        },
        link: {
          textDecoration: 'none',
        },
      },
      focus: {
        outline: `2px solid ${colorTokens.ring}`,
        outlineOffset: '2px',
      },
      disabled: {
        pointerEvents: 'none' as const,
        opacity: '0.5',
      },
    },
  },

  accordion: {
    item: {
      borderBottom: `1px solid ${colorTokens.border}`,
    },
    trigger: {
      display: 'flex',
      flex: '1',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spacingTokens.lg} 0`,
      fontSize: fontTokens.size.sm,
      fontWeight: fontTokens.weight.medium,
      fontFamily: fontTokens.family.sans,
      textAlign: 'left' as const,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: colorTokens.foreground,
      transition: transitionTokens.fast,
      outline: 'none',
      width: '100%',
    },
    content: {
      overflow: 'hidden',
      fontSize: fontTokens.size.sm,
      transition: transitionTokens.medium,
    },
    body: {
      paddingBottom: spacingTokens.lg,
    },
    states: {
      hover: {
        textDecoration: 'underline',
      },
      focus: {
        outline: `2px solid ${colorTokens.ring}`,
        outlineOffset: '2px',
        borderRadius: `calc(${radiusTokens.lg} - 2px)`,
      },
      disabled: {
        pointerEvents: 'none' as const,
        opacity: '0.5',
      },
    },
  },

  calendar: {
    container: {
      padding: spacingTokens.xl,
      textAlign: 'center' as const,
      border: `1px solid ${colorTokens.border}`,
      borderRadius: radiusTokens.lg,
      backgroundColor: colorTokens.card,
      color: colorTokens.cardForeground,
    },
  },
};

// CSS 변수로 변환하는 헬퍼 함수
export function generateCSSVariables() {
  return {
    '--radius': radiusTokens.lg,
    '--background': colorTokens.background,
    '--foreground': colorTokens.foreground,
    '--card': colorTokens.card,
    '--card-foreground': colorTokens.cardForeground,
    '--popover': colorTokens.popover,
    '--popover-foreground': colorTokens.popoverForeground,
    '--primary': colorTokens.primary,
    '--primary-foreground': colorTokens.primaryForeground,
    '--secondary': colorTokens.secondary,
    '--secondary-foreground': colorTokens.secondaryForeground,
    '--muted': colorTokens.muted,
    '--muted-foreground': colorTokens.mutedForeground,
    '--accent': colorTokens.accent,
    '--accent-foreground': colorTokens.accentForeground,
    '--destructive': colorTokens.destructive,
    '--border': colorTokens.border,
    '--input': colorTokens.input,
    '--ring': colorTokens.ring,
  };
}

// CSS 문자열로 스타일 변환하는 헬퍼 함수
export function stylesToCSS(styles: Record<string, string | number>): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      // camelCase를 kebab-case로 변환
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join(' ');
}