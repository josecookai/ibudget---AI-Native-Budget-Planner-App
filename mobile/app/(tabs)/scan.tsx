import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function ScanTabScreen() {
  const router = useRouter();

  useEffect(() => {
    // Tab "Scan" leads to full-screen scan interface
    router.replace("/scan");
  }, []);

  return (
    <View className="flex-1 bg-slate-50 items-center justify-center">
      <Text className="text-slate-500">Opening scanner...</Text>
    </View>
  );
}
