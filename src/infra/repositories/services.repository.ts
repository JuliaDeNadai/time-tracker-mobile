import { api } from "../api/api"
import { Service } from "../models"

export class ServicesRepository {
    public async list(): Promise<Service[]> {
        const { data } = await api.get<Service[]>('/services')
        return data
    }

    public async create(name: string): Promise<Service> {
        const { data } = await api.post<Service>('/services', { name })
        return data
    }
}
