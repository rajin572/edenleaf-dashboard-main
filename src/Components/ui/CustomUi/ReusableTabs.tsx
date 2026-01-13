"use client";
import React from "react";

type Tab<T extends string> = {
  label: string;
  value: T;
  content: React.ReactNode;
};

type ReusableTabsProps<T extends string> = {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  align?: "left" | "center" | "right";
};

const ReusableTabs = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
  align = "center",
}: ReusableTabsProps<T>) => {
  const justifyClass =
    align === "left"
      ? "justify-start"
      : align === "right"
        ? "justify-end"
        : "justify-center";

  return (
    <div>
      <div className={`w-full flex ${justifyClass}`}>
        <div className="bg-[#F2F2F4CC] p-1.5 rounded-xl flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`px-4 py-1.5 rounded-md font-medium text-sm sm:text-base transition-all duration-300 cursor-pointer
                ${activeTab === tab.value
                  ? "bg-foreground text-white"
                  : "bg-transparent text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {tabs.find((tab) => tab.value === activeTab)?.content}
      </div>
    </div>
  );
};

export default ReusableTabs;
