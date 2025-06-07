import { supabase } from '@/integrations/supabase/client';

export interface Cidade {
  id: number;
  nome: string;
  estado_sigla: string;
}

export async function getCidadesByEstado(siglaEstado: string): Promise<Cidade[]> {
  const { data, error } = await (supabase as any)
    .from('cidades')
    .select('*')
    .eq('estado_sigla', siglaEstado)
    .order('nome', { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return data || []; 
}
