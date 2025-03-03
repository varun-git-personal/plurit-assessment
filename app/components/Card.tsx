import { View, ViewProps } from "react-native";
import React, { ReactNode } from "react";

interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
  return (
    <View
      className={`bg-white rounded-lg aspect-square ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};

export default Card;
