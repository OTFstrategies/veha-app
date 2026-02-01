"use client";

import { useState, useCallback, useMemo } from "react";
import {
  startOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  format,
  getWeek,
  getYear,
  isToday,
  isSameWeek,
} from "date-fns";
import { nl } from "date-fns/locale";
import type { CurrentWeek, WeekDay } from "@/types/weekplanning";

interface UseWeekNavigationReturn {
  currentWeek: CurrentWeek;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;
  goToDate: (date: Date) => void;
  isCurrentWeek: boolean;
}

/**
 * Hook for managing week navigation state
 * Week starts on Monday and shows 5 working days (Mon-Fri)
 */
export function useWeekNavigation(): UseWeekNavigationReturn {
  const [baseDate, setBaseDate] = useState<Date>(() => new Date());

  const currentWeek = useMemo<CurrentWeek>(() => {
    // Get start of week (Monday)
    const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
    // End of week is Friday (4 days after Monday)
    const weekEnd = addDays(weekStart, 4);

    // Generate working days (Mon-Fri)
    const days: WeekDay[] = Array.from({ length: 5 }, (_, i) => {
      const date = addDays(weekStart, i);
      return {
        date: format(date, "yyyy-MM-dd"),
        dayName: format(date, "EEEE", { locale: nl }),
        dayNumber: date.getDate(),
        isToday: isToday(date),
      };
    });

    return {
      weekNumber: getWeek(weekStart, { weekStartsOn: 1 }),
      year: getYear(weekStart),
      startDate: format(weekStart, "yyyy-MM-dd"),
      endDate: format(weekEnd, "yyyy-MM-dd"),
      days,
    };
  }, [baseDate]);

  const goToPreviousWeek = useCallback(() => {
    setBaseDate((prev) => subWeeks(prev, 1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setBaseDate((prev) => addWeeks(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setBaseDate(new Date());
  }, []);

  const goToDate = useCallback((date: Date) => {
    setBaseDate(date);
  }, []);

  // Check if currently viewing the current week
  const isCurrentWeek = useMemo(
    () => isSameWeek(baseDate, new Date(), { weekStartsOn: 1 }),
    [baseDate]
  );

  return {
    currentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    goToDate,
    isCurrentWeek,
  };
}
