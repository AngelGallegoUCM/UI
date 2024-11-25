<template>
    <h4>Usuario <span class="name">{{ user.firstName }} {{ user.lastName }}</span></h4>

    <table>
        <tbody>
            <tr>
                <th>Rol</th>
                <td>{{ user.userRole }} </td>
            </tr>
            <tr>
                <th>Créditos</th>
                <td>imparte {{ user.assignedCredits }} de {{ user.maxCredits }}</td>
            </tr>
            <tr>
                <th>Grupos a los que da clase</th>
                <td v-if="user.groups.length">
                    {{ user.groups.map(g => formatNiceGroup(g)).join(' ') }}
                </td>
                <td v-else> (ninguno) </td>
            </tr>
        </tbody>
    </table>

    <SortableGrid :data="addSlotCols(slots)" :columns="slotColumns" 
      :filter="{ all: '', fields: [] }" v-model:sorter="sorter" />
    <TimeTable :slots="slots" />

    <h5>Acciones</h5>
    <div class="btn-group">
        <button @click="$emit('editUser')" class="btn btn-outline-success">✏️</button>
        <button @click="$emit('rmUser')" class="btn btn-outline-danger">🗑️</button>
    </div>
</template>

<script setup>
import SortableGrid from './SortableGrid.vue';
import TimeTable from './TimeTable.vue';

import { gState, semesterNames, weekDayNames } from '../state.js';
import { ref, computed } from 'vue'

defineEmits([
  'filterUser',
  'editUser',
  'rmUser',
])

const props = defineProps({
    user: Object // see definition of User in ../model.js
})

let sorter = ref([{key: "weekDay", order: 1}])

const slots = computed(() => slotsOfAllGroups(props.user.groups))

const slotsOfAllGroups = (gg) => {
    const rv = [];
    for (let g of gg.map(o => gState.resolve(o))) {
        for (let s of g.slots.map(s => gState.resolve(s))) {
            rv.push(s);
        }
    }
    return rv;
}

const slotColumns = [
    { key: 'niceGroup', display: 'Grupo', type: 'String' },
    {
        key: 'weekDay', display: 'Día', type: 'Enum',
        values: gState.model.WeekDay,
        displayValues: weekDayNames
    },
    {
        key: 'semester', display: 'Cuatr.', type: 'Enum',
        values: gState.model.Semester,
        displayValues: semesterNames
    },
    { key: 'niceStart', display: 'Inicio', type: 'Time' },
    { key: 'niceEnd', display: 'Final', type: 'Time' },
    { key: 'location', display: 'Lugar', type: 'String' },
]

const addSlotCols = (ss) => {
    for (let s of ss) {
        s.niceGroup = formatNiceGroup(s.groupId)
        s.niceStart = formatTime(s.startTime)
        s.niceEnd = formatTime(s.endTime)
    }
    return ss;
}

// 1450 => "14:50"
const formatTime = t => `${Math.floor(t / 100)}:` + `0${t % 100}`.slice(-2)

const formatNiceGroup = groupId => {
    const group = gState.resolve(groupId);
    const subject = gState.resolve(group.subjectId);
    return `${subject.short}:${group.name}`
}

</script>