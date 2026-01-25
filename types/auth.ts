export enum TipoPapel {
  DONO_SISTEMA = 'DONO_SISTEMA',
  ADMIN = 'ADMIN',
  LOJISTA = 'LOJISTA',
  CLIENTE = 'CLIENTE',
  TRABALHADOR = 'TRABALHADOR',
}

export interface PapelUsuario {
  id: string
  tipo: TipoPapel
  usuarioId: string
}

export interface User {
  id: string
  email: string
  name: string
  nome?: string // Compatibilidade com backend
  avatar?: string
  fotoUrl?: string
  papeis?: PapelUsuario[]
  cidadeId?: string
  endereco?: string
  bairro?: string
  cep?: string
  contato?: string
}
export type GoogleLoginPayload = {
  credential: string // idToken do Google
}
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  senha: string
}
export interface CadastroCredentials {
  nome:string
  email: string
  senha: string
  endereco?: string
  bairro?:  string
  cep?: string

}


export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<any>
  logout: () => void
  cadastro: (credentials: CadastroCredentials)=> Promise<any>
  hasRole: (role: TipoPapel) => boolean
  hasAnyRole: (roles: TipoPapel[]) => boolean
  isLojista: () => boolean
  isAdmin: () => boolean
  isCliente: () => boolean
}

export interface ApiError {
  message: string
  status?: number
}
