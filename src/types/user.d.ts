export interface myInfoProps {
  id: number
  loginId: string
  roles: roleInfo[]
  username: string
  isHeadOffice: boolean
}

type roleInfo = {
  id: number
  name: string
  deleted: boolean
}
