export interface User {
  id: string
  email: string
  name: string
  avatar?: string
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
}

export interface ApiError {
  message: string
  status?: number
}
