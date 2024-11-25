<!--
    Pensado para campo de formulario modal, permite elegir 0 o más referencia
    de un grupo de posibles referencias
-->
<template>
    <div class="row g-1">
        <div class="col-3 text-end">
            <label :for="id" class="form-label">{{ label }}</label>
        </div>
        <div class="col-9 text-start">
            <div v-for="o in possible" :key="o.id" class="caja">
                <span v-if="current.some(c => c.id == o.id)" class="exists" @click="rm(o.id)">
                    {{ o.name }}
                </span>
                <span v-else @click="current.push(o)">
                    {{ o.name }}
                </span>
            </div>
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
    all: Array,
})

const current = ref([])
const possible = ref([])

onMounted(() => {
    current.value = props.start.map(id => gState.resolve(id));
    possible.value = props.all.toSorted((a, b) => a.name > b.name);
})

function rm(id) {
    current.value.splice(current.value.findIndex(o => o.id == id), 1);
}

const read = computed(() => {
    return JSON.stringify(current.value.map(o => o.id));
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