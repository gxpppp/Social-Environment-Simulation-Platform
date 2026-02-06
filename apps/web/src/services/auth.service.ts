import api from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export const authApi = {
  // 登录
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post('/auth/login', data),

  // 注册
  register: (data: RegisterRequest): Promise<LoginResponse> =>
    api.post('/auth/register', data),
}
