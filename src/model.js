/**
 * Este fichero, `model.js`, contiene objetos para implementar un sistema de planificación
 * docente, como parte de las prácticas de IU de la FdI UCM, curso 2024-25.
 *
 * Fuera de las prácticas de IU, lee la licencia: dice lo que puedes hacer con él:
 * lo que quieras siempre y cuando
 * - no digas que eres el autor original
 * - no me eches la culpa si algo no funciona como esperas
 *
 * @Author manuel.freire@fdi.ucm.es
 */

import * as U from './util.js';

class State {
    /**
     * A full model of the internal state.
     * @param {string} name 
     * @param {[User]} users 
     * @param {[Subject]} subjects 
     * @param {[Group]} groups
     * @param {[Slot]} slots
     */
    constructor(name, users, subjects, groups, slots) {
        this.name = name;
        this.users = users || [];
        this.subjects = subjects || [];
        this.groups = groups || [];
        this.slots = slots || [];
    }
}

class User {
    /**
     * A system user. Either a teacher or an admin (see UserRole)
     * @param {number} id
     * @param {UserRole} userRole
     * @param {string} userName
     * @param {string} token
     * @param {string} firstName
     * @param {string} lastName
     * @param {number} maxCredits
     * @param {[number]} [groups=[]] ids of groups assigned to this teacher
     */
    constructor(id, userRole, userName, token, firstName, lastName, maxCredits,  groups) {
        this.id = +id;
        this.userRole = userRole;
        this.userName = userName;
        this.token = token;
        this.firstName = firstName;
        this.lastName = lastName;
        this.maxCredits = +maxCredits;
        this.groups = groups || [];
    }
}

class Subject {
    /**
     * An academic subject, such as "User Interfaces".
     * @param {number} id
     * @param {string} name
     * @param {string} short short name
     * @param {string} degree
     * @param {number} credits
     * @param {Semester} semester when taught
     * @param {codes} GEA codes
     * @param {[number]} [groups=[]] ids of groups for subject
     */
    constructor(id, name, short, degree, credits, semester, codes, groups) {
        this.id = +id;
        this.name = name;
        this.short = short;
        this.degree = degree;
        this.credits = credits;
        this.semester = semester;
        this.codes = codes;
        this.groups = groups || [];
    }
}

class Group {
    /** 
     * A group of students that is taught a specific subject. All subjects have at least 1 group,
     * but some will have more. Groups can be either lectures or labs.
     * @param {number} id 
     * @param {string} name 
     * @param {number} subjectId
     * @param {number} credits
     * @param {boolean} isLab
     * @param {[number]} [slots=[]] slots for this subject
     * @param {number} [teacherId], con undefined para no-definido
     */
    constructor(id, name, subjectId, credits, isLab, slots, teacherId) {
        this.id = +id;
        this.name = name;
        this.subjectId = subjectId;
        this.credits = credits;
        this.isLab = isLab;
        this.slots = slots || [];
        this.teacherId = teacherId || undefined;
    }
}

class Slot {
    /** 
     * A place+time where learning takes place.
     * @param {number} id 
     * @param {WeekDay} weekDay 
     * @param {number} startTime
     * @param {number} endTime
     * @param {string} location
     * @param {Semester} semester
     * @param {number} groupId
     */
    constructor(id, weekDay, startTime, endTime, location, semester, groupId) {
        this.id = +id;
        this.weekDay = weekDay;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.semester = semester;
        this.groupId = groupId;
    }
}

/**
 * Possible user roles
 */
const UserRole = {
    ADMIN: 'admin', 
    TEACHER: 'teacher',
}

/**
 * Possible weekdays
 */
const WeekDay = {
    MON: 'Lunes',
    TUE: 'Martes',
    WED: 'Miércoles',
    THU: 'Jueves',
    FRI: 'Viernes'    
}

/**
 * Possible semesters
 */
const Semester = {
    SPRING: 'C1',
    FALL: 'C2',  
}

class Util {

    /**
     * Generates random subjects
     */
    static randomSubjects(n, startId) {
        const prefixes = new Map();
        let all = U.fill(n, () => Util.randomSubject(startId++, prefixes));
        // si hay Algo, Algo 1, ...realmente deberían ser Algo I, Algo II, ...
        for (let [k,v] of prefixes.entries()) {
            if (v > 1) {
                //console.log(`fixing suffixes for ${k}`)
                const re = new RegExp(k + " [0-9]+");
                for (let s of all) {
                    if (s.name === k) {
                        s.name = s.name + " I"
                        s.short = U.initials(s.name);
                    } else if (s.name.match(re)) {
                        s.name = s.name.replace(/([0-9]+)$/, (n) => U.roman(+n+1));
                        s.short = U.initials(s.name);
                    }
                }
            }
        }
        return all;
    }

    static randomSubject(id, prefixes) {
        const name = U.unique(U.randomChoice(U.subjectNames).trim(), prefixes, false, " ");
        const short = U.initials(name);
        const credits = U.randomChoice([6, 6, 6, 6, 4.5, 4.5, 3])
        const semester = U.randomChoice([... Object.keys(Semester)])
        const codes = [];
        for (let i=U.randomInRange(1, 3); i>=0; i--) {
            codes.push(U.randomString(6, U.DIGITS));            
        }        
        return new Subject(id, name, short, "Informágica", credits, semester, codes.join("-"));
    }

    /**
     * Reserves non-conflicting slots for a group
     * Lab slots include an altLocation lecture hall, in case the lab is not needed (or there are 
     * technical problems)
     * @param {*} id 
     * @param {*} availability 
     * @param {*} isLab 
     * @param {*} weekDay 
     * @param {*} isLong 
     * @param {*} location 
     * @param {*} altLocation 
     * @param {*} semester 
     * @param {*} group 
     * @param {*} state 
     */
    static addSlotToGroupAndState(id, availability, weekDay, isLong, location, altLocation, semester, group, state) {
        let candidate = null;
        let altCandidate = null;
        let tries = 0;
        do {
            const start = U.randomInRange(9,19) * 100;
            candidate = new Slot(id, weekDay, 
                start, start + (isLong? 150 : 50), location, semester, group.id);
            if (altLocation) {
                altCandidate = new Slot(id+1, weekDay, 
                    start, start + (isLong? 150 : 50), altLocation, semester, group.id);    
            }
            if (tries ++ > 1000) {
                console.log("Could not find a valid slot in 1000 tries for", location, "alt", altLocation, "on", weekDay, "of", semester, "; slots are", state.slots)
                throw Error("Failed 1000 times to find a valid slot, erroring out")
            }
        } while (overlapsOtherSlots(candidate, state.slots) != null && 
            (! altCandidate || overlapsOtherSlots(altCandidate, state.slots) != null));

        state.slots.push(candidate);
        group.slots.push(candidate.id);
        let aKey = `${altLocation?'lab':'lecture'}${semester}|${location}|${weekDay}`;
        availability.set(aKey, availability.get(aKey) - (isLong?2:1));
        if (altCandidate) {
            state.slots.push(altCandidate);
            group.slots.push(altCandidate.id);    
            aKey = `lecture${semester}|${altLocation}|${weekDay}`;
            availability.set(aKey, availability.get(aKey) - (isLong?2:1));
        }
    }

    /**
     * Returns locations & weekdays in which to find slots for a group
     * @param {Map} availability 
     * @param {*} semester 
     * @param {*} isLab 
     * @param {*} isLong 
     * @param {*} isTwice 
     * @param {*} avoid 
     * @returns 
     */
    static chooseByAvailable(availability, semester, isLab, isTwice, avoid) {
        //prefix|${location}|${day}
        const allKeys = [ ... availability.keys()]
            .sort((a, b) => availability.get(b)-availability.get(a));
        const freeLabs = allKeys
            .filter(o => o.startsWith(`lab${semester}`));
        const freeLectureHalls = allKeys
            .filter(o => o.startsWith(`lecture${semester}`));
        const locationsByAvailability = (isLab ? freeLabs : freeLectureHalls);

        let mainKey = locationsByAvailability[0];
        let mainParts = mainKey.split('|');
        if (mainParts[2] == avoid) {
            for (let i = 0; i < locationsByAvailability.length && mainParts[2] == avoid; i++) {
                mainKey = locationsByAvailability[i];
                mainParts = mainKey.split('|');
            }
        }

        if (isTwice) {
            // must also choose a second, different day with same location; cannot be a lab
            for (let i = 0; i < locationsByAvailability.length; i++) {
                let secondKey = locationsByAvailability[i];
                let secondParts = secondKey.split('|');
                if (secondParts[1] === mainParts[1] && secondParts[2] != mainParts[2] && 
                        (!avoid || secondParts[2] != avoid)) {
                    return {
                        location: mainParts[1], 
                        weekDay: mainParts[2], 
                        otherWeekDay: secondParts[2]
                    }; 
                }
            }
        } else {
            return {
                location: mainParts[1], 
                weekDay: mainParts[2]
            };
        }
    }

    static addRandomGroups(subject, n, startId, state, availability) {
        for (let i=0,letter='A'; i<n; i++) {
            const g1 = new Group(startId++, letter, subject.id, 0, false);
            const g2 = new Group(startId++, letter+'1', subject.id, 0, true);

            switch (subject.credits) {
                case 4.5: // 3 x 1h (1h lab)
                {
                    g1.credits = 3;
                    g2.credits = 1.5;
                    const {location: lab, weekDay: d1} = 
                        Util.chooseByAvailable(availability, subject.semester, true, false);
                    const {location: lectures, weekDay: d2, otherWeekDay: d3} = 
                        Util.chooseByAvailable(availability, subject.semester, false, true, d1);
                    this.addSlotToGroupAndState(
                        startId++, availability, d1, false, lab, lectures, subject.semester, g2, state);
                    startId ++; // labs assign 2 slots, a main and an alt
                    this.addSlotToGroupAndState(
                        startId++, availability, d2, false, lectures, null, subject.semester, g1, state);
                    this.addSlotToGroupAndState(
                        startId++, availability, d3, false, lectures, null, subject.semester, g1, state); 
                    break;
                }
                case 6: // 2 x 2h (2h lab)
                {
                    g1.credits = 4.5;
                    g2.credits = 1.5;
                    const {location: lab, weekDay: d1} = 
                        Util.chooseByAvailable(availability, subject.semester, true, false);
                    const {location: lectures, weekDay: d2} = 
                        Util.chooseByAvailable(availability, subject.semester, false, false, d1);
                    this.addSlotToGroupAndState(
                        startId++, availability, d1, true, lab, lectures, subject.semester, g2, state);
                    startId ++; // labs assign 2 slots, a main and an alt
                    this.addSlotToGroupAndState(
                        startId++, availability, d2, true, lectures, null, subject.semester, g1, state);
                    break;
                }
                default: // 2 x 1h, (1h lab)
                {
                    g1.credits = 1.5;
                    g2.credits = 1.5;
                    const {location: lab, weekDay: d1} = 
                        Util.chooseByAvailable(availability, subject.semester, true, false);
                    const {location: lectures, weekDay: d2} = 
                        Util.chooseByAvailable(availability, subject.semester, false, false, d1);
                    this.addSlotToGroupAndState(
                        startId++, availability, d1, false, lab, lectures, subject.semester, g2, state);
                    startId ++; // labs assign 2 slots, a main and an alt
                    this.addSlotToGroupAndState(
                        startId++, availability, d2, false, lectures, null, subject.semester, g1, state);
                }
            }

            subject.groups.push(g1.id);
            state.groups.push(g1);
            subject.groups.push(g2.id);
            state.groups.push(g2);
            letter=String.fromCharCode(letter.charCodeAt(0)+1)
        }
        return startId;
    }

    static randomUsers(n, startId) {
        const prefixes = new Map();
        console.log(`Generating ${n} users, staring with ID ${startId}...`)
        return U.fill(n, () => Util.randomUser(startId++, prefixes));
    }

    static randomUser(id, prefixes) {
        const firstName = U.randomChoice(U.nombresFrecuentes);
        const lastName = U.randomChoice(U.apellidosFrecuentes) 
            + ' ' + U.randomChoice(U.apellidosFrecuentes);
        const firstNameInitials = firstName.split(' ').map(s=>s[0]).join('');
        const userName = U.unique(
            `${firstNameInitials}${lastName.split(' ')[0]}`.toLowerCase(), prefixes)
        const maxCredits = U.randomInRange(12, 24);
        return new User(id, UserRole.TEACHER, userName, U.randomString(16), 
            firstName, lastName, maxCredits);
    }

    static populate(nUsers, nSubjects) {
        const state = new State("Randomly-created State", [], [], [], []);
        let lastId = 1;
        const admin = Util.randomUser(lastId, new Map());        
        admin.userRole = UserRole.ADMIN;
        const totalTeachers = nUsers - 1;
        state.users = [
            // 1 admin guaranteed at position 0, lots of non-admins
            admin, ... Util.randomUsers(totalTeachers, lastId+1)
        ];
        lastId += nUsers;
        console.log(`generating ${nSubjects} subjects; lastId now ${lastId}`)
        state.subjects = Util.randomSubjects(nSubjects, lastId);
        lastId += nSubjects;
        let totalCredits = 0;

        const maxTries = 20;
        const lastIdBeforeGroups = lastId;
        let happy = false;
        for (let tries = 0; !happy && tries < maxTries; tries ++) {
            const availability = new Map(); // 'lab'/'lecture', name, weekDay, slots free
            // genera disponibilidades (para minimizar probabilidad de "no encuentro aulas")
            for (let semester of Object.keys(Semester)) {
                for (let location of U.labsFdi) {
                    for (let day of Object.keys(WeekDay)) {
                        availability.set(`lab${semester}|${location}|${day}`, 10); // 9 - 19h = 10 slots max
                    }            
                }
                for (let location of U.aulasFdi) {
                    for (let day of Object.keys(WeekDay)) {
                        availability.set(`lecture${semester}|${location}|${day}`, 10); // 9 - 19h = 10 slots max
                    }            
                }
            }

            try {
                let remainingSubjects = state.subjects.length
                for (let s of state.subjects) {
                    let nGroups = U.randomInRange(1, 5) + (s.name.match(/.*unda.*/i)?3:0);
                    console.log(`${remainingSubjects--} to go; generating ${nGroups} groups for ${s.name}; lastId now ${lastId}; 
                        availability is ${availability.values().reduce((p,v)=>p+v, 0)}`)
                    lastId = Util.addRandomGroups(s, nGroups, lastId, state, availability);
                    totalCredits += s.credits;                    
                }
                happy = true;
            } catch (error) {
                // complain
                console.log(error, "\nfailed after", state.slots.length, " slots generated")
                let sum = 0;
                for (let [k, v] of availability.entries()) {
                    console.log(`  ... ${k} -> ${v}`)
                    sum += v;
                }
                console.log("Total availability at time of error was ", sum);
                 
                // reset & retry
                lastId = lastIdBeforeGroups;
                for (let s of state.subjects) {
                    s.groups = [];
                }
                state.groups = [];
                state.slots = [];
            }
        } 
        if (!happy) {
            throw Error(`${maxTries} retries, but slot conflicts still exist: add classrooms or reduce classes`);
        } 
        let averageCreditsPerTeacher = totalCredits / totalTeachers;
        let totalTeacherCredits = 0;
        U.doWhere(state.users, o => {
            if (o.userRole == UserRole.TEACHER) totalTeacherCredits+= o.maxCredits;
        });

        // ajusta cantidad de créditos a enseñar
        console.log(`Total of ${totalCredits} credits, averaging ${averageCreditsPerTeacher} x ${totalTeachers} teachers`, `\nteacher free credits: ${totalTeacherCredits}`)
        while (Math.abs(totalCredits - totalTeacherCredits) > 0.5) {
            const t = state.users[U.randomInRange(1, nUsers-1)];           
            if (totalCredits > totalTeacherCredits) {
                t.maxCredits ++;
                totalTeacherCredits ++;
            } else if (totalCredits < totalTeacherCredits) {
                t.maxCredits --;
                totalTeacherCredits --;
            }
        }
        console.log(`after adjusting: a total of ${totalCredits} credits, averaging ${averageCreditsPerTeacher} x ${totalTeachers} teachers`, `\nteacher free credits: ${totalTeacherCredits}`)
        
        return state;
    }
}

// cache de IDs
// (se llena vía getId, y se consulta vía resolve, que sí es público; 
//  modificado en métodos de tipo add, rm y set)
let cache = new Map();
// ultimo ID usado (incrementado en métodos de tipo addAlgo)
let lastId = 0;
// el estado global (modificado en métodos de la API tipo add, rm, y set )
let state = new State();
// ultima version; una misma ID puede pasar por muchas
let lastKey = 0;

/**
 * Inicializa el estado a uno dado o, si no se especifica, uno generado al azar
 * 
 * @param {State} [newState] 
 */
function init(newState) {
    
    state = updateState(newState);
    console.log("inicializado!", state);
    return state;
}

/**
 * Devuelve (una copia) del objeto (User, Subject, Group, ó Slot) con esa id
 * @param {number} id a buscar
 * @returns {(User|Subject|Group|Slot|undefined)} 
 */
function resolve(id) {
    if (!cache.has(+id)) {
        throw Error("ID not found: " + id);
    }
    return U.clone(cache.get(+id));
}

// acceso y refresco de la cache de IDs
// privado
function getId(id, object, overwrite) {
    const found = cache.has(id);
    if (object) {
        if (found) {
            const old = JSON.stringify(cache.get(+id));
            const cur = JSON.stringify(object);
            if (!overwrite) {
                throw Error(`duplicate ID ${id}; old '${old}', new '${cur}'`);
            } else if (old !== cur) {
                object.key = lastKey++;
                cache.set(+id, object);
            } else {
                // nothing changed
            }
        } else {
            object.key = lastKey++;
            cache.set(+id, object);            
        }
    } else {
        if (!found) throw Error("ID not found: " + id);
        return cache.get(+id);
    }
}

// refresca cachés
// privado
function updateState(newState) {
    cache = new Map();

    // si no se especifica un estado, se inventa uno nuevo
    const s = newState || Util.populate(10, 40);
    
    // refresca cachés
    s.users.forEach(o => getId(o.id, o));
    s.subjects.forEach(o => getId(o.id, o));
    s.groups.forEach(o => getId(o.id, o));
    s.slots.forEach(o => getId(o.id, o));

    // actualiza lastId para que siempre sea > todos
    lastId = 0;
    [...s.users, ...s.subjects, ...s.groups, ...s.slots].forEach(o => lastId = Math.max(lastId, o.id))
    lastId ++;

    console.log("Updated state", s);
    return s;
}

/**
 * Salva el estado actual, y permite recuperarlo via restoreState
 * @returns {string} token
 */
function saveState() {
    const randomToken = U.randomString(8);

    // add token to stack
    let stack = localStorage.getItem('stack');
    if (!stack) {
        stack = [];
    } else {
        stack = JSON.parse(stack);
    }
    stack.push(randomToken);
    localStorage.setItem('stack', JSON.stringify(stack));
    console.log(`copia guardada ${randomToken}; copias de seguridad existentes`, stack);

    localStorage.setItem(randomToken, JSON.stringify(state));
    return randomToken;
}

/**
 * Restaura un estado previamente guardado
 * @param {string} token 
 */
function restoreState(token) {

    // if no token specified, pop token from stack
    let stack = localStorage.getItem('stack');
    if (!token) {
        if (!stack) {
            stack = [];
        } else {
            stack = JSON.parse(stack);
        }
        if (!stack.length) {
            throw Error("No token specified, and state-stack is empty");
        } else {
            token = stack.pop();
            localStorage.setItem('stack', JSON.stringify(stack));
        }
    }
    console.log(`restaurada: ${token}; copias de seguridad existentes`, stack);

    state = updateState(JSON.parse(localStorage.getItem(token)));
}

/**
 * Vuelca el estado a una cadena de texto. Puedes
 * usarla con init.
 */
function dumpState() {
    return JSON.stringify(state, null, 2);
}

/**
 * Devuelve (copias) de usuarios
 */
function getUsers(pattern) {
    const r = pattern ?
        state.users.filter(o => U.sameAs(o, pattern)) :
        state.users;
    return U.clone(r);
}

/**
 * Devuelve (copias) de asignaturas
 */
function getSubjects(pattern) {
    const r = pattern ?
        state.subjects.filter(o => U.sameAs(o, pattern)) :
        state.subjects;
    return U.clone(r);
}

/**
 * Devuelve (copias) de grupos
 */
function getGroups(pattern) {
    const r = pattern ?
        state.groups.filter(o => U.sameAs(o, pattern)) :
        state.groups;
    return U.clone(r);
}

/**
 * Devuelve (copias) de franjas (slots)
 */
function getSlots(pattern) {
    const r = pattern ?
        state.slots.filter(o => U.sameAs(o, pattern)) :
        state.slots;
    return U.clone(r);
}

/**
 * elimina un usuario del sistema
 */
function rmUser(userId) {
    console.log(`removing user ${userId}`)
    if (!cache.has(+userId)) {
        throw Error(`Cannot rm with id ${userId}: not found`);
    }

    // elimina de users    
    const removals = U.rmWhere(state.users, o => o.id == userId);
    if (removals != 1) {
        throw Error(`Expected 1 removal, but did ${removals}`)
    }

    // elimina menciones en grupos
    for (let g of state.groups) {
        if (g.teacherId == userId) g.teacherId = undefined;
    }

    // regenera cachés: cosas pueden haber sido borradas
    state = updateState(state)
}

/**
 * elimina una asignatura del sistema
 * ... y todos sus grupos, y sus horarios
 */
function rmSubject(subjectId) {
    console.log(`removing subject ${subjectId}`)
    if (!cache.has(+subjectId)) {
      throw Error(`Cannot rm with id ${subjectId}: not found`);
    }
    
    // elimina de subjects    
    const removals = U.rmWhere(state.subjects, o => o.id == subjectId);
    if (removals != 1) {
      throw Error(`Expected 1 removal, but did ${removals}`)
    }

    // elimina horarios de grupos, profesores de los mismos
    for (let g of state.groups.filter(o => o.subjectId == subjectId)) {
      U.rmWhere(state.slots, o => o.groupId == g.id);
      // des-asigna profesores de sus grupos
      if (g.teacherId) {
        U.rmWhere(cache.get(g.teacherId).groups, x => x == g.id)
      }
    }

    // elimina grupos
    U.rmWhere(state.groups, o => o.subjectId == subjectId);

    // regenera cachés: cosas pueden haber sido borradas
    state = updateState(state)
}

/**
 * elimina un grupo del sistema
 * ... y todos sus horarios
 * NO elimina la asignatura a la que pertenecía, aunque se quede sin grupos
 */
function rmGroup(groupId) {
    console.log(`removing group ${groupId}`)
    if (!cache.has(+groupId)) {
        throw Error(`Cannot rm group with id ${groupId}: not found`);
    }

    // elimina sus horarios
    const g = cache.get(+groupId);
    const slotIds = new Set([... g.slots]);
    U.rmWhere(state.slots, o => slotIds.has(o.id))

    // elimina de asignatura
    const subject = cache.get(g.subjectId)
    U.rmWhere(subject.groups, o => o.id == groupId);

    // elimina de grupos
    const removals = U.rmWhere(state.groups, o => o.id == groupId);
    if (removals != 1) {
        throw Error(`Expected 1 removal, but did ${removals}`)
    }
    
    // regenera cachés: cosas pueden haber sido borradas
    state = updateState(state)
}

/**
 * elimina una franja horaria del sistema
 */
function rmSlot(slotId) {
    console.log(`removing slot ${slotId}`)
    if (!cache.has(+slotId)) {
        throw Error(`Cannot rm with id ${slotId}: not found`);
    }

    // elimina de slots    
    const removals = U.rmWhere(state.slots, o => o.id == slotId);
    if (removals != 1) {
        throw Error(`Expected 1 removal, but did ${removals}`)
    }

    // elimina menciones en grupos
    for (let g of state.groups) {
        U.rmWhere(g.slots, o => o == slotId);
    }

    // regenera cachés: cosas pueden haber sido borradas
    state = updateState(state)
}

/**
 * modifica un usuario
 * ... en particular, permite asignar y desasignar grupos
 */
function setUser(user) {
    if (!cache.has(user.id)) {
        throw Error(`Cannot set user with id ${user.id}: not found`);
    }
    console.log("reemplazando ", resolve(user.id), "con", user);

    // verifica primero si conflicto horario en selección de grupos
    const newGroups = user.groups
    const oldGroups = getId(user.id).groups;
    const dropped = U.inOneButNotAnother(oldGroups, newGroups);
    const joined = U.inOneButNotAnother(newGroups, oldGroups);

    const nonConflicting = U.inOneButNotAnother(oldGroups, dropped)
      .map(o => cache.get(o))
    for (let newGroup of joined.map(o => cache.get(o))) {
        const badGroups = hasTimeConflict(newGroup, nonConflicting)
        if (badGroups.length) {
            throw Error(
                `modifying user ${user.id}: teaching group ${JSON.stringify(newGroup, null, 2)} conflicts with ${JSON.stringify(badGroups, null, 2)}`)
        } else {
          nonConflicting.push(newGroup); // should now use in new conflict tests
        }
    }

    // actualiza grupos
    for (let gId of joined) {
        const o = cache.get(gId)
        if (o.teacherId != user.id) {
            o.teacherId = user.id; // ojo: machaca anterior
            o.key = lastKey ++;
        }
    }
    for (let gId of dropped) {
        const o = cache.get(gId)
        if (o.teacherId != undefined) {
            o.teacherId = undefined; // ojo: machaca anterior
            o.key = lastKey ++;
        }
    }

    // rectifica créditos totales asignados
    user.assignedCredits = 0;
    for (let g of user.groups.map(o => cache.get(o))) {
      user.assignedCredits += g.credits;
    }

    // reemplaza y actualiza cache con restantes campos
    U.doWhere(state.users, o => o.id == user.id, (a,i) => a[i] = user)
    getId(user.id, user, true);
}

/**
 * modifica una asignatura
 * ... permite también asignarle grupos, aunque no horarios
 */
function setSubject(subject) {
    if (!cache.has(subject.id)) {
        throw Error(`Cannot set subject with id ${subject.id}: not found`);
    }
    console.log("reemplazando ", resolve(subject.id), "con", subject);

    const oldGroups = getId(subject.id).groups;
    const dropped = U.inOneButNotAnother(oldGroups, subject.groups);
    const joined = U.inOneButNotAnother(subject.groups, oldGroups);

    // actualiza grupos
    for (let gId of dropped) {
        const o = cache.get(gId)
        if (o.subjectId != undefined) {
            o.subjectId = undefined; // ojo: machaca anterior
            o.key = lastKey ++;
        }        
    }
    for (let gId of joined) {
        const o = cache.get(gId)
        if (o.subjectId != subject.id) {
            o.subjectId = subject.id; // ojo: machaca anterior
            o.key = lastKey ++;
        }
    }

    // reemplaza y actualiza cache con restantes campos
    U.doWhere(state.subjects, o => o.id == subject.id, (a,i) => a[i] = subject)
    getId(subject.id, subject, true);
}

/**
 * modifica un grupo
 * ... permite asignar profesor y asignatura (ambos por ID);
 * ... y asignar también franjas horarias distintas
 */
function setGroup(group) {
    if (!cache.has(group.id)) {
        throw Error(`Cannot set group with id ${group.id}: not found`);
    }
    const old = cache.get(group.id);
    console.log("reemplazando ", old, "con", group);

    const oldSlots = old.slots;
    const dropped = U.inOneButNotAnother(oldSlots, group.slots);
    const joined = U.inOneButNotAnother(group.slots, oldSlots);

    // actualiza slots
    for (let sId of dropped) {
        cache.delete(sId)
        U.rmWhere(state.slots, o => o.id == sId)
    }
    for (let sId of joined) {
        cache.get(sId).groupId = group.id; // ojo: machaca anterior
        U.doWhere(state.slots, o => o.id == sId, (a,i) => a[i].groupId = group.id)
    }

    if (group.teacherId != old.teacherId) {
        // quita grupo a profe que no repite
        U.rmWhere(cache.get(old.teacherId).groups, o => o == group.id)
    }
    if (group.subjectId != old.subjectId) {
        // quita grupo a asignatura anterior
        U.rmWhere(cache.get(old.subjectId).groups, o => o == group.id)
    }

    // reemplaza y actualiza cache con restantes campos
    U.doWhere(state.groups, o => o.id == group.id, (a,i) => a[i] = group)
    getId(group.id, group, true);
}

/**
 * modifica una franja horaria
 * ... esto permite moverla de grupo
 */
function setSlot(slot, ignoreConflicts=false) {
    if (!cache.has(slot.id)) {
        throw Error(`Cannot set group with id ${slot.id}: not found`);
    }
    const old = cache.get(slot.id);
    console.log("reemplazando ", old, "con", slot);
    
    // comprueba conflictos
    if (! ignoreConflicts) {
        const badSlot = overlapsOtherSlots(slot, state.slots);
        if (badSlot != null) {
            throw Error(`slot ${slot.id} conflicts with ${badSlot.id}`);
        }
    }

    // actualiza en grupo
    if (slot.groupId != old.groupId) {
        // quita franja a grupo anterior
        // FIXME
        U.rmWhere(cache.get(old.groupId).slots, o => o == slot.id)
    }

    // reemplaza y actualiza cache con restantes campos
    U.doWhere(state.slots, o => o.id == slot.id, (a,i) => a[i] = slot)    
    getId(slot.id, slot, true);
}

/**
 * añade un usuario; ignora el ID para asignarle otro nuevo
 * @param {User} user 
 */
function addUser(user) {
    console.log("añadiendo ", user);
    const newUser = new User(lastId++, user.userRole,   user.userName, user.token,
        user.firstName, user.lastName, +user.maxCredits);

    getId(newUser.id, newUser, false);
    state.users.push(newUser);

    // update groups
    if (user.groups) {
        newUser.groups = user.groups;
        setUser(newUser);
    }

    return newUser;
}

/**
 * añade una asignatura; ignora el ID para asignarle otro nuevo
 * 
 * ASUME QUE NO HAY GRUPOS
 * 
 * @param {Subject} subject 
 */
function addSubject(subject) {
    console.log("añadiendo ", subject);
    const newSubject = new Subject(lastId++, subject.name, subject.short, subject.degree,
        +subject.credits, subject.semester, subject.codes
    );
    getId(newSubject.id, newSubject, false);
    state.subjects.push(newSubject);
    return newSubject;
}

/**
 * añade un grupo; ignora el ID para asignarle otro nuevo
 * 
 * ASUME QUE NO HAY PROFESOR NI HORARIOS
 * 
 * @param {Group} group 
 */
function addGroup(group) {
    console.log("añadiendo ", group);
    const newGroup = new Group(lastId++, group.name, group.subjectId, group.credits, group.isLab);
    getId(newGroup.id, newGroup, false);
    state.groups.push(newGroup);

    // update subject
    cache.get(newGroup.subjectId).groups.push(newGroup.id)

    return newGroup;
}setGroup

/**
 * añade una franja horaria; ignora el ID para asignarle otro nuevo
 * @param {Slot} slot 
 */
function addSlot(slot) {
    console.log("añadiendo ", slot);
    const newSlot = new Slot(lastId++, slot.weekDay, 
        slot.startTime, slot.endTime, slot.location, slot.semester, slot.groupId);
    getId(newSlot.id, newSlot, false);

    // update group
    cache.get(slot.groupId).slots.push(newSlot.id)

    state.slots.push(newSlot);
    return newSlot;
}

/**
 * Devuelve el 1er slot que solapa con éste en tiempo y, opcionalmente,
 * lugar. No se verifican solapamientos si el grupo es el mismo
 * @param {Slot} slot a comparar
 * @param {[Slot]} slots contra los que buscar conflicto
 * @param {boolean} includingLocation si tiene que coincidir también el lugar
 * @return {Slot} el primer slot en el cual haya solapamiento, o null si ninguno
 * Ojo - sólo busca conflictos entre 1er slot y restantes, 
 *  y no mira si lo hay entre los restantes
 */
function overlapsOtherSlots(slot, slots, includingLocation=true) {
    for (let s of slots) {
        // no hay conflicto si el grupo es el mismo -- o comparando slot contra si mismo
        if (slot.groupId == s.groupId || slot.id == s.id) continue; 

        // no hay conflicto si día o cuatrimestre no coinciden
        if (slot.semester != s.semester || slot.weekDay != s.weekDay) continue;

        // no hay conflicto si espacio debe coincidir y no coincide
        if (includingLocation && slot.location != s.location) continue;

        // no hay conflicto si uno empieza después de que el otro haya acabado
        if ((slot.startTime >= s.endTime) || (s.startTime >= slot.endTime)) continue;
        
        // pues sí: hay conflicto
        return true;
    }
    return null;
}

/**
 * Devuelve 1er grupo que solapa con este grupo en tiempo
 * @param {Group} group cuyos horarios hay que usar
 * @param {[Group]} groups con cuyos horarios comparar
 * @return {[Group]} grupos que causan conflicto, o [] si ninguno
 * Ojo - sólo busca conflictos horarios entre el 1er grupo y los restantes, 
 *   y no mira si lo hay entre los restantes
 */
function hasTimeConflict(group, groups) {
    const conflicting = []
    for (let mySlot of group.slots.map(o => cache.get(o))) {
        for (let otherGroup of groups) {
            const otherSlots = otherGroup.slots.map(o => cache.get(o))
            if (overlapsOtherSlots(mySlot, otherSlots, false)) {
              // 'otherGroup' tiene un slot que solapa con uno de los de 'group'
              conflicting.push(otherGroup);
              break;
            }
        }        
    }
    return conflicting;
}

// cosas que estarán disponibles desde fuera de este módulo
// todo lo que NO se mencione aquí es privado (= inaccesible) desde fuera
// (también podríamos haber añadido `export` a en el momento de definirlas,
// pero así se puede ver la API toda junta)
export {

    // Estado de la aplicación; incluye todas las instancias de las siguientes entidades
    State, 
    // Entidades
    User,
    Subject,
    Group,
    Slot,

    // Enums
    WeekDay,
    Semester,
    UserRole,

    // salva el estado actual a memoria del navegador, y devuelve ID asignado
    saveState,
    // restaura un estado previamente guardado, usando ID devuelto por saveState
    restoreState,
    // genera JSON del estado
    dumpState,
   
    // gestión de entidades en el estado actual. En general,
    // getXs([o]) - devuelve (copias) de entidades de tipo X 
    //      o (opcional): filtro de propiedades
    //          ej.: getUsers({id: 1}) devuelve sólo el usuario con id 1
    //          ej.: getUsers({userRole: "TEACHER"}) devuelve todos los profes
    // addX(o) - añade un X, cogiento todas las propiedades de o, EXCEPTO el id
    //      o: objeto con (todas) las propiedades que debe tener el nuevo X
    //          aunque ignora o.id, y asigna siempre uno nuevo
    // setX(o) - modifica un X que tenga el mismo id de o, para que sea como o
    //      o: objeto con (todas) las propiedades que debe tener el X con id X.id
    // rmX(id) - elimina el X que tenga ese id-
    //      id: id del X a eliminar

    // gestión de usuarios
    getUsers,
    addUser,
    setUser,
    rmUser,
    
    // gestión de asignaturas
    getSubjects,
    addSubject,
    setSubject,
    rmSubject,
   
    // gestión de grupos
    getGroups,
    addGroup,
    setGroup,
    rmGroup,

    // gestión de franjas
    getSlots,
    addSlot,
    setSlot,  
    rmSlot,

    // detección de conflictos
    hasTimeConflict,
    overlapsOtherSlots,
    
    // inicializa el estado; llama para no operar con un modelo vacío
    init, 
    // devuelve (copia) de un objeto, por ID; o estalla si no existe
    resolve, 
    // permite generar estados iniciales al azar (vía Util.populate)
    Util,
};