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

export const hasRole = (user: UserData, ...roles: Role[]) => {
  if (roles.length == 0) {
    return false;
  }

  for (const role of roles) {
    if (!user.roles.includes(role)) {
      return false;
    }
  }
  
  return true;
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