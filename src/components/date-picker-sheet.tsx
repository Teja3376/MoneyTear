import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";

import {
  backgroundElement,
  border,
  error as errorColor,
  handle as handleColor,
  primary,
  primaryForeground,
  text,
  textSecondary,
} from "@/constants/theme";

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;

export const CURRENT_YEAR = new Date().getFullYear();

/**
 * Formats a Date object into a readable string (e.g. "15 Jan 1998").
 */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Formats a Date object into "YYYY-MM-DD" local calendar date without UTC timezone shift.
 */
export function formatDateYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface CalendarIconProps {
  color?: string;
  size?: number;
}

/**
 * Standard calendar icon matching MoneyTear design language.
 */
export function CalendarIcon({ color = primary, size = 21 }: CalendarIconProps) {
  const scale = size / 21;
  return (
    <View
      style={[
        styles.calendarIcon,
        {
          borderColor: color,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={styles.calendarTop}>
        <View style={[styles.calendarRing, { backgroundColor: color }]} />
        <View style={[styles.calendarRing, { backgroundColor: color }]} />
      </View>
      <View style={styles.calendarDots}>
        <View style={[styles.calendarDot, { backgroundColor: color }]} />
        <View style={[styles.calendarDot, { backgroundColor: color }]} />
        <View style={[styles.calendarDot, { backgroundColor: color }]} />
        <View style={[styles.calendarDot, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

export type CalendarMode = "days" | "years" | "months";

export interface CalendarProps {
  /** Currently selected date */
  value?: Date | null;
  /** Callback fired when a valid date is selected */
  onSelect: (date: Date) => void;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Minimum selectable date */
  minDate?: Date;
  /** Initial month/year to display if value is null */
  initialDate?: Date;
  /** Optional container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * Common Calendar component supporting days grid, month selection, and year scrolling.
 * Can be used standalone in any page, modal, or screen.
 */
export function Calendar({
  value,
  onSelect,
  maxDate,
  minDate,
  initialDate,
  style,
}: CalendarProps) {
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    () => value ?? initialDate ?? new Date()
  );
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("days");
  const yearScrollRef = useRef<ScrollView>(null);

  // Sync displayed month if value changes externally
  useEffect(() => {
    if (value) {
      setCalendarMonth(new Date(value.getFullYear(), value.getMonth(), 1));
    }
  }, [value]);

  const startYear = minDate ? minDate.getFullYear() : 1900;
  const endYear = maxDate ? maxDate.getFullYear() : CURRENT_YEAR + 10;
  const years = useMemo(
    () =>
      Array.from(
        { length: Math.max(endYear - startYear + 1, 1) },
        (_, index) => endYear - index
      ),
    [startYear, endYear]
  );

  const monthStart = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1
  );
  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0
  ).getDate();

  const calendarCells = useMemo(
    () => [
      ...Array(firstWeekday).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ],
    [daysInMonth, firstWeekday]
  );

  const canGoNext = useMemo(() => {
    if (!maxDate) return true;
    const nextMonthStart = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      1
    );
    const maxMonthStart = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    return nextMonthStart <= maxMonthStart;
  }, [calendarMonth, maxDate]);

  const canGoPrev = useMemo(() => {
    if (!minDate) return true;
    const currentMonthStart = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1
    );
    const minMonthStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    return currentMonthStart > minMonthStart;
  }, [calendarMonth, minDate]);

  useEffect(() => {
    if (calendarMode === "years") {
      requestAnimationFrame(() => {
        const offsetIndex = Math.max(0, endYear - calendarMonth.getFullYear());
        yearScrollRef.current?.scrollTo({
          y: Math.max(0, offsetIndex * 44 - 60),
          animated: false,
        });
      });
    }
  }, [calendarMode, calendarMonth, endYear]);

  const changeMonth = (offset: number) => {
    setCalendarMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1)
    );
  };

  const selectYear = (year: number) => {
    setCalendarMonth((current) => new Date(year, current.getMonth(), 1));
    setCalendarMode("months");
  };

  const selectMonth = (monthIndex: number) => {
    setCalendarMonth(
      (current) => new Date(current.getFullYear(), monthIndex, 1)
    );
    setCalendarMode("days");
  };

  const selectDay = (day: number) => {
    const selectedDate = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day,
      12,
      0,
      0
    );
    if (maxDate && selectedDate > maxDate) return;
    if (minDate && selectedDate < minDate) return;
    onSelect(selectedDate);
  };

  return (
    <View style={[styles.calendarContainer, style]}>
      {calendarMode === "days" ? (
        <>
          <View style={styles.monthNav}>
            <Pressable
              onPress={() => canGoPrev && changeMonth(-1)}
              disabled={!canGoPrev}
              hitSlop={10}
              style={styles.monthArrow}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
            >
              <Text
                style={[
                  styles.monthArrowText,
                  !canGoPrev && styles.disabledArrow,
                ]}
              >
                ‹
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setCalendarMode("years")}
              hitSlop={8}
              style={styles.monthTitleButton}
              accessibilityRole="button"
              accessibilityLabel="Choose month and year"
            >
              <Text style={styles.monthTitle}>
                {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}{" "}
                <Text style={styles.expandMark}>⌄</Text>
              </Text>
            </Pressable>

            <Pressable
              onPress={() => canGoNext && changeMonth(1)}
              disabled={!canGoNext}
              hitSlop={10}
              style={styles.monthArrow}
              accessibilityRole="button"
              accessibilityLabel="Next month"
            >
              <Text
                style={[
                  styles.monthArrowText,
                  !canGoNext && styles.disabledArrow,
                ]}
              >
                ›
              </Text>
            </Pressable>
          </View>

          <View style={styles.calendarGrid}>
            {WEEKDAYS.map((day, index) => (
              <Text key={`weekday-${index}`} style={styles.weekday}>
                {day}
              </Text>
            ))}
            {calendarCells.map((day, index) => {
              if (day === null) {
                return (
                  <View
                    key={`blank-${index}`}
                    style={styles.dateCell}
                  />
                );
              }

              const cellDate = new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth(),
                day
              );
              const isSelected =
                value !== null &&
                value !== undefined &&
                value.getDate() === day &&
                value.getMonth() === calendarMonth.getMonth() &&
                value.getFullYear() === calendarMonth.getFullYear();

              const isFuture = maxDate ? cellDate > maxDate : false;
              const isPast = minDate ? cellDate < minDate : false;
              const isDisabled = isFuture || isPast;

              return (
                <Pressable
                  key={`date-${day}`}
                  disabled={isDisabled}
                  onPress={() => selectDay(day)}
                  style={[styles.dateCell, isDisabled && styles.disabledDay]}
                  accessibilityRole="button"
                  accessibilityLabel={`${day} ${MONTHS[calendarMonth.getMonth()]} ${calendarMonth.getFullYear()}`}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      isSelected && styles.selectedDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        isDisabled && styles.disabledDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : calendarMode === "years" ? (
        <View style={styles.modeContainer}>
          <View style={styles.modeSubHeader}>
            <Pressable
              onPress={() => setCalendarMode("days")}
              hitSlop={8}
              style={styles.backModeButton}
            >
              <Text style={styles.backModeText}>‹ Back</Text>
            </Pressable>
            <Text style={styles.modeSubTitle}>Select Year</Text>
            <View style={styles.backModeButtonPlaceholder} />
          </View>
          <ScrollView
            ref={yearScrollRef}
            style={styles.yearList}
            showsVerticalScrollIndicator={false}
          >
            {years.map((year) => {
              const isYearSelected = calendarMonth.getFullYear() === year;
              return (
                <Pressable
                  key={year}
                  onPress={() => selectYear(year)}
                  style={[
                    styles.yearOption,
                    isYearSelected && styles.yearOptionSelected,
                  ]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.yearText,
                      isYearSelected && styles.selectedDayText,
                    ]}
                  >
                    {year}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.modeContainer}>
          <View style={styles.modeSubHeader}>
            <Pressable
              onPress={() => setCalendarMode("years")}
              hitSlop={8}
              style={styles.backModeButton}
            >
              <Text style={styles.backModeText}>‹ Years</Text>
            </Pressable>
            <Text style={styles.modeSubTitle}>
              {calendarMonth.getFullYear()}
            </Text>
            <View style={styles.backModeButtonPlaceholder} />
          </View>
          <View style={styles.monthGrid}>
            {MONTHS.map((month, index) => {
              const isMonthSelected = calendarMonth.getMonth() === index;
              const monthDateStart = new Date(
                calendarMonth.getFullYear(),
                index,
                1
              );
              const monthDateEnd = new Date(
                calendarMonth.getFullYear(),
                index + 1,
                0
              );
              const isMonthDisabled =
                (maxDate && monthDateStart > maxDate) ||
                (minDate && monthDateEnd < minDate);

              return (
                <Pressable
                  key={month}
                  disabled={isMonthDisabled}
                  onPress={() => selectMonth(index)}
                  style={[
                    styles.monthOption,
                    isMonthSelected && styles.monthOptionSelected,
                    isMonthDisabled && styles.disabledDay,
                  ]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.monthOptionText,
                      isMonthSelected && styles.selectedDayText,
                      isMonthDisabled && styles.disabledDayText,
                    ]}
                  >
                    {month}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

export interface DatePickerSheetProps {
  /** Controls bottom sheet visibility */
  visible: boolean;
  /** Callback fired when the sheet requests closing */
  onClose: () => void;
  /** Current selected date */
  value?: Date | null;
  /** Callback fired when date is selected */
  onSelect: (date: Date) => void;
  /** Sheet header title (default: "Select date") */
  title?: string;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Minimum selectable date */
  minDate?: Date;
  /** Initial date displayed if value is null */
  initialDate?: Date;
  /** Whether selecting a day automatically dismisses the sheet (default: true) */
  autoCloseOnSelect?: boolean;
}

/**
 * Reusable animated Bottom Sheet Date Picker.
 * Features smooth spring slide-up, backdrop fade, month/year navigation, and full accessibility.
 */
export function DatePickerSheet({
  visible,
  onClose,
  value,
  onSelect,
  title = "Select date",
  maxDate,
  minDate,
  initialDate,
  autoCloseOnSelect = true,
}: DatePickerSheetProps) {
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const sheetY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Handle opening and closing animations
  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(sheetY, {
          toValue: 0,
          damping: 26,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.48,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(sheetY, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, height, sheetY, backdropOpacity, mounted]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(sheetY, {
        toValue: height,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 190,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false);
        onClose();
      }
    });
  };

  // Android hardware back press listener
  useEffect(() => {
    if (!visible) return;
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleDismiss();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [visible]);

  const handleSelectDate = (date: Date) => {
    onSelect(date);
    if (autoCloseOnSelect) {
      handleDismiss();
    }
  };

  if (!mounted && !visible) return null;

  const sheetHeight = Math.min(Math.max(height * 0.58, 410), 470);

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleDismiss}
            accessibilityLabel="Close date picker"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              transform: [{ translateY: sheetY }],
            },
          ]}
        >
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable
              onPress={handleDismiss}
              hitSlop={12}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <Calendar
            value={value}
            onSelect={handleSelectDate}
            maxDate={maxDate}
            minDate={minDate}
            initialDate={initialDate}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

export interface DatePickerFieldProps {
  label?: string;
  value?: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
  title?: string;
  maxDate?: Date;
  minDate?: Date;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/**
 * Convenience form input that displays formatted date and triggers DatePickerSheet on click.
 */
export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "Select date",
  error,
  title,
  maxDate,
  minDate,
  style,
  disabled = false,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  const handlePress = () => {
    if (disabled) return;
    Keyboard.dismiss();
    setOpen(true);
  };

  return (
    <View style={[styles.fieldContainer, style]}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        style={({ pressed }) => [
          styles.dateInput,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabledInput,
        ]}
      >
        <Text style={[styles.dateInputText, !value && styles.placeholderText]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <CalendarIcon color={primary} />
      </Pressable>

      {error ? <Text style={styles.fieldError}>{error}</Text> : null}

      <DatePickerSheet
        visible={open}
        onClose={() => setOpen(false)}
        value={value}
        onSelect={onChange}
        title={title ?? label ?? "Select date"}
        maxDate={maxDate}
        minDate={minDate}
      />
    </View>
  );
}

export default DatePickerSheet;

const styles = StyleSheet.create({
  calendarContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: backgroundElement,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 26,
    overflow: "hidden",
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 4,
    backgroundColor: handleColor,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sheetTitle: {
    color: text,
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF0A",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: textSecondary,
    fontSize: 23,
    lineHeight: 25,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  monthArrow: {
    width: 38,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  monthArrowText: {
    color: text,
    fontSize: 28,
    lineHeight: 32,
  },
  disabledArrow: {
    color: handleColor,
    opacity: 0.4,
  },
  monthTitleButton: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  monthTitle: {
    color: text,
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  expandMark: {
    color: textSecondary,
    fontSize: 13,

  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  weekday: {
    width: "14.2857%",
    height: 34,
    textAlign: "center",
    textAlignVertical: "center",
    color: textSecondary,
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
  },
  dateCell: {
    width: "14.2857%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircle: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  selectedDay: {
    backgroundColor: primary,
  },
  disabledDay: {
    opacity: 0.35,
  },
  dayText: {
    color: text,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  selectedDayText: {
    color: primaryForeground,
    fontFamily: "Poppins_600SemiBold",
  },
  disabledDayText: {
    color: textSecondary,
  },
  modeContainer: {
    flex: 1,
  },
  modeSubHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 8,
    height: 36,
  },
  backModeButton: {
    minWidth: 60,
    justifyContent: "center",
  },
  backModeText: {
    color: primary,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  modeSubTitle: {
    color: text,
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  backModeButtonPlaceholder: {
    minWidth: 60,
  },
  yearList: {
    flex: 1,
    minHeight: 0,
  },
  yearOption: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    alignSelf: "center",
    width: 104,
  },
  yearOptionSelected: {
    backgroundColor: primary,
  },
  yearText: {
    color: textSecondary,
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    flex: 1,
    paddingVertical: 12,
  },
  monthOption: {
    width: "33.3333%",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
  },
  monthOptionSelected: {
    backgroundColor: primary,
  },
  monthOptionText: {
    color: text,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  calendarIcon: {
    width: 21,
    height: 21,
    borderWidth: 1.6,
    borderRadius: 5,
    paddingTop: 5,
    paddingHorizontal: 3,
  },
  calendarTop: {
    position: "absolute",
    top: -3,
    left: 4,
    right: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  calendarRing: {
    width: 2,
    height: 6,
    borderRadius: 2,
  },
  calendarDots: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 3,
  },
  calendarDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    color: text,
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
  },
  dateInput: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 14,
    backgroundColor: backgroundElement,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInputText: {
    color: text,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  placeholderText: {
    color: textSecondary,
  },
  fieldError: {
    color: errorColor,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: -4,
  },
  pressed: {
    opacity: 0.78,
  },
  disabledInput: {
    opacity: 0.5,
  },
});
