<template>
    <div class="row g-1 form-inline align-items-baseline">
        <div class="col-3 text-end">
            <label :for="id" class="form-label">{{ label }}</label>
        </div>
        <div class="col-auto">
            <select class="form-select" :name="id" :id="id" v-model="value">
                <option value="FALL">1er Cuatrimestre</option>
                <option value="SPRING">2º Cuatrimestre</option>
            </select>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
    label: String,
    id: String,
    start: String,
})
defineEmits(['change'])

let value = ref('')

onMounted(() => {
    value.value = props.start || 'FALL'; // Asignar 'FALL' como valor predeterminado si props.start no está definido
})
</script>

<style scoped></style>
