import * as React from "react";

// cn 유틸리티 함수
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// ChevronDown 아이콘 컴포넌트
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

interface AccordionContextType {
  value: string[];
  onValueChange: (value: string[]) => void;
  type: "single" | "multiple";
  collapsible: boolean;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

const useAccordionContext = () => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};

interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  value?: string[];
  onValueChange?: (value: string[]) => void;
  children: React.ReactNode;
  className?: string;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      type = "single",
      collapsible = true,
      value,
      onValueChange,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string[]>([]);

    const currentValue = value || internalValue;
    const handleValueChange = onValueChange || setInternalValue;

    const contextValue: AccordionContextType = {
      value: currentValue,
      onValueChange: handleValueChange,
      type,
      collapsible,
    };

    return (
      <AccordionContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-slot="accordion"
          className={cn("w-full", className)}
          {...props}
        >
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);

Accordion.displayName = "Accordion";

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="accordion-item"
        data-value={value}
        className={cn("border-b last:border-b-0", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ children, className, onClick, ...props }, ref) => {
  const { value, onValueChange, type, collapsible } = useAccordionContext();
  const itemRef = React.useRef<HTMLDivElement>(null);

  const itemValue =
    itemRef.current?.closest("[data-value]")?.getAttribute("data-value") || "";
  const isOpen = value.includes(itemValue);

  const handleClick = (e: React.MouseEvent) => {
    if (type === "single") {
      if (isOpen && collapsible) {
        onValueChange([]);
      } else {
        onValueChange([itemValue]);
      }
    } else {
      if (isOpen) {
        onValueChange(value.filter((v) => v !== itemValue));
      } else {
        onValueChange([...value, itemValue]);
      }
    }
    onClick?.(e);
  };

  return (
    <div className="flex">
      <button
        ref={ref}
        data-slot="accordion-trigger"
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </button>
    </div>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ children, className, ...props }, ref) => {
  const { value } = useAccordionContext();
  const itemRef = React.useRef<HTMLDivElement>(null);

  const itemValue =
    itemRef.current?.closest("[data-value]")?.getAttribute("data-value") || "";
  const isOpen = value.includes(itemValue);

  return (
    <div
      ref={ref}
      data-slot="accordion-content"
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "overflow-hidden text-sm transition-all duration-200",
        isOpen ? "animate-accordion-down" : "animate-accordion-up"
      )}
      style={{
        height: isOpen ? "auto" : "0",
        opacity: isOpen ? 1 : 0,
      }}
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </div>
  );
});

AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
