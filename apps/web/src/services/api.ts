import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 错误，当前路径:', window.location.pathname)
      // 检查是否已经在登录页面
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token')
        // 使用 replace 避免历史记录问题
        window.location.replace('/login')
      }
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

export default api
