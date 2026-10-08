import ResourceListScreen from '@/components/resource-list-screen';
import Colors from '@/constants/colors';
import { CompaniesRepository } from '@/infra/repositories/companies.repository';

const repository = new CompaniesRepository();
const load = () => repository.list();
const create = (name: string) => repository.create(name);
const remove = (id: string) => repository.remove(id);

export default function Companies() {
  return (
    <ResourceListScreen
      title="Empresas"
      subtitle="Cadastre as empresas para quem você trabalha."
      placeholder="Nome da empresa"
      emptyText="Nenhuma empresa cadastrada ainda."
      background={Colors.shortcut_companies_bg}
      load={load}
      create={create}
      remove={remove}
    />
  );
}
