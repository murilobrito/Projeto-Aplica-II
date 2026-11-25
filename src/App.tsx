import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { RequireArea } from './auth/RequireArea'
import { GestaoLayout, PlataformaLayout } from './layouts/AppLayouts'
import { CatadorLayout } from './layouts/CatadorLayout'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { GestaoProvider } from './gestao/GestaoContext'
import { GestaoDashboardPage } from './pages/gestao/DashboardPage'
import { GestaoDispositivosPage } from './pages/gestao/DispositivosPage'
import { GestaoHomePage } from './pages/gestao/HomePage'
import { CatadorDetalhePage } from './pages/gestao/CatadorDetalhePage'
import { CategoriaDetalhePage } from './pages/gestao/CategoriaDetalhePage'
import { ComposicaoPage } from './pages/gestao/ComposicaoPage'
import { ConfiguracoesPage } from './pages/gestao/ConfiguracoesPage'
import { CorrecoesPage } from './pages/gestao/CorrecoesPage'
import { EquipePage } from './pages/gestao/EquipePage'
import { NovoUsuarioPage } from './pages/gestao/NovoUsuarioPage'
import { RelatoriosPage } from './pages/gestao/RelatoriosPage'
import { UsuariosPage } from './pages/gestao/UsuariosPage'
import { GestaoPerfilPage } from './pages/gestao/PerfilPage'
import { MaisPage } from './pages/gestao/MaisPage'
import { DesempenhoPage } from './pages/catador/DesempenhoPage'
import { DispositivosPage } from './pages/catador/DispositivosPage'
import { HistoricoPage } from './pages/catador/HistoricoPage'
import { PerfilPage } from './pages/catador/PerfilPage'
import { CapturaPage } from './pages/captura/CapturaPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* MVP: identificação pelo celular, pública (sem login) */}
          <Route path="/captura" element={<CapturaPage />} />

          {/* Admin: equipe EcoTriall */}
          <Route element={<RequireArea area="plataforma" />}>
            <Route path="/plataforma" element={<PlataformaLayout />}>
              <Route index element={<PlaceholderPage title="Painel da plataforma" />} />
              <Route path="cooperativas" element={<PlaceholderPage title="Cooperativas" />} />
              <Route path="cooperativas/nova" element={<PlaceholderPage title="Nova cooperativa" />} />
              <Route path="cooperativas/:id" element={<PlaceholderPage title="Detalhe da cooperativa" />} />
              <Route path="dispositivos" element={<PlaceholderPage title="Dispositivos da plataforma" />} />
              <Route path="catalogo" element={<PlaceholderPage title="Catálogo de materiais" />} />
              <Route path="perfil" element={<PlaceholderPage title="Perfil" />} />
            </Route>
          </Route>

          {/* Gerente e Coordenador */}
          <Route element={<RequireArea area="gestao" />}>
            <Route
              path="/gestao"
              element={
                <GestaoProvider>
                  <GestaoLayout />
                </GestaoProvider>
              }
            >
              <Route index element={<GestaoHomePage />} />
              <Route path="dashboard" element={<GestaoDashboardPage />} />
              <Route path="composicao" element={<ComposicaoPage />} />
              <Route path="configuracoes" element={<ConfiguracoesPage />} />
              <Route path="configuracoes/:categoriaId" element={<CategoriaDetalhePage />} />
              <Route path="equipe" element={<EquipePage />} />
              <Route path="equipe/:catadorId" element={<CatadorDetalhePage />} />
              <Route path="relatorios" element={<RelatoriosPage />} />
              <Route path="dispositivos" element={<GestaoDispositivosPage />} />
              <Route path="correcoes" element={<CorrecoesPage />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="usuarios/novo" element={<NovoUsuarioPage />} />
              <Route path="perfil" element={<GestaoPerfilPage />} />
              <Route path="mais" element={<MaisPage />} />
            </Route>
          </Route>

          {/* Catador */}
          <Route element={<RequireArea area="catador" />}>
            <Route path="/catador" element={<CatadorLayout />}>
              <Route index element={<CapturaPage embedded />} />
              <Route path="historico" element={<HistoricoPage />} />
              <Route path="desempenho" element={<DesempenhoPage />} />
              <Route path="dispositivos" element={<DispositivosPage />} />
              <Route path="perfil" element={<PerfilPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App