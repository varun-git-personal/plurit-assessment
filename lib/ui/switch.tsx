import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { StyleProp, ViewStyle } from "react-native";

type SwitchProps = {
  value: SharedValue<boolean>;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
  duration?: number;
  trackColors?: { on: string; off: string };
};
const Switch = React.memo<SwitchProps>(
  ({
    value,
    onPress,
    style,
    duration = 400,
    trackColors = { on: "#82cab2", off: "#fa7f7c" },
  }) => {
    const height = useSharedValue(0);
    const width = useSharedValue(0);

    const trackAnimatedStyle = useAnimatedStyle(() => {
      const color = interpolateColor(
        Number(value.value),
        [0, 1],
        [trackColors.off, trackColors.on]
      );
      const colorValue = withTiming(color, { duration });

      return {
        backgroundColor: colorValue,
        borderRadius: height.value / 2,
      };
    });

    const thumbAnimatedStyle = useAnimatedStyle(() => {
      const moveValue = interpolate(
        Number(value.value),
        [0, 1],
        [0, width.value - height.value]
      );
      const translateValue = withTiming(moveValue, { duration });

      return {
        transform: [{ translateX: translateValue }],
        borderRadius: height.value / 2,
      };
    });

    return (
      <Pressable onPress={onPress}>
        <Animated.View
          onLayout={(e) => {
            height.value = e.nativeEvent.layout.height;
            width.value = e.nativeEvent.layout.width;
          }}
          style={[switchStyles.track, style, trackAnimatedStyle]}
        >
          <Animated.View
            style={[switchStyles.thumb, thumbAnimatedStyle]}
          ></Animated.View>
        </Animated.View>
      </Pressable>
    );
  }
);

const switchStyles = StyleSheet.create({
  track: {
    alignItems: "flex-start",
    width: 50,
    height: 15,
    padding: 2,
    borderColor: "#6b21a8",
    borderWidth: 1,
  },
  thumb: {
    height: "100%",
    aspectRatio: 1,
    backgroundColor: "#6b21a8",
  },
});

export { Switch };
