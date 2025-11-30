export enum Role {
  ROLE_ADMIN     = "admin",
  ROLE_PROTECTED = "protected",
  ROLE_ANONYMOUS = "anonymous",
}

export interface UserData {
  picture: ""
	username:  string
	timestamp: number
  first_time: boolean
  roles: string[]
}

export const hasRole = (user: UserData, role: Role) => {
  return user.roles.includes(role)
}

export const hasAnyRole = (user: UserData, ...role: Role[]) => {
  return role.find(e => hasRole(user, e))
}

export function newUserData(): UserData {
  return {
    picture: "",
    username: "",
    timestamp: 0,
    first_time: false,
    roles: []
  }
}