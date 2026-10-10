import { api } from "../api/api"
import { CreateUserParameters, User } from "../models"

export class UsersRepository {
    public async me(): Promise<User> {
        const { data } = await api.get<User[]>('/users')
        return data[0]
    }

    /** Somente admin. */
    public async listGeneral(): Promise<User[]> {
        const { data } = await api.get<User[]>('/users/general')
        return data
    }

    public async create(params: CreateUserParameters): Promise<void> {
        await api.post('/users', params)
    }
}
