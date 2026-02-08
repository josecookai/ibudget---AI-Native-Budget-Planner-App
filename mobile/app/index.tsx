import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PIN_LENGTH = 4;

export default function LoginScreen() {
  const router = useRouter();
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const inputRef = useRef<TextInput>(null);

  const handlePinChange = (value: string) => {
    if (value.length > PIN_LENGTH) return;
    const digits = value.replace(/\D/g, "").split("");
    const newPin = [...Array(PIN_LENGTH).fill("")];
    digits.forEach((d, i) => (newPin[i] = d));
    setPin(newPin);
    if (digits.length === PIN_LENGTH) {
      // Mock verify - in real app call API then navigate
      setTimeout(() => router.replace("/(tabs)/home"), 200);
    }
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-8"
      >
        {/* Logo / Brand */}
        <View className="items-center mb-16">
          <View className="w-20 h-20 rounded-2xl bg-slate-200 items-center justify-center mb-4">
            <Text className="text-4xl">🏠</Text>
          </View>
          <Text className="text-2xl font-semibold text-slate-800">
            HomeWise AI
          </Text>
          <Text className="text-slate-500 mt-1">Family expense tracker</Text>
        </View>

        {/* Enter Family PIN */}
        <Text className="text-slate-600 text-center text-lg mb-6">
          Enter Family PIN
        </Text>

        {/* OTP-style digit boxes */}
        <Pressable onPress={focusInput} className="flex-row justify-center gap-3 mb-8">
          {pin.map((digit, i) => (
            <View
              key={i}
              className="w-16 h-20 rounded-xl border-2 border-slate-300 bg-white items-center justify-center"
            >
              <Text className="text-2xl font-semibold text-slate-800">
                {digit || " "}
              </Text>
            </View>
          ))}
        </Pressable>

        <TextInput
          ref={inputRef}
          value={pin.join("")}
          onChangeText={handlePinChange}
          keyboardType="number-pad"
          maxLength={PIN_LENGTH}
          autoFocus
          caretHidden
          className="absolute opacity-0 w-0 h-0"
          accessibilityLabel="Family PIN input"
        />

        {/* Primary action - large and clear */}
        <Pressable
          onPress={focusInput}
          className="bg-black rounded-2xl py-5 items-center justify-center active:opacity-90"
        >
          <Text className="text-white text-lg font-semibold">Enter Family PIN</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
