import * as React from "react";
import { ContainerElement } from "@/shared/types";

interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Partial<ContainerElement> {
  children?: React.ReactNode;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      className = "",
      backgroundColor,
      borderRadius,
      borderStyle = "none",
      borderWidth = 0,
      borderColor,
      boxShadow = "none",
      padding,
      gap = 8,
      flex,
      children,
      ...props
    },
    ref
  ) => {
    const shadowClasses = {
      none: "",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl",
      "2xl": "shadow-2xl",
    };

    const flexDirection = flex?.flexDirection || "row";
    const justifyContent = flex?.justifyContent || "flex-start";
    const alignItems = flex?.alignItems || "stretch";
    const flexWrap = flex?.flexWrap || "nowrap";

    const flexClasses = {
      "flex-start": "justify-start",
      "flex-end": "justify-end",
      center: "justify-center",
      "space-between": "justify-between",
      "space-around": "justify-around",
      "space-evenly": "justify-evenly",
    };

    const alignClasses = {
      stretch: "items-stretch",
      "flex-start": "items-start",
      "flex-end": "items-end",
      center: "items-center",
      baseline: "items-baseline",
    };

    const baseClasses = `flex ${
      flexDirection === "column" ? "flex-col" : "flex-row"
    } ${flexClasses[justifyContent]} ${alignClasses[alignItems]} ${
      flexWrap === "wrap" ? "flex-wrap" : "flex-nowrap"
    } ${shadowClasses[boxShadow] || ""} transition-all`.trim();

    const style: React.CSSProperties = {
      backgroundColor,
      borderRadius: borderRadius ? `${borderRadius}px` : undefined,
      borderStyle: borderStyle !== "none" ? borderStyle : undefined,
      borderWidth: borderWidth ? `${borderWidth}px` : undefined,
      borderColor: borderWidth ? borderColor : undefined,
      padding: padding
        ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`
        : undefined,
      gap: `${gap}px`,
    };

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${className}`.trim()}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export { Container };