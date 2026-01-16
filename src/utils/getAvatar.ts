export const getAvatar = (name?: string | null): string => {
  if (!name) return "";

  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};
