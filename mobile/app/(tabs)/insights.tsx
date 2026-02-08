import { Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CARDS = [
  {
    id: "1",
    emoji: "💡",
    title: "Subscription reminder",
    body: "You have 3 active subscriptions (Netflix, Disney+, Spotify). Total $45/mo.",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    id: "2",
    emoji: "📉",
    title: "Spending trend",
    body: "Grocery spending is 12% lower than last month. Great job!",
    bg: "bg-sky-50",
    border: "border-sky-200",
  },
  {
    id: "3",
    emoji: "💡",
    title: "Tip",
    body: "Scan receipts right after shopping to keep your history accurate.",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
];

export default function InsightsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-xl font-semibold text-slate-800">
          Savings & Insights
        </Text>
        <Text className="text-slate-500 text-sm mt-1">
          Tips and reminders for your family
        </Text>
      </View>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {CARDS.map((card) => (
          <View
            key={card.id}
            className={`mt-4 p-4 rounded-2xl border ${card.bg} ${card.border}`}
          >
            <View className="flex-row items-start gap-3">
              <Text className="text-2xl">{card.emoji}</Text>
              <View className="flex-1">
                <Text className="font-semibold text-slate-800 mb-1">
                  {card.title}
                </Text>
                <Text className="text-slate-600 text-sm leading-5">
                  {card.body}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
