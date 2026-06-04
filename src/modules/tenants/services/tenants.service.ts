import { 
  getAdminTenants, 
  getAdminTenantsId, 
  postAdminTenants, 
  putAdminTenantsId, 
  deleteAdminTenantsId 
} from '../../../core/http/generated/endpoints/endpoints';
import { Tenant, TenantFormData } from '../types/tenant.types';
import { tenantMapper } from '../mappers/tenant.mapper';

const LOCAL_STORAGE_KEY = 'petvex_tenants_db';

const getStoredTenants = (): Tenant[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    const initialTenants: Tenant[] = [
      {
        id: '1',
        name: 'Clínica Veterinária Patas & Pelos',
        email: 'contato@patasepelos.com.br',
        documento: '12.345.678/0001-99',
        telefone: '(11) 98765-4321',
        status: 'active',
        plano: 'Pro',
        createdAt: '2026-01-15T10:30:00.000Z',
      },
      {
        id: '2',
        name: 'Hospital Vet Amigo Fiel',
        email: 'financeiro@amigofiel.com.br',
        documento: '98.765.432/0001-00',
        telefone: '(21) 99999-8888',
        status: 'active',
        plano: 'Enterprise',
        createdAt: '2026-03-22T14:45:00.000Z',
      },
      {
        id: '3',
        name: 'Petshop e Consultório Banho de Amor',
        email: 'banhodeamor@outlook.com',
        documento: '45.678.123/0001-11',
        telefone: '(31) 97777-6666',
        status: 'inactive',
        plano: 'Starter',
        createdAt: '2026-05-10T08:15:00.000Z',
      },
      {
        id: '4',
        name: 'Centro Veterinário Saúde Animal',
        email: 'saudeanimal@vets.com.br',
        documento: '11.222.333/0001-44',
        telefone: '(19) 98888-7777',
        status: 'active',
        plano: 'Pro',
        createdAt: '2026-05-28T16:00:00.000Z',
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialTenants));
    return initialTenants;
  }
  return JSON.parse(data);
};

const saveStoredTenants = (tenants: Tenant[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tenants));
};

export interface ListarTenantsParams {
  search?: string;
  status?: string;
  plano?: string;
  page?: number;
  perPage?: number;
}

export interface ListarTenantsResult {
  data: Tenant[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export const tenantsService = {
  async listarTenants(params: ListarTenantsParams = {}): Promise<ListarTenantsResult> {
    try {
      const rawParams = {
        search: params.search,
        status: params.status === 'all' ? undefined : params.status,
        plano: params.plano === 'all' ? undefined : params.plano,
        page: params.page,
        perPage: params.perPage,
      };

      const cleanParams = Object.fromEntries(
        Object.entries(rawParams).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );

      const apiResponse = await getAdminTenants(cleanParams);

      return {
        data: apiResponse.data.map(tenantMapper.toUi),
        total: apiResponse.total,
        page: apiResponse.page,
        perPage: apiResponse.perPage,
        lastPage: apiResponse.lastPage,
      };
    } catch (e) {
      console.warn('API error listing tenants, using local fallback:', e);

      let list = getStoredTenants();

      if (params.search) {
        const searchLower = params.search.toLowerCase();
        list = list.filter((c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          (c.documento && c.documento.includes(searchLower)) ||
          (c.telefone && c.telefone.includes(searchLower))
        );
      }

      if (params.status && params.status !== 'all') {
        list = list.filter((c) => c.status === params.status);
      }

      if (params.plano && params.plano !== 'all') {
        list = list.filter((c) => c.plano === params.plano);
      }

      const page = params.page || 1;
      const total = list.length;
      
      let paginatedItems = list;
      let lastPage = 1;
      let responsePerPage = total;

      if (params.perPage) {
        responsePerPage = params.perPage;
        lastPage = Math.ceil(total / responsePerPage) || 1;
        const startIndex = (page - 1) * responsePerPage;
        paginatedItems = list.slice(startIndex, startIndex + responsePerPage);
      }

      return {
        data: paginatedItems,
        total,
        page,
        perPage: responsePerPage,
        lastPage,
      };
    }
  },

  async buscarTenantPorId(id: string): Promise<Tenant> {
    try {
      const apiResponse = await getAdminTenantsId(id);
      return tenantMapper.toUi(apiResponse);
    } catch (e) {
      console.warn(`API error getting tenant #${id}, using local fallback:`, e);
      const list = getStoredTenants();
      const found = list.find((c) => c.id === id);
      if (!found) {
        throw new Error('Tenant não encontrado');
      }
      return found;
    }
  },

  async cadastrarTenant(formData: TenantFormData): Promise<Tenant> {
    const list = getStoredTenants();
    if (list.some((c) => c.email.toLowerCase() === formData.email.toLowerCase())) {
      const apiError: any = new Error('The given data was invalid.');
      apiError.response = {
        status: 422,
        data: {
          message: 'Erro: O e-mail informado já está em uso por outro tenant.',
          errors: {
            email: ['Este e-mail já foi registrado para outro tenant no Petvex.'],
          }
        }
      };
      throw apiError;
    }

    const apiPayload = tenantMapper.toApiCreate(formData);

    try {
      const apiResponse = await postAdminTenants(apiPayload);
      const mapped = tenantMapper.toUi(apiResponse);
      saveStoredTenants([mapped, ...list]);
      return mapped;
    } catch (e: any) {
      if (e && (e.name === 'ApiError' || e.status || e.response)) {
        throw e;
      }
      console.warn('API error creating tenant, simulating response locally:', e);
      const mockApiResponse = {
        id: Math.floor(Math.random() * 1000000).toString(),
        name: apiPayload.name,
        email: apiPayload.email,
        documento: apiPayload.documento || '',
        telefone: apiPayload.telefone || '',
        status: apiPayload.status || 'active',
        plano: apiPayload.plano || 'Starter',
        created_at: new Date().toISOString(),
      };

      const newTenant = tenantMapper.toUi(mockApiResponse);
      saveStoredTenants([newTenant, ...list]);
      return newTenant;
    }
  },

  async atualizarTenant(id: string, formData: Partial<TenantFormData>): Promise<Tenant> {
    const list = getStoredTenants();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Tenant não encontrado.');
    }

    if (formData.email) {
      const emailConflict = list.some((c) => c.id !== id && c.email.toLowerCase() === formData.email!.toLowerCase());
      if (emailConflict) {
        const apiError: any = new Error('The given data was invalid.');
        apiError.response = {
          status: 422,
          data: {
            message: 'Erro: Conflito de cadastro.',
            errors: {
              email: ['Este endereço de e-mail já está associado a outro tenant.'],
            }
          }
        };
        throw apiError;
      }
    }

    const apiPayload = tenantMapper.toApiUpdate(formData);

    try {
      const apiResponse = await putAdminTenantsId(id, apiPayload);
      const mapped = tenantMapper.toUi(apiResponse);
      list[index] = mapped;
      saveStoredTenants(list);
      return mapped;
    } catch (e: any) {
      if (e && (e.name === 'ApiError' || e.status || e.response)) {
        throw e;
      }
      console.warn(`API error updating tenant #${id}, patching locally:`, e);
      const current = list[index];
      const updatedModel: Tenant = {
        ...current,
        name: formData.name ?? current.name,
        email: formData.email ?? current.email,
        documento: formData.documento ?? current.documento,
        telefone: formData.telefone ?? current.telefone,
        status: formData.status ?? current.status,
        plano: formData.plano ?? current.plano,
      };

      list[index] = updatedModel;
      saveStoredTenants(list);
      return updatedModel;
    }
  },

  async excluirTenant(id: string): Promise<void> {
    try {
      await deleteAdminTenantsId(id);
    } catch (e) {
      console.warn(`API error deleting tenant #${id}, running locally:`, e);
    } finally {
      const list = getStoredTenants();
      const filtered = list.filter((t) => t.id !== id);
      saveStoredTenants(filtered);
    }
  }
};
