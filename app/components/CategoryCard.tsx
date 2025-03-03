import { View, Text, Pressable } from "react-native";
import React from "react";
import Card from "./Card";
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";

interface Category {
  id: number;
  categoryId: string;
  name: string;
  type: string;
  image: string;
}

interface CategoryCardProps {
  category: Category;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  className = "",
}) => {
  const router = useRouter();
  return (
    <Card className={`w-[110px] ${className}`}>
      <Pressable
        className="relative rounded-md overflow-hidden"
        onPress={() =>
          router.push({
            pathname: "/(app)/categories/[id]",
            params: {
              id: category.categoryId,
              category: JSON.stringify(category),
            },
          })
        }
      >
        <Animated.Image
          source={{ uri: category.image }}
          resizeMode="cover"
          className="w-full aspect-square rounded-md"
        />
        <View className="absolute bottom-0 left-0 right-0 p-2 bg-purple-200/90">
          <Text className="text-black text-xs">{category.name}</Text>
        </View>
      </Pressable>
    </Card>
  );
};

export default CategoryCard;
