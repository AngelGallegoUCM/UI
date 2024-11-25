/**
 * Este fichero, `util.js`, contiene funciones que te pueden resultar útiles para 
 * - generar datos de prueba
 * - validar datos
 * - operar con el DOM
 *
 * Fuera de las prácticas de IU, lee la licencia: dice lo que puedes hacer con él:
 * lo que quieras siempre y cuando
 * - no digas que eres el autor original
 * - no me eches la culpa si algo no funciona como esperas
 *
 * @Author manuel.freire@fdi.ucm.es
 */

export function one(selector) {
    return document.querySelector(selector);
}

export function all(selector) {
    return document.querySelectorAll(selector);
}

export function add(selector, html) {
    one(selector).insertAdjacentHTML("beforeend", html);
}

export function clean(selector) {
    all(selector).forEach(o => o.innerHTML = '')
}

/**
 * Generates an html element from a string
 * @param {String} html 
 * @returns the resulting element
 * @see https://stackoverflow.com/a/35385518/15472
 */
export function mkElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

export const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const LOWER = 'abcdefghijklmnopqrstuvwxyz';
export const DIGITS = '01234567890';

/**
 * Builds a sorter based on the order of properties in an object.
 *
 * Given an object nums = {ONE: "uno", TWO: "dos", THREE: "tres"}, and 
 * objects with properties that use keys of this map as values, this would 
 * work as expected:
 * 
 * const s = mkKeySorter(nums, "num")
 * [{ foo: 1, num: "THREE" }, { bar: 4, num: "TWO" }].sort(s) // sorts TWO before THREE!
 * 
 * @param {Object} keyObject 
 * @param {string} keyName 
 * @returns a comparator
 */
export function mkKeySorter(keyObject, keyName) {
    const m = new Map();
    let i = 0;
    for (let k of Object.keys(keyObject)) {
        m.set(k, i++);
    }
    return (a,b) => m.get(a[keyName]) - m.get(b[keyName])
}

/**
 * Builds a value sorter. Understands strings and numbers (only)
 *
 * @param {string} keyName 
 * @returns a comparator
 */
export function mkValueSorter(keyName) {
    return (a,b) => isFinite(a[keyName]) ? 
            a[keyName] - b[keyName] :
            a[keyName].localeCompare(b[keyName])
}

/**
 * Builds an array sorter. Sorts them according to size, then contents
 *
 * @param {string} keyName 
 * @returns a comparator
 */
export function mkArraySorter(keyName) {
  return (a,b) => {
    let as = a[keyName]
    let bs = b[keyName]
    let rv = as.length - bs.length
    for (let i=0; rv == 0 && i<as.length; i++) {
      rv = as[i] < bs[i] ? -1 : as[i] > bs[i] ? 1 : 0
    } 
    return rv
  }
}

/**
 * Builds a time sorter. Understands hh:mm only
 *
 * @param {string} keyName 
 * @returns a comparator
 */
export function mkTimeSorter(keyName) {
  return (a,b) => {
    const as = a[keyName].split(":").map(v => +v)
    const bs = b[keyName].split(":").map(v => +v)
    return as[0]*60 + as[1] - bs[0]*60 + bs[1];
  }
}


/**
 * Builds a reverse sorter
 */
export function mkReverseSorter(sorter) {
    return (a,b) => -sorter(a,b);
}

/**
 * Runs a set of comparator functions one after the other; the first to return non-zero
 * decides the ultimate value.
 * 
 * @param {[function]} cs - comparator functions
 * @returns a comparator that combines all inputs, sequentially
 */
export function mkMultiSorter(cs) {
    return (a, b) => {
        let rv = 0;
        for (let c of cs) {
            rv = c(a,b)
            if (rv != 0) return rv;
        }
        return rv;
    }
}

/**
 * Escapes special characters to prevent XSS/breakage when generating HTML
 * via, say, insertAdjacentHTML or insertHTML.
 * 
 * (see https://stackoverflow.com/a/9756789/15472)
 * 
 * @param {string} s
 */
export function escape(s) {
    return ('' + s) /* Forces the conversion to string. */
        .replace(/\\/g, '\\\\') /* This MUST be the 1st replacement. */
        .replace(/\t/g, '\\t') /* These 2 replacements protect whitespaces. */
        .replace(/\n/g, '\\n')
        .replace(/\u00A0/g, '\\u00A0') /* Useful but not absolutely necessary. */
        .replace(/&/g, '\\x26') /* These 5 replacements protect from HTML/XML. */
        .replace(/'/g, '\\x27')
        .replace(/"/g, '\\x22')
        .replace(/</g, '\\x3C')
        .replace(/>/g, '\\x3E');
}

/**
 * Quote attribute values to prevent XSS/breakage
 * 
 * (see https://stackoverflow.com/a/9756789/15472)
 * 
 * @param {string} s
 * @param {boolean|undefined} preserveCR (por defecto false) para permitir `\n`
 */
export function quoteattr(s, preserveCR) {
    preserveCR = preserveCR ? '&#13;' : '\n';
    return ('' + s) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        /*
        You may add other replacements here for HTML only 
        (but it's not necessary).
        Or for XML, only if the named entities are defined in its DTD.
        */
        .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
        .replace(/[\r\n]/g, preserveCR);
}

/**
 * Lanza excepción si el parámetro no existe como clave en el objeto pasado como segundo valor
 * @param {string} a
 * @param {*} enumeration, un objeto
 */
export function checkEnum(a, enumeration) {
    const valid = Object.values(enumeration);
    if (a === undefined) {
        return;
    }
    if (valid.indexOf(a) === -1) {
        throw Error(
            "Invalid enum value " + a +
            ", expected one of " + valid.join(", "));
    }
}

/**
 * Genera un acrónimo a partir de una frase
 * @param {string} words
 */
export function initials(words) {
    let start = true;
    let result = [];
    words = words
        .replaceAll(/^(la|las|el|los) /gi, "")
        .replaceAll(/( (y|a|o|de|del|por|para|con|la|las|el|los|en))+ /gi, " ") 
        .replaceAll(/ V$/g, " 5")
        .replaceAll(/ IV$/g, " 4")
        .replaceAll(/ III$/g, " 3")
        .replaceAll(/ II$/g, " 2")
        .replaceAll(/ I$/g, " 1")
    for (let c of words) {
        if (start) {
            start = false;
            result.push(c);
        } else if (c == ' ' || c == '-') {
            start = true;
        }
    }
    return (result.length == 0) ? '?' 
        : result.join("").normalize("NFKD").toUpperCase();
}

/**
 * Genera un entero aleatorio entre min y max, ambos inclusive
 * @param {Number} min 
 * @param {Number} max 
 */
export function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Devuelve un carácter al azar de la cadena pasada como argumento
 * @param {string} alphabet 
 */
export function randomChar(alphabet) {
    return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
}

/**
 * Devuelve una cadena de longitud `count` extraida del alfabeto pasado como
 * segundo argumento
 * @param {number} count 
 * @param {(string|undefined)} alphabet, por defecto alfanuméricos con mayúsculas y minúsculas
 */
export function randomString(count, alphabet) {
    const n = count || 5;
    const valid = alphabet || UPPER + LOWER + DIGITS;
    return new Array(n).fill('').map(() => this.randomChar(valid)).join('');
}

/**
 * Devuelve un identificador tipo DNI al azar (8 caracteres + letra)
 */
export function generateDni(number) {
    const nr = number ?
        number.padStart(8, '0').substring(0, 8) :
        new Array(8).fill('').map(() => this.randomChar(DIGITS)).join('');
    const pos = nr % 23;
    return "" + nr + "TRWAGMYFPDXBNJZSQVHLCKET".substring(pos, pos + 1);
}

/**
 * Devuelve una dirección IPv4 "válida" (ver isValidIp) al azar
 */
export function generateIp() {
    return [1,2,3,4].map(() => randomInRange(0, 255)).join(".");
}

/**
 * Devuelve true si y sólo si el DNI es válido (8 caracteres + letra)
 */
export function isValidDni(dni) {
    if (!/^[0-9]{8}[A-Z]$/.test(dni)) {
        return false;
    }
    return generateDni(dni.substring(0, 8)) == dni
}

/**
 * Devuelve true si y sólo si la cadena pasada es una IPv4 válida
 * (no comprueba direcciones reservadas o si son enrutables o no...)
 */
export function isValidIp(ip) {
    if (!/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}\.[0-9]{3}]$/.test(ip)) {
        return false;
    }
    return ip.split(".").filter(n => n < 256).length == 4;
}


/**
 * Genera una palabra, opcionalmente empezando por mayúsculas
 * 
 * @param {number} count longitud
 * @param {(boolean|undefined)} capitalized, por defecto false; si true, 1er caracter en mayuscula
 */
export function randomWord(count, capitalized) {
    return capitalized ?
        this.randomChar(UPPER) + this.randomString(count - 1, LOWER) :
        this.randomString(count, LOWER);
}

/**
 * Genera palabras al azar, de forma configurable
 * 
 * @param {number} wordCount a generar
 * @param {(boolean|undefined)} allCapitalized si todas deben empezar por mayúsculas (por defecto, sólo 1a)
 * @param {(string|undefined)} delimiter delimitador a usar (por defecto, espacio)
 */
export function randomText(wordCount, allCapitalized, delimiter) {
    let words = [this.randomWord(5, true)]; // primera empieza en mayusculas
    for (let i = 1; i < (wordCount || 1); i++) words.push(this.randomWord(5, allCapitalized));
    return words.join(delimiter || ' ');
}

/**
 * Devuelve algo al azar de un array
 * 
 * @param {[*]} array 
 */
export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Genera una fecha al azar entre 2 dadas
 * https://stackoverflow.com/a/19691491
 * 
 * @param {string} fechaIni, en formato válido para `new Date(fechaIni)`
 * @param {number} maxDias 
 */
export function randomDate(fechaIni, maxDias) {
    let dia = new Date(fechaIni);
    dia.setDate(dia.getDate() - randomInRange(1, maxDias));
    return dia;
}

/**
 * Devuelve n elementos no-duplicados de un array
 * de https://stackoverflow.com/a/11935263/15472
 *
 * @param {[*]} array 
 * @param {size} cuántos elegir (<= array.length)
 */
export function randomSample(array, size) {
    var shuffled = array.slice(0),
        i = array.length,
        temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}

/**
 * Genera hasta n parejas no-repetidas de elementos de dos arrays
 * los elementos deben ser números, o texto que no contenga el separador
 * 
 * @param {number} count 
 * @param {[(string|number)]} as 
 * @param {[(string|number)]} bs 
 * @param {string|undefined} separator a usar, por defecto `,`
 */
export function randomPairs(count, as, bs, separator) {
    separator = separator || ",";
    const pairs = new Set();
    let retries = 0;
    while (pairs.size < count && retries < 100) {
        let p = `${randomChoice(as)}${separator}${randomChoice(bs)}`;
        if (pairs.has(p)) {
            retries++;
        } else {
            pairs.add(p);
        }
    }
    return Array.from(pairs).map(p => p.split(separator).map(s => +s));
}

/**
 * Llena un array con el resultado de llamar a una funcion varias veces
 * 
 * @param {number} count 
 * @param {Function} f 
 */
export function fill(count, f) {
    // new Array(count).map(f) fails: map only works on existing indices
    return new Array(count).fill().map(f)
}

// de https://informatica.ucm.es/listado-de-asignaturas-2024-2025
// extraída mediante {let a=new Set(); document.querySelectorAll("tr>td:nth-child(2)").forEach(o=>a.add(o.textContent)); JSON.stringify([... a].sort())}
export const subjectNames = [
    "Administración de bases de datos","Administración de sistemas y redes",
    "Adquisición y Preprocesamiento de Datos","Algebra Lineal","Ampliación de Matemáticas",
    "Ampliación de Redes","Ampliación de Sistemas Operativos",
    "Ampliación de Sistemas Operativos y Redes","Ampliación de bases de datos",
    "Análisis de redes sociales","Análisis de sistemas concurrentes y distribuidos",
    "Análisis estático de programas y resolución de restricciones","Análisis numérico",
    "Aplicaciones web","Aprendizaje Automático","Aprendizaje Automático",
    "Aprendizaje automático y Big Data","Aprendizaje automático y big data",
    "Aprendizaje automático y minería de datos","Arquitectura Interna de Linux y Android",
    "Arquitectura de Computadores","Arquitectura del Nodo IoT",
    "Arquitecturas de Procesamiento","Arquitecturas y Programación de Computadores Cuánticos",
    "Auditoría informática","Auditoría informática",
    "Auditoría, calidad y fiabilidad informáticas","Bases de Datos",
    "Bases de Datos Relacionales","Bases de Datos noSQL","Bases de Datos nosql",
    "Ciberseguridad en Videojuegos","Cloud y Big Data","Computación Cuántica",
    "Computación cuántica","Computación de altas prestaciones y aplicaciones",
    "Creación de empresas","Criptografía y teoría de códigos",
    "Cálculo","Desarrollo de aplicaciones y servicios inteligentes",
    "Desarrollo de sistemas interactivos","Desarrollo de videojuegos",
    "Desarrollo de videojuegos mediante tecnologías web",
    "Dirección y gestión de proyectos software","Diseño automático de sistemas",
    "Diseño de algoritmos","Diseño de algoritmos bioinspirados",
    "Diseño de infraestructura inteligente para el Internet de las Cosas",
    "Diseño de sistemas correctos por construcción","Diseño de videojuegos",
    "Diseño y análisis de protocolos de seguridad","E-learning","Electrónica",
    "Empresa y Emprendimiento","Entornos interactivos y realidad virtual",
    "Especificación, validación y testing","Estadística aplicada",
    "Estructura de Computadores","Estructura de Computadores",
    "Estructura de computadores","Estructuras de Datos y Algoritmos","Estructuras de datos",
    "Estructuras de datos y algoritmos","Evaluación de configuraciones",
    "Fundamentos de Algoritmia","Fundamentos de Computadores",
    "Fundamentos de Computadores","Fundamentos de algoritmia",
    "Fundamentos de computadores","Fundamentos de computadores",
    "Fundamentos de electricidad y electrónica","Fundamentos de la Inteligencia Artificial",
    "Fundamentos de la Programación","Fundamentos de la Programación",
    "Fundamentos de los computadores","Fundamentos de los lenguajes informáticos",
    "Gestión de Empresas de Base Tecnológica y Sistemas Informáticos",
    "Gestión de Proyectos Software","Gestión de la información en la web",
    "Gestión de proyectos software y metodologías de desarrollo","Gestión empresarial",
    "Gestión empresarial","Gráficos por computador",
    "Herramientas informáticas para los juegos de azar",
    "Informática Musical","Informática gráfica","Informática gráfica",
    "Ingeniería de Comportamientos Inteligentes",
    "Ingeniería de sistemas basados en el conocimiento",
    "Ingeniería del Software","Ingeniería del Software",
    "Ingeniería del conocimiento","Ingeniería del software",
    "Ingeniería del software","Ingeniería web",
    "Inteligencia Artificial Aplicada al Control","Inteligencia Artificial",
    "Inteligencia Artificial","Inteligencia Artificial aplicada a Internet de las Cosas",
    "Inteligencia artificial para videojuegos",
    "Interfaces de usuario","Introducción a la Tecnología Blockchain y Smart Contracts",
    "Investigación Operativa","Juegos Serios",
    "Laboratorio de Sistemas Inteligentes sobre Internet de las Cosas",
    "Lenguajes de programación y procesadores de lenguaje",
    "Los escenarios científicos y tecnológicos emergentes y la defensa","Lógica Matemática",
    "Matemática Discreta","Matemática Discreta y Lógica Matemática",
    "Matemática Discreta y Lógica Matemática","Matemática discreta",
    "Metodologías ágiles de producción","Minería de datos y el paradigma Big Data",
    "Modelado de software","Modelado en 2D y 3D","Modelos de la concurrencia",
    "Modelos operativos de gestión","Motores de videojuegos",
    "Métodos Estadísticos","Métodos Estadísticos para Ingeniería de Datos",
    "Métodos algorítmicos en resolución de problemas",
    "Métodos algorítmicos en resolución de problemas",
    "Métodos algorítmicos en resolución de problemas",
    "Métodos formales de testing","Métodos matemáticos","Negocio digital",
    "Optimización","Paralelismo y Sistemas Distribuidos","Percepción computacional",
    "Principios de dibujo, color y composición","Probabilidad y Estadística",
    "Probabilidad y Estadística  ","Probabilidad y estadística",
    "Procesadores de Lenguajes","Programación Competitiva",
    "Programación Concurrente","Programación Declarativa",
    "Programación con restricciones","Programación de GPUs y aceleradores",
    "Programación de aplicaciones para dispositivos móviles",
    "Programación de sistemas distribuidos","Programación de sistemas y dispositivos",
    "Programación de videojuegos en lenguajes interpretados",
    "Programación declarativa","Programación declarativa aplicada",
    "Programación evolutiva","Programación paralela para móviles y multicores",
    "Proyecto de Datos","Proyecto de Datos",
    "Proyectos","Proyectos","Proyectos","Prácticas en empresas",
    "Redes","Redes Neuronales y Deep Learning","Redes de nueva generación e Internet",
    "Redes y Sistemas Operativos","Redes y seguridad","Redes y seguridad",
    "Redes y videojuegos en red","Redes, Protocolos e Interfaces",
    "Redes, protocolos e interfaces","Robótica","Seguridad en redes",
    "Seguridad y Legalidad","Simulación física para videojuegos",
    "Sistemas Basados en Conocimiento","Sistemas Operativos",
    "Sistemas de Gestión de Empresas","Sistemas de Gestión de Empresas",
    "Sistemas de gestión de datos y de la información","Sistemas empotrados",
    "Sistemas empotrados distribuidos","Sistemas inteligentes",
    "Sistemas web","Software corporativo","Sonido en videojuegos",
    "Tecnología de computadores",
    "Tecnología de la Programación","Tecnología de la programación",
    "Tecnología de la programación","Tecnología de la programación de videojuegos",
    "Tecnología de la programación de videojuegos",
    "Tecnología y Organización de Computadores","Tecnología y organización de computadores",
    "Tecnologías multimedia e interacción","Teoría de lenguajes de programación",
    "Testing de Software","Trabajo de fin de grado","Trabajo fin de máster",
    "Tratamiento de Datos Masivos","Tratamiento de datos masivos",
    "Técnicas algorítmicas en ingeniería del software","Técnicas de animación en 2D y 3D",
    "Técnicas de control de la gestión empresarial",
    "Usabilidad y análisis de juegos","Verificación asistida de programas",
    "Videojuegos en consola","Videojuegos para dispositivos móviles",
    "Visualización de Datos","Álgebra Lineal","Ética, legislación y profesión"
]

// de https://informatica.ucm.es/horarios-por-aulas
// via {let a=new Set(); document.querySelectorAll("ul>ul>li").forEach(o=>a.add(o.textContent)); JSON.stringify([...a])} 
export const aulasFdi = [
    "Aula 1","Aula 2","Aula 3","Aula 4","Aula 5","Aula 6","Aula 7","Aula 8","Aula 9",
    "Aula 10","Aula 11","Aula 12","Aula 13","Aula 14","Aula 15","Aula 16",
    "Aula 1208","Aula 1210","Aula 1218","Aula 1220","Aula 1008"
];

// de https://informatica.ucm.es/horarios-por-laboratorios
// via {let a=new Set(); document.querySelectorAll("ul>ul>li").forEach(o=>a.add(o.textContent)); JSON.stringify([...a])} 
export const labsFdi = [
    "Laboratorio 1","Laboratorio 2","Laboratorio 3","Laboratorio 4",
    "Laboratorio 5","Laboratorio 6","Laboratorio 7","Laboratorio 8",
    "Laboratorio 9","Laboratorio 10","Laboratorio 11"
];

// de https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177009&menu=resultados&idp=1254734710990#_tabs-1254736195497
export const apellidosFrecuentes = [
    'Garcia',
    'Rodriguez',
    'Gonzalez',
    'Fernandez',
    'Lopez',
    'Martinez',
    'Sanchez',
    'Perez',
    'Gomez',
    'Martin',
    'Jimenez',
    'Hernandez',
    'Ruiz',
    'Diaz',
    'Moreno',
    'Muñoz',
    'Alvarez',
    'Romero',
    'Gutierrez',
    'Alonso',
    'Navarro',
    'Torres',
    'Dominguez',
    'Ramirez',
    'Ramos',
    'Vazquez',
    'Gil',
    'Serrano',
    'Morales',
    'Molina',
    'Suarez',
    'Blanco',
    'Castro',
    'Delgado',
    'Ortega',
    'Ortiz',
    'Marin',
    'Rubio',
    'Nuñez',
    'Medina',
    'Castillo',
    'Sanz',
    'Cortes',
    'Iglesias',
    'Santos',
    'Garrido',
    'Guerrero',
    'Lozano',
    'Cano',
    'Cruz',
    'Flores',
    'Mendez',
    'Herrera',
    'Prieto',
    'Peña',
    'Leon',
    'Marquez',
    'Cabrera',
    'Gallego',
    'Calvo',
    'Vidal',
    'Reyes',
    'Campos',
    'Vega',
    'Fuentes',
    'Carrasco',
    'Aguilar',
    'Caballero',
    'Diez',
    'Nieto',
    'Vargas',
    'Santana',
    'Gimenez',
    'Hidalgo',
    'Montero',
    'Pascual',
    'Herrero',
    'Lorenzo',
    'Santiago',
    'Benitez',
    'Duran',
    'Arias',
    'Mora',
    'Ibañez',
    'Rojas',
    'Ferrer',
    'Carmona',
    'Vicente',
    'Soto',
    'Crespo',
    'Roman',
    'Parra',
    'Pastor',
    'Velasco',
    'Rivera',
    'Saez',
    'Silva',
    'Bravo',
    'Moya',
    'Gallardo',
]

// de https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177009&menu=resultados&idp=1254734710990#_tabs-1254736195454
export const nombresFrecuentes = [
    'Antonio',
    'Manuel',
    'Jose',
    'Francisco',
    'David',
    'Juan',
    'Javier',
    'Daniel',
    'Jose Antonio',
    'Francisco Javier',
    'Jose Luis',
    'Carlos',
    'Alejandro',
    'Jesus',
    'Jose Manuel',
    'Miguel',
    'Miguel Angel',
    'Pablo',
    'Rafael',
    'Sergio',
    'Angel',
    'Pedro',
    'Fernando',
    'Jorge',
    'Jose Maria',
    'Luis',
    'Alberto',
    'Alvaro',
    'Adrian',
    'Juan Carlos',
    'Diego',
    'Juan Jose',
    'Raul',
    'Ivan',
    'Ruben',
    'Juan Antonio',
    'Oscar',
    'Enrique',
    'Juan Manuel',
    'Andres',
    'Ramon',
    'Mario',
    'Santiago',
    'Victor',
    'Vicente',
    'Joaquin',
    'Eduardo',
    'Marcos',
    'Roberto',
    'Hugo',
    'Maria Carmen',
    'Maria',
    'Carmen',
    'Ana Maria',
    'Laura',
    'Maria Pilar',
    'Maria Dolores',
    'Isabel',
    'Maria Teresa',
    'Ana',
    'Josefa',
    'Marta',
    'Cristina',
    'Maria Angeles',
    'Lucia',
    'Maria Jose',
    'Maria Isabel',
    'Francisca',
    'Antonia',
    'Paula',
    'Sara',
    'Dolores',
    'Elena',
    'Maria Luisa',
    'Raquel',
    'Rosa Maria',
    'Manuela',
    'Maria Jesus',
    'Pilar',
    'Concepcion',
    'Julia',
    'Mercedes',
    'Alba',
    'Beatriz',
    'Silvia',
    'Nuria',
    'Irene',
    'Patricia',
    'Rocio',
    'Andrea',
    'Rosario',
    'Juana',
    'Montserrat',
    'Teresa',
    'Encarnacion',
    'Monica',
    'Alicia',
    'Maria Mar',
    'Marina',
    'Sandra',
]

/**
 * Genera números romanos a partir de enteros
 * @param {number} n
 */
export function roman(n) {
    const values = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
    const letters = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
    let result = [];
    for (let i=0; i<values.length; i++) {
        while (n >= values[i]) {
            n -= values[i];
            result.push(letters[i]);
        }
    }
    return result.join("");
}

/**
 * Convierte un valor en único dentro de un conjunto usando un sufijo numérico
 * 
 * @param {string} str a hacer mediante un sufijo numérico que se puede incrementar
 * @param {Map<String, number>} prev con los valores previos
 * @param {boolean} useRoman para usar sufijos I, II, ... en lugar de 1, 2, ...
 */
export function unique(str, prev, useRoman=false, sep="") {
    if (!prev.has(str)) {
        prev.set(str, 1);
        return str;
    } else {
        const next = prev.get(str);
        prev.set(str, next + 1);
        return useRoman ? `${str}${sep}${roman(next)}` : `${str}${sep}${next}`;
    }
}

/**
 * Llama a `callback` allá donde se cumpla la condición
 * devuelve el número de callbacks invocados
 * @param {[*]} array 
 * @param {function} condition 
 * @param {function} callback; recibe array e índice
 */
export function doWhere(array, condition, callback) {
    let counter = 0;
    for (let i = 0; i < array.length; i++) {
        if (condition(array[i])) {
            if (callback) {
                callback(array, i);
                counter ++;
            }
        }
    }
    return counter;
}

/**
 * Elimina el elemento de las posiciones donde se cumple la condición;
 * devuelve el número de eliminaciones totales
 * @param {[*]} array 
 * @param {function} condition 
 */
export function rmWhere(array, condition) {
    let counter = 0;
    for (let i = 0; i < array.length; i++) {
        if (condition(array[i])) {
            array[i] = array[array.length - 1];
            array.length --;
            counter ++;
        }
    }
    return counter;
}

/**
 * Returns elements in one array but not in the other
 */
export function inOneButNotAnother(as, bs) {
    return as.filter(a => bs.indexOf(a) == -1);
}

/**
 * Returns a deep clone of a serializable object
 */
export function clone(o) {
    return JSON.parse(JSON.stringify(o));
}

/**
 * Devuelve "true" si el objeto corresponde al patrón (= mismos valores en mismas propiedades)
 * 
 * @param {Object} objeto
 * @param {Object} pattern
 */
export function sameAs(o, pattern) {
    for (let [k, v] of Object.entries(pattern)) {
        if (o[k] !== v) return false;
    }
    return true;
}