import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PulseButton } from "../ui/pulse-button";
import { Badge } from "../ui/badge";
import {
  Calendar,
  Clock,
  Heart,
  Plus,
  Sparkles,
  Trash2,
  Pencil,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../../contexts/AuthContext";
import { scheduleReminder } from "../../lib/reminders";
import { useTranslation } from "../../i18n";
import { ProgressRing } from "../ui/progress-ring";
import { getConfetti } from "../../lib/confetti";
import type { Options as ConfettiOptions } from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { fetchGoogleCalendarEvents } from "../../integrations/google-calendar";
import { fetchMicrosoftCalendarEvents } from "../../integrations/microsoft-calendar";
import { fetchEnergyCycleMetrics, type EnergyCycleMetrics } from "../../integrations/wearable";

export interface TimeSlot {
  id: string;
  user_id: string;
  start: string;
  end: string;
  date: string;
  type: "mutual" | "suggested" | "booked";
  title?: string | null;
  source?: "internal" | "google" | "microsoft";
}

interface Suggestion {
  date: string;
  start: string;
  end: string;
  display: string;
  match: string;
  reason: string;
}

interface SharedCalendarProps {
  className?: string;
}

const TimePicker = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ ...props }, ref) => <Input type="time" ref={ref} {...props} />);
TimePicker.displayName = "TimePicker";

export const SharedCalendar: React.FC<SharedCalendarProps> = ({
  className,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [partnerSlots, setPartnerSlots] = useState<TimeSlot[]>([]);
  const [importedEvents, setImportedEvents] = useState<TimeSlot[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedDate, setSelectedDate] = useState("2024-01-15");
  const [view, setView] = useState<"week" | "suggestions">("week");
  const [showMutualOnly, setShowMutualOnly] = useState(false);
  const [now, setNow] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [energyMetrics, setEnergyMetrics] = useState<EnergyCycleMetrics | null>(null);
  const [formData, setFormData] = useState<{
    id: string | null;
    start: string;
    end: string;
    title: string;
  }>({ id: null, start: "", end: "", title: "" });

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchEnergyCycleMetrics().then(setEnergyMetrics);
  }, []);

  const celebratedSlots = useRef<Set<string>>(new Set());
  const allTimeSlots = useMemo(
    () => [...timeSlots, ...importedEvents],
    [timeSlots, importedEvents],
  );

  const parseTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60)
      .toString()
      .padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const snapToHalfHour = (time: string) => {
    const mins = parseTime(time);
    const snapped = Math.round(mins / 30) * 30;
    const clamped = Math.min(Math.max(snapped, 0), 23 * 60 + 30);
    return minutesToTime(clamped);
  };

  const formatDisplay = (date: string, start: string, end: string) => {
    const dateObj = new Date(`${date}T${start}`);
    const today = new Date().toISOString().split("T")[0];
    const dayLabel =
      date === today
        ? "Today"
        : dateObj.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
    const startStr = new Date(`${date}T${start}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const endStr = new Date(`${date}T${end}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${dayLabel}, ${startStr} - ${endStr}`;
  };

  const computeMatchAndReason = useCallback(
    (date: string, startMinutes: number) => {
      let match = 80;
      let reason = "Balanced energy";
      const phase = energyMetrics?.phase;
      const ranges: Record<string, [number, number]> = {
        peak: [9 * 60, 17 * 60],
        low: [13 * 60, 15 * 60],
        recovery: [18 * 60, 21 * 60],
      };
      if (phase) {
        const range = ranges[phase] || [0, 24 * 60];
        if (startMinutes >= range[0] && startMinutes <= range[1]) {
          match = 95;
          reason = `Aligns with your ${phase} energy`;
        } else {
          match = 70;
          reason = `Outside your ${phase} energy`;
        }
      }
      const day = new Date(date).getDay();
      const isWeekend = day === 0 || day === 6;
      if (isWeekend) {
        match += 2;
        reason += " on weekend";
      }
      return { match: `${match}%`, reason };
    },
    [energyMetrics],
  );

  const parentMode = user?.parentMode;

  const generateSuggestions = useCallback(
    (mine: TimeSlot[], partner: TimeSlot[]): Suggestion[] => {
      const suggestions: Suggestion[] = [];
      const partnerByDate = partner.reduce<Record<string, TimeSlot[]>>(
        (acc, slot) => {
          if (slot.type === "booked") return acc;
          acc[slot.date] = acc[slot.date] || [];
          acc[slot.date].push(slot);
          return acc;
        },
        {},
      );
      const busySlots = mine.filter((s) => s.type === "booked");

      mine.forEach((slot) => {
        if (slot.type === "booked") return;
        const sameDay = partnerByDate[slot.date] || [];
        sameDay.forEach((pSlot) => {
          const start = Math.max(parseTime(slot.start), parseTime(pSlot.start));
          const end = Math.min(parseTime(slot.end), parseTime(pSlot.end));
          if (start < end) {
            const hasConflict = busySlots.some(
              (b) =>
                b.date === slot.date &&
                parseTime(b.start) < end &&
                parseTime(b.end) > start,
            );
            if (hasConflict) return;
            const startStr = minutesToTime(start);
            const endStr = minutesToTime(end);
            const { match, reason } = computeMatchAndReason(slot.date, start);
            suggestions.push({
              date: slot.date,
              start: startStr,
              end: endStr,
              display: formatDisplay(slot.date, startStr, endStr),
              match,
              reason,
            });
            if (parentMode) {
              [10, 20].forEach((dur) => {
                if (start + dur <= end) {
                  const mEnd = minutesToTime(start + dur);
                  suggestions.push({
                    date: slot.date,
                    start: startStr,
                    end: mEnd,
                    display: formatDisplay(slot.date, startStr, mEnd),
                    match: "100%",
                    reason: "Micro-sieste",
                  });
                }
              });
            }
          }
        });
      });

      return suggestions.sort(
        (a, b) => parseInt(b.match) - parseInt(a.match),
      );
    },
    [parentMode, computeMatchAndReason],
  );

  useEffect(() => {
    if (!user) return;

    const fetchSlots = async () => {
      const { data: myData, error: myError } = await supabase
        .from("time_slots")
        .select("*")
        .eq("user_id", user.id);
      if (!myError && myData) {
        setTimeSlots(
          (myData as TimeSlot[]).map((s) => ({ ...s, source: "internal" })),
        );
      }

      if (user.partnerId) {
        const { data: partnerData, error: partnerError } = await supabase
          .from("time_slots")
          .select("*")
          .eq("user_id", user.partnerId);
        if (!partnerError && partnerData) {
          setPartnerSlots(partnerData as TimeSlot[]);
        }
      } else {
        setPartnerSlots([]);
      }

      const [googleEvents, microsoftEvents] = await Promise.all([
        fetchGoogleCalendarEvents(),
        fetchMicrosoftCalendarEvents(),
      ]);
      setImportedEvents([...googleEvents, ...microsoftEvents]);
    };

    fetchSlots();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setSuggestions(generateSuggestions(allTimeSlots, partnerSlots));
  }, [allTimeSlots, partnerSlots, user, generateSuggestions]);

  useEffect(() => {
    timeSlots
      .filter((slot) => slot.type === "booked")
      .forEach((slot) => {
        const hasPartner = partnerSlots.some(
          (p) =>
            p.type === "booked" &&
            p.date === slot.date &&
            p.start === slot.start &&
            p.end === slot.end,
        );
        const key = `${slot.date}-${slot.start}-${slot.end}`;
        if (hasPartner && !celebratedSlots.current.has(key)) {
          celebratedSlots.current.add(key);
          getConfetti().then((confetti) =>
            confetti(
              {
                particleCount: 80,
                spread: 60,
                origin: { y: 0.6 },
              } as ConfettiOptions,
            ),
          );
        }
      });
  }, [timeSlots, partnerSlots]);

  const addTimeSlot = () => {
    setFormData({ id: null, start: "", end: "", title: "" });
    setIsModalOpen(true);
  };

  const updateTimeSlot = (id: string) => {
    const slot = timeSlots.find((s) => s.id === id);
    if (!slot) return;
    setFormData({
      id: slot.id,
      start: slot.start,
      end: slot.end,
      title: slot.title || "",
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!user) return;
    const start = snapToHalfHour(formData.start);
    const end = snapToHalfHour(formData.end);
    const title = formData.title || null;

    if (formData.id) {
      const { data, error } = await supabase
        .from("time_slots")
        .update({ start, end, title })
        .eq("id", formData.id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (!error && data) {
        setTimeSlots((prev) =>
          prev.map((slot) =>
            slot.id === formData.id
              ? ({ ...(data as TimeSlot), source: "internal" })
              : slot,
          ),
        );
      }
    } else {
      const { data, error } = await supabase
        .from("time_slots")
        .insert({
          user_id: user.id,
          start,
          end,
          date: selectedDate,
          type: "mutual",
          title,
        })
        .select()
        .single();
      if (!error && data) {
        setTimeSlots((prev) => [
          ...prev,
          { ...(data as TimeSlot), source: "internal" },
        ]);
      }
    }
    setIsModalOpen(false);
  };

  const deleteTimeSlot = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("time_slots")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (!error) {
      setTimeSlots((prev) => prev.filter((slot) => slot.id !== id));
    }
  };

  const handleAcceptSuggestion = async (suggestion: Suggestion) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("time_slots")
      .insert({
        user_id: user.id,
        start: suggestion.start,
        end: suggestion.end,
        date: suggestion.date,
        type: "booked",
        title: suggestion.reason,
      })
      .select()
      .single();
    if (!error && data) {
      setTimeSlots((prev) => [
        ...prev,
        { ...(data as TimeSlot), source: "internal" },
      ]);
    }
  };

  const handleDeferSuggestion = async (suggestion: Suggestion) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("time_slots")
      .insert({
        user_id: user.id,
        start: suggestion.start,
        end: suggestion.end,
        date: suggestion.date,
        type: "suggested",
        title: suggestion.reason,
      })
      .select()
      .single();
    if (!error && data) {
      setTimeSlots((prev) => [
        ...prev,
        { ...(data as TimeSlot), source: "internal" },
      ]);
    }

    const now = new Date();
    const nextSlot = timeSlots
      .filter((s) => s.type === "mutual")
      .map((s) => ({ ...s, dateTime: new Date(`${s.date}T${s.start}`) }))
      .filter((s) => s.dateTime > now)
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())[0];

    if (nextSlot) {
      scheduleReminder(user.id, nextSlot);
    }
  };

  const weekDays = [
    { date: "2024-01-15", day: "Mon", dayNum: "15" },
    { date: "2024-01-16", day: "Tue", dayNum: "16" },
    { date: "2024-01-17", day: "Wed", dayNum: "17" },
    { date: "2024-01-18", day: "Thu", dayNum: "18" },
    { date: "2024-01-19", day: "Fri", dayNum: "19" },
    { date: "2024-01-20", day: "Sat", dayNum: "20" },
    { date: "2024-01-21", day: "Sun", dayNum: "21" },
  ];

  const getSlotTypeInfo = (type: TimeSlot["type"]) => {
    switch (type) {
      case "mutual":
        return {
          color: "bg-primary/20 border-primary text-primary",
          icon: <Heart className="w-3 h-3" />,
          label: "Perfect Match",
        };
      case "suggested":
        return {
          color: "bg-accent/20 border-accent text-accent-foreground",
          icon: <Sparkles className="w-3 h-3" />,
          label: "AI Suggestion",
        };
      case "booked":
        return {
          color: "bg-success/20 border-success text-success-foreground",
          icon: <Calendar className="w-3 h-3" />,
          label: "Confirmed",
        };
    }
  };

  const getSlotsForDate = (date: string) => {
    return allTimeSlots.filter(
      (slot) =>
        slot.date === date && (!showMutualOnly || slot.type === "mutual"),
    );
  };

  const findOverlaps = (slots: TimeSlot[]) => {
    const overlapping = new Set<string>();
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const aStart = parseTime(slots[i].start);
        const aEnd = parseTime(slots[i].end);
        const bStart = parseTime(slots[j].start);
        const bEnd = parseTime(slots[j].end);
        if (aStart < bEnd && bStart < aEnd) {
          overlapping.add(slots[i].id);
          overlapping.add(slots[j].id);
        }
      }
    }
    return overlapping;
  };
  const slotsForSelectedDate = getSlotsForDate(selectedDate);
  const overlappingSlots = findOverlaps(slotsForSelectedDate);

  const halfHourMarks = Array.from({ length: 48 }, (_, i) => minutesToTime(i * 30));
  const allSlotsForSelectedDate = allTimeSlots.filter(
    (slot) => slot.date === selectedDate,
  );

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.id ? "Edit Time Slot" : "Add Time Slot"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="start">Start</Label>
              <TimePicker
                id="start"
                value={formData.start}
                onChange={(e) =>
                  setFormData({ ...formData, start: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">End</Label>
              <TimePicker
                id="end"
                value={formData.end}
                onChange={(e) =>
                  setFormData({ ...formData, end: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <PulseButton variant="outline">Cancel</PulseButton>
            </DialogClose>
            <PulseButton onClick={handleModalSubmit}>Save</PulseButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className={cn("shadow-card animate-scale-in", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-serif">
            <Calendar className="w-5 h-5 text-primary" />
            Shared Calendar
          </CardTitle>
          <div className="flex gap-2">
            <Badge
              variant={view === "week" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setView("week")}
            >
              Week
            </Badge>
            <Badge
              variant={view === "suggestions" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setView("suggestions")}
            >
              Suggestions
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {view === "week" ? (
          <>
            {/* Week View */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDays.map((day) => {
                const isSelected = selectedDate === day.date;
                const hasSlots = getSlotsForDate(day.date).length > 0;

                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={cn(
                      "p-2 rounded-lg text-center transition-all duration-200",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : hasSlots
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    <div className="text-xs font-medium">{day.day}</div>
                    <div className="text-sm">{day.dayNum}</div>
                    {hasSlots && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Slots */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedDate === "2024-01-15"
                    ? "Today"
                    : new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={showMutualOnly ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setShowMutualOnly(!showMutualOnly)}
                  >
                    Mutual Only
                  </Badge>
                  <PulseButton variant="ghost" size="sm" onClick={addTimeSlot}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Time Slot
                  </PulseButton>
                </div>
              </div>

              <div className="relative border rounded-md overflow-hidden">
                <div
                  className="grid w-full"
                  style={{ gridTemplateRows: "repeat(48, 1.5rem)" }}
                >
                  {halfHourMarks.map((mark, i) => (
                    <div
                      key={mark}
                      className="border-b border-border text-[10px] text-muted-foreground relative"
                    >
                      {i % 2 === 0 && (
                        <span className="absolute -left-10">{mark}</span>
                      )}
                    </div>
                  ))}
                </div>

                {slotsForSelectedDate.map((slot) => {
                  const typeInfo = getSlotTypeInfo(slot.type);
                  const start = parseTime(slot.start);
                  const end = parseTime(slot.end);
                  const top = (start / (24 * 60)) * 100;
                  const height = ((end - start) / (24 * 60)) * 100;
                  const isOverlap = overlappingSlots.has(slot.id);
                  const slotStartDate = new Date(`${slot.date}T${slot.start}`);
                  const diff =
                    (slotStartDate.getTime() - now.getTime()) / 60000;
                  const isUpcoming = diff <= 120 && diff >= 0;
                  const progress =
                    ((120 - Math.min(120, Math.max(0, diff))) / 120) * 100;
                  return (
                    <div
                      key={slot.id}
                      className={cn(
                        "absolute left-0 right-0 m-0.5 p-2 rounded border text-xs flex flex-col justify-between",
                        typeInfo.color,
                        isOverlap && "bg-destructive/20 border-destructive",
                      )}
                      style={{ top: `${top}%`, height: `${height}%` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isUpcoming && (
                            <ProgressRing progress={progress} size={16} />
                          )}
                          {typeInfo.icon}
                          <span className="font-medium">
                            {slot.start} - {slot.end}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {typeInfo.label}
                          </Badge>
                          {!slot.source && (
                            <>
                              <button
                                onClick={() => updateTimeSlot(slot.id)}
                                className="p-1 hover:text-foreground text-muted-foreground"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteTimeSlot(slot.id)}
                                className="p-1 hover:text-destructive text-destructive/80"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {slotsForSelectedDate.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No time slots for this day</p>
                    </div>
                  </div>
                )}
              </div>

              {slotsForSelectedDate.length > 0 ? (
                <div className="space-y-2">
                  {slotsForSelectedDate.map((slot) => {
                    const typeInfo = getSlotTypeInfo(slot.type);
                    const slotStartDate = new Date(`${slot.date}T${slot.start}`);
                    const diff =
                      (slotStartDate.getTime() - now.getTime()) / 60000;
                    const isUpcoming = diff <= 120 && diff >= 0;
                    const progress =
                      ((120 - Math.min(120, Math.max(0, diff))) / 120) * 100;
                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          "p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02]",
                          typeInfo.color,
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isUpcoming && (
                              <ProgressRing progress={progress} size={16} />
                            )}
                            {typeInfo.icon}
                            <span className="font-medium">
                              {slot.start} - {slot.end}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {typeInfo.label}
                            </Badge>
                            {!slot.source && (
                              <>
                                <button
                                  onClick={() => updateTimeSlot(slot.id)}
                                  className="p-1 hover:text-foreground text-muted-foreground"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteTimeSlot(slot.id)}
                                  className="p-1 hover:text-destructive text-destructive/80"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {slot.title && (
                          <p className="text-[10px] mt-1 opacity-90">
                            {slot.title}
                          </p>
                        )}
                      </div>
                    );
                  })}

                {slotsForSelectedDate.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No time slots for this day</p>
                    </div>
                  </div>
                )}
              </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <path d="M8 12h8M12 8v8" />
                  </svg>
                  <p>{t("addFirstAvailability")}</p>

                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>
                    {showMutualOnly && allSlotsForSelectedDate.length > 0
                      ? "No mutual time slots for this day"
                      : "No time slots for this day"}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* AI Suggestions View */
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI-Powered Suggestions</span>
            </div>

            <div className="space-y-3">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-card rounded-lg border border-primary/20 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{suggestion.display}</span>
                      <Badge
                        variant="outline"
                        className="text-primary border-primary"
                      >
                        {suggestion.match} match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {suggestion.reason}
                    </p>
                    <div className="flex gap-2">
                      <PulseButton
                        variant="soft"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAcceptSuggestion(suggestion)}
                      >
                        Accepter
                      </PulseButton>
                      <PulseButton
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeferSuggestion(suggestion)}
                      >
                        Plus tard
                      </PulseButton>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No matching time slots found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
