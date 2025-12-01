import { useState, useMemo } from 'react'

export function usePagination<T>(allRows: T[], pageSize = 10) {
  const [page, setPage] = useState(1)
  const totalCount = allRows?.length
  const totalPages = Math.ceil(totalCount / pageSize)

  // 현재 페이지에 맞는 데이터만 잘라서 제공
  const displayedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return allRows?.slice(start, start + pageSize)
  }, [allRows, page, pageSize])

  return {
    page,
    setPage,
    totalPages,
    displayedRows,
  }
}
