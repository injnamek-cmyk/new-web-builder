import * as React from "react";

interface ShapeProps extends React.HTMLAttributes<HTMLDivElement> {
  shapeType: "rectangle" | "circle" | "triangle" | "diamond" | "star" | "heart";
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: "solid" | "dashed" | "dotted" | "none";
  borderRadius?: number;
}

const Shape = React.forwardRef<HTMLDivElement, ShapeProps>(
  (
    {
      shapeType,
      width,
      height,
      backgroundColor,
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
    const getShapeStyles = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        width: width,
        height: height,
        backgroundColor,
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
            borderLeft: `${width / 2}px solid transparent`,
            borderRight: `${width / 2}px solid transparent`,
            borderBottom: `${height}px solid ${backgroundColor}`,
            border: borderStyle !== "none" ? `${borderWidth}px ${borderStyle} ${borderColor}` : "none",
            width: 0,
            height: 0,
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
        fill={backgroundColor}
        stroke={borderStyle !== "none" ? borderColor : "none"}
        strokeWidth={borderWidth}
        style={{ display: "block" }}
      >
        <polygon points="12,2 15,8 22,8 17,13 19,21 12,17 5,21 7,13 2,8 9,8" />
      </svg>
    );

    const renderHeartSVG = () => (
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill={backgroundColor}
        stroke={borderStyle !== "none" ? borderColor : "none"}
        strokeWidth={borderWidth}
        style={{ display: "block" }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );

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