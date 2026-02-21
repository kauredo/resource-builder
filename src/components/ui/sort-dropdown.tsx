"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface SortDropdownProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: T[];
  labels: Record<T, string>;
  /** Label prefix shown before the selected value. Defaults to "Sort" */
  prefix?: string;
  /** Optional icon rendered before the prefix */
  icon?: React.ElementType;
}

export function SortDropdown<T extends string>({
  value,
  onChange,
  options,
  labels,
  prefix = "Sort",
  icon: Icon,
}: SortDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setFocusedIndex(options.indexOf(value));
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0) {
          onChange(options[focusedIndex]);
          setOpen(false);
          triggerRef.current?.focus();
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) {
            setFocusedIndex(options.indexOf(value));
          }
        }}
        onKeyDown={handleKeyDown}
        className="inline-flex items-center gap-2 min-h-[32px] px-3 py-1.5 text-sm font-medium text-muted-foreground bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {Icon && <Icon className="size-3.5" aria-hidden="true" />}
        {prefix}: {labels[value]}
        <ChevronDown
          className={`size-4 transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 w-36 bg-card border border-border rounded-lg shadow-lg py-1 z-10"
          role="listbox"
          aria-label="Sort options"
          aria-activedescendant={
            focusedIndex >= 0
              ? `sort-option-${options[focusedIndex]}`
              : undefined
          }
          onKeyDown={handleKeyDown}
        >
          {options.map((option, index) => (
            <button
              key={option}
              id={`sort-option-${option}`}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              onMouseEnter={() => setFocusedIndex(index)}
              className={`w-full min-h-[36px] px-3 py-2 text-sm text-left cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                focusedIndex === index
                  ? "bg-muted border-l-2 border-coral"
                  : "border-l-2 border-transparent"
              } ${
                value === option
                  ? "text-coral font-medium"
                  : "text-foreground"
              }`}
              role="option"
              aria-selected={value === option}
            >
              {labels[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
