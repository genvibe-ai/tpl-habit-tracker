import { useId } from "react";
import Svg, { Defs, G, LinearGradient, Path, Stop } from "react-native-svg";
import { MARK } from "./mark";

/** The Rootwell mark on a transparent background. */
export function Logo({ size = 48 }: { size?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { colors } = MARK;
  return (
    <Svg width={size} height={size} viewBox={MARK.viewBox}>
      <Defs>
        <LinearGradient id={`stem${id}`} x1="0" y1="1" x2="0.25" y2="0">
          <Stop offset="0" stopColor={colors.stem[0]} />
          <Stop offset="0.5" stopColor={colors.stem[1]} />
          <Stop offset="1" stopColor={colors.stem[2]} />
        </LinearGradient>
        <LinearGradient id={`left${id}`} x1="1" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={colors.leftLeaf[0]} />
          <Stop offset="1" stopColor={colors.leftLeaf[1]} />
        </LinearGradient>
        <LinearGradient id={`right${id}`} x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor={colors.rightLeaf[0]} />
          <Stop offset="1" stopColor={colors.rightLeaf[1]} />
        </LinearGradient>
      </Defs>
      <G>
        <Path d={MARK.leftLeaf} fill={`url(#left${id})`} />
        <Path d={MARK.leftVein} stroke={colors.vein} strokeOpacity={0.22} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        <Path d={MARK.rightLeaf} fill={`url(#right${id})`} />
        <Path d={MARK.rightVein} stroke={colors.vein} strokeOpacity={0.2} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        <Path
          d={MARK.stem}
          stroke={`url(#stem${id})`}
          strokeWidth={6.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </G>
    </Svg>
  );
}
