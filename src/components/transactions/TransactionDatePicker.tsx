import { format, isToday, isYesterday, subDays } from "date-fns"
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
import { useState } from "react"

interface TransactionDatePickerProps {
  date: Date
  setDate: (date: Date) => void
}

export function TransactionDatePicker({ date, setDate }: TransactionDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      setIsOpen(false)
    }
  }

  const setToday = () => {
    setDate(new Date())
    setIsOpen(false)
  }

  const setYesterday = () => {
    setDate(subDays(new Date(), 1))
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            isToday(date) ? (
              "Hoy"
            ) : isYesterday(date) ? (
              "Ayer"
            ) : (
              format(date, "PPP", { locale: es })
            )
          ) : (
            <span>Seleccionar fecha</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x border-b">
          <div className="flex sm:flex-col gap-2 p-3">
            <Button 
              variant={isToday(date) ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={setToday}
            >
              Hoy
            </Button>
            <Button 
              variant={isYesterday(date) ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={setYesterday}
            >
              Ayer
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            locale={es}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
