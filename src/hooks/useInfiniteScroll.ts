/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  RefCallback,
  Dispatch,
  SetStateAction,
} from "react";

interface PaginatedResult<T> {
  result: T[];
  meta: {
    totalPage: number;
    currentPage: number;
    total: number;
  };
}

interface UseInfiniteScrollProps<T, Q> {
  query: (args: Q & { page: number }) => {
    data?: { data: PaginatedResult<T> };
    error?: unknown;
    isLoading: boolean;
    isFetching: boolean;
  };
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  queryArgs: Q;
  dataSelector: (data: any) => T[]; // extract items array from data
  metaSelector: (data: any) => { totalPage: number }; // extract pagination meta from data
}

function useInfiniteScroll<T extends { _id: string }, Q>({
  query,
  items,
  setItems,
  queryArgs,
  dataSelector,
  metaSelector,
}: UseInfiniteScrollProps<T, Q>) {
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  const { data, error, isLoading, isFetching } = query({
    ...queryArgs,
    page,
  });

  useEffect(() => {
    const newItems = dataSelector(data) || [];
    const meta = metaSelector(data) || { totalPage: 1 };

    if (newItems.length) {
      setItems((prev) => {
        const unique = newItems.filter(
          (item) => !prev.some((existing) => existing._id === item._id)
        );
        return [...prev, ...unique];
      });
      setHasNextPage(page < meta?.totalPage);
    }
  }, [data, page, setItems]);

  const lastItemRef: RefCallback<Element> = useCallback(
    (node) => {
      if (isFetching || !hasNextPage) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetching, hasNextPage]
  );

  return {
    items,
    error,
    isLoading,
    lastItemRef,
    isFetchingNextPage: isFetching,
  };
}

export default useInfiniteScroll;
