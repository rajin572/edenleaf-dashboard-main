import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/** "3 days ago", "a month ago", etc. */
export const timeAgo = (date: string | Date | undefined): string => dayjs(date).fromNow();

export const formatDateTime = (date: string | Date): string => {
  // date is less than 1min ago, return "just now"
  // date is less than 1 hour ago, return "x minutes ago"
  // date is less than 1 day ago, return "hh:mm A"
  // date is greater than 1 day ago, return "MMM DD YYYY"
  const now = dayjs();
  const messageDate = dayjs(date);

  if (now.diff(messageDate, "minute") < 1) return "just now";
  if (now.diff(messageDate, "hour") < 1)
    return `${now.diff(messageDate, "minute")} minutes ago`;
  if (now.diff(messageDate, "day") < 1) return messageDate.format("hh:mm A");
  if (now.diff(messageDate, "year") < 1)
    return messageDate.format("MMM DD hh:mm A");
  return messageDate.format("MMM DD YYYY hh:mm A"); // Fixed: used "MMM DD YYYY"
};

export const formatDate = (date: string | Date | undefined): string => {
  const messageDate = dayjs(date);

  return messageDate.format("MMM DD YYYY"); // Fixed: used "MMM DD YYYY"
};

export const formetDateAndTime = (date: string | Date | undefined): string => {
  const messageDate = dayjs(date);

  return messageDate.format("MMM DD YYYY hh:mm A"); // Fixed: used "MMM DD YYYY"
};

export const formetTime = (date: string | Date | undefined): string => {
  const messageDate = dayjs(date);

  return messageDate.format("HH:mm"); // 24-hour format
};
