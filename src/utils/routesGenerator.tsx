import { RouteObject } from "react-router-dom";
import PermissionGuard from "@/Routes/PermissionGuard";

interface NavRouteItem {
  url?: string;
  element?: React.ReactNode;
  /** When set, the page is wrapped in PermissionGuard. */
  permission?: string;
  items?: NavRouteItem[];
}

/** Wraps the element in a permission guard when the entry declares one. */
const guard = (item: NavRouteItem): React.ReactNode =>
  item.permission ? (
    <PermissionGuard permission={item.permission}>{item.element}</PermissionGuard>
  ) : (
    item.element
  );

export const routeGenerator = (allitems: NavRouteItem[]): RouteObject[] => {
  return allitems.reduce<RouteObject[]>((acc, item) => {
    if (item.url && item.element) {
      if (item.items && item.items.length > 0) {
        acc.push(...routeGenerator(item.items));
      }
      acc.push({ path: item.url, element: guard(item) });
    } else if (item.items && item.items.length > 0) {
      acc.push(...routeGenerator(item.items));
    }

    return acc;
  }, []);
};
