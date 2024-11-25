<!--
    Pensado para campo de formulario modal, permite elegir 0 ó 1 objetos
    de un grupo de posibles objetos. Marcar una deselecciona otras. 
    Devuelve id de objeto seleccionado
-->
<template>
    <div class="row g-1">
        <div class="col-3 text-end">
            <label :for="id" class="form-label">{{ label }}</label>
        </div>
        <div class="col-9 text-start">
            <div v-for="o in possible" :key="o.id" class="caja">
                <span v-if="o.id == current" class="exists" 
                    @click="current = ''">
                    {{ o[displayCol] }}
                </span>
                <span v-else @click="current = o.id">
                    {{ o[displayCol] }}
                </span>
            </div>
            <input type="hidden" :name="id" :id="id" :value="current">
        </div>
    </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'

const props = defineProps({
    label: String,
    id: String,
    start: Number,
    displayCol: String,
    all: Array,
})

const current = ref('')
const possible = ref([])

onMounted(() => {
    current.value = props.start
    possible.value = props.all.toSorted((a, b) => a[props.displayCol] > b[props.displayCol]);
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