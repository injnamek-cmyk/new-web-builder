import * as React from "react";
import { ShapeBackground } from "@/shared/types";

interface ShapeProps extends React.HTMLAttributes<HTMLDivElement> {
  shapeType: "rectangle" | "circle" | "triangle" | "diamond" | "star" | "heart";
  width: number;
  height: number;
  background: ShapeBackground;
  borderColor: string;
  borderWidth: number;
  borderStyle: "solid" | "dashed" | "dotted" | "none";
  borderRadius?: number;
  // 하위 호환성을 위한 옵셔널 속성
  backgroundColor?: string;
}

const Shape = React.forwardRef<HTMLDivElement, ShapeProps>(
  (
    {
      shapeType,
      width,
      height,
      background,
      backgroundColor, // 하위 호환성
      borderColor,
      borderWidth,
      borderStyle,
      borderRadius = 0,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // 실제 배경색 결정 (하위 호환성 지원)
    const actualBackgroundColor = background?.type === "color"
      ? background.color
      : backgroundColor || "#3b82f6";

    const getBackgroundStyle = (): React.CSSProperties => {
      if (background?.type === "image" && background.imageUrl) {
        return {
          backgroundImage: `url(${background.imageUrl})`,
          backgroundSize: background.imageSize === "stretch" ? "100% 100%" : background.imageSize || "cover",
          backgroundPosition: background.imagePosition || "center",
          backgroundRepeat: background.imageSize === "repeat" ? "repeat" : "no-repeat",
        };
      }
      return { backgroundColor: actualBackgroundColor };
    };
    const getShapeStyles = (): React.CSSProperties => {
      const backgroundStyle = getBackgroundStyle();
      const baseStyle: React.CSSProperties = {
        width: width,
        height: height,
        ...backgroundStyle,
        border: borderStyle !== "none" ? `${borderWidth}px ${borderStyle} ${borderColor}` : "none",
        display: "inline-block",
        ...style,
      };

      switch (shapeType) {
        case "rectangle":
          return {
            ...baseStyle,
            borderRadius: borderRadius,
          };

        case "circle":
          return {
            ...baseStyle,
            borderRadius: "50%",
          };

        case "triangle":
          return {
            ...baseStyle,
            backgroundColor: "transparent",
            position: "relative",
          };

        case "diamond":
          return {
            ...baseStyle,
            transform: "rotate(45deg)",
            borderRadius: borderRadius,
          };

        case "star":
          return {
            ...baseStyle,
            backgroundColor: "transparent",
            position: "relative",
          };

        case "heart":
          return {
            ...baseStyle,
            backgroundColor: "transparent",
            position: "relative",
            transform: "rotate(-45deg)",
          };

        default:
          return baseStyle;
      }
    };

    const renderStarSVG = () => (
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill={actualBackgroundColor}
        stroke={borderStyle !== "none" ? borderColor : "none"}
        strokeWidth={borderWidth}
        style={{ display: "block" }}
      >
        <polygon points="12,2 15,8 22,8 17,13 19,21 12,17 5,21 7,13 2,8 9,8" />
      </svg>
    );

    const renderTriangleSVG = () => {
      const patternId = `triangle-pattern-${Math.random().toString(36).substr(2, 9)}`;

      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 100 100"
          style={{ display: "block" }}
        >
          {background?.type === "image" && background.imageUrl && (
            <defs>
              <pattern
                id={patternId}
                patternUnits="objectBoundingBox"
                width="100%"
                height="100%"
              >
                <image
                  href={background.imageUrl}
                  width="100"
                  height="100"
                  preserveAspectRatio={
                    background.imageSize === "cover" ? "xMidYMid slice" :
                    background.imageSize === "contain" ? "xMidYMid meet" :
                    "none"
                  }
                />
              </pattern>
            </defs>
          )}
          <polygon
            points="50,10 10,90 90,90"
            fill={
              background?.type === "image" && background.imageUrl
                ? `url(#${patternId})`
                : actualBackgroundColor
            }
            stroke={borderStyle !== "none" ? borderColor : "none"}
            strokeWidth={borderWidth}
          />
        </svg>
      );
    };

    const renderHeartSVG = () => (
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill={actualBackgroundColor}
        stroke={borderStyle !== "none" ? borderColor : "none"}
        strokeWidth={borderWidth}
        style={{ display: "block" }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );

    if (shapeType === "triangle") {
      return (
        <div
          ref={ref}
          className={className}
          {...props}
          style={{ display: "inline-block", ...style }}
        >
          {renderTriangleSVG()}
        </div>
      );
    }

    if (shapeType === "star") {
      return (
        <div
          ref={ref}
          className={className}
          {...props}
          style={{ display: "inline-block", ...style }}
        >
          {renderStarSVG()}
        </div>
      );
    }

    if (shapeType === "heart") {
      return (
        <div
          ref={ref}
          className={className}
          {...props}
          style={{ display: "inline-block", ...style }}
        >
          {renderHeartSVG()}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={className}
        style={getShapeStyles()}
        {...props}
      />
    );
  }
);

Shape.displayName = "Shape";

export { Shape };