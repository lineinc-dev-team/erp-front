type OrderInfoProps = {
  orderName: string
  businessNumber: string
  ceoName: string
  phoneNumber: string
  chargeName: string
  email: string
  companyName: string
}

type OrderState = {
  orderInfo: OrderInfoProps
  startDate: Date | null
  endDate: Date | null
  useORnot: string

  setField: <K extends keyof OrderInfoProps>(field: K, value: OrderInfoProps[K]) => void
  setStartDate: (date: Date | null) => void
  setEndDate: (date: Date | null) => void
  setUseORnot: (useORnot: string) => void
  resetFields: () => void
}

type OrderInfo = {
  orderName: string
  businessNumber: string
  ceoName: string
  phoneNumber: string
  chargeName: string
  email: string
  companyName: string
}

type OrderState = {
  orderInfo: OrderInfo
  startDate: Date | null
  endDate: Date | null
  useORnot: string

  setField: (field: keyof OrderInfo, value: string) => void
  setStartDate: (date: Date | null) => void
  setEndDate: (date: Date | null) => void
  setUseORnot: (useORnot: string) => void
  resetFields: () => void
}

type Manager = {
  id: number
  name: string
  department: string
  contact: string
  mobile: string
  email: string
  memo: string
}

type AttachedFileProps = {
  id: number
  fileName: string
  fileInfo: FileUploadProps
  memo: string
}
