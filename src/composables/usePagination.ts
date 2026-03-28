import {reactive, computed} from "vue";
import type {PagingInfo} from "@/types";

export function usePagination(defaultPageSize = 10) {
  const paging = reactive<PagingInfo>({
    pageNumber: 1,
    pageSize: defaultPageSize,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const pagingFrom = computed(() =>
    paging.totalCount === 0 ? 0 : (paging.pageNumber - 1) * paging.pageSize + 1,
  );
  const pagingTo = computed(() => Math.min(paging.pageNumber * paging.pageSize, paging.totalCount));

  return {
    paging,
    pagingFrom,
    pagingTo,
  };
}
