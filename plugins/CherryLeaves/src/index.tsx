import { React, ReactNative } from "@vendetta/metro/common";
import { registerCommand } from "@vendetta/commands";
import { showToast } from "@vendetta/ui/toasts";

const { Dimensions, View, Animated, Easing, StyleSheet } = ReactNative;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const LEAF_COUNT = 30;
const LEAF_COLORS = ["#ffb7c5", "#ff9ebb", "#e86f88", "#d85870"];

interface LeafProps {
  delay: number;
}

const CherryLeaf = ({ delay }: LeafProps) => {
  const fallAnim = React.useRef(new Animated.Value(-30)).current;
  const swayAnim = React.useRef(new Animated.Value(0)).current;

  const startX = React.useRef(Math.random() * SCREEN_WIDTH).current;
  const size = React.useRef(Math.random() * 8 + 10).current;
  const color = React.useRef(
    LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]
  ).current;
  const duration = React.useRef(Math.random() * 3000 + 4000).current;

  React.useEffect(() => {
    // Vertical falling animation
    const fallAnimation = Animated.loop(
      Animated.timing(fallAnim, {
        toValue: SCREEN_HEIGHT + 30,
        duration: duration,
        delay: delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Horizontal swaying animation
    const swayAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 15,
          duration: duration / 2,
          easing: Easing.sin,
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: -15,
          duration: duration / 2,
          easing: Easing.sin,
          useNativeDriver: true,
        }),
      ])
    );

    fallAnimation.start();
    swayAnimation.start();

    return () => {
      fallAnimation.stop();
      swayAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.leaf,
        {
          width: size,
          height: size * 1.4,
          backgroundColor: color,
          borderRadius: size / 2,
          borderTopRightRadius: 2,
          transform: [
            { translateX: Animated.add(startX, swayAnim) },
            { translateY: fallAnim },
            {
              rotate: swayAnim.interpolate({
                inputRange: [-15, 15],
                outputRange: ["-30deg", "30deg"],
              }),
            },
          ],
        },
      ]}
    />
  );
};

const CherryOverlay = () => {
  const leaves = React.useMemo(() => {
    return Array.from({ length: LEAF_COUNT }).map((_, i) => (
      <CherryLeaf key={i} delay={i * (5000 / LEAF_COUNT)} />
    ));
  }, []);

  return <View style={styles.overlay} pointerEvents="none">{leaves}</View>;
};

let unmountOverlay: (() => void) | null = null;

export default {
  onLoad: () => {
    // Mount to the root window/overlay layer if available, or register
    showToast("Cherry leaves activated!", undefined);
  },
  onUnload: () => {
    if (unmountOverlay) unmountOverlay();
  },
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
  },
  leaf: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0.85,
  },
});
