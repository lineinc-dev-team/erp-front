type BusinessInfoProps = {
  name: string
  code: string
  description: string
}

type BusinessState = {
  businessInfo: BusinessInfoProps
  status: string
  location: string
  process: string
  startDate: Date | null
  endDate: Date | null

  setField: <K extends keyof BusinessInfoProps>(field: K, value: BusinessInfoProps[K]) => void
  setStatus: (status: string) => void
  setLocation: (location: string) => void
  setProcess: (process: string) => void
  setStartDate: (date: Date | null) => void
  setEndDate: (date: Date | null) => void
  resetFields: () => void
}
