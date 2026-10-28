import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { RequireArea } from './auth/RequireArea'
import { AdminLayout, CatadorLayout } from './layouts/AppLayouts'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { MaisPage } from './pages/admin/MaisPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Coordenador e Administrador */}
          <Route element={<RequireArea area="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<PlaceholderPage title="Home" />} />
              <Route path="dashboard" element={<PlaceholderPage title="Dashboard" />} />
              <Route path="composicao" element={<PlaceholderPage title="Composição" />} />
              <Route path="configuracoes" element={<PlaceholderPage title="Configurações" />} />
              <Route
                path="configuracoes/:categoriaId"
                element={<PlaceholderPage title="Detalhe da categoria" />}
              />
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
              <Route index element={<PlaceholderPage title="Home" />} />
              <Route path="historico" element={<PlaceholderPage title="Histórico" />} />
              <Route path="desempenho" element={<PlaceholderPage title="Desempenho" />} />
              <Route path="dispositivos" element={<PlaceholderPage title="Dispositivos" />} />
              <Route path="perfil" element={<PlaceholderPage title="Perfil" />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App