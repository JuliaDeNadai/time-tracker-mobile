import { JourneyButton, JourneyLayout } from '@/components/journey';
import OptionPicker from '@/components/option-picker';
import { getErrorMessage } from '@/infra/api/api';
import { NamedResource } from '@/infra/models';
import { CompaniesRepository } from '@/infra/repositories/companies.repository';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

const companiesRepository = new CompaniesRepository();

export default function SelectCompany() {
  const router = useRouter();
  const { serviceId, serviceName } = useLocalSearchParams<{ serviceId: string, serviceName: string }>();
  const [companies, setCompanies] = useState<NamedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NamedResource | null>(null);

  useEffect(() => {
    companiesRepository.list()
      .then(setCompanies)
      .catch(error => alert(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(name: string) {
    const created = await companiesRepository.create(name);
    setCompanies(current => [...current, created]);
    return created;
  }

  function handleNext() {
    if (!selected) return;
    router.push({
      pathname: '/new-entry/confirm',
      params: { serviceId, serviceName, companyId: selected._id, companyName: selected.name },
    });
  }

  return (
    <JourneyLayout
      step={2}
      subtitle="Selecione qual será a empresa contratante:"
      footer={(
        <>
          <JourneyButton variant="back" text="Voltar" onPress={() => router.back()} />
          <JourneyButton variant="next" text="Próximo" onPress={handleNext} disabled={!selected} />
        </>
      )}
    >
      <OptionPicker
        options={companies}
        loading={loading}
        selectedId={selected?._id}
        placeholder="Buscar ou cadastrar empresa"
        emptyText="Nenhuma empresa cadastrada. Digite o nome para cadastrar."
        onSelect={setSelected}
        onCreate={handleCreate}
      />
    </JourneyLayout>
  );
}
