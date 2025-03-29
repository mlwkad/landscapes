import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLoginStore = defineStore('login', () => {
  const token = ref('')
  function storeToken(token: string) {
    this.token = token
    localStorage.setItem('token', token)
  }
  return { token, storeToken }
})
