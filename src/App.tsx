import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Programacao from "./pages/Programacao";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import NotFound from "./pages/NotFound";
import Configuracoes from "./pages/Configuracoes";
import ResetPassword from "./pages/ResetPassword";
import EsqueciSenha from "./pages/EsqueciSenha";

// Admin pages
import GerenciarUsuarios from "./pages/Admin/GerenciarUsuarios";
import Permissoes from "./pages/Admin/Permissoes";
import Aprovacoes from "./pages/Admin/Aprovacoes";
import Automacao from "./pages/Admin/Automacao";
import TabelasApoio from "./pages/Admin/TabelasApoio";

// Commercial pages
import Propostas from "./pages/Comercial/Propostas";
import ValoresUnitarios from "./pages/Comercial/ValoresUnitarios";
import AceitesDigitais from "./pages/Comercial/AceitesDigitais";
import ModelosContrato from "./pages/Comercial/ModelosContrato";
import RelatoriosComerciais from "./pages/Comercial/RelatoriosComerciais";

// Operations pages
import Medicoes from "./pages/Obras/Medicoes";
import AlteracoesEscopo from "./pages/Obras/AlteracoesEscopo";
import Materiais from "./pages/Obras/Materiais";
import HorasExtras from "./pages/Obras/HorasExtras";
import EPIs from "./pages/Obras/EPIs";
import EstoqueEPI from "./pages/Obras/EstoqueEPI";
import RelatoriosObra from "./pages/Obras/RelatoriosObra";
import ObrasConcluidas from "./pages/Obras/ObrasConcluidas";
import ObrasEmAndamento from "./pages/Obras/ObrasEmAndamento";
import ObrasAgendadas from "./pages/Obras/ObrasAgendadas";
import EquipeAtiva from "./pages/Obras/EquipeAtiva";
import CentralAlertas from "./pages/Obras/CentralAlertas";

// Financial pages
import BoletinsMedicao from "./pages/Financeiro/BoletinsMedicao";
import ControleFinanceiro from "./pages/Financeiro/ControleFinanceiro";
import RelatoriosFinanceiros from "./pages/Financeiro/RelatoriosFinanceiros";
import ExportarDados from "./pages/Financeiro/ExportarDados";
import ControleRetencoes from "./pages/Financeiro/ControleRetencoes";
import DetalhesRetencao from "./pages/Financeiro/DetalhesRetencao";
import FechamentoMensal from "./pages/Financeiro/FechamentoMensal";
import MateriaisEquipamentos from "./pages/Obras/MateriaisEquipamentos";
import RelatorioDiarioObra from "./pages/Obras/RelatorioDiarioObra";
import LancamentoDespesas from "./pages/Financeiro/LancamentoDespesas";

// Client pages
import SolicitarAgendamento from "./pages/Cliente/SolicitarAgendamento";
import MinhasObras from "./pages/Cliente/MinhasObras";
import MinhasPropostas from "./pages/Cliente/MinhasPropostas";
import MeusRelatorios from "./pages/Cliente/MeusRelatorios";
import MeusPagamentos from "./pages/Cliente/MeusPagamentos";

// Shared pages
import Relatorios from "./pages/Shared/Relatorios";

// Colaboradores
import ColaboradoresPage from "./pages/Colaboradores/ColaboradoresPage";

// Routes rebuild trigger v2
const queryClient = new QueryClient();

const gt = 'gerenciador_tecnico' as const;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Dashboard - All users */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Configurações - All users */}
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/usuarios" element={
              <ProtectedRoute allowedUserTypes={['admin', gt]}>
                <GerenciarUsuarios />
              </ProtectedRoute>
            } />
            <Route path="/permissoes" element={
              <ProtectedRoute allowedUserTypes={['admin', gt]}>
                <Permissoes />
              </ProtectedRoute>
            } />
            <Route path="/aprovacoes" element={
              <ProtectedRoute allowedUserTypes={['admin', gt]}>
                <Aprovacoes />
              </ProtectedRoute>
            } />
            <Route path="/automacao" element={
              <ProtectedRoute allowedUserTypes={['admin', gt]}>
                <Automacao />
              </ProtectedRoute>
            } />

            <Route path="/tabelas-apoio" element={
              <ProtectedRoute allowedUserTypes={['admin', gt]}>
                <TabelasApoio />
              </ProtectedRoute>
            } />

            {/* Shared routes */}
            <Route path="/programacao" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="programacoes">
                <Programacao />
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute allowedUserTypes={['admin', gt]}>
                <Relatorios />
              </ProtectedRoute>
            } />

            {/* Commercial routes */}
            <Route path="/propostas" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'comercial']} modulo="propostas">
                <Propostas />
              </ProtectedRoute>
            } />
            <Route path="/valores-unitarios" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'comercial']} modulo="valores_unitarios">
                <ValoresUnitarios />
              </ProtectedRoute>
            } />
            <Route path="/aceites" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'comercial']} modulo="aceites">
                <AceitesDigitais />
              </ProtectedRoute>
            } />
            <Route path="/modelos-contrato" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'comercial']} modulo="modelos_contrato">
                <ModelosContrato />
              </ProtectedRoute>
            } />
            <Route path="/relatorios-comerciais" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'comercial']} modulo="relatorios_comerciais">
                <RelatoriosComerciais />
              </ProtectedRoute>
            } />

            {/* Operations routes */}
            <Route path="/medicoes" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras', 'financeira']} modulo="medicoes">
                <Medicoes />
              </ProtectedRoute>
            } />
            <Route path="/alteracoes-escopo" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="alteracoes_escopo">
                <AlteracoesEscopo />
              </ProtectedRoute>
            } />
            <Route path="/materiais" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="materiais">
                <Materiais />
              </ProtectedRoute>
            } />
            <Route path="/horas-extras" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras', 'financeira']} modulo="horas_extras">
                <HorasExtras />
              </ProtectedRoute>
            } />
            <Route path="/relatorios-obra" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="relatorios_obra">
                <RelatoriosObra />
              </ProtectedRoute>
            } />

            {/* New Operations detail routes */}
            <Route path="/obras-concluidas" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="programacoes">
                <ObrasConcluidas />
              </ProtectedRoute>
            } />
            <Route path="/obras-em-andamento" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="programacoes">
                <ObrasEmAndamento />
              </ProtectedRoute>
            } />
            <Route path="/obras-agendadas" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="programacoes">
                <ObrasAgendadas />
              </ProtectedRoute>
            } />
            <Route path="/equipe-ativa" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="colaboradores">
                <EquipeAtiva />
              </ProtectedRoute>
            } />
            <Route path="/central-alertas" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="programacoes">
                <CentralAlertas />
              </ProtectedRoute>
            } />

            {/* Financial routes */}
            <Route path="/boletins-medicao" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']} modulo="boletins">
                <BoletinsMedicao />
              </ProtectedRoute>
            } />
            <Route path="/financeiro" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']} modulo="financeiro">
                <ControleFinanceiro />
              </ProtectedRoute>
            } />
            <Route path="/relatorios-financeiros" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']} modulo="relatorios_financeiros">
                <RelatoriosFinanceiros />
              </ProtectedRoute>
            } />
            <Route path="/exportar-dados" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']} modulo="exportar_dados">
                <ExportarDados />
              </ProtectedRoute>
            } />
            <Route path="/retencoes" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']} modulo="retencoes">
                <ControleRetencoes />
              </ProtectedRoute>
            } />
            <Route path="/retencoes/:id" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']} modulo="retencoes">
                <DetalhesRetencao />
              </ProtectedRoute>
            } />
            <Route path="/fechamento-mensal" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']} modulo="fechamento_mensal">
                <FechamentoMensal />
              </ProtectedRoute>
            } />
            <Route path="/lancamento-despesas" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira', 'obras']} modulo="despesas">
                <LancamentoDespesas />
              </ProtectedRoute>
            } />

            {/* Materiais e Equipamentos - Nova rota unificada */}
            <Route path="/materiais-equipamentos" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="materiais">
                <MateriaisEquipamentos />
              </ProtectedRoute>
            } />

            {/* Colaboradores */}
            <Route path="/colaboradores" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="colaboradores">
                <ColaboradoresPage />
              </ProtectedRoute>
            } />

            {/* EPIs */}
            <Route path="/epis" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="epis">
                <EPIs />
              </ProtectedRoute>
            } />

            {/* Estoque de EPIs */}
            <Route path="/estoque-epis" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="epis">
                <EstoqueEPI />
              </ProtectedRoute>
            } />

            {/* Relatório Diário de Obra */}
            <Route path="/relatorio-diario-obra" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']} modulo="relatorios_diarios">
                <RelatorioDiarioObra />
              </ProtectedRoute>
            } />

            {/* Client routes */}
            <Route path="/solicitar-agendamento" element={
              <ProtectedRoute allowedUserTypes={['cliente', gt]}>
                <SolicitarAgendamento />
              </ProtectedRoute>
            } />
            <Route path="/minhas-obras" element={
              <ProtectedRoute allowedUserTypes={['cliente', gt]}>
                <MinhasObras />
              </ProtectedRoute>
            } />
            <Route path="/minhas-propostas" element={
              <ProtectedRoute allowedUserTypes={['cliente', gt]}>
                <MinhasPropostas />
              </ProtectedRoute>
            } />
            <Route path="/meus-relatorios" element={
              <ProtectedRoute allowedUserTypes={['cliente', gt]}>
                <MeusRelatorios />
              </ProtectedRoute>
            } />
            <Route path="/meus-pagamentos" element={
              <ProtectedRoute allowedUserTypes={['cliente', gt]}>
                <MeusPagamentos />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;