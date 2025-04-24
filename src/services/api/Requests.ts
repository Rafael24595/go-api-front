export interface RequestLogin {
	username: string
	password: string
}

export interface RequestSignin {
	username: string
	password_1: string
	password_2: string
	is_admin: boolean
}

export interface RequestAuthentication {
	old_password: string
	new_password_1: string
	new_password_2: string
}