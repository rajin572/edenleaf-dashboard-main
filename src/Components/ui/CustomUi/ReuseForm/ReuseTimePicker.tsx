"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "../../button";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import { ScrollArea, ScrollBar } from "../../scroll-area";

// Define possible props for the component
interface DateTimePickerProps {
    selectedDate?: Date | undefined; // Full Date (e.g., 2025/29/12)
    value: Date | undefined; // Time value (e.g., 10:30 AM)
    onChange: (date: Date) => void; // Callback to update the time
    formatString?: string; // Optional custom format string
    timeFormat?: "12-hour" | "24-hour"; // Choose between 12-hour and 24-hour format
    placeholder?: string; // Placeholder text
    disablePast?: boolean; // Disable past times if today
    disable?: boolean; // Disable the popover if true
}

export function ReuseTimePicker({
    selectedDate,
    value,
    onChange,
    formatString = "hh:mm aa", // Default to 12-hour format (without date)
    timeFormat = "12-hour", // Default to 12-hour format
    placeholder = "Select a time", // Default placeholder
    disablePast = false, // Default disablePast to false
    disable = false, // Default to false (popover enabled)
}: DateTimePickerProps) {
    // Get today's date and current time to disable past times
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight to compare only the date part
    const currentTime = new Date(); // Current time to compare with

    // Get current AM/PM based on selectedTime or current time
    const getCurrentAMPM = (): "AM" | "PM" => {
        if (value) {
            return value.getHours() >= 12 ? "PM" : "AM";
        }
        return currentTime.getHours() >= 12 ? "PM" : "AM";
    };

    const [selectedTime, setSelectedTime] = useState<Date | undefined>(value);
    const [timeAMPMFormat, setTimeAMPMFormat] = useState<"AM" | "PM">(getCurrentAMPM());

    console.log("Selected Time:", selectedTime, "AM/PM:", timeAMPMFormat);

    // Effect to update selectedTime if selectedDate or value prop changes
    useEffect(() => {
        setSelectedTime(value); // If value changes, update the selected time
        if (value) {
            setTimeAMPMFormat(value.getHours() >= 12 ? "PM" : "AM");
        }
    }, [value]);

    const handleTimeChange = (type: "hour" | "minute" | "ampm", changeValue: string) => {
        const currentDate = selectedTime || new Date();
        const newDate = new Date(currentDate);

        if (type === "hour") {
            const hour = parseInt(changeValue, 10);
            // Handle 12-hour format conversion
            if (timeFormat === "12-hour") {
                const currentPeriod = timeAMPMFormat;
                if (currentPeriod === "PM") {
                    // PM: 12 stays 12, 1-11 becomes 13-23
                    newDate.setHours(hour === 12 ? 12 : hour + 12);
                } else {
                    // AM: 12 becomes 0, 1-11 stays 1-11
                    newDate.setHours(hour === 12 ? 0 : hour);
                }
            } else {
                newDate.setHours(hour);
            }
        } else if (type === "minute") {
            newDate.setMinutes(parseInt(changeValue, 10));
        } else if (type === "ampm") {
            setTimeAMPMFormat(changeValue as "AM" | "PM");
            const hours = newDate.getHours();
            if (changeValue === "AM" && hours >= 12) {
                newDate.setHours(hours - 12);
            } else if (changeValue === "PM" && hours < 12) {
                newDate.setHours(hours + 12);
            }
        }

        setSelectedTime(newDate);
        onChange(newDate); // Pass the new date back to the parent
    };

    // Function to disable past times if today
    const isTimeDisabled = (hour: number, minute: number, period?: "AM" | "PM", isHourCheck: boolean = false) => {
        if (disablePast && selectedDate && selectedDate.toDateString() === today.toDateString()) {
            const currentHour = currentTime.getHours();
            const currentMinute = currentTime.getMinutes();

            // For 12-hour format
            if (timeFormat === "12-hour" && period) {
                // Convert display hour to 24-hour format
                let hour24 = hour;
                if (period === "PM" && hour !== 12) {
                    hour24 = hour + 12;
                } else if (period === "AM" && hour === 12) {
                    hour24 = 0;
                }

                // If checking hour selection, only disable if hour is strictly before current hour
                if (isHourCheck) {
                    return hour24 < currentHour;
                }

                // If selected hour is before current hour, disable it
                if (hour24 < currentHour) {
                    return true;
                }

                // If selected hour is the same as current hour, check minutes
                if (hour24 === currentHour && minute < currentMinute) {
                    return true;
                }

                return false;
            }

            // For 24-hour format
            // If checking hour selection, only disable if hour is strictly before current hour
            if (isHourCheck) {
                return hour < currentHour;
            }

            // If selected hour is before current hour, disable it
            if (hour < currentHour) {
                return true;
            }

            // If selected hour is the same as current hour, check minutes
            if (hour === currentHour && minute < currentMinute) {
                return true;
            }

            return false;
        }
        return false;
    };

    if (disable) {
        return null; // Return nothing if popover is disabled
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={"outline"} className="w-fit pl-3 text-left font-normal">
                    {selectedTime ? (
                        format(selectedTime, formatString) // Only show time without date
                    ) : (
                        <span>{placeholder}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="flex flex-col sm:flex-row py-5 divide-y sm:divide-y-0 sm:divide-x">
                    {/* ScrollArea for Hours */}
                    <ScrollArea className="w-64 sm:w-auto h-[250px] overflow-auto">
                        <div className="flex sm:flex-col p-2">
                            {Array.from({ length: timeFormat === "12-hour" ? 12 : 24 }, (_, i) => i).map(
                                (hour) => {
                                    const displayHour = timeFormat === "12-hour" && hour === 0 ? 12 : hour;
                                    return (
                                        <Button
                                            key={hour}
                                            size="icon"
                                            variant={
                                                selectedTime &&
                                                    (timeFormat === "12-hour"
                                                        ? (selectedTime.getHours() % 12 === 0 ? 12 : selectedTime.getHours() % 12) === displayHour
                                                        : selectedTime.getHours() === hour)
                                                    ? "default"
                                                    : "ghost"
                                            }
                                            className="sm:w-full shrink-0 aspect-square"
                                            onClick={() => handleTimeChange("hour", displayHour.toString())}
                                            disabled={isTimeDisabled(displayHour, 0, timeAMPMFormat, true)} // Pass AM/PM and isHourCheck=true
                                        >
                                            {displayHour}
                                        </Button>
                                    );
                                }
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                    </ScrollArea>
                    {/* ScrollArea for Minutes */}
                    <ScrollArea className="w-64 sm:w-auto h-[250px] overflow-auto">
                        <div className="flex sm:flex-col p-2">
                            {Array.from({ length: 60 }, (_, i) => i).map((minute) => {
                                const currentHour = selectedTime ? selectedTime.getHours() : 0;
                                const displayHour = timeFormat === "12-hour"
                                    ? (currentHour % 12 === 0 ? 12 : currentHour % 12)
                                    : currentHour;

                                return (
                                    <Button
                                        key={minute}
                                        size="icon"
                                        variant={
                                            selectedTime && selectedTime.getMinutes() === minute
                                                ? "default"
                                                : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() => handleTimeChange("minute", minute.toString())}
                                        disabled={isTimeDisabled(displayHour, minute, timeAMPMFormat)} // Pass AM/PM
                                    >
                                        {minute.toString().padStart(2, "0")}
                                    </Button>
                                );
                            })}
                        </div>
                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                    </ScrollArea>
                    {/* ScrollArea for AM/PM (Only for 12-hour format) */}
                    {timeFormat === "12-hour" && (
                        <ScrollArea className="h-[250px] overflow-auto">
                            <div className="flex sm:flex-col p-2">
                                {["AM", "PM"].map((ampm) => (
                                    <Button
                                        key={ampm}
                                        size="icon"
                                        variant={timeAMPMFormat === ampm ? "default" : "ghost"}
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() => handleTimeChange("ampm", ampm)}
                                    >
                                        {ampm}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}