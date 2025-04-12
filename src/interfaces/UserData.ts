export interface UserData {
	username:  string
	timestamp: number
	context:   string
}

export function newUserData(): UserData {
  return {
    username: "",
    timestamp: 0,
    context: "",
  }
}