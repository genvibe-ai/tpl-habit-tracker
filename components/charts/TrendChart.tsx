import { useEffect, useId, useState } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { calendar } from "@/constants/content";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { addDays, dayOfMonth, monthOf } from "@/lib/dates";
import { EASE } from "@/lib/motion";
import type { DateKey } from "@/lib/types";
import { Text } from "../ui/Text";

/** A smooth line through points (Catmull-Rom turned into cubic curves). */
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
  }
  return d;
}

/** Weekly completion (0..1) as a soft area chart that sweeps in from the left. */
export function TrendChart({ data, height = 140 }: { data: { start: DateKey; rate: number | null }[]; height?: number }) {
  const s = useStyles();
  const t = useTheme();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [width, setWidth] = useState(0);
  const reveal = useSharedValue(0);
  useEffect(() => {
    if (width > 0) reveal.value = withTiming(1, { duration: 1100, easing: EASE });
  }, [width, reveal]);
  const clip = useAnimatedStyle(() => ({ width: width * reveal.value }));

  const pad = 8;
  const step = data.length > 1 ? (width - pad * 2) / (data.length - 1) : 0;
  const points = data
    .map((d, i) => ({ x: pad + i * step, y: pad + (1 - (d.rate ?? 0)) * (height - pad * 2), known: d.rate !== null }))
    .filter((p) => p.known);
  const line = smoothPath(points);
  const area = points.length > 1 ? `${line} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z` : "";
  const last = points[points.length - 1];

  return (
    <View>
      <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {[0, 0.5, 1].map((g) => (
          <View key={g} style={[s.grid, { top: pad + (1 - g) * (height - pad * 2) }]}>
            <Text variant="small" tone="faint" style={s.gridLabel}>
              {Math.round(g * 100)}%
            </Text>
          </View>
        ))}
        {width > 0 && (
          <Animated.View style={[s.clip, { height }, clip]}>
            <Svg width={width} height={height}>
              <Defs>
                <LinearGradient id={`area${id}`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={t.accent} stopOpacity={t.mode === "dark" ? 0.32 : 0.26} />
                  <Stop offset="1" stopColor={t.accent} stopOpacity={0} />
                </LinearGradient>
                <LinearGradient id={`line${id}`} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={t.ring[2]} />
                  <Stop offset="1" stopColor={t.ring[0]} />
                </LinearGradient>
              </Defs>
              <Path d={area} fill={`url(#area${id})`} />
              <Path d={line} stroke={`url(#line${id})`} strokeWidth={3} strokeLinecap="round" fill="none" />
              {points.map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 0 : 2.5} fill={t.surface} stroke={t.accent} strokeWidth={1.5} />
              ))}
              {last && <Circle cx={last.x} cy={last.y} r={10} fill={t.accent} fillOpacity={0.18} />}
              {last && <Circle cx={last.x} cy={last.y} r={5} fill={t.accent} stroke={t.surface} strokeWidth={2} />}
            </Svg>
          </Animated.View>
        )}
      </View>
      <View style={s.labels}>
        {data.map((week, i) => {
          const end = addDays(week.start, 6);
          const startsMonth = dayOfMonth(week.start) === 1 || monthOf(end) !== monthOf(week.start);
          return (
            <Text key={week.start} variant="small" tone="faint" style={[s.label, { left: pad + i * step - 20 }]}>
              {startsMonth ? calendar.monthsShort[monthOf(end)] : ""}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  grid: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: t.line },
  gridLabel: { position: "absolute", right: 0, top: -16, fontSize: 10, lineHeight: 12 },
  clip: { position: "absolute", left: 0, top: 0, overflow: "hidden" },
  labels: { height: 16, marginTop: 8 },
  label: { position: "absolute", width: 40, textAlign: "center", fontSize: 10.5, lineHeight: 13 },
}));
