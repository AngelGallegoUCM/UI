<template>
    <BaseModal ref="modalRef" id="userAddOrEditModal"
      :title="isAdd ? 'Añadiendo nuevo usuario' : 'Editando usuario'" 
      :name="name">
      <template #body>
        <form id="addOrEditUserForm" 
          @submit.prevent="e => setUser()">
          <div class="container">
            <TextBox :start="user.firstName" id="e-firstName" label="Nombre" />
            <TextBox :start="user.lastName" id="e-lastName" label="Apellidos" />
            <TextBox :start="''+user.maxCredits" id="e-maxCredits" label="Créditos totales" />
            <br>
            <TextBox :start="user.userName" id="e-userName" label="Login" 
                @change="(v) => name=v"/>
            <TextBox :start="user.token" id="e-userToken" label="Password" />
            <br>
            <MemberBox :start="user.groups" :all="prettyGroups()" id="e-groups" label="grupos" />
          </div>
          <button type="submit" class="invisible">Submit</button>
        </form>
      </template>
      <template #footer>
        <button @click.prevent="() => setUser()" class="btn btn-primary">
          {{ isAdd ? 'Añadir usuario' : 'Confirmar cambios a' }}
          <span class="name">{{ name }}</span>
        </button>
      </template>
    </BaseModal>
</template>

<script setup>

import BaseModal from './BaseModal.vue';
import MemberBox from './MemberBox.vue'
import TextBox from './TextBox.vue'

import { gState } from '../state.js';
import { ref } from 'vue'

const emit = defineEmits(['add', 'edit'])

const props = defineProps({
  user: Object,
  isAdd: Boolean, // otherwise, editing existing instead of adding
})

let modalRef = ref(null);
let name = ref(props.user.userName);

function prettyGroups() {
    return gState.model.getGroups().map(g => {
        const subject = gState.resolve(g.subjectId)
        g.name = `${subject.short}:${g.name}`
        return g;
    })
}

function setUser() {    
  const user = props.user;
  const form = document.getElementById("addOrEditUserForm")
  const valueFor = (name) => {
    const input = form.querySelector(`input[name=${name}]`)
    if (!input) console.log("ERROR: no input for name", name, "in", form)
    return input.value
  }

  console.log("saving user...", user, form, JSON.parse(valueFor("e-groups")))

  // comprueba validez de todos los campos, y sobreescribe resultado
  if ( ! form.checkValidity()) {
    // fuerza a que se muestren los errores simulando un envío
    // (pero como hay errores, no se va a enviar nada :-)
    form.querySelector("button[type=submit]").click()
    return; 
  }    

  // todo válido: lanza evento a padre, y cierra modal
  emit(props.isAdd ? 'add' : 'edit', new gState.model.User(user.id,
    gState.model.UserRole.TEACHER,
    valueFor("e-userName"), 
    valueFor("e-userToken"), 
    valueFor("e-firstName"), valueFor("e-lastName"),
    valueFor("e-maxCredits"),
    JSON.parse(valueFor("e-groups")),
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