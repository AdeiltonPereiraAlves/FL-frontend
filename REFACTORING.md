# Refatoração Profissional do Frontend

## 📋 Visão Geral

Esta refatoração implementa uma arquitetura profissional e escalável para o frontend, com foco em:
- **Separação de responsabilidades**
- **Segurança e validação**
- **Gerenciamento de estado centralizado**
- **Hooks personalizados reutilizáveis**
- **Proteção de rotas baseada em roles**

## 🏗️ Estrutura de Arquitetura

### Contextos

#### `ApiContext` (`contexts/ApiContext.tsx`)
- Centraliza todas as chamadas de API
- Tratamento padronizado de erros
- Sanitização automática de dados
- Interceptors para autenticação

#### `AuthContext` (`contexts/AuthContext.tsx`)
- Gerenciamento de autenticação
- Verificação de roles e permissões
- Métodos: `hasRole`, `hasAnyRole`, `isLojista`, `isAdmin`, `isCliente`

### Hooks Personalizados

#### `useRole` (`hooks/useRole.ts`)
Hook para verificação de roles e permissões:
```typescript
const { isLojista, isAdmin, hasRole, hasAnyRole } = useRole()
```

#### `useCidades` (`hooks/useCidades.ts`)
Hook para gerenciar cidades:
```typescript
const { cidades, isLoading, carregarCidades } = useCidades()
```

#### `useEntidades` (`hooks/useEntidades.ts`)
Hook para gerenciar entidades/lojas:
```typescript
const { entidades, carregarEntidadesPorCidade } = useEntidades()
```

#### `useProdutos` (`hooks/useProdutos.ts`)
Hook para gerenciar produtos:
```typescript
const { produtos, buscarProdutosPorCidade } = useProdutos()
```

### Componentes de Segurança

#### `ProtectedRoute` (`components/auth/ProtectedRoute.tsx`)
Componente para proteger rotas baseado em autenticação e roles:
```typescript
<ProtectedRoute requiredRoles={[TipoPapel.LOJISTA]}>
  <DashboardLojista />
</ProtectedRoute>
```

## 🔐 Sistema de Roles

### Tipos de Papel (Roles)

O sistema suporta os seguintes roles definidos no backend:

- `DONO_SISTEMA` - Acesso total ao sistema
- `ADMIN` - Administrador com permissões elevadas
- `LOJISTA` - Proprietário de loja/entidade
- `CLIENTE` - Cliente comum
- `TRABALHADOR` - Funcionário de uma loja

### Verificação de Roles

#### No Contexto de Autenticação
```typescript
const { isLojista, isAdmin, hasRole } = useAuth()

if (isLojista()) {
  // Mostrar dashboard do lojista
}
```

#### Com Hook Dedicado
```typescript
const { isLojista, hasAnyRole } = useRole()

if (hasAnyRole([TipoPapel.LOJISTA, TipoPapel.ADMIN])) {
  // Acesso permitido
}
```

## 🎯 Header Dinâmico

O `Header` agora mostra opções diferentes baseado no role do usuário:

- **LOJISTA**: Mostra "Minha Loja" → `/lojista/dashboard`
- **ADMIN/DONO_SISTEMA**: Mostra "Painel Admin" → `/admin/dashboard`
- **CLIENTE**: Mostra "Dashboard" → `/dashboard`

### Exemplo de Uso no Header

```typescript
const { isLojista, isAdmin } = useRole()

{isLojista() && (
  <Link href="/lojista/dashboard">Minha Loja</Link>
)}

{isAdmin() && (
  <Link href="/admin">Painel Admin</Link>
)}
```

## 🛡️ Segurança

### Sanitização de Dados

Utilitários em `utils/security.ts`:
- `sanitizeString()` - Remove caracteres perigosos
- `sanitizeEmail()` - Valida e sanitiza emails
- `sanitizeId()` - Valida UUIDs
- `sanitizePhone()` - Valida telefones brasileiros
- `sanitizeUrl()` - Valida URLs seguras
- `sanitizeObject()` - Sanitiza objetos completos

### Interceptors de API

- **Request**: Adiciona token automaticamente e sanitiza dados
- **Response**: Trata erros 401 (não autenticado) e 403 (sem permissão)

## 📝 Exemplo de Uso Completo

### 1. Proteger uma Rota

```typescript
// app/lojista/dashboard/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { TipoPapel } from '@/types/auth'

export default function DashboardLojista() {
  return (
    <ProtectedRoute requiredRoles={[TipoPapel.LOJISTA]}>
      <div>Dashboard do Lojista</div>
    </ProtectedRoute>
  )
}
```

### 2. Usar Hooks Personalizados

```typescript
// components/ProductList.tsx
import { useProdutos } from '@/hooks/useProdutos'

export function ProductList() {
  const { produtos, isLoading, buscarProdutosPorCidade } = useProdutos()

  useEffect(() => {
    buscarProdutosPorCidade({
      cidadeId: '123',
      query: 'arroz',
      page: 1,
      limit: 20,
    })
  }, [])

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      {produtos.map(produto => (
        <div key={produto.id}>{produto.nome}</div>
      ))}
    </div>
  )
}
```

### 3. Verificar Permissões

```typescript
// components/AdminPanel.tsx
import { useRole } from '@/hooks/useRole'
import { TipoPapel } from '@/types/auth'

export function AdminPanel() {
  const { isAdmin, hasRole } = useRole()

  if (!isAdmin()) {
    return <div>Acesso negado</div>
  }

  return (
    <div>
      {hasRole(TipoPapel.DONO_SISTEMA) && (
        <button>Configurações Avançadas</button>
      )}
    </div>
  )
}
```

## 🔄 Migração de Código Existente

### Antes (usando api diretamente)
```typescript
const response = await api.get('/produtos')
const produtos = response.data
```

### Depois (usando hooks)
```typescript
const { produtos, carregarProdutos } = useProdutos()
await carregarProdutos()
```

## 📦 Estrutura de Pastas

```
frontend/
├── contexts/
│   ├── ApiContext.tsx      # Contexto centralizado de API
│   ├── AuthContext.tsx     # Contexto de autenticação com roles
│   ├── CartContext.tsx     # Contexto do carrinho
│   └── ProductContext.tsx  # Contexto de produtos
├── hooks/
│   ├── useRole.ts          # Hook para verificação de roles
│   ├── useCidades.ts       # Hook para cidades
│   ├── useEntidades.ts     # Hook para entidades
│   ├── useProdutos.ts      # Hook para produtos
│   └── useAuth.ts          # Hook de autenticação
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx  # Componente de proteção de rotas
├── utils/
│   └── security.ts         # Utilitários de segurança
└── types/
    └── auth.ts            # Tipos incluindo roles
```

## ✅ Checklist de Implementação

- [x] Contexto de API centralizado
- [x] Hooks personalizados para requisições
- [x] Sistema de roles e permissões
- [x] Header dinâmico baseado em roles
- [x] Proteção de rotas
- [x] Sanitização de dados
- [x] Tratamento de erros padronizado
- [x] Página de acesso negado

## 🚀 Próximos Passos

1. Criar páginas de dashboard específicas por role:
   - `/lojista/dashboard`
   - `/admin/dashboard`
   - `/cliente/dashboard`

2. Implementar middleware de proteção de rotas no Next.js

3. Adicionar testes unitários para hooks e utilitários

4. Implementar cache de requisições para melhor performance
