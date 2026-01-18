import { api } from "../api/api"

interface LoginParameters {
    email: string,
    password: string
}

export class AuthRepository {
    public async signin({email, password}: LoginParameters){
        return await api.post('/auth', {email, password})
    }
}