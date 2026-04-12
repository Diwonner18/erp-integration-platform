import { useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface CepResult {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface CepData {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export const useCepLookup = () => {
  const [loading, setLoading] = useState(false);

  const fetchCep = useCallback(async (cep: string): Promise<CepData | null> => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return null;

    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: CepResult = await response.json();
      if (data.erro) return null;
      return {
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        uf: data.uf || '',
      };
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchCep, loading };
};
