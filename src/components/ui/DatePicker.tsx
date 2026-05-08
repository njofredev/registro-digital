"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  name: string
  defaultValue?: string
  required?: boolean
  className?: string
  onChange?: (date: Date | undefined) => void
}

export function DatePicker({ name, defaultValue, required, className, onChange }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!defaultValue) return undefined;
    // Prevent timezone shifts by parsing explicitly
    const parsed = new Date(defaultValue + "T12:00:00");
    return isNaN(parsed.getTime()) ? undefined : parsed;
  })

  React.useEffect(() => {
    if (defaultValue) {
      const parsed = new Date(defaultValue + "T12:00:00");
      if (!isNaN(parsed.getTime())) {
        setDate(parsed);
      }
    }
  }, [defaultValue]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onChange) {
      onChange(selectedDate);
    }
  };

  const formattedValue = date ? format(date, "yyyy-MM-dd") : ""

  return (
    <div className={cn("w-full", className)}>
      <input type="hidden" name={name} value={formattedValue} required={required} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-12 rounded-xl border border-border/50 bg-background/50 hover:bg-secondary/40 focus:border-primary/50 transition-all",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground/80" />
            {date ? (
              format(date, "PPP", { locale: es })
            ) : (
              <span>Seleccione fecha...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-2xl border border-border/50 shadow-2xl bg-card z-50" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            locale={es}
            className="rounded-2xl border-none p-3"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
