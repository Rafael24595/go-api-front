export interface UserData {
  picture: ""
	username:  string
	timestamp: number
  history: string,
	collection: string
  context: string
  is_protected: boolean
  is_admin: boolean
  first_time: boolean
}

export function newUserData(): UserData {
  return {
    picture: "",
    username: "",
    timestamp: 0,
    history: "",
    collection: "",
    context: "",
    is_protected: false,
    is_admin: false,
    first_time: false,
  }
}