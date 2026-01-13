"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "../../button";
import { Calendar } from "../../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";

type DatePickerProps = {
  value: Date | undefined;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
  formatString?: string;
  disablePast?: boolean; // Add disablePast prop
  Layout?: "dropdown" | "label" | "dropdown-years" | "dropdown-months"; //  layout prop
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  formatString = "PPP", // Default to 'PPP' format, you can customize
  disablePast = false, // Default to false
  Layout = "dropdown", // Default caption layout
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to midnight to ignore time part

  return (
    <div className={`w-full p-6 flex justify-center ${className}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!value}
            className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal"
          >
            <CalendarIcon />
            {value ? format(value, formatString) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            required={true}
            mode="single"
            selected={value}
            onSelect={onChange}
            captionLayout={Layout}
            disabled={disablePast ? (date) => {
              // Disable dates before today (ignoring time)
              const compareDate = new Date(date);
              compareDate.setHours(0, 0, 0, 0);
              return compareDate < today;
            } : undefined} // Disable past dates if disablePast is true
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
