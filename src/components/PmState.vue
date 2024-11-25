<template>

  <!-- Navbar principal -->
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">PlanDoc</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a href="#" aria-current="page"
              :class="`nav-link active ${gState.currentListing == 'users' ? 'boxed' : ''}`"
              @click="gState.currentListing = 'users'">Usuarios</a>
          </li>
          <li class="nav-item">
            <a href="#" aria-current="page"
              :class="`nav-link active ${gState.currentListing == 'subjects' ? 'boxed' : ''}`"
              @click="gState.currentListing = 'subjects'">Asignaturas</a>
          </li>
          <li class="nav-item">
            <a href="#" aria-current="page"
              :class="`nav-link active ${gState.currentListing == 'groups' ? 'boxed' : ''}`"
              @click="gState.currentListing = 'groups'">Grupos</a>
          </li>
          <li class="nav-item">
            <a href="#" aria-current="page"
              :class="`nav-link active ${gState.currentListing == 'locations' ? 'boxed' : ''}`"
              @click="gState.currentListing = 'locations'">Espacios</a>
          </li>
        </ul>
        <div class="nav-item ms-auto">
          <div class="btn-group">
            <button id="save" class="btn btn-outline-secondary">💾</button>
            <button id="clean" class="btn btn-outline-secondary">🧽</button>
            <button id="restore" class="btn btn-outline-secondary">↩️</button>
          </div>
        </div>
      </div>
    </div>
  </nav>


  <!-- 
    Div principal; container-fluid expande el contenedor para que ocupe todo el espacio disponible 
  -->
  <div class="container-fluid">
    <div class="row">
      <!-- columna izquierda (opcional): listado de usuarios -->
      <div v-if="gState.currentListing == 'users'" id="div-users" class="col-md">
        <div>
          <h5 class="d-inline">Usuarios
          </h5>
          <a class="d-inline d-sm-none details" href="#div-details">↘️</a>
        </div>
        <span v-if="debug"> {{ gState.searchUserQuery }}</span>
        <FilterOrAddBox v-model:filter="gState.searchUserQuery" :columns="userColumns" @add-element="editUser(-1)"
          addBtnTitle="Añadir nuevo usuario" />
        <div class="overflow-y-scroll vh-100">
          <SortableGrid :data="users" :columns="userColumns" :filter="gState.searchUserQuery"
            v-model:sorter="gState.userSorter" @selectOne="(e) => selectOne('user', e)" />
        </div>
      </div>
      <!-- columna izquierda (opcional): listado de asignaturas -->
      <div v-if="gState.currentListing == 'subjects'" id="div-subjects" class="col-md">
        <div>
          <h5 class="d-inline">Asignaturas
          </h5>
          <a class="d-inline d-sm-none details" href="#div-details">↘️</a>
        </div>
        <span v-if="debug"> {{ gState.searchSubjectQuery }}</span>
        <FilterOrAddBox v-model:filter="gState.searchSubjectQuery" :columns="subjectColumns" @add-element="editSubject(-1)"
          addBtnTitle="Añadir nueva asignatura" />
        <div class="overflow-y-scroll vh-100">
          <SortableGrid :data="subjects" :columns="subjectColumns" :filter="gState.searchSubjectQuery"
            v-model:sorter="gState.subjectSorter" @selectOne="(e) => selectOne('subject', e)" />
        </div>
      </div>
      <!-- columna izquierda (opcional): listado de grupos -->
      <div v-if="gState.currentListing == 'groups'" id="div-groups" class="col-md">
        <div>
          <h5 class="d-inline">Grupos
          </h5>
          <a class="d-inline d-sm-none details" href="#div-details">↘️</a>
        </div>
        <span v-if="debug"> {{ gState.searchGroupQuery }}</span>
        <FilterOrAddBox v-model:filter="gState.searchGroupQuery" :columns="groupColumns" @add-element="editGroup(-1)"
          addBtnTitle="Añadir nuevo grupo" />
        <div class="overflow-y-scroll vh-100">
          <SortableGrid :data="groups" :columns="groupColumns" :filter="gState.searchGroupQuery"
            v-model:sorter="gState.groupSorter" @selectOne="(e) => selectOne('group', e)" />
        </div>
      </div>
      <!-- columna izquierda (opcional): vista de espacios -->
      <div v-if="gState.currentListing == 'locations'" id="div-locations" class="col-md">
        <div>
          <h5 class="d-inline">Espacios
          </h5>
          <a class="d-inline d-sm-none details" href="#div-details">↘️</a>
        </div>
        <span v-if="debug"> {{ gState.searchLocationQuery }}</span>
        <FilterOrAddBox v-model:filter="gState.searchLocationQuery" :columns="locationColumns" addBtnTitle="" />
        <div class="overflow-y-scroll vh-100">
          <SortableGrid :data="locations" :columns="locationColumns" :filter="gState.searchLocationQuery"
            v-model:sorter="gState.locationSorter" @selectOne="(e) => selectOne('location', e)" />
        </div>
      </div>

      <!-- columna derecha: detalles de elemento seleccionado -->
      <div id="div-details" class="col-md">
        <div>
          <a class="d-inline d-sm-none escape" href="#">⬆️</a>
          <h5 class="d-inline">Detalles</h5>
        </div>
        <div id="details" class="container">
          <DetailsPane :element="selected" @editUser="editUser(selected.id)" @rmUser="rmUser(selected.id)"
            @editSubject="editSubject(selected.id)" @rmSubject="rmSubject(selected.id)"
            @editGroup="editGroup(selected.id)" @rmGroup="rmGroup(selected.id)" />
        </div>
      </div>
    </div>
  </div>

  <!-- 
    Modal para crear/editar usuario
    siempre usamos el mismo, y no se muestra hasta que hace falta
  -->
  <UserModal ref="userModalRef" :key="userToAddOrEdit.id" :user="userToAddOrEdit" :isAdd="userToAddOrEdit.id == -1"
    @add="(o) => { console.log('adding', o); gState.model.addUser(o); gState.key++ }"
    @edit="(o) => { console.log('setting', o); gState.model.setUser(o); gState.key++ }" />
  <!-- 
    Modal para crear/editar asignatura
    siempre usamos el mismo, y no se muestra hasta que hace falta
  -->
  <SubjectModal ref="subjectModalRef" :key="subjectToAddOrEdit.id" :subject="subjectToAddOrEdit"
    :isAdd="subjectToAddOrEdit.id == -1"
    @add="(o) => { console.log('adding', o); gState.model.addSubject(o); gState.key++ }"
    @edit="(o) => { console.log('setting', o); gState.model.setSubject(o); gState.key++ }" />
  <!-- 
    Modal para crear/editar grupo
    siempre usamos el mismo, y no se muestra hasta que hace falta
  -->
  <GroupModal ref="groupModalRef" :key="groupToAddOrEdit.id" :group="groupToAddOrEdit"
    :isAdd="groupToAddOrEdit.id == -1"
    @add="(o) => { console.log('adding', o); gState.model.addGroup(o); gState.key++ }"
    @edit="(o) => { console.log('setting', o); gState.model.setGroup(o); gState.key++ }" />
</template>

<script setup>
import FilterOrAddBox from './FilterOrAddBox.vue';
import SortableGrid from './SortableGrid.vue';
import DetailsPane from './DetailsPane.vue';
import UserModal from './UserModal.vue';
import SubjectModal from './SubjectModal.vue';
import GroupModal from './GroupModal.vue';

import { ref, computed, onMounted, nextTick } from 'vue';
import { gState, semesterNames } from '../state.js';
import * as bootstrap from 'bootstrap'
import * as U from '../util.js'

// tooltips html para elementos con data-bs-toggle="tooltip"]
onMounted(() => {
  // see https://getbootstrap.com/docs/5.3/components/tooltips/#overview
  [...document.querySelectorAll('[data-bs-toggle="tooltip"]')]
    .map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
})

const props = defineProps(['state'])

const debug = false;

// para vista de usuarios; ver doc. en SortableGrid
const userColumns = [
  { key: 'userName', display: 'Login', type: 'String' },
  { key: 'firstName', display: 'First name', type: 'String' },
  { key: 'lastName', display: 'Last name', type: 'String' },
  { key: 'maxCredits', display: 'Totales', type: 'Number' },
  { key: 'assignedCredits', display: 'Imparte', type: 'Number' },
  { 
    key: 'groups', display: 'Grupos', type: 'ObjectIds',
    title: (o, key, v) => {
      const subject = gState.resolve(v.subjectId)
      return `
        ${subject.semester} ${v.credits} créditos - 
        ${subject.name} (${subject.short}) - ${subject.degree}`
    }
  }
]

// para vista de asignaturas; ver doc. en SortableGrid
const subjectColumns = [
  { key: 'name', display: 'Nombre', type: 'String' },
  { key: 'short', display: 'Acr.', type: 'String' },
  { key: 'degree', display: 'Título', type: 'String' },
  { key: 'credits', display: 'Cr.', type: 'Number' },
  {
    key: 'semester', display: 'Semestre', type: 'Enum',
    values: gState.model.Semester,
    displayValues: semesterNames
  },
  { key: 'groups', display: 'Grupos', type: 'ObjectIds' },
]

// añade columnas adicionales a un array de grupos para la vista de grupos
const addGroupCols = (gg) => {
  for (let g of gg) {
    const subject = gState.resolve(g.subjectId);
    g.niceName = `${subject.short}:${g.name}`
    g.niceSemester = subject.semester;
    g.niceSlots = slotsToShort(g.slots.map((s) => gState.resolve(s)))
    g.niceTeacher = g.teacherId >= 0 ? gState.resolve(g.teacherId).userName : ''
  }
  return gg;
}

// hace un resumen de los horarios de un grupo
const slotsToShort = (ss) => {
  let rv = [];
  const ShortDay = {
    MON: 'L',
    TUE: 'M',
    WED: 'X',
    THU: 'J',
    FRI: 'V'
  };
  for (let s of ss) {
    rv.push(`${ShortDay[s.weekDay]}${s.startTime / 100}-${Math.floor(s.endTime / 100)} ${s.location}`
      .replaceAll('Aula ', 'A')
      .replaceAll('Lab. ', 'L'))
  }

  // pasa de "L9-10 X9-10" a "LX9-10"
  return rv.join(', ')
    .replaceAll(/([LMXJV][0-9]+-[0-9]+ )([^,]+), \1/g, '$1$2/')
}

const groupColumns = [
  { key: 'niceName', display: 'Nombre', type: 'String' },
  {
    key: 'niceSemester', display: 'Cuatrimestre', type: 'Enum',
    values: gState.model.Semester,
    displayValues: semesterNames
  },
  { key: 'credits', display: 'Créditos', type: 'Number' },
  { key: 'niceSlots', display: 'Horarios', type: 'String' },
  { key: 'niceTeacher', display: 'Profesor', type: 'String' }
]

const locationColumns = [
  { key: 'niceName', display: 'Espacio', type: 'String' },
  {
    key: 'niceSemester', display: 'Cuatrimestre', type: 'Enum',
    values: gState.model.Semester,
    displayValues: semesterNames
  },
  { key: 'niceSlots', display: 'Ocupación', type: 'Number' },
]

const addLocationCols = (ss) => {
  const locations = new Map()
  for (let s of ss) {
    if (!locations.has(s.location)) {
      locations.set(s.location, [])
    }
    locations.get(s.location).push(s)
  }
  const rv = [];
  for (let [k, v] of locations.entries()) {
    for (let semester of Object.keys(gState.model.Semester)) {
      rv.push({
        id: `${k}_${semester}`, niceName: k, niceSemester: semester,
        niceSlots: v.filter(o => o.semester == semester, v).length
      })
    }
  }
  return rv;
}

const users = computed(() => props.state.getUsers())
const subjects = computed(() => props.state.getSubjects())
const groups = computed(() => addGroupCols(props.state.getGroups()))
const locations = computed(() => addLocationCols(props.state.getSlots()))

const selected = ref({ id: -1 })

const selectOne = (type, id) => {
  const element = (typeof id == 'string') ?
    locations.value.find(o => o.id == id) :
    gState.resolve(id)
  console.log(`selected ${type} ${id}`, element)
  selected.value = element
}

/////
// Usuarios
/////

// modal para añadir/editar
let userModalRef = ref(null);

const randomUser = () => gState.model.Util.randomUser(-1, new Map())
let userToAddOrEdit = ref(randomUser());

// usamos id=-1 para crear
async function editUser(id) {
  console.log("now editing", id)
  userToAddOrEdit.value = (id == -1) ?
    userToAddOrEdit.value = randomUser() :
    userToAddOrEdit.value = gState.resolve(id);
  // da tiempo a Vue para que prepare el componente antes de mostrarlo
  await nextTick()
  userModalRef.value.show()
}

function rmUser(id) {
  gState.model.rmUser(id)
  if (selected.value.id == id) {
    selected.value = { id: -1 };
  }
  gState.key++
}

/////
// Asignaturas
/////

// modal para añadir/editar
let subjectModalRef = ref(null);

const randomSubject = () => gState.model.Util.randomSubject(-1, new Map())
let subjectToAddOrEdit = ref(randomUser());

// usamos id=-1 para crear
async function editSubject(id) {
  console.log("now editing", id)
  subjectToAddOrEdit.value = (id == -1) ?
    subjectToAddOrEdit.value = randomSubject() :
    subjectToAddOrEdit.value = gState.resolve(id);
  // da tiempo a Vue para que prepare el componente antes de mostrarlo
  await nextTick()
  subjectModalRef.value.show()
}

function rmSubject(id) {
  if (selected.value.id == id) {
    selected.value = { id: -1 };
  }  
  gState.model.rmSubject(id)
  gState.key++
}


/////
// Grupos
/////

// modal para añadir/editar
let groupModalRef = ref(null);

const randomGroup = () => new gState.model.Group(
  -1, "X", U.randomChoice(gState.model.getSubjects().map(o => o.id)), 3, false);
let groupToAddOrEdit = ref(randomGroup());

// usamos id=-1 para crear
async function editGroup(id) {
  console.log("now editing", id)
  groupToAddOrEdit.value = (id == -1) ?
    groupToAddOrEdit.value = randomGroup() :
    groupToAddOrEdit.value = gState.resolve(id);
  // da tiempo a Vue para que prepare el componente antes de mostrarlo
  await nextTick()
  groupModalRef.value.show()
}

function rmGroup(id) {
  gState.model.rmGroup(id)
  if (selected.value.id == id) {
    selected.value = { id: -1 };
  }
  gState.key++
}

</script>

<style>
.navbar {
  background-color: #faffbb;
  border-bottom: 2px solid black;
  margin-bottom: 5px
}

.escape {
  font-size: 120%;
  padding-right: 1em;
}

.boxed {
  font-weight: bold;
}

@media(min-width: 995px) {
  .boxed {
    position: relative;
    bottom: -10px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    border-top: 2px solid black;
    border-left: 2px solid black;
    border-right: 2px solid black;
    border-bottom: 2px solid #faffbb;
  }
}

.details {
  font-size: 150%;
  padding-left: 1em;
}

span.filter>.name {
  font-weight: 1000;
}

span.filter {
  border-bottom: 2px dashed gray;
}

span.filter:hover {
  border-bottom: 2px dashed blue;
}
</style>