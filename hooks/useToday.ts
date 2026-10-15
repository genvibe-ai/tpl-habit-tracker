import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { todayKey } from "@/lib/dates";

/** Today's date key. Rolls over at midnight and when the app comes back to the foreground. */
export function useToday() {
  const [today, setToday] = useState(todayKey);
  useEffect(() => {
    const check = () => setToday((previous) => {
      const now = todayKey();
      return now === previous ? previous : now;
    });
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    const timer = setInterval(check, 30_000);
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, []);
  return today;
}
