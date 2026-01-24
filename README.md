# 🛒 FeiraLivre - Frontend

Frontend desenvolvido em Next.js e React para a plataforma FeiraLivre, que conecta comerciantes locais e clientes.

## 🚀 Tecnologias

- **Framework**: Next.js 16
- **Linguagem**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Componentes**: Radix UI
- **Mapas**: Leaflet / React Leaflet
- **Autenticação**: Google OAuth
- **HTTP Client**: Axios
- **Formulários**: React Hook Form + Zod

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- Backend da FeiraLivre rodando (veja o [repositório do backend](https://github.com/seu-usuario/feiralivre))
- Credenciais do Google OAuth (opcional, para login com Google)

## ⚙️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/frontend.git
cd frontend
```

### 2. Instale as dependências

```bash
npm install
# ou se usar pnpm
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# URL da API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Google OAuth Client ID (para autenticação)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-google-client-id.apps.googleusercontent.com
```

### 4. Execute o servidor de desenvolvimento

```bash
npm run dev
# ou
pnpm dev
```

O frontend estará rodando em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
frontend/
├── app/                    # App Router do Next.js
│   ├── (auth)/            # Rotas de autenticação
│   ├── (private)/         # Rotas privadas
│   ├── (public)/          # Rotas públicas
│   ├── globals.css        # Estilos globais
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── carrinho/         # Componentes do carrinho
│   ├── loja/             # Componentes de loja
│   ├── mapa/             # Componentes de mapa
│   ├── produto/          # Componentes de produto
│   └── ui/               # Componentes UI (shadcn/ui)
├── contexts/             # Contextos React
│   ├── AuthContext.tsx   # Contexto de autenticação
│   ├── CartContext.tsx   # Contexto do carrinho
│   └── ProductContext.tsx # Contexto de produtos
├── hooks/                # Custom hooks
├── services/             # Serviços (API, etc)
├── types/                # Tipos TypeScript
└── lib/                  # Utilitários
```

## 🎨 Funcionalidades

- ✅ Autenticação (Login/Registro com email e Google OAuth)
- ✅ Busca de produtos e lojas
- ✅ Mapa interativo com localização de lojas
- ✅ Carrinho de compras
- ✅ Perfil de usuário
- ✅ Tema claro/escuro (Next Themes)

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Linting
npm run lint
```

## 🔗 Repositório do Backend

O backend está em um repositório separado: [feiralivre](https://github.com/seu-usuario/feiralivre)

## 🔑 Como obter as credenciais

### Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá em "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth client ID"
5. Configure como "Web application"
6. Adicione `http://localhost:3000` nas URLs autorizadas
7. Copie o Client ID gerado

## 🎯 Próximos Passos

Após configurar tudo:

1. Certifique-se de que o backend está rodando em `http://localhost:3001`
2. Configure as variáveis de ambiente
3. Execute `npm run dev`
4. Acesse `http://localhost:3000`

## 👥 Desenvolvedores

- **Adeilton Pereira Alves** - [GitHub](https://github.com/AdeiltonPereiraAlves)
- **Filipe Lira de Oliveira**

## 📝 Licença

ISC
