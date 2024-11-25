<template>
    <div>
        <table class="tt">
            <thead>
                <tr>
                    <td>h. ini.</td>
                    <th>L</th>
                    <th>M</th>
                    <th>X</th>
                    <th>J</th>
                    <th>V</th>
                </tr>
            </thead>
            <tbody class="tt" :id="bodyId">
            </tbody>
        </table>
        <div v-for="slot in slots" :key="slot.id" 
            :id="`${bodyId}${slot.id}`" 
            :class="slot.semester == 'FALL' ? 'ttb c1' : 'ttb c2'" 
            :title="JSON.stringify(slot)"
            :data-slot="slot">
            <span>{{ formatNiceGroup(slot.groupId) }}</span>
        </div>
    </div>
</template>

<script setup>

import { gState } from '../state.js';
import { useId, onMounted, onUpdated } from 'vue';

const bodyId = useId();
const props = defineProps({
    slots: Array // array of slots to display in TT
})

let tableBody = null; // fixed when onMounted runs

const formatNiceGroup = groupId => {
  const group = gState.resolve(groupId);
  const subject = gState.resolve(group.subjectId);
  return `${subject.short}:${group.name}`
}

const openingTime = 800
const closingTime = 2200

const fillTable = () => {
    const rows = []
    const makeRow = (start) =>
        `<tr class="tt${start}"><th class="tth${start / 100}">${start / 100}</th>\n` +
        Object.keys(gState.model.WeekDay)
          .map((wd) => `\t<td class="tt${start} tt${wd}"></td>`)
          .join('\n') +
        "</tr>"
    for (let t = openingTime; t < closingTime; t += 100) { rows.push(makeRow(t)) }
    tableBody.innerHTML = rows.join('\n');
}

const hundredsTimeToHours = hhmm => {
    const h = Math.floor(hhmm/100)
    const m = hhmm%100
    return h + m/60;
}

const placeBoxes = () => {
    const div = tableBody.closest("div")

    const moveBox = (slot) => {
        const startCell = tableBody.querySelector(
            "td.tt" + (slot.startTime - (slot.startTime % 100)) + ".tt" + slot.weekDay);

        const box = div.querySelector(`#${bodyId}${slot.id}`)

        let top = startCell.offsetTop;
        let left = startCell.offsetLeft;
        let width = startCell.offsetWidth;
        let hourHeight = startCell.offsetHeight; // altura de 1h
        let height = hourHeight * 
            (hundredsTimeToHours(slot.endTime)-hundredsTimeToHours(slot.startTime))            
        
        top += hourHeight*(slot.startTime%100)/60;
        
        box.style.position = 'absolute'
        box.style["z-index"] = 10        
        box.style.top = `${top + div.offsetTop-1}px`
        box.style.left = `${left + div.offsetLeft-1}px`
        box.style.width = `${width+1}px`
        box.style.height = `${height+1}px`
    }

    // find 1st and last class
    let highest = closingTime
    let lowest = openingTime
    for (let slot of props.slots) {
        highest = Math.min(highest, slot.startTime)
        lowest = Math.max(lowest, slot.endTime)
    }

    // show full timetable
    for (let tr of document.querySelectorAll("tr")) {
      tr.classList.remove("hide")
    }

    // hide unused from start
    for (let t = openingTime; t < highest; t += 100) {
      tableBody.querySelector("tr.tt" + t).classList.add("hide")
    }
    
    // place boxes
    for (let slot of props.slots) {
        moveBox(slot)
    }

    // hide unused from end
    for (let t = (lowest+200-(lowest%100)); t < closingTime; t += 100) {
      tableBody.querySelector("tr.tt" + t).classList.add("hide")
    }
  }

// otherwise boxes keep to their old positions!
addEventListener("resize", placeBoxes)

onMounted(() => {
    tableBody = document.getElementById(bodyId)
    fillTable()
    placeBoxes()
});

onUpdated(() => {
    placeBoxes()
})

</script>

<style>
table.tt {
    position: relative; /* makes boxes with position: absolute work */
}
div.ttb.c1 {
    border: 1px solid black;
    background-color: rgba(135, 172, 221, 0.6)!important;
}
div.ttb.c2 {
    border: 1px solid black;
    background-color: rgba(221, 135, 172, 0.6)!important;
}
tr.hide {
  display: none;
}
table.tt td,
table.tt th {
    border: 1px solid #ddd;
}

table.tt td:not(:first-child),
table.tt th:not(:first-child) {
    width: 100px;
}
</style>