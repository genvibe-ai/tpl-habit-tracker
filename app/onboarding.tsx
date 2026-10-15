import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";
import { HabitIcon } from "@/components/HabitIcon";
import { GrowingSprout } from "@/components/brand/GrowingSprout";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { copy, suggestedHabits } from "@/constants/content";
import type { IconName } from "@/constants/icons";
import { fonts, gutter, radius } from "@/constants/theme";
import { makeStyles, useTheme } from "@/hooks/useTheme";
import { withAlpha } from "@/lib/color";
import { fill, formatSchedule, formatTime, greeting } from "@/lib/format";
import { haptics } from "@/lib/haptics";
import { GLIDE } from "@/lib/motion";
import { useGarden } from "@/lib/store";

const STEPS = 3;

/** Welcome → pick habits → name and a daily check-in. Swipe or tap Continue. */
export default function OnboardingScreen() {
  const s = useStyles();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, 520);
  const habits = useGarden((state) => state.habits);
  const prefs = useGarden((state) => state.prefs);
  const finishOnboarding = useGarden((state) => state.finishOnboarding);

  // Step 2: the garden's habits (picked) and new ideas (not picked).
  const current = useMemo(() => habits.filter((h) => !h.archived), [habits]);
  const ideas = useMemo(
    () =>
      suggestedHabits
        .map((idea, index) => ({ idea, index }))
        .filter(({ idea }) => !habits.some((h) => h.name.toLowerCase() === idea.name.toLowerCase())),
    [habits],
  );
  const [keep, setKeep] = useState(() => new Set(current.map((h) => h.id)));
  const [add, setAdd] = useState(() => new Set<number>());
  const [name, setName] = useState(prefs.name);
  const [reminder, setReminder] = useState<string | null>(prefs.dailyReminder ?? "20:30");
  const picked = keep.size + add.size;

  const [step, setStep] = useState(0);
  const position = useSharedValue(0);
  const drag = useSharedValue(0);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(STEPS - 1, next));
    if (clamped !== step) haptics.select();
    setStep(clamped);
    position.value = withSpring(clamped, GLIDE);
  };

  const finish = (skip = false) => {
    haptics.success();
    finishOnboarding({
      keep: skip ? current.map((h) => h.id) : [...keep],
      add: skip ? [] : [...add],
      name,
      reminder: skip ? prefs.dailyReminder : reminder,
    });
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-14, 14])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      drag.value = e.translationX;
    })
    .onEnd((e) => {
      const threshold = width * 0.18;
      const direction = e.translationX < -threshold || e.velocityX < -600 ? 1 : e.translationX > threshold || e.velocityX > 600 ? -1 : 0;
      drag.value = withSpring(0, GLIDE);
      if (direction !== 0) scheduleOnRN(go, step + direction);
    });

  const offset = useDerivedValue(() => -position.value * width + drag.value);
  const track = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  const canContinue = step !== 1 || picked > 0;
  const last = step === STEPS - 1;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[s.screen, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) }]}
    >
      <View style={s.top}>
        <View style={s.topSide}>
          {step > 0 && <IconButton name="chevron-left" label={copy.detail.back} onPress={() => go(step - 1)} size={40} tone="plain" />}
        </View>
        <Dots step={step} />
        <View style={[s.topSide, s.topRight]}>
          {!last && (
            <Tap label={copy.onboarding.skip} onPress={() => finish(true)} style={s.skip}>
              <Text variant="label" tone="muted">
                {copy.onboarding.skip}
              </Text>
            </Tap>
          )}
        </View>
      </View>

      <GestureDetector gesture={pan}>
        <View style={[s.viewport, { width }]}>
          <Animated.View style={[s.track, { width: width * STEPS }, track]}>
            {/* 1 · Welcome */}
            <View style={[s.page, s.welcome, { width }]}>
              <GrowingSprout size={Math.min(250, width * 0.62)} />
              <Text variant="caps" tone="accent" style={s.eyebrow}>
                {copy.onboarding.welcomeEyebrow}
              </Text>
              <Text variant="hero" style={s.welcomeTitle}>
                {copy.onboarding.welcomeTitle}
              </Text>
              <Text tone="muted" style={s.welcomeBody}>
                {copy.onboarding.welcomeBody}
              </Text>
            </View>

            {/* 2 · Pick habits */}
            <ScrollView style={{ width }} contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
              <Text variant="caps" tone="accent">
                {fill(copy.onboarding.stepOf, { n: 2 })}
              </Text>
              <Text variant="title" style={s.stepTitle}>
                {copy.onboarding.pickTitle}
              </Text>
              <Text tone="muted" style={s.stepBody}>
                {copy.onboarding.pickBody}
              </Text>
              <View style={s.choices}>
                {current.map((habit) => (
                  <Choice
                    key={habit.id}
                    name={habit.name}
                    detail={habit.reminder ? formatTime(habit.reminder) : formatSchedule(habit.days, prefs.weekStart)}
                    icon={habit.icon}
                    color={habit.color}
                    selected={keep.has(habit.id)}
                    onToggle={() =>
                      setKeep((prev) => {
                        const next = new Set(prev);
                        if (next.has(habit.id)) next.delete(habit.id);
                        else next.add(habit.id);
                        return next;
                      })
                    }
                  />
                ))}
                {ideas.map(({ idea, index }) => (
                  <Choice
                    key={idea.name}
                    name={idea.name}
                    detail={idea.note}
                    icon={idea.icon}
                    color={idea.color}
                    selected={add.has(index)}
                    onToggle={() =>
                      setAdd((prev) => {
                        const next = new Set(prev);
                        if (next.has(index)) next.delete(index);
                        else next.add(index);
                        return next;
                      })
                    }
                  />
                ))}
              </View>
            </ScrollView>

            {/* 3 · Make it yours */}
            <ScrollView
              style={{ width }}
              contentContainerStyle={s.page}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text variant="caps" tone="accent">
                {fill(copy.onboarding.stepOf, { n: 3 })}
              </Text>
              <Text variant="title" style={s.stepTitle}>
                {copy.onboarding.nameTitle}
              </Text>
              <Text tone="muted" style={s.stepBody}>
                {copy.onboarding.nameBody}
              </Text>

              <Text variant="caps" tone="muted" style={s.label}>
                {copy.onboarding.nameLabel}
              </Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder={copy.onboarding.namePlaceholder}
                style={s.input}
                maxLength={24}
                returnKeyType="done"
                accessibilityLabel={copy.onboarding.nameLabel}
              />
              <Text variant="small" tone="muted" style={s.preview}>
                “{greeting(name)}”
              </Text>

              <Text variant="caps" tone="muted" style={s.label}>
                {copy.onboarding.reminderLabel}
              </Text>
              <View style={s.reminders}>
                {copy.onboarding.reminderOptions.map((option) => {
                  const active = option.time === reminder;
                  return (
                    <Tap
                      key={option.label}
                      label={option.label}
                      role="radio"
                      selected={active}
                      onPress={() => setReminder(option.time)}
                      style={[s.reminder, active && s.reminderActive]}
                      scaleTo={0.94}
                    >
                      <Icon name={option.time ? "bell-ring" : "x"} size={18} color={active ? t.accentText : t.muted} />
                      <Text variant="label" tone={active ? "text" : "muted"} numberOfLines={1}>
                        {option.label}
                      </Text>
                      {option.time ? (
                        <Text variant="small" tone="faint">
                          {formatTime(option.time)}
                        </Text>
                      ) : null}
                    </Tap>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
          <LinearGradient pointerEvents="none" colors={[withAlpha(t.background, 0), t.background]} style={s.fade} />
        </View>
      </GestureDetector>

      <View style={s.bottom}>
        {step === 1 && (
          <Animated.View entering={FadeInDown.duration(200)}>
            <Text variant="small" tone="muted" style={s.count}>
              {picked > 0 ? fill(copy.onboarding.picked, { n: picked }) : copy.onboarding.pickNone}
            </Text>
          </Animated.View>
        )}
        <Button
          size="lg"
          title={last ? copy.onboarding.start : copy.onboarding.next}
          icon={last ? "sprout" : undefined}
          disabled={!canContinue}
          onPress={() => (last ? finish() : go(step + 1))}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function Dots({ step }: { step: number }) {
  const s = useStyles();
  return (
    <View style={s.dots} accessibilityLabel={fill(copy.onboarding.stepOf, { n: step + 1 })}>
      {Array.from({ length: STEPS }, (_, i) => (
        <Dot key={i} active={i === step} />
      ))}
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const t = useTheme();
  const style = useAnimatedStyle(() => ({
    width: withSpring(active ? 26 : 8, GLIDE),
    backgroundColor: active ? t.accent : t.raised,
  }));
  return <Animated.View style={[{ height: 8, borderRadius: 4 }, style]} />;
}

function Choice({
  name,
  detail,
  icon,
  color,
  selected,
  onToggle,
}: {
  name: string;
  detail: string;
  icon: IconName;
  color: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const s = useStyles();
  const t = useTheme();
  return (
    <Tap
      label={name}
      role="checkbox"
      selected={selected}
      onPress={onToggle}
      scaleTo={0.98}
      style={[s.choice, selected && { borderColor: withAlpha(color, 0.9), backgroundColor: withAlpha(color, t.mode === "dark" ? 0.08 : 0.1) }]}
    >
      <HabitIcon icon={icon} color={color} size={42} />
      <View style={s.choiceText}>
        <Text variant="label" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="small" tone="muted" numberOfLines={1}>
          {detail}
        </Text>
      </View>
      <View style={[s.tick, selected ? { backgroundColor: color, borderColor: color } : { borderColor: t.line }]}>
        {selected && <Icon name="check" size={15} color={t.onColor} strokeWidth={3} />}
      </View>
    </Tap>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.background, alignItems: "center" },
  top: { width: "100%", maxWidth: 520, flexDirection: "row", alignItems: "center", paddingHorizontal: gutter - 6, height: 48 },
  topSide: { flex: 1 },
  topRight: { alignItems: "flex-end" },
  skip: { paddingHorizontal: 10, paddingVertical: 8 },
  dots: { flexDirection: "row", gap: 6, alignItems: "center" },
  viewport: { flex: 1, overflow: "hidden" },
  fade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 28 },
  track: { flex: 1, flexDirection: "row" },
  page: { paddingHorizontal: gutter + 4, paddingTop: 16, paddingBottom: 24 },
  welcome: { height: "100%", alignItems: "center", justifyContent: "center", paddingBottom: 40 },
  eyebrow: { marginTop: 18 },
  welcomeTitle: { textAlign: "center", marginTop: 12, fontSize: 40, lineHeight: 44, letterSpacing: -1.2 },
  welcomeBody: { textAlign: "center", marginTop: 14, maxWidth: 320, fontSize: 16.5, lineHeight: 24 },
  stepTitle: { marginTop: 10 },
  stepBody: { marginTop: 8, marginBottom: 22 },
  choices: { gap: 10 },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: t.line,
    backgroundColor: t.surface,
  },
  choiceText: { flex: 1, gap: 2 },
  tick: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  label: { marginBottom: 10, marginTop: 8 },
  input: { height: 58, fontFamily: fonts.display, fontSize: 22 },
  preview: { marginTop: 10, marginBottom: 22 },
  reminders: { flexDirection: "row", gap: 8 },
  reminder: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    backgroundColor: t.surface,
    borderWidth: 1.5,
    borderColor: t.line,
  },
  reminderActive: { borderColor: t.accent, backgroundColor: withAlpha(t.accent, t.mode === "dark" ? 0.08 : 0.1) },
  bottom: { width: "100%", maxWidth: 520, paddingHorizontal: gutter, paddingTop: 8, gap: 10 },
  count: { textAlign: "center" },
}));
