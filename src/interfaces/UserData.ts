export interface UserData {
  picture: ""
	username:  string
	timestamp: number
	context:   string
}

export function newUserData(): UserData {
  return {
    picture: "",
    username: "",
    timestamp: 0,
    context: "",
  }
}