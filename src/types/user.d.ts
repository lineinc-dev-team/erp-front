export interface myInfoProps {
  id: number
  loginId: string
  roles: roleInfo[]
  username: string
}

type roleInfo = {
  id: number
  name: string
}
