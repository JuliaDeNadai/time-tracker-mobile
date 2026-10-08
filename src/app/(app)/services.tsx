import ResourceListScreen from '@/components/resource-list-screen';
import Colors from '@/constants/colors';
import { ServicesRepository } from '@/infra/repositories/services.repository';

const repository = new ServicesRepository();
const load = () => repository.list();
const create = (name: string) => repository.create(name);

export default function Services() {
  return (
    <ResourceListScreen
      title="Serviços"
      subtitle="Cadastre os serviços que você presta."
      placeholder="Nome do serviço"
      emptyText="Nenhum serviço cadastrado ainda."
      background={Colors.shortcut_services_bg}
      load={load}
      create={create}
    />
  );
}
