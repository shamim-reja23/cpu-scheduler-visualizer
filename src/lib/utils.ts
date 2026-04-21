import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateColor = (index: number): string => {
  const colors = [
    '#DBEAFE', // blue-100
    '#DCFCE7', // green-100
    '#FEF9C3', // yellow-100
    '#FEE2E2', // red-100
    '#E0E7FF', // indigo-100
    '#F3E8FF', // purple-100
    '#FAE8FF', // pink-100
    '#FFEDD5', // orange-100
    '#ECFCCB', // lime-100
    '#CFFAFE', // cyan-100
  ];
  return colors[index % colors.length];
};

export const generateDarkColor = (index: number): string => {
  const colors = [
    '#2563EB', // blue-600
    '#16A34A', // green-600
    '#CA8A04', // yellow-600
    '#DC2626', // red-600
    '#4F46E5', // indigo-600
    '#9333EA', // purple-600
    '#D946EF', // pink-600
    '#EA580C', // orange-600
    '#65A30D', // lime-600
    '#0891B2', // cyan-600
  ];
  return colors[index % colors.length];
};

export const formatTime = (time: number): string => {
  return time % 1 === 0 ? time.toString() : time.toFixed(1);
};
