import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextInputProps,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "@/lib/state/useAuthStore";
import { observer } from "@legendapp/state/react";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormData {
  username: string;
  password: string;
}

interface FormErrors {
  username: string;
  password: string;
}

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

const FormInput: React.FC<InputProps> = ({ label, error, ...props }) => (
  <View className="w-full p-2">
    <Text className="text-gray-600 mb-2">{label}</Text>
    <TextInput
      className={`border rounded-full p-3 w-full bg-gray-50 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      {...props}
    />
    {error ? <Text className="text-red-500 text-sm mt-1">{error}</Text> : null}
  </View>
);

const Login = observer(() => {
  const router = useRouter();
  const authStore = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    username: "",
    password: "",
  });

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = { username: "", password: "" };

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (): Promise<void> => {
    try {
      if (!validateForm()) return;

      await authStore.login(formData.username, formData.password);
      if (authStore.isAuthenticated.get()) {
        router.replace("/(app)/(tabs)");
      }
    } catch (error) {
      console.error(
        "Login error:",
        error instanceof Error ? error.message : error
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-0.2 p-2 mt-14 justify-center items-center h-24 mb-8">
          <Image
            source={require("@/assets/images/logo.png")}
            className="w-30 h-24 mb-2"
            resizeMode="contain"
          />
          <View>
            <Text className="text-gray-500 text-sm text-center">
              use john_doe:hashedPassword123 for testing
            </Text>
          </View>
        </View>

        <View className="p-2 mt-4 justify-center items-center  mb-4 flex-shrink">
          <Text className="text-xl text-black mb-8 text-center">
            Login now to find whats {"\n"} happening around you{" "}
          </Text>
        </View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-0.8 p-w justify-center px-2">
            <View className="space-y-4 justify-center items-center">
              <Text className="text-3xl font-bold text-purple-800 mb-8">
                Welcome Back
              </Text>

              <FormInput
                label="Username"
                value={formData.username}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, username: text }))
                }
                placeholder="Enter your username"
                autoCapitalize="none"
                autoComplete="username"
                textContentType="username"
                error={errors.username}
              />

              <FormInput
                label="Password"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, password: text }))
                }
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                error={errors.password}
              />

              {authStore.error.get() && (
                <Text className="text-red-500 text-center">
                  {authStore.error.get()}
                </Text>
              )}

              <View className="w-full px-2">
                <Pressable
                  onPress={handleLogin}
                  disabled={authStore.isLoading.get()}
                  className={`rounded-full w-full p-3 mt-8 ${
                    authStore.isLoading.get()
                      ? "bg-purple-300"
                      : "bg-purple-800"
                  }`}
                >
                  {authStore.isLoading.get() ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-semibold">
                      Login
                    </Text>
                  )}
                </Pressable>
              </View>
              <View className="w-full px-2">
                <Text className="text-center m-4 text-lg text-purple-800">
                  Or
                </Text>
              </View>
              <View className="px-2 justify-around items-center flex-row gap-1">
                <Image
                  source={require("@/assets/images/insta.png")}
                  className="w-10 h-10"
                  resizeMode="contain"
                />
                <Image
                  source={require("@/assets/images/facebook.png")}
                  className="w-10 h-10"
                  resizeMode="contain"
                />
                <Image
                  source={require("@/assets/images/twitter.png")}
                  className="w-10 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

export default Login;
