import { supabase } from '@/integrations/supabase/client';

// Tipagem manual da tabela 'estados', já que não existe no types gerado
export interface Estado {
  id: number;
  nome: string;
  sigla: string;
}

export async function getEstados(): Promise<Estado[]> {
  const { data, error } = await (supabase as any)
    .from('estados')
    .select('*')
    .order('nome', { ascending: true });
  if (error) throw error;
  // Como 'estados' não existe no types do Supabase, forçamos o cast
  return (data as unknown as Estado[]) || [];
}
