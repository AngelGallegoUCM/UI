<template>
  <h4>Espacio <span class="name">{{ location }}</span> en {{ semester }}</h4>

  <SortableGrid :data="addSlotCols(slots)" :columns="slotColumns" 
    :filter="{ all: '', fields: [] }" v-model:sorter="sorter" />

  <TimeTable :slots="slots" />

</template>

<script setup>
import SortableGrid from './SortableGrid.vue';
import TimeTable from './TimeTable.vue';

import { gState, weekDayNames } from '../state.js';

import { ref, computed } from 'vue'

const props = defineProps({
  location: String, // a Location
  semester: String  // a semester
})

let sorter = ref([{key: "weekDay", order: 1}])
const slots = computed(() =>
  gState.model.getSlots({ location: props.location, semester: props.semester })
)

const slotColumns = [
  { key: 'niceGroup', display: 'Grupo', type: 'String' },
  {
    key: 'weekDay', display: 'Día', type: 'Enum',
    values: gState.model.WeekDay,
    displayValues: weekDayNames
  },
  { key: 'niceStart', display: 'Inicio', type: 'Time' },
  { key: 'niceEnd', display: 'Final', type: 'Time' },
  { key: 'niceTeacher', display: 'Profesor', type: 'String' }
]

const formatNiceGroup = group => {
  const subject = gState.resolve(group.subjectId);
  return `${subject.short}:${group.name}`
}

const addSlotCols = (ss) => {
  for (let s of ss) {
    const g = gState.resolve(s.groupId)
    s.niceGroup = formatNiceGroup(g)
    s.niceStart = formatTime(s.startTime)
    s.niceEnd = formatTime(s.endTime)
    s.niceTeacher = g.teacherId >= 0 ? gState.resolve(g.teacherId).userName : ''
  }
  return ss;
}

// 1450 => 14:50
const formatTime = t => `${Math.floor(t / 100)}:` + `0${t % 100}`.slice(-2)

</script>