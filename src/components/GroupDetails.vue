<template>
  <h4>Grupo <span class="name">{{ group.niceName }}</span></h4>
  <table>
    <tbody>
      <tr>
        <th>Asignatura</th>
        <td>{{ subject.name }}</td>
      </tr>
      <tr>
        <th>Créditos</th>
        <td>{{ group.credits }}</td>
      </tr>
      <tr>
        <th>Cuatrimestre</th>
        <td v-if="subject.semester === 'FALL'">Otoño</td>
        <td v-else>Primavera</td>
      </tr>
      <tr>
        <th>Profesor</th>
        <td v-if="teacher">
          {{ teacher.userName }} ({{ teacher.firstName }} {{ teacher.lastName}})
        </td>
        <td v-else> (Ninguno) </td>
      </tr>
    </tbody>
  </table>

  <h3>Horario</h3>
  <SortableGrid :data="addSlotCols(slots)" :columns="slotColumns" 
    :filter="{ all: '', fields: [] }" v-model:sorter="sorter" />
  <TimeTable :slots="slots" />

  <h5>Acciones</h5>
  <div class="btn-group">
    <button @click="$emit('editGroup')" class="btn btn-outline-success" title="Editar grupo">✏️</button>
    <button @click="$emit('rmGroup')" class="btn btn-outline-danger"  title="Eliminar grupo">🗑️</button>
  </div>
</template>

<script setup>
import SortableGrid from './SortableGrid.vue';
import TimeTable from './TimeTable.vue';

import { gState, weekDayNames } from '../state.js';
import { ref, computed } from 'vue'

defineEmits([
  'editGroup',
  'rmGroup',
])

const props = defineProps({
  group: Object // see definition of Group in ../model.js
})

const subject = computed(() => gState.resolve(props.group.subjectId))
const teacher = computed(() => props.group.teacherId ? gState.resolve(props.group.teacherId) : '')

let sorter = ref([{key: "weekDay", order: 1}])
const slots = computed(() => props.group.slots.map(s => gState.resolve(s)))

const slotColumns = [
    { key: 'location', display: 'Lugar', type: 'String' },
    {
        key: 'weekDay', display: 'Día', type: 'Enum',
        values: gState.model.WeekDay,
        displayValues: weekDayNames
    },
    { key: 'niceStart', display: 'Inicio', type: 'String' },
    { key: 'niceEnd', display: 'Final', type: 'String' },
]

const addSlotCols = (ss) => {
    for (let s of ss) {
        s.niceStart = formatTime(s.startTime)
        s.niceEnd = formatTime(s.endTime)
        s.niceTeacher = s.teacherId >= 0 ? gState.resolve(s.teacherId).userName : ''
    }
    return ss;
}

// 1450 => 14:50
const formatTime = t => `${Math.floor(t / 100)}:` + `0${t % 100}`.slice(-2)

</script>

<style scoped>
.dayOfWeek {
  display: inline-block;
  width: 4em;
}

h4{ /* Cabecera con el grupo */
  margin-top: 30px;
  margin-bottom: 10px;
}

h5 { /* Cabecera con las accciones */
  margin-top: 30px;
  margin-bottom: 10px;
}

/* Añadir espacio antes y después de los títulos */
h3 {
  margin-top: 20px;
}

.slot {
  display: block;
}
</style>