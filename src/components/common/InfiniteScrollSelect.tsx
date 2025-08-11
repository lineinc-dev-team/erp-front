'use client'

import { useEffect, useRef, useState } from 'react'

type InfiniteScrollSelectProps<T> = {
  placeholder?: string
  keyword: string
  debouncedKeyword: string
  onChangeKeyword: (value: string) => void
  items: T[]
  hasNextPage: boolean
  fetchNextPage: () => void
  renderItem: (item: T, isHighlighted?: boolean) => React.ReactNode
  onSelect?: (item: T) => void
  shouldShowList?: boolean
  isLoading?: boolean
  onFocus?: () => void
  onBlur?: () => void
}

export default function InfiniteScrollSelect<T>({
  placeholder,
  keyword,
  onChangeKeyword,
  debouncedKeyword,
  items,
  hasNextPage,
  fetchNextPage,
  renderItem,
  onSelect,
  onFocus,
  onBlur,
  shouldShowList = true,
  isLoading = false,
}: InfiniteScrollSelectProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]) // 아이템 각각에 ref 저장
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const manuallySelected = useRef(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (manuallySelected.current) {
      manuallySelected.current = false // 초기화
      return // 리스트 다시 열지 않음
    }

    if (keyword.trim() !== '') {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
    setActiveIndex(-1)
  }, [keyword])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && hasNextPage) {
        fetchNextPage()
      }
    }

    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [hasNextPage, fetchNextPage])

  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })

      if (hasNextPage && activeIndex >= items.length - 1) {
        fetchNextPage()
      }
    }
  }, [activeIndex, fetchNextPage, hasNextPage, items.length])

  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [activeIndex])

  const handleItemClick = (item: T) => {
    manuallySelected.current = true
    if (onSelect) onSelect(item)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      const selectedItem = items[activeIndex]
      handleItemClick(selectedItem)
    }
  }

  const showList =
    isOpen && shouldShowList && debouncedKeyword === keyword && (items.length > 0 || isLoading)

  return (
    <div className=" relative border-gray-400 px-2 p-2 w-full flex justify-center items-center">
      <input
        className="border rounded px-2 py-2 w-full"
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => onChangeKeyword(e.target.value)}
        onFocus={() => {
          setIsOpen(true)
          if (onFocus) onFocus()
        }}
        onBlur={() => {
          setTimeout(() => {
            setIsOpen(false)
            if (onBlur) onBlur()
          }, 200) // 100~200ms 정도 딜레이 주면 충분합니다.
        }}
        // onFocus={() => {
        //   if (keyword.trim() !== '') setIsOpen(true)
        // }}
        // onBlur={() => {
        //   // setTimeout(() => setIsOpen(false), 10000)
        // }}
        onKeyDown={handleKeyDown}
      />

      {showList && (
        <div
          ref={containerRef}
          className="absolute left-0 top-12  right-0 max-h-40 mx-2 overflow-auto  border  rounded px-2 py-2 bg-white shadow z-10"
        >
          {items.map((item, index) => (
            <div
              key={index}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              className={`cursor-pointer px-2 py-1  text-left
      ${index === activeIndex ? 'bg-gray-400 text-white font-bold' : 'hover:bg-gray-100'}`}
              onMouseEnter={() => setActiveIndex(index)} // 마우스 오버 시에도 강조
              onClick={() => handleItemClick(item)}
            >
              {renderItem(item, index === activeIndex)}
            </div>
          ))}

          {hasNextPage && (
            <div className="text-center text-sm text-gray-500 py-2">불러오는 중...</div>
          )}

          {/* {(items.length === 0 && !isLoading) || (
            <div className="text-center text-sm text-gray-400 py-4">검색 결과가 없습니다</div>
          )} */}
        </div>
      )}
    </div>
  )
}
