import React from 'react';
import {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Zap,
  HeartPulse,
  Tv,
  GraduationCap,
  Briefcase,
  MoreHorizontal,
  Sparkles,
  Coffee,
  Plane,
  Gift,
  Dumbbell,
  BookOpen,
  Film,
  Music,
  Wifi,
  Smartphone,
  CreditCard,
  Landmark,
  Banknote,
  PiggyBank,
  ShieldCheck,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Zap,
  HeartPulse,
  Tv,
  GraduationCap,
  Briefcase,
  MoreHorizontal,
  Sparkles,
  Coffee,
  Plane,
  Gift,
  Dumbbell,
  BookOpen,
  Film,
  Music,
  Wifi,
  Smartphone,
  CreditCard,
  Landmark,
  Banknote,
  PiggyBank,
  ShieldCheck,
};

export const AVAILABLE_ICONS = [
  'Utensils',
  'Car',
  'Home',
  'ShoppingBag',
  'Zap',
  'HeartPulse',
  'Tv',
  'GraduationCap',
  'Briefcase',
  'Sparkles',
  'Coffee',
  'Plane',
  'Gift',
  'Dumbbell',
  'BookOpen',
  'Film',
  'Music',
  'PiggyBank',
  'MoreHorizontal',
];

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || MoreHorizontal;
  return <IconComponent {...props} />;
};
