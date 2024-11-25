<template>
  <div v-if="!element || element.id == -1" class="empty">
    (selecciona una fila para ver sus detalles)
  </div>
  <div v-else-if="typeof element.id == 'string'">
    <LocationDetails :location="element.id.split('_')[0]" :semester="element.id.split('_')[1]" />
  </div>
  <div v-else-if="element.firstName">
    <UserDetails :user="element" 
    @editUser="$emit('editUser')" @rmUser="$emit('rmUser')" />
  </div>
  <div v-else-if="element.codes">
    <SubjectDetails :subject="element" 
    @editSubject="$emit('editSubject')" @rmSubject="$emit('rmSubject')" />
  </div>
  <div v-else-if="element.slots">
    <GroupDetails :group="element" 
    @editGroup="$emit('editGroup')" @rmGroup="$emit('rmGroup')" />
  </div>
</template>

<script setup>
import LocationDetails from './LocationDetails.vue';
import UserDetails from './UserDetails.vue';
import SubjectDetails from './SubjectDetails.vue';
import GroupDetails from './GroupDetails.vue';

defineEmits([
  'editUser',
  'rmUser',
  'editSubject',
  'rmSubject',
  'editGroup',
  'rmGroup',
])

defineProps({
  element: Object // a User, Subject, Group, Slot or Location; use {id: -1} for "nothing"
})

</script>

<style scoped>
tr>th {
  width: 10em;
  text-align: right;
}

.empty {
  margin: 2em;
}

.name {
  font-weight: 1000;
}

.dayOfWeek {
  display: inline-block;
  width: 4em;
}

td,
th {
  padding: 4px;
}

h5 {
  margin-top: 1em;
}
</style>