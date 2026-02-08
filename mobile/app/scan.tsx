import { useRouter } from "expo-router";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScanScreen() {
  const router = useRouter();
  const lineY = useSharedValue(0);
  const frameOpacity = useSharedValue(0.8);

  useEffect(() => {
    const FRAME_H = 420;
    lineY.value = withRepeat(
      withSequence(
        withTiming(FRAME_H - 4, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
    frameOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lineY.value }],
  }));

  const frameStyle = useAnimatedStyle(() => ({
    opacity: frameOpacity.value,
  }));

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Camera placeholder - full screen */}
        <View className="flex-1 bg-slate-800 items-center justify-center overflow-hidden">
          <Text className="text-slate-400 text-sm absolute top-8">
            [Expo Camera view placeholder]
          </Text>

          {/* Scanning frame - corners only */}
          <Animated.View
            style={[frameStyle]}
            className="absolute w-80 h-[420px] border-2 border-white rounded-lg"
          >
            {/* Corner accents */}
            <View className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg" />
            <View className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg" />
            <View className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg" />
            <View className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg" />

            {/* Scanning line */}
            <Animated.View
              style={[scanLineStyle]}
              className="absolute left-0 right-0 h-0.5 bg-green-400"
            />
          </Animated.View>

          {/* Feedback text */}
          <Text className="absolute bottom-32 text-white text-center px-8 text-base">
            Align receipt within frame...
          </Text>
        </View>

        {/* Bottom bar - close */}
        <View className="bg-slate-900 py-4 px-5 pb-8">
          <Pressable
            onPress={() => router.replace("/(tabs)/home")}
            className="bg-white rounded-2xl py-4 items-center active:opacity-90"
          >
            <Text className="text-black font-semibold">Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
