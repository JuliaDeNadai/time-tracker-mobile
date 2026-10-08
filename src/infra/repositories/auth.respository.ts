import { api } from "../api/api"

interface LoginParameters {
    email: string,
    password: string
}

interface LoginResponse {
    access_token: string
}

export class AuthRepository {
    public async signin({email, password}: LoginParameters): Promise<string> {
        const { data } = await api.post<LoginResponse>('/auth', {email, password})
        return data.access_token
    }
}
