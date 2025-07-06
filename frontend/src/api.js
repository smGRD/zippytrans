// 📁 frontend/src/api.js
import axios from 'axios'

const api = axios.create({
  baseURL:  "https://zippytrans.onrender.com" ,
})

export default api
