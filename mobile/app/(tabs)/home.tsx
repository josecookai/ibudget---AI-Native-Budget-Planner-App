import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Text, View, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RECENT_TRANSACTIONS = [
  { id: "1", icon: "🛒", label: "Whole Foods", amount: "-$120.00" },
  { id: "2", icon: "⛽", label: "Shell Gas", amount: "-$55.00" },
  { id: "3", icon: "📦", label: "Amazon", amount: "-$89.99" },
  { id: "4", icon: "🍕", label: "Domino's", amount: "-$28.50" },
  { id: "5", icon: "🛒", label: "Costco", amount: "-$210.00" },
];

export default function HomeScreen() {
  const router = useRouter();
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );
    borderOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0.5, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const cameraButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  const greeting = "Good Morning";
  const userName = "Mom";
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const totalSpent = "$3,240.50";

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-2 pb-4">
        <Text className="text-slate-800 text-lg">
          {greeting}, {userName}
        </Text>
        <Text className="text-slate-500 text-sm">{dateStr}</Text>
      </View>

      {/* Big Number - Total Spent This Month */}
      <View className="px-5 pb-6">
        <Text className="text-slate-500 text-sm mb-1">Spent this month</Text>
        <Text
          className="text-4xl font-bold text-slate-900 tracking-tight"
          style={{ fontFamily: "JetBrainsMono_400Regular" } as const}
        >
          {totalSpent}
        </Text>
      </View>

      {/* Recent List */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-slate-600 font-medium mb-3">Recent</Text>
        {RECENT_TRANSACTIONS.map((t) => (
          <View
            key={t.id}
            className="flex-row items-center py-4 border-b border-slate-200"
          >
            <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center mr-3">
              <Text className="text-lg">{t.icon}</Text>
            </View>
            <Text className="flex-1 text-slate-800 text-base">{t.label}</Text>
            <Text className="text-slate-800 font-semibold text-base">
              {t.amount}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Floating Camera Button - massive, circular, gradient border, pulse */}
      <View className="absolute bottom-8 left-0 right-0 items-center">
        <Animated.View
          style={[borderStyle]}
          className="absolute w-24 h-24 rounded-full border-4 border-slate-400"
        />
        <Animated.View style={cameraButtonStyle}>
          <Pressable
            onPress={() => router.push("/scan")}
            className="w-20 h-20 rounded-full bg-black items-center justify-center shadow-lg active:opacity-90"
          >
            <Text className="text-2xl">📷</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
