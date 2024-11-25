<!--
    Editor modal para grupos
-->

<template>
  <BaseModal ref="modalRef" id="groupAddOrEditModal" 
    :title="isAdd ? 'Añadiendo nuevo grupo' : 'Editando grupo'"
    :name="name">
    <template #body>
      <form id="addOrEditGroupForm" @submit.prevent="e => setGroup()">
        <div class="container">
          <TextBox :start="group.name" id="e-name" label="Name"
            @change="(v) => name = gState.resolve(group.subjectId).short + ':' + v" />
          <SelectBox :all="gState.model.getSubjects()" 
            :start="group.subjectId" :displayCol="'short'" id="e-subjectId"
            label="Asignatura" />
          <br>
          <TextBox :start="'' + group.credits" id="e-credits" label="Créditos" />
          <TextBox :start="'' + group.isLab" id="e-isLab" label="Prácticas" />
          <SelectBox 
            :all="gState.model.getUsers({ userRole: gState.model.UserRole.TEACHER })" 
            :start="group.teacherId"
            :displayCol="'userName'" id="e-teacherId" label="Profesor" />
          <br>
          <SlotBox 
            :start="group.slots"
            id="e-slots" label="Slots" />
        </div>
        <button type="submit" class="invisible">Submit</button>
      </form>
    </template>
    <template #footer>
      <button @click.prevent="() => setGroup()" class="btn btn-primary">
        {{ isAdd ? 'Añadir grupo' : 'Confirmar cambios a' }}
        <span class="name">{{ name }}</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup>

import BaseModal from './BaseModal.vue';
import TextBox from './TextBox.vue'
import SelectBox from './SelectBox.vue'
import SlotBox from './SlotBox.vue'

import { gState } from '../state.js';
import { ref } from 'vue'

const emit = defineEmits(['add', 'edit'])

const props = defineProps({
  group: Object,
  isAdd: Boolean, // otherwise, editing existing instead of adding
})

let modalRef = ref(null);
let name = ref(gState.resolve(props.group.subjectId).short + ':' + props.group.name);

function setGroup() {
  const group = props.group;
  const form = document.getElementById("addOrEditGroupForm")
  const inputFor = (name) => {
    const input = form.querySelector(`input[name=${name}]`)
    if (!input) console.log("ERROR: no input for name", name, "in", form)
    return input
  }
  const valueFor = (name) => inputFor(name).value

  console.log("saving group...", group, form)

  // inicializa campos dependientes de slots
  const slots = JSON.parse(valueFor("e-slots"))
  const otherSlots = gState.model.getSlots()
  const subject = gState.model.resolve(+valueFor("e-subjectId"))

  for (let s of slots) {
    s.semester = subject.semester;
    s.groupId = group.id;
    if (s.id >= 0) {
      otherSlots.splice(otherSlots.findIndex(o => o.id == s.id), 1)
    }
  }

  // verifica slots no causan conflicto  
  for (let s of slots) {
    inputFor(`e-slots-${s.id}-location`).setCustomValidity(
      gState.model.overlapsOtherSlots(s, otherSlots, true) ?
        "conflicts with other slots!" : "")
  }

  // comprueba validez de todos los campos, y sobreescribe resultado
  if (!form.checkValidity()) {
    // fuerza a que se muestren los errores simulando un envío
    // (pero como hay errores, no se va a enviar nada :-)
    form.querySelector("button[type=submit]").click()
    return;
  }

  // crea y actualiza slots según sea necesario
  for (let i=0; i<slots.length; i++) {
    if (slots[i].id < 0) {
      slots[i] = gState.model.addSlot(slots[i]);
    } else {
      gState.model.setSlot(slots[i])
    }
  }

  // todo válido: lanza evento a padre, y cierra modal
  emit(props.isAdd ? 'add' : 'edit', new gState.model.Group(group.id,
    valueFor("e-name"),
    valueFor("e-subjectId") ? +valueFor("e-subjectId") : undefined,
    +valueFor("e-credits"),
    valueFor("e-isLab") === "true",
    slots.map(o => o.id),
    valueFor("e-teacherId") ? +valueFor("e-teacherId") : undefined,
  ))
  modalRef.value.hide()
}

// para que el padre pueda llamar a show (hide no debería hacer falta)
function show() {
  modalRef.value.show();
}
defineExpose({ show });
</script>

<style scoped>
.name {
  font-weight: 200%;
}
</style>