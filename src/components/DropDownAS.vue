<template>
    <div class="row g-1">
        <div class="col-3 text-end">
            <label :for="id" class="form-label">{{ label }}</label>
        </div>
        <div class="col-9 text-start">
            <select :name="id" :id="id" class="form-select" v-model="current">
                <option v-for="o in possible" :key="o.id" :value="o.id">
                    {{ o[displayCol] }}
                </option>
            </select>
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
.form-select {
    width: 100%;
    padding: 8px;
    font-size: 1rem;
}
</style>
