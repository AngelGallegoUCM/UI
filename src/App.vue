<template>
  <PmState 
    :state="gState.model" 
    :key="gState.key" />
</template>

<script setup>
  import PmState from './components/PmState.vue'
  import { gState } from './state.js'

  // da acceso al modelo desde la consola - M.model = modelo
  window.M = gState
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
