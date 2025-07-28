// import { useState, useMemo } from 'react'
// import { useInfiniteQuery } from '@tanstack/react-query'

// type PageData<T> = {
//   data: {
//     content: T[]
//     sliceInfo: {
//       page: number
//       hasNext: boolean
//     }
//   }
// }

// interface UseInfiniteSelectOptionsProps<T> {
//   queryKey: string
//   queryFn: (params: { pageParam: number; keyword: string }) => Promise<PageData<T>>
//   getLabel: (item: T) => string
//   getValue: (item: T) => string | number
// }

// export function useInfiniteSelectOptions<T>({
//   queryKey,
//   queryFn,
//   getLabel,
//   getValue,
// }: UseInfiniteSelectOptionsProps<T>) {
//   const [search, setSearch] = useState('')

//   const { data, fetchNextPage, hasNextPage, isFetching, isLoading } = useInfiniteQuery<
//     PageData<T>,
//     unknown,
//     PageData<T>,
//     [string, string],
//     number
//   >({
//     queryKey: [queryKey, search],
//     queryFn: ({ pageParam }) => queryFn({ pageParam, keyword: search }),
//     initialPageParam: 0,
//     getNextPageParam: (lastPage) => {
//       const nextPage = lastPage.data.sliceInfo.page + 1
//       return lastPage.data.sliceInfo.hasNext ? nextPage : undefined
//     },
//   })

//   const options = useMemo(() => {
//     const defaultOption = { label: '선택', value: '0' }
//     const results: { label: string; value: string | number }[] = (data?.pages ?? []).flatMap(
//       (page: PageData<T>) =>
//         page.data.content.map((item: T) => ({
//           label: getLabel(item),
//           value: getValue(item),
//         })),
//     )

//     return [defaultOption, ...results]
//   }, [data, getLabel, getValue])

//   return {
//     setSearch,
//     options,
//     fetchNextPage,
//     hasNextPage,
//     isFetching,
//     isLoading,
//   }
// }
