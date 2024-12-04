<template>
    <div class="row g-1">
      <!-- Primer combobox: Prefijos -->
      <div class="col-3 text-end">
        <label for="prefix-combobox" class="form-label">Seleccionar Prefijo</label>
      </div>
      <div class="col-9 text-start">
        <select id="prefix-combobox" v-model="selectedPrefix" class="form-select">
          <option v-for="prefix in sortedPrefixes" :key="prefix" :value="prefix">
            {{ prefix }}
          </option>
        </select>
      </div>
  
      <!-- Segundo combobox: Grupos filtrados -->
      <div class="col-3 text-end mt-3">
        <label for="group-combobox" class="form-label">Seleccionar Grupo</label>
      </div>
      <div class="col-9 text-start mt-3">
        <select id="group-combobox" v-model="selectedGroup" class="form-select">
          <option v-for="group in filteredGroupNames" :key="group" :value="group">
            {{ group }}
          </option>
        </select>
      </div>
  
      <!-- Campo oculto con los grupos seleccionados -->
      <input type="hidden" :name="id" :value="read" />
    </div>
  </template>
  
  <script setup>
  import { computed, onMounted, ref } from "vue";
  
  const props = defineProps({
    label: String,
    id: String,
    start: Array, // Grupos seleccionados inicialmente
    all: Array, // Todos los grupos posibles
  });
  
  const selectedPrefix = ref(""); // Prefijo seleccionado
  const selectedGroup = ref(""); // Grupo seleccionado del segundo combobox
  const possible = ref([]); // Todos los grupos posibles
  const prefixes = ref([]); // Lista de prefijos únicos
  
  onMounted(() => {
    // Inicializa los grupos posibles
    possible.value = props.all.map(group => ({
      id: group.id,
      name: group.name,
    }));
  
    // Extrae los prefijos únicos de los nombres de grupo
    prefixes.value = [...new Set(possible.value.map(group => group.name.split(":")[0]))];
  
    // Selecciona el primer prefijo por defecto
    selectedPrefix.value = prefixes.value[0] || "";
  
    console.log("Posibles grupos:", possible.value);
    console.log("Prefijos únicos:", prefixes.value);
  });
  
  // Prefijos ordenados alfabéticamente
  const sortedPrefixes = computed(() => {
    return prefixes.value.slice().sort((a, b) => a.localeCompare(b));
  });
  
  // Grupos filtrados y solo muestran la parte después del `:`
  const filteredGroupNames = computed(() => {
    return possible.value
      .filter(group => group.name.startsWith(selectedPrefix.value))
      .map(group => group.name.split(":")[1])
      .slice()
      .sort((a, b) => a.localeCompare(b));
  });
  
  // Convierte los grupos seleccionados a JSON para enviar en el formulario
  const read = computed(() => {
    return JSON.stringify(filteredGroupNames.value);
  });
  </script>
  
  <style scoped>
  .form-select {
    margin-bottom: 1rem;
  }
  </style>
  