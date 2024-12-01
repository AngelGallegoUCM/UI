<template>
  <div class="row g-1">
    <div class="col-3 text-end">
      <label :for="id" class="form-label">{{ label }}</label>
    </div>
    <div class="col-9 text-start">
      <div v-for="subject in current" :key="subject.id" class="caja">
        <select :id="`${id}-${subject.id}`" :name="`${id}-${subject.id}`" @input="setSubject(subject)">
          <option v-for="s in availableSubjects" :key="s.id" :value="s.id"
            :selected="subject.id == s.id ? 'selected' : null">
            {{ s.name }}
          </option>
        </select>
        <button type="button" @click="rm(subject)">🗑️</button>
      </div>
      <button type="button" @click="add">➕</button>
      <input type="hidden" :name="id" :id="id" :value="read">
    </div>
  </div>
</template>

<script setup>
import { gState } from '../state.js'

import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  label: String,
  id: String,
  start: Array,
  availableSubjects: Array, // Array de asignaturas disponibles para seleccionar
})

const current = ref([])

let lastId = -1;

onMounted(() => {
  current.value = props.start.map(id => gState.resolve(id));
})

function setSubject(subject) {
  const selectedSubjectId = document.getElementById(`${props.id}-${subject.id}`).value;
  subject.id = selectedSubjectId;
  subject.name = props.availableSubjects.find(s => s.id == selectedSubjectId).name;
}

function add() {
  // negative ids to be able to create the subjects later
  current.value.push({
      id: --lastId,
      name: "???",
  });
}

function rm(subject) {
  current.value.splice(current.value.findIndex(o => o.id == subject.id), 1);
}

const read = computed(() => {
  return JSON.stringify(current.value);
})

</script>

<style scoped>
.exists {
  background-color: lightblue;
}

.caja {
  display: inline-block;
  padding: 2px;
}
</style>
