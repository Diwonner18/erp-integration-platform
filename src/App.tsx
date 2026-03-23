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

// Admin pages
import GerenciarUsuarios from "./pages/Admin/GerenciarUsuarios";
import Permissoes from "./pages/Admin/Permissoes";
import Aprovacoes from "./pages/Admin/Aprovacoes";
import Automacao from "./pages/Admin/Automacao";

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
              <ProtectedRoute allowedUserTypes={['admin', gt, 'comercial']}>
                <ValoresUnitarios />
              </ProtectedRoute>
            } />
            <Route path="/aceites" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'comercial']}>
                <AceitesDigitais />
              </ProtectedRoute>
            } />
            <Route path="/modelos-contrato" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'comercial']}>
                <ModelosContrato />
              </ProtectedRoute>
            } />
            <Route path="/relatorios-comerciais" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'comercial']}>
                <RelatoriosComerciais />
              </ProtectedRoute>
            } />

            {/* Operations routes */}
            <Route path="/medicoes" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras', 'financeira']}>
                <Medicoes />
              </ProtectedRoute>
            } />
            <Route path="/alteracoes-escopo" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']}>
                <AlteracoesEscopo />
              </ProtectedRoute>
            } />
            <Route path="/materiais" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']}>
                <Materiais />
              </ProtectedRoute>
            } />
            <Route path="/horas-extras" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras', 'financeira']}>
                <HorasExtras />
              </ProtectedRoute>
            } />
            <Route path="/relatorios-obra" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']}>
                <RelatoriosObra />
              </ProtectedRoute>
            } />

            {/* New Operations detail routes */}
            <Route path="/obras-concluidas" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']}>
                <ObrasConcluidas />
              </ProtectedRoute>
            } />
            <Route path="/obras-em-andamento" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']}>
                <ObrasEmAndamento />
              </ProtectedRoute>
            } />
            <Route path="/obras-agendadas" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']}>
                <ObrasAgendadas />
              </ProtectedRoute>
            } />
            <Route path="/equipe-ativa" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']}>
                <EquipeAtiva />
              </ProtectedRoute>
            } />
            <Route path="/central-alertas" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']}>
                <CentralAlertas />
              </ProtectedRoute>
            } />

            {/* Financial routes */}
            <Route path="/boletins-medicao" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']}>
                <BoletinsMedicao />
              </ProtectedRoute>
            } />
            <Route path="/financeiro" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']}>
                <ControleFinanceiro />
              </ProtectedRoute>
            } />
            <Route path="/relatorios-financeiros" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']}>
                <RelatoriosFinanceiros />
              </ProtectedRoute>
            } />
            <Route path="/exportar-dados" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']}>
                <ExportarDados />
              </ProtectedRoute>
            } />
            <Route path="/retencoes" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']}>
                <ControleRetencoes />
              </ProtectedRoute>
            } />
            <Route path="/retencoes/:id" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']}>
                <DetalhesRetencao />
              </ProtectedRoute>
            } />
            <Route path="/fechamento-mensal" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira']}>
                <FechamentoMensal />
              </ProtectedRoute>
            } />
            <Route path="/lancamento-despesas" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'financeira', 'obras']}>
                <LancamentoDespesas />
              </ProtectedRoute>
            } />

            {/* Materiais e Equipamentos - Nova rota unificada */}
            <Route path="/materiais-equipamentos" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']}>
                <MateriaisEquipamentos />
              </ProtectedRoute>
            } />

            {/* Colaboradores */}
            <Route path="/colaboradores" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']}>
                <ColaboradoresPage />
              </ProtectedRoute>
            } />

            {/* EPIs */}
            <Route path="/epis" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']}>
                <EPIs />
              </ProtectedRoute>
            } />

            {/* Relatório Diário de Obra */}
            <Route path="/relatorio-diario-obra" element={
              <ProtectedRoute allowedUserTypes={['admin', gt, 'obras']}>
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