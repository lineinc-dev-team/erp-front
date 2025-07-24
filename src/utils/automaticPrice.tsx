export const automaticPrice = (type: 'costItem', id: number, field: string, value: string) => {
  setManagers((prev) =>
    prev.map((item) => {
      if (item.id !== id) return item

      const updatedItem = { ...item, [field]: value }

      if (field === 'supplyPrice') {
        const supply = parseFloat(value) || 0
        const vat = Math.floor(supply * 0.1) // 정수 처리
        const total = supply + vat

        updatedItem.vat = vat.toString()
        updatedItem.total = total.toString()
      }

      return updatedItem
    }),
  )
}
