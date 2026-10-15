import { memo, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View, type GestureResponderEvent } from "react-native";
import { calendar } from "@/constants/content";
import { fonts } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { withAlpha } from "@/lib/color";
import { addDays, dayOfMonth, monthOf, startOfWeek } from "@/lib/dates";
import type { DateKey } from "@/lib/types";
import { Text } from "../ui/Text";

export type HeatCell = {
  level: 0 | 1 | 2 | 3 | 4;
  /** value: a normal day; rest: not planned; before: before tracking began. */
  kind: "value" | "rest" | "before";
};

const CELL = 13;
const GAP = 3;
const STRIDE = CELL + GAP;

/**
 * A GitHub-style year: one column per week, newest on the right. Scrolls
 * sideways and opens at today. Tap a square to read that day below.
 */
export const Heatmap = memo(function Heatmap({
  today,
  weekStart,
  cellFor,
  describe,
  weeks = 53,
  less,
  more,
}: {
  today: DateKey;
  weekStart: 0 | 1;
  cellFor: (day: DateKey) => HeatCell;
  /** The caption for a tapped day. */
  describe: (day: DateKey, cell: HeatCell | null) => string;
  weeks?: number;
  less: string;
  more: string;
}) {
  const s = useStyles();
  const t = useTheme();
  const scroll = useRef<ScrollView>(null);
  const [selected, setSelected] = useState<DateKey>(today);
  const first = addDays(startOfWeek(today, weekStart), -7 * (weeks - 1));

  const columns = useMemo(
    () =>
      Array.from({ length: weeks }, (_, w) =>
        Array.from({ length: 7 }, (_, d) => {
          const day = addDays(first, w * 7 + d);
          return { day, cell: day > today ? null : cellFor(day) };
        }),
      ),
    [first, weeks, today, cellFor],
  );

  // A month label over the first week that starts in a new month.
  const months = useMemo(() => {
    const labels: { x: number; label: string }[] = [];
    columns.forEach((column, w) => {
      const top = column[0].day;
      if (dayOfMonth(top) <= 7 && w < weeks - 1) labels.push({ x: w * STRIDE, label: calendar.monthsShort[monthOf(top)] });
    });
    return labels;
  }, [columns, weeks]);

  const colorOf = (cell: HeatCell | null) => {
    if (!cell) return "transparent";
    if (cell.kind === "before") return withAlpha(t.heat[0], 0.35);
    if (cell.kind === "rest") return withAlpha(t.heat[0], 0.55);
    return t.heat[cell.level];
  };

  const onPress = (e: GestureResponderEvent) => {
    // Native gives locationX/Y; on the web the press is a mouse click with offsetX/Y.
    const event = e.nativeEvent as GestureResponderEvent["nativeEvent"] & { offsetX?: number; offsetY?: number };
    const x = event.locationX ?? event.offsetX ?? 0;
    const y = event.locationY ?? event.offsetY ?? 0;
    const w = Math.min(weeks - 1, Math.max(0, Math.floor(x / STRIDE)));
    const d = Math.min(6, Math.max(0, Math.floor(y / STRIDE)));
    const target = columns[w]?.[d];
    if (target?.cell) setSelected(target.day);
  };

  const selectedCell = columns.flat().find((c) => c.day === selected)?.cell ?? null;
  const rowLabels = [0, 2, 4, 6].map((offset) => ({ row: offset, label: calendar.weekdaysShort[(weekStart + offset) % 7] }));
  const width = weeks * STRIDE - GAP;

  return (
    <View>
      <View style={s.body}>
        <View style={s.rowLabels}>
          {rowLabels.map(({ row, label }) => (
            <Text key={row} variant="small" tone="faint" style={[s.rowLabel, { top: 18 + row * STRIDE }]}>
              {label}
            </Text>
          ))}
        </View>
        <ScrollView
          ref={scroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
          style={s.scroll}
        >
          <View style={{ width }}>
            <View style={s.months}>
              {months.map((m) => (
                <Text key={`${m.x}`} variant="small" tone="faint" style={[s.month, { left: m.x }]}>
                  {m.label}
                </Text>
              ))}
            </View>
            <Pressable onPress={onPress} accessibilityLabel={describe(selected, selectedCell)}>
              <View style={s.grid} pointerEvents="none">
                {columns.map((column, w) => (
                  <View key={w} style={s.column}>
                    {column.map(({ day, cell }) => (
                      <View
                        key={day}
                        style={[
                          s.cell,
                          { backgroundColor: colorOf(cell) },
                          day === today && s.today,
                          day === selected && day !== today && s.selected,
                        ]}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </View>
      <View style={s.footer}>
        <Text variant="small" tone="muted" style={s.caption} numberOfLines={1}>
          {describe(selected, selectedCell)}
        </Text>
        <View style={s.legend}>
          <Text variant="small" tone="faint">
            {less}
          </Text>
          {t.heat.map((color, i) => (
            <View key={i} style={[s.legendCell, { backgroundColor: color }]} />
          ))}
          <Text variant="small" tone="faint">
            {more}
          </Text>
        </View>
      </View>
    </View>
  );
});

const useStyles = makeStyles((t) => ({
  body: { flexDirection: "row" },
  rowLabels: { width: 30 },
  rowLabel: { position: "absolute", left: 0, fontSize: 10.5, lineHeight: 13 },
  scroll: { flex: 1 },
  months: { height: 18 },
  month: { position: "absolute", top: 0, fontSize: 10.5, lineHeight: 13 },
  grid: { flexDirection: "row", gap: GAP },
  column: { gap: GAP },
  cell: { width: CELL, height: CELL, borderRadius: 3.5 },
  today: { borderWidth: 1.5, borderColor: t.text },
  selected: { borderWidth: 1.5, borderColor: t.muted },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 10 },
  caption: { flex: 1, fontFamily: fonts.bodySemibold },
  legend: { flexDirection: "row", alignItems: "center", gap: 3 },
  legendCell: { width: 10, height: 10, borderRadius: 2.5, marginHorizontal: 0.5 },
}));
