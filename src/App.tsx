import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { RequireArea } from './auth/RequireArea'
import { CatadorLayout, GestaoLayout, PlataformaLayout } from './layouts/AppLayouts'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { MaisPage } from './pages/gestao/MaisPage'
import { DesempenhoPage } from './pages/catador/DesempenhoPage'
import { DispositivosPage } from './pages/catador/DispositivosPage'
import { HistoricoPage } from './pages/catador/HistoricoPage'
import { HomePage } from './pages/catador/HomePage'
import { PerfilPage } from './pages/catador/PerfilPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

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
            <Route path="/gestao" element={<GestaoLayout />}>
              <Route index element={<PlaceholderPage title="Home" />} />
              <Route path="dashboard" element={<PlaceholderPage title="Dashboard" />} />
              <Route path="composicao" element={<PlaceholderPage title="Composição" />} />
              <Route path="configuracoes" element={<PlaceholderPage title="Configurações" />} />
              <Route
                path="configuracoes/:categoriaId"
                element={<PlaceholderPage title="Detalhe da categoria" />}
              />
              <Route path="equipe" element={<PlaceholderPage title="Desempenho da equipe" />} />
              <Route path="equipe/:catadorId" element={<PlaceholderPage title="Detalhe do catador" />} />
              <Route path="relatorios" element={<PlaceholderPage title="Relatórios" />} />
              <Route path="dispositivos" element={<PlaceholderPage title="Dispositivos" />} />
              <Route path="correcoes" element={<PlaceholderPage title="Correções" />} />
              <Route path="usuarios" element={<PlaceholderPage title="Usuários" />} />
              <Route path="perfil" element={<PlaceholderPage title="Perfil" />} />
              <Route path="mais" element={<MaisPage />} />
            </Route>
          </Route>

          {/* Catador */}
          <Route element={<RequireArea area="catador" />}>
            <Route path="/catador" element={<CatadorLayout />}>
              <Route index element={<HomePage />} />
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