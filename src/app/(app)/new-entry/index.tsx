import { JourneyButton, JourneyLayout } from '@/components/journey';
import OptionPicker from '@/components/option-picker';
import { getErrorMessage } from '@/infra/api/api';
import { NamedResource } from '@/infra/models';
import { ServicesRepository } from '@/infra/repositories/services.repository';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

const servicesRepository = new ServicesRepository();

export default function SelectService() {
  const router = useRouter();
  const [services, setServices] = useState<NamedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NamedResource | null>(null);

  useEffect(() => {
    servicesRepository.list()
      .then(setServices)
      .catch(error => alert(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(name: string) {
    const created = await servicesRepository.create(name);
    setServices(current => [...current, created]);
    return created;
  }

  function handleNext() {
    if (!selected) return;
    router.push({
      pathname: '/new-entry/company',
      params: { serviceId: selected._id, serviceName: selected.name },
    });
  }

  return (
    <JourneyLayout
      step={1}
      subtitle="Selecione qual será o serviço prestado:"
      footer={(
        <>
          <JourneyButton variant="cancel" text="Cancelar" onPress={() => router.back()} />
          <JourneyButton variant="next" text="Próximo" onPress={handleNext} disabled={!selected} />
        </>
      )}
    >
      <OptionPicker
        options={services}
        loading={loading}
        selectedId={selected?._id}
        placeholder="Buscar ou cadastrar serviço"
        emptyText="Nenhum serviço cadastrado. Digite o nome para cadastrar."
        onSelect={setSelected}
        onCreate={handleCreate}
      />
    </JourneyLayout>
  );
}
