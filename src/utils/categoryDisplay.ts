import { Car, Plane, Ship } from "lucide-react";
import { TransportCategory } from "@/types";

export const categoryIcon: Record<TransportCategory, React.ComponentType<{ className?: string }>> = {
  boat: Ship,
  air: Plane,
  land: Car,
};

export const categoryLabel: Record<TransportCategory, string> = {
  boat: "Boat",
  air: "Aircraft",
  land: "Land",
};

export const vehicleCountLabel = (category: TransportCategory, count: number): string => {
  const noun = category === "boat" ? "Boats" : category === "air" ? "Aircraft" : "Vehicles";
  return `${count} ${noun}`;
};
