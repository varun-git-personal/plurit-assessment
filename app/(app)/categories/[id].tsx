import React from "react";
import { useLocalSearchParams } from "expo-router";
import CategoryDetails from "@/app/components/CategoryDetail";

export default function CategoryDetail() {
  const { category } = useLocalSearchParams();
  const categoryData = JSON.parse(category as string);

  return <CategoryDetails category={categoryData} />;
}
