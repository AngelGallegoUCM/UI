import { reactive } from 'vue'
import * as M from './model.js'

import initialData from './grupos2425.json'

M.init(initialData);

/**
 * Estado global de la aplicación
 * En una aplicación más seria, usaríamos un gestor de estado tipo `Pinia` 
 * para gestionar cambios más complejos
 */
export const gState = reactive({
    // el modelo con datos + métodos para mutarlos
    model: M,
    // acceso cómodo a entidades a partir de ids (evita escribir .model.resolve...)
    resolve: M.resolve,
    // usado para forzar redibujados completos de PmState
    key: 0,

    // listado actual
    currentListing: "users",

    // filtro de usuarios
    searchUserQuery: {all: '', fields: []},
    // cómo se ordenan los usuarios
    userSorter: [{key: "lastName", order: 1}],

    // filtro de asignaturas
    searchSubjectQuery: {all: '', fields: []},   
    // cómo se ordenan las asignaturas
    subjectSorter: [{key: "short", order: 1}],

    // filtro de grupos
    searchGroupQuery: {all: '', fields: []},
    // cómo se ordenan los grupos
    groupSorter: [{key: "niceName", order: 1}],

    // filtro de espacios
    searchLocationQuery: {all: '', fields: []},
    // cómo se ordenan los espacios
    locationSorter: [{key: "niceName", order: 1}],
})

export const semesterNames = {
    FALL: "Fall",
    SPRING: "Spring",
}

export const weekDayNames = {
    MON: "Monday",
    TUE: "Tuesday",
    WED: "Wednesday",
    THU: "Thursday",
    FRI: "Friday",
}