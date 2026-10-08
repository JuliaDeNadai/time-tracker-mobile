import { api } from "../api/api"
import { Company } from "../models"

export class CompaniesRepository {
    public async list(): Promise<Company[]> {
        const { data } = await api.get<Company[]>('/companies')
        return data
    }

    public async create(name: string): Promise<Company> {
        const { data } = await api.post<Company>('/companies', { name })
        return data
    }

    public async remove(id: string): Promise<void> {
        await api.delete(`/companies/${id}`)
    }
}
