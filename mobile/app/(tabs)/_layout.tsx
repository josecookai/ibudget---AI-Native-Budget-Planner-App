import { Tabs } from "expo-router";
import { Text, View } from "react-native";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: "🏠",
    scan: "📷",
    insights: "💡",
  };
  return (
    <View className="items-center justify-center">
      <Text className="text-xl">{icons[name] ?? "•"}</Text>
      <Text
        className={`text-xs mt-0.5 ${focused ? "text-black font-semibold" : "text-slate-500"}`}
      >
        {name === "home" ? "Home" : name === "scan" ? "Scan" : "Insights"}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#f8fafc",
          borderTopColor: "#e2e8f0",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#0f172a",
        tabBarInactiveTintColor: "#64748b",
        tabBarShowLabel: true,
        tabBarLabelPosition: "below-icon",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ focused }) => <TabIcon name="scan" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="insights" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
