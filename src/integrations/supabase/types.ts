export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      aceites_digitais: {
        Row: {
          aceito_em: string
          assinatura_digital: string | null
          cliente_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          proposta_id: string
          user_agent: string | null
        }
        Insert: {
          aceito_em?: string
          assinatura_digital?: string | null
          cliente_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          proposta_id: string
          user_agent?: string | null
        }
        Update: {
          aceito_em?: string
          assinatura_digital?: string | null
          cliente_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          proposta_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aceites_digitais_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aceites_digitais_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      acessos_compartilhados: {
        Row: {
          aprovacao_id: string | null
          concedido_por: string | null
          created_at: string | null
          expira_em: string | null
          id: string
          nivel_acesso: string
          registro_id: string
          tabela: string
          user_id: string
        }
        Insert: {
          aprovacao_id?: string | null
          concedido_por?: string | null
          created_at?: string | null
          expira_em?: string | null
          id?: string
          nivel_acesso?: string
          registro_id: string
          tabela: string
          user_id: string
        }
        Update: {
          aprovacao_id?: string | null
          concedido_por?: string | null
          created_at?: string | null
          expira_em?: string | null
          id?: string
          nivel_acesso?: string
          registro_id?: string
          tabela?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acessos_compartilhados_aprovacao_id_fkey"
            columns: ["aprovacao_id"]
            isOneToOne: false
            referencedRelation: "aprovacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_preferida: string
          descricao: string
          email: string | null
          endereco: string
          horario: string
          id: string
          nome: string
          observacoes_internas: string | null
          prioridade: string
          status: string
          telefone: string | null
          tipo_servico: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_preferida: string
          descricao: string
          email?: string | null
          endereco: string
          horario: string
          id?: string
          nome: string
          observacoes_internas?: string | null
          prioridade?: string
          status?: string
          telefone?: string | null
          tipo_servico: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_preferida?: string
          descricao?: string
          email?: string | null
          endereco?: string
          horario?: string
          id?: string
          nome?: string
          observacoes_internas?: string | null
          prioridade?: string
          status?: string
          telefone?: string | null
          tipo_servico?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      alteracoes_escopo: {
        Row: {
          aprovado_por: string | null
          created_at: string
          created_by: string | null
          data_aprovacao: string | null
          descricao: string
          id: string
          impacto_prazo: number | null
          impacto_valor: number | null
          justificativa: string | null
          obra_id: string
          status: Database["public"]["Enums"]["alteracao_escopo_status"]
          updated_at: string
        }
        Insert: {
          aprovado_por?: string | null
          created_at?: string
          created_by?: string | null
          data_aprovacao?: string | null
          descricao: string
          id?: string
          impacto_prazo?: number | null
          impacto_valor?: number | null
          justificativa?: string | null
          obra_id: string
          status?: Database["public"]["Enums"]["alteracao_escopo_status"]
          updated_at?: string
        }
        Update: {
          aprovado_por?: string | null
          created_at?: string
          created_by?: string | null
          data_aprovacao?: string | null
          descricao?: string
          id?: string
          impacto_prazo?: number | null
          impacto_valor?: number | null
          justificativa?: string | null
          obra_id?: string
          status?: Database["public"]["Enums"]["alteracao_escopo_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alteracoes_escopo_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      aprovacoes: {
        Row: {
          aprovador_id: string | null
          comentario: string | null
          created_at: string
          data_resposta: string | null
          id: string
          referencia_id: string
          referencia_tabela: string | null
          solicitante_id: string | null
          status: Database["public"]["Enums"]["aprovacao_status"]
          tipo: string
        }
        Insert: {
          aprovador_id?: string | null
          comentario?: string | null
          created_at?: string
          data_resposta?: string | null
          id?: string
          referencia_id: string
          referencia_tabela?: string | null
          solicitante_id?: string | null
          status?: Database["public"]["Enums"]["aprovacao_status"]
          tipo: string
        }
        Update: {
          aprovador_id?: string | null
          comentario?: string | null
          created_at?: string
          data_resposta?: string | null
          id?: string
          referencia_id?: string
          referencia_tabela?: string | null
          solicitante_id?: string | null
          status?: Database["public"]["Enums"]["aprovacao_status"]
          tipo?: string
        }
        Relationships: []
      }
      banco_horas: {
        Row: {
          colaborador_id: string
          created_at: string
          created_by: string | null
          data: string
          horas: number
          id: string
          motivo: string | null
          tipo: string
        }
        Insert: {
          colaborador_id: string
          created_at?: string
          created_by?: string | null
          data: string
          horas?: number
          id?: string
          motivo?: string | null
          tipo?: string
        }
        Update: {
          colaborador_id?: string
          created_at?: string
          created_by?: string | null
          data?: string
          horas?: number
          id?: string
          motivo?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "banco_horas_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      boletins_medicao: {
        Row: {
          created_at: string
          created_by: string | null
          data_emissao: string | null
          id: string
          medicao_id: string | null
          numero: string | null
          obra_id: string
          observacoes: string | null
          status: Database["public"]["Enums"]["boletim_status"]
          updated_at: string
          valor: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_emissao?: string | null
          id?: string
          medicao_id?: string | null
          numero?: string | null
          obra_id: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["boletim_status"]
          updated_at?: string
          valor?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_emissao?: string | null
          id?: string
          medicao_id?: string | null
          numero?: string | null
          obra_id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["boletim_status"]
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "boletins_medicao_medicao_id_fkey"
            columns: ["medicao_id"]
            isOneToOne: false
            referencedRelation: "medicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boletins_medicao_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_hora_extra: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cnpj: string | null
          contato_email: string | null
          contato_telefone: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          endereco: string | null
          id: string
          razao_social: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cnpj?: string | null
          contato_email?: string | null
          contato_telefone?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          endereco?: string | null
          id?: string
          razao_social: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cnpj?: string | null
          contato_email?: string | null
          contato_telefone?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          endereco?: string | null
          id?: string
          razao_social?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      colaborador_alocacoes: {
        Row: {
          colaborador_id: string
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          funcao: string | null
          id: string
          obra_id: string
        }
        Insert: {
          colaborador_id: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          funcao?: string | null
          id?: string
          obra_id: string
        }
        Update: {
          colaborador_id?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          funcao?: string | null
          id?: string
          obra_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "colaborador_alocacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_alocacoes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      colaborador_beneficios: {
        Row: {
          ativo: boolean | null
          colaborador_id: string
          created_at: string
          id: string
          tipo: string
          valor: number | null
        }
        Insert: {
          ativo?: boolean | null
          colaborador_id: string
          created_at?: string
          id?: string
          tipo?: string
          valor?: number | null
        }
        Update: {
          ativo?: boolean | null
          colaborador_id?: string
          created_at?: string
          id?: string
          tipo?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "colaborador_beneficios_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          bairro: string | null
          cargo: string | null
          celular: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          data_admissao: string | null
          data_nascimento: string | null
          email: string | null
          funcao: string | null
          id: string
          logradouro: string | null
          nome: string
          numero: string | null
          pis_pasep: string | null
          rg: string | null
          salario_base: number | null
          status: string
          telefone: string | null
          tipo_contrato: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cargo?: string | null
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_admissao?: string | null
          data_nascimento?: string | null
          email?: string | null
          funcao?: string | null
          id?: string
          logradouro?: string | null
          nome: string
          numero?: string | null
          pis_pasep?: string | null
          rg?: string | null
          salario_base?: number | null
          status?: string
          telefone?: string | null
          tipo_contrato?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cargo?: string | null
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_admissao?: string | null
          data_nascimento?: string | null
          email?: string | null
          funcao?: string | null
          id?: string
          logradouro?: string | null
          nome?: string
          numero?: string | null
          pis_pasep?: string | null
          rg?: string | null
          salario_base?: number | null
          status?: string
          telefone?: string | null
          tipo_contrato?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      despesas: {
        Row: {
          categoria: Database["public"]["Enums"]["despesa_categoria"]
          comprovante_url: string | null
          created_at: string
          created_by: string | null
          data: string
          descricao: string
          id: string
          obra_id: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["despesa_categoria"]
          comprovante_url?: string | null
          created_at?: string
          created_by?: string | null
          data: string
          descricao: string
          id?: string
          obra_id?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: Database["public"]["Enums"]["despesa_categoria"]
          comprovante_url?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          descricao?: string
          id?: string
          obra_id?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      epis: {
        Row: {
          certificado_aprovacao: string | null
          colaborador_id: string | null
          created_at: string
          created_by: string | null
          data_entrega: string | null
          funcionario: string | null
          id: string
          obra_id: string
          quantidade: number | null
          tipo: string
          validade: string | null
        }
        Insert: {
          certificado_aprovacao?: string | null
          colaborador_id?: string | null
          created_at?: string
          created_by?: string | null
          data_entrega?: string | null
          funcionario?: string | null
          id?: string
          obra_id: string
          quantidade?: number | null
          tipo: string
          validade?: string | null
        }
        Update: {
          certificado_aprovacao?: string | null
          colaborador_id?: string | null
          created_at?: string
          created_by?: string | null
          data_entrega?: string | null
          funcionario?: string | null
          id?: string
          obra_id?: string
          quantidade?: number | null
          tipo?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epis_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epis_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      equipamentos: {
        Row: {
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          fornecedor: string | null
          id: string
          nome: string
          obra_id: string
          quantidade: number | null
          status: string | null
          updated_at: string
          valor_unitario: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          fornecedor?: string | null
          id?: string
          nome: string
          obra_id: string
          quantidade?: number | null
          status?: string | null
          updated_at?: string
          valor_unitario?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          fornecedor?: string | null
          id?: string
          nome?: string
          obra_id?: string
          quantidade?: number | null
          status?: string | null
          updated_at?: string
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipamentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      faltas_licencas: {
        Row: {
          colaborador_id: string
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string
          id: string
          observacoes: string | null
          remunerada: boolean | null
          tipo: string
        }
        Insert: {
          colaborador_id: string
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio: string
          id?: string
          observacoes?: string | null
          remunerada?: boolean | null
          tipo?: string
        }
        Update: {
          colaborador_id?: string
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          remunerada?: boolean | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "faltas_licencas_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      horas_extras: {
        Row: {
          categoria: string | null
          created_at: string
          created_by: string | null
          data: string
          funcionario: string
          horas: number
          id: string
          motivo: string | null
          obra_id: string
          status: string | null
          tipo_hora_extra: string | null
          valor_hora: number | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          created_by?: string | null
          data: string
          funcionario: string
          horas: number
          id?: string
          motivo?: string | null
          obra_id: string
          status?: string | null
          tipo_hora_extra?: string | null
          valor_hora?: number | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          funcionario?: string
          horas?: number
          id?: string
          motivo?: string | null
          obra_id?: string
          status?: string | null
          tipo_hora_extra?: string | null
          valor_hora?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "horas_extras_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_auditoria: {
        Row: {
          acao: string
          created_at: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          data_expiracao: string | null
          descricao: string | null
          entidade: string | null
          entidade_id: string | null
          id: string
          ip_address: string | null
          modulo: string | null
          nivel_sensibilidade: string | null
          origem: string | null
          registro_id: string | null
          sessao_id: string | null
          tabela: string | null
          user_agent: string | null
          user_id: string | null
          usuario_email: string | null
          usuario_nome: string | null
          usuario_tipo: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          data_expiracao?: string | null
          descricao?: string | null
          entidade?: string | null
          entidade_id?: string | null
          id?: string
          ip_address?: string | null
          modulo?: string | null
          nivel_sensibilidade?: string | null
          origem?: string | null
          registro_id?: string | null
          sessao_id?: string | null
          tabela?: string | null
          user_agent?: string | null
          user_id?: string | null
          usuario_email?: string | null
          usuario_nome?: string | null
          usuario_tipo?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          data_expiracao?: string | null
          descricao?: string | null
          entidade?: string | null
          entidade_id?: string | null
          id?: string
          ip_address?: string | null
          modulo?: string | null
          nivel_sensibilidade?: string | null
          origem?: string | null
          registro_id?: string | null
          sessao_id?: string | null
          tabela?: string | null
          user_agent?: string | null
          user_id?: string | null
          usuario_email?: string | null
          usuario_nome?: string | null
          usuario_tipo?: string | null
        }
        Relationships: []
      }
      materiais: {
        Row: {
          created_at: string
          created_by: string | null
          data_entrega: string | null
          fornecedor: string | null
          id: string
          nome: string
          obra_id: string
          quantidade: number | null
          status: string | null
          unidade: string | null
          updated_at: string
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_entrega?: string | null
          fornecedor?: string | null
          id?: string
          nome: string
          obra_id: string
          quantidade?: number | null
          status?: string | null
          unidade?: string | null
          updated_at?: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_entrega?: string | null
          fornecedor?: string | null
          id?: string
          nome?: string
          obra_id?: string
          quantidade?: number | null
          status?: string | null
          unidade?: string | null
          updated_at?: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "materiais_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      medicoes: {
        Row: {
          correcao_igpm: number | null
          created_at: string
          created_by: string | null
          data_medicao: string | null
          descricao: string | null
          id: string
          itens: Json | null
          metragem: number | null
          numero: string | null
          obra_id: string
          observacoes: string | null
          percentual: number | null
          periodo_fim: string | null
          periodo_inicio: string | null
          programacoes_ids: string[] | null
          status: Database["public"]["Enums"]["medicao_status"]
          taxa_igpm: number | null
          updated_at: string
          valor: number | null
          valor_bruto: number | null
        }
        Insert: {
          correcao_igpm?: number | null
          created_at?: string
          created_by?: string | null
          data_medicao?: string | null
          descricao?: string | null
          id?: string
          itens?: Json | null
          metragem?: number | null
          numero?: string | null
          obra_id: string
          observacoes?: string | null
          percentual?: number | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          programacoes_ids?: string[] | null
          status?: Database["public"]["Enums"]["medicao_status"]
          taxa_igpm?: number | null
          updated_at?: string
          valor?: number | null
          valor_bruto?: number | null
        }
        Update: {
          correcao_igpm?: number | null
          created_at?: string
          created_by?: string | null
          data_medicao?: string | null
          descricao?: string | null
          id?: string
          itens?: Json | null
          metragem?: number | null
          numero?: string | null
          obra_id?: string
          observacoes?: string | null
          percentual?: number | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          programacoes_ids?: string[] | null
          status?: Database["public"]["Enums"]["medicao_status"]
          taxa_igpm?: number | null
          updated_at?: string
          valor?: number | null
          valor_bruto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medicoes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      modelos_contrato: {
        Row: {
          ativo: boolean | null
          conteudo: string | null
          created_at: string
          created_by: string | null
          id: string
          tipo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          conteudo?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          tipo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          conteudo?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          tipo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          created_at: string
          dados: Json | null
          destinatario: string | null
          id: string
          lida: boolean | null
          mensagem: string | null
          prioridade: string | null
          status: string | null
          tipo: Database["public"]["Enums"]["notificacao_tipo"]
          titulo: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dados?: Json | null
          destinatario?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string | null
          prioridade?: string | null
          status?: string | null
          tipo?: Database["public"]["Enums"]["notificacao_tipo"]
          titulo: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dados?: Json | null
          destinatario?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string | null
          prioridade?: string | null
          status?: string | null
          tipo?: Database["public"]["Enums"]["notificacao_tipo"]
          titulo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      obra_checklist: {
        Row: {
          concluido_em: string | null
          concluido_por: string | null
          created_at: string
          descricao: string
          id: string
          obra_id: string
          obrigatorio: boolean | null
          ordem: number | null
          status: string | null
        }
        Insert: {
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          descricao: string
          id?: string
          obra_id: string
          obrigatorio?: boolean | null
          ordem?: number | null
          status?: string | null
        }
        Update: {
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          descricao?: string
          id?: string
          obra_id?: string
          obrigatorio?: boolean | null
          ordem?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obra_checklist_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      obras: {
        Row: {
          cliente_id: string | null
          cno: string | null
          created_at: string
          created_by: string | null
          data_conclusao: string | null
          data_inicio: string | null
          data_previsao: string | null
          endereco: string | null
          escopo: string | null
          id: string
          metragem: number | null
          nome: string
          progresso: number | null
          proposta_id: string | null
          responsavel_email: string | null
          responsavel_id: string | null
          responsavel_telefone: string | null
          status: Database["public"]["Enums"]["obra_status"]
          ultima_programacao: string | null
          updated_at: string
          valor_contrato: number | null
        }
        Insert: {
          cliente_id?: string | null
          cno?: string | null
          created_at?: string
          created_by?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          data_previsao?: string | null
          endereco?: string | null
          escopo?: string | null
          id?: string
          metragem?: number | null
          nome: string
          progresso?: number | null
          proposta_id?: string | null
          responsavel_email?: string | null
          responsavel_id?: string | null
          responsavel_telefone?: string | null
          status?: Database["public"]["Enums"]["obra_status"]
          ultima_programacao?: string | null
          updated_at?: string
          valor_contrato?: number | null
        }
        Update: {
          cliente_id?: string | null
          cno?: string | null
          created_at?: string
          created_by?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          data_previsao?: string | null
          endereco?: string | null
          escopo?: string | null
          id?: string
          metragem?: number | null
          nome?: string
          progresso?: number | null
          proposta_id?: string | null
          responsavel_email?: string | null
          responsavel_id?: string | null
          responsavel_telefone?: string | null
          status?: Database["public"]["Enums"]["obra_status"]
          ultima_programacao?: string | null
          updated_at?: string
          valor_contrato?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "obras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      permissoes_perfil: {
        Row: {
          acesso_modulo: boolean
          created_at: string
          excluir: boolean
          id: string
          incluir_editar: boolean
          modulo: string
          perfil: string
          pesquisar: boolean
          updated_at: string
        }
        Insert: {
          acesso_modulo?: boolean
          created_at?: string
          excluir?: boolean
          id?: string
          incluir_editar?: boolean
          modulo: string
          perfil: string
          pesquisar?: boolean
          updated_at?: string
        }
        Update: {
          acesso_modulo?: boolean
          created_at?: string
          excluir?: boolean
          id?: string
          incluir_editar?: boolean
          modulo?: string
          perfil?: string
          pesquisar?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_demo: boolean
          preferencias: Json | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_demo?: boolean
          preferencias?: Json | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_demo?: boolean
          preferencias?: Json | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      programacoes: {
        Row: {
          created_at: string
          created_by: string | null
          data_programada: string
          descricao: string | null
          equipe: Json | null
          hora_fim: string | null
          hora_inicio: string | null
          id: string
          notificar_cliente: boolean | null
          obra_id: string
          observacoes: string | null
          responsavel: string | null
          servicos_executados: Json | null
          status: Database["public"]["Enums"]["programacao_status"]
          tipo: Database["public"]["Enums"]["programacao_tipo"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_programada: string
          descricao?: string | null
          equipe?: Json | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          notificar_cliente?: boolean | null
          obra_id: string
          observacoes?: string | null
          responsavel?: string | null
          servicos_executados?: Json | null
          status?: Database["public"]["Enums"]["programacao_status"]
          tipo?: Database["public"]["Enums"]["programacao_tipo"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_programada?: string
          descricao?: string | null
          equipe?: Json | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          notificar_cliente?: boolean | null
          obra_id?: string
          observacoes?: string | null
          responsavel?: string | null
          servicos_executados?: Json | null
          status?: Database["public"]["Enums"]["programacao_status"]
          tipo?: Database["public"]["Enums"]["programacao_tipo"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programacoes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          cliente_id: string | null
          condicoes_pagamento: string | null
          created_at: string
          created_by: string | null
          data_validade: string | null
          descricao: string | null
          id: string
          obra_id: string | null
          prazo_execucao: string | null
          status: Database["public"]["Enums"]["proposta_status"]
          titulo: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          cliente_id?: string | null
          condicoes_pagamento?: string | null
          created_at?: string
          created_by?: string | null
          data_validade?: string | null
          descricao?: string | null
          id?: string
          obra_id?: string | null
          prazo_execucao?: string | null
          status?: Database["public"]["Enums"]["proposta_status"]
          titulo: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          cliente_id?: string | null
          condicoes_pagamento?: string | null
          created_at?: string
          created_by?: string | null
          data_validade?: string | null
          descricao?: string | null
          id?: string
          obra_id?: string | null
          prazo_execucao?: string | null
          status?: Database["public"]["Enums"]["proposta_status"]
          titulo?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_diarios: {
        Row: {
          atividades: string | null
          clima: string | null
          created_at: string
          created_by: string | null
          data: string
          fotos: Json | null
          id: string
          mao_de_obra_presente: number | null
          obra_id: string
          ocorrencias: string | null
          temperatura_max: number | null
          temperatura_min: number | null
        }
        Insert: {
          atividades?: string | null
          clima?: string | null
          created_at?: string
          created_by?: string | null
          data: string
          fotos?: Json | null
          id?: string
          mao_de_obra_presente?: number | null
          obra_id: string
          ocorrencias?: string | null
          temperatura_max?: number | null
          temperatura_min?: number | null
        }
        Update: {
          atividades?: string | null
          clima?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          fotos?: Json | null
          id?: string
          mao_de_obra_presente?: number | null
          obra_id?: string
          ocorrencias?: string | null
          temperatura_max?: number | null
          temperatura_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_diarios_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      retencao_followups: {
        Row: {
          created_at: string
          created_by: string | null
          data: string
          horario: string
          id: string
          observacoes: string | null
          retencao_id: string
          tipo_contato: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data: string
          horario: string
          id?: string
          observacoes?: string | null
          retencao_id: string
          tipo_contato: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: string
          horario?: string
          id?: string
          observacoes?: string | null
          retencao_id?: string
          tipo_contato?: string
        }
        Relationships: [
          {
            foreignKeyName: "retencao_followups_retencao_id_fkey"
            columns: ["retencao_id"]
            isOneToOne: false
            referencedRelation: "retencoes"
            referencedColumns: ["id"]
          },
        ]
      }
      retencao_pagamentos: {
        Row: {
          created_at: string
          created_by: string | null
          data_pagamento: string
          descricao: string | null
          id: string
          retencao_id: string
          tipo: string
          valor: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_pagamento: string
          descricao?: string | null
          id?: string
          retencao_id: string
          tipo: string
          valor: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_pagamento?: string
          descricao?: string | null
          id?: string
          retencao_id?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "retencao_pagamentos_retencao_id_fkey"
            columns: ["retencao_id"]
            isOneToOne: false
            referencedRelation: "retencoes"
            referencedColumns: ["id"]
          },
        ]
      }
      retencoes: {
        Row: {
          base_calculo: number | null
          created_at: string
          created_by: string | null
          id: string
          mes_referencia: string | null
          obra_id: string
          observacoes: string | null
          percentual: number
          status: string | null
          tipo: Database["public"]["Enums"]["retencao_tipo"]
          valor: number | null
        }
        Insert: {
          base_calculo?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          mes_referencia?: string | null
          obra_id: string
          observacoes?: string | null
          percentual: number
          status?: string | null
          tipo: Database["public"]["Enums"]["retencao_tipo"]
          valor?: number | null
        }
        Update: {
          base_calculo?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          mes_referencia?: string | null
          obra_id?: string
          observacoes?: string | null
          percentual?: number
          status?: string | null
          tipo?: Database["public"]["Enums"]["retencao_tipo"]
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "retencoes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_epi: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      tipos_hora_extra: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      valores_unitarios: {
        Row: {
          ativo: boolean | null
          cliente_id: string | null
          created_at: string
          created_by: string | null
          descricao: string | null
          id: string
          servico: string
          unidade: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          servico: string
          unidade?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          servico?: string
          unidade?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "valores_unitarios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_internal_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: undefined
      }
      get_cliente_ids_for_user: {
        Args: { _user_id: string }
        Returns: string[]
      }
      get_obra_ids_for_cliente: {
        Args: { _user_id: string }
        Returns: string[]
      }
      get_related_cliente_ids: { Args: { _user_id: string }; Returns: string[] }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_record_access: {
        Args: {
          _nivel: string
          _registro_id: string
          _tabela: string
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_audit_log: {
        Args: {
          _acao: string
          _dados_anteriores?: Json
          _dados_novos?: Json
          _descricao?: string
          _entidade?: string
          _entidade_id?: string
          _modulo?: string
          _nivel_sensibilidade?: string
          _registro_id?: string
          _tabela?: string
        }
        Returns: string
      }
      is_demo_user: { Args: { _uid: string }; Returns: boolean }
      self_assign_area: {
        Args: { _area: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
    }
    Enums: {
      alteracao_escopo_status:
        | "pendente"
        | "em_analise"
        | "aprovada"
        | "rejeitada"
      app_role:
        | "admin"
        | "obras"
        | "financeira"
        | "comercial"
        | "cliente"
        | "gerenciador_tecnico"
      aprovacao_status: "pendente" | "aprovada" | "rejeitada"
      boletim_status: "rascunho" | "emitido" | "aprovado" | "pago"
      despesa_categoria:
        | "material"
        | "mao_de_obra"
        | "equipamento"
        | "transporte"
        | "alimentacao"
        | "outro"
      medicao_status: "em_elaboracao" | "pendente" | "aprovada" | "rejeitada"
      notificacao_tipo: "interna" | "email" | "alerta_seguranca" | "sistema"
      obra_status:
        | "programacao_pendente"
        | "programada"
        | "em_andamento"
        | "pausada"
        | "concluida"
        | "cancelada"
      programacao_status:
        | "programada"
        | "confirmada"
        | "em_execucao"
        | "executada"
        | "cancelada"
      programacao_tipo: "visita" | "execucao" | "medicao" | "entrega" | "outro"
      proposta_status:
        | "rascunho"
        | "pendente"
        | "em_analise"
        | "aprovada"
        | "rejeitada"
        | "cancelada"
      retencao_tipo: "iss" | "inss" | "irrf" | "pis_cofins_csll" | "outro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alteracao_escopo_status: [
        "pendente",
        "em_analise",
        "aprovada",
        "rejeitada",
      ],
      app_role: [
        "admin",
        "obras",
        "financeira",
        "comercial",
        "cliente",
        "gerenciador_tecnico",
      ],
      aprovacao_status: ["pendente", "aprovada", "rejeitada"],
      boletim_status: ["rascunho", "emitido", "aprovado", "pago"],
      despesa_categoria: [
        "material",
        "mao_de_obra",
        "equipamento",
        "transporte",
        "alimentacao",
        "outro",
      ],
      medicao_status: ["em_elaboracao", "pendente", "aprovada", "rejeitada"],
      notificacao_tipo: ["interna", "email", "alerta_seguranca", "sistema"],
      obra_status: [
        "programacao_pendente",
        "programada",
        "em_andamento",
        "pausada",
        "concluida",
        "cancelada",
      ],
      programacao_status: [
        "programada",
        "confirmada",
        "em_execucao",
        "executada",
        "cancelada",
      ],
      programacao_tipo: ["visita", "execucao", "medicao", "entrega", "outro"],
      proposta_status: [
        "rascunho",
        "pendente",
        "em_analise",
        "aprovada",
        "rejeitada",
        "cancelada",
      ],
      retencao_tipo: ["iss", "inss", "irrf", "pis_cofins_csll", "outro"],
    },
  },
} as const
