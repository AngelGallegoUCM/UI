<template>
    <h4>Usuario <span class="name">{{ user.firstName }} {{ user.lastName }}</span></h4>

    <table>
        <tbody>
            <tr>
                <th>Rol</th>
                <td v-if="user.userRole === 'teacher'">Profesor</td>
                <td v-else>Administrador</td>
            </tr>
            <tr>
                <th>Créditos</th>
                <td>Imparte {{ user.assignedCredits }} de {{ user.maxCredits }}</td>
            </tr>
            <tr>
                <th>Grupos a los que da clase</th>
                <td v-if="user.groups.length">
                   <!--{{ user.groups.map(g => formatNiceGroup(g)).join(' ') }}      he cambiado este por un for-->
                    <span 
                        v-for="group in user.groups" 
                        :key="group"
                        class="badge me-1"
                        :style="{ backgroundColor: ' #1f76aa ', color: 'white' }">
                        {{ formatNiceGroup(group) }}
                    </span>
                </td>
                <td v-else>(Ninguno)</td>
            </tr>
        </tbody>
    </table>

    
   <!-- Botón para alternar entre los cuatrimestres -->
   <div class="mb-3">
        <button 
            class="btn btn-primary" 
            @click="toggleSemester">
            Mostrar Horario {{ isFallSemester ? '2º Cuatrimestre' : '1º Cuatrimestre' }}
        </button>
    </div>

    <!-- Mostrar horario del primer cuatrimestre si el switch está activado -->
    <div v-if="isFallSemester">
        <h3>Horario 1º Cuatrimestre</h3>
        <SortableGrid :data="addSlotCols(FallSlots)" :columns="slotColumns" 
          :filter="{ all: '', fields: [] }" v-model:sorter="sorter" />
        <TimeTable :slots="FallSlots" />
    </div>

    <!-- Mostrar horario del segundo cuatrimestre si el switch está desactivado -->
    <div v-else>
        <h3>Horario 2º Cuatrimestre</h3>
        <SortableGrid :data="addSlotCols(SpringSlots)" :columns="slotColumns" 
          :filter="{ all: '', fields: [] }" v-model:sorter="sorter" />
        <TimeTable :slots="SpringSlots" />
    </div>

    <h5>Acciones</h5>
    <div class="btn-group">
        <button @click="$emit('editUser')" class="btn btn-outline-success" title="Editar usuario">✏️</button>
        <button @click="$emit('rmUser')" class="btn btn-outline-danger" title="Eliminar usuario">🗑️</button>
    </div>
</template>

<script setup>
import SortableGrid from './SortableGrid.vue';
import TimeTable from './TimeTable.vue';

import { computed, ref } from 'vue';
import { gState, semesterNames, weekDayNames } from '../state.js';

defineEmits([
  'filterUser',
  'editUser',
  'rmUser'
]);

const props = defineProps({
    user: Object // see definition of User in ../model.js
});

// Definir la propiedad para controlar el switch de los cuatrimestres
let isFallSemester = ref(true);  // Por defecto, mostramos el primer cuatrimestre

let sorter = ref([{ key: "weekDay", order: 1 }]);

const slots = computed(() => slotsOfAllGroups(props.user.groups));

const FallSlots = computed(() => {
    return slots.value.filter(slot => slot.semester === 'FALL');
});

const SpringSlots = computed(() => {
    return slots.value.filter(slot => slot.semester === 'SPRING');
});

const slotsOfAllGroups = (gg) => {
    const rv = [];
    for (let g of gg.map(o => gState.resolve(o))) {
        for (let s of g.slots.map(s => gState.resolve(s))) {
            rv.push(s);
        }
    }
    return rv;
};

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
    { key: 'location', display: 'Lugar', type: 'String' }
];

// Función para alternar entre los cuatrimestres
const toggleSemester = () => {
    isFallSemester.value = !isFallSemester.value;
};

const addSlotCols = (ss) => {
    for (let s of ss) {
        s.niceGroup = formatNiceGroup(s.groupId);
        s.niceStart = formatTime(s.startTime);
        s.niceEnd = formatTime(s.endTime);
    }
    return ss;
};

// 1450 => "14:50"
const formatTime = t => `${Math.floor(t / 100)}:` + `0${t % 100}`.slice(-2);

const formatNiceGroup = groupId => {
    const group = gState.resolve(groupId);
    const subject = gState.resolve(group.subjectId);
    return `${subject.short}:${group.name}`;
};
</script>

<style scoped>

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

</style>
