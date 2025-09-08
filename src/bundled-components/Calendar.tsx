import * as React from "react";

// cn 유틸리티 함수
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// 아이콘 컴포넌트들
const ChevronLeftIcon = ({ className }: { className?: string }) => (
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
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
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
    <path d="m9 18 6-6-6-6" />
  </svg>
);

interface CalendarProps {
  mode?: "single" | "range" | "multiple";
  selected?: Date | { from: Date; to: Date } | Date[];
  onSelect?: (
    date: Date | { from: Date; to: Date } | Date[] | undefined
  ) => void;
  showOutsideDays?: boolean;
  disabled?: boolean;
  className?: string;
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      mode = "single",
      selected,
      onSelect,
      showOutsideDays = true,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());
    const [selectedDates, setSelectedDates] = React.useState<Date[]>([]);
    const [rangeSelection, setRangeSelection] = React.useState<{
      from: Date | null;
      to: Date | null;
    }>({ from: null, to: null });

    // 초기 선택된 날짜 설정
    React.useEffect(() => {
      if (selected) {
        if (mode === "single" && selected instanceof Date) {
          setSelectedDates([selected]);
        } else if (mode === "multiple" && Array.isArray(selected)) {
          setSelectedDates(selected);
        } else if (
          mode === "range" &&
          typeof selected === "object" &&
          "from" in selected
        ) {
          setRangeSelection({ from: selected.from, to: selected.to });
        }
      }
    }, [selected, mode]);

    const handleDateClick = (date: Date) => {
      if (disabled) return;

      if (mode === "single") {
        const newSelected = selectedDates.includes(date) ? [] : [date];
        setSelectedDates(newSelected);
        onSelect?.(newSelected[0]);
      } else if (mode === "multiple") {
        const newSelected = selectedDates.includes(date)
          ? selectedDates.filter((d) => d.getTime() !== date.getTime())
          : [...selectedDates, date];
        setSelectedDates(newSelected);
        onSelect?.(newSelected);
      } else if (mode === "range") {
        if (
          !rangeSelection.from ||
          (rangeSelection.from && rangeSelection.to)
        ) {
          setRangeSelection({ from: date, to: null });
          onSelect?.({ from: date, to: date });
        } else {
          const from = rangeSelection.from;
          const to = date;
          if (from > to) {
            setRangeSelection({ from: to, to: from });
            onSelect?.({ from: to, to: from });
          } else {
            setRangeSelection({ from, to });
            onSelect?.({ from, to });
          }
        }
      }
    };

    const goToPreviousMonth = () => {
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
      );
    };

    const goToNextMonth = () => {
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
      );
    };

    const isDateSelected = (date: Date) => {
      if (mode === "single" || mode === "multiple") {
        return selectedDates.some((d) => d.getTime() === date.getTime());
      } else if (mode === "range") {
        if (!rangeSelection.from) return false;
        if (!rangeSelection.to)
          return date.getTime() === rangeSelection.from.getTime();
        return date >= rangeSelection.from && date <= rangeSelection.to;
      }
      return false;
    };

    const isDateInRange = (date: Date) => {
      if (mode !== "range" || !rangeSelection.from) return false;
      if (!rangeSelection.to) return false;
      return date > rangeSelection.from && date < rangeSelection.to;
    };

    const isToday = (date: Date) => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    const isCurrentMonth = (date: Date) => {
      return date.getMonth() === currentMonth.getMonth();
    };

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days = [];

      // 이전 달의 날짜들
      if (showOutsideDays) {
        const prevMonth = new Date(year, month - 1, 0);
        const daysInPrevMonth = prevMonth.getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
          days.push(new Date(year, month - 1, daysInPrevMonth - i));
        }
      } else {
        for (let i = 0; i < startingDayOfWeek; i++) {
          days.push(null);
        }
      }

      // 현재 달의 날짜들
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }

      // 다음 달의 날짜들
      if (showOutsideDays) {
        const remainingDays = 42 - days.length;
        for (let day = 1; day <= remainingDays; day++) {
          days.push(new Date(year, month + 1, day));
        }
      }

      return days;
    };

    const days = getDaysInMonth(currentMonth);
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

    return (
      <div
        ref={ref}
        data-slot="calendar"
        className={cn("bg-background group/calendar p-3 w-fit", className)}
        {...props}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            disabled={disabled}
            className="size-8 p-0 hover:bg-accent hover:text-accent-foreground rounded-md disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronLeftIcon className="size-4" />
          </button>

          <h3 className="text-sm font-medium">
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </h3>

          <button
            onClick={goToNextMonth}
            disabled={disabled}
            className="size-8 p-0 hover:bg-accent hover:text-accent-foreground rounded-md disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-muted-foreground text-xs font-normal text-center p-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="aspect-square" />;
            }

            const isSelected = isDateSelected(day);
            const inRange = isDateInRange(day);
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDate = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                disabled={disabled}
                className={cn(
                  "aspect-square w-full p-0 text-center text-sm font-normal rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "disabled:opacity-50 disabled:pointer-events-none",
                  isSelected && "bg-primary text-primary-foreground",
                  inRange && "bg-accent text-accent-foreground",
                  isTodayDate &&
                    !isSelected &&
                    "bg-accent text-accent-foreground",
                  !isCurrentMonthDay && "text-muted-foreground"
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

Calendar.displayName = "Calendar";

export { Calendar };
