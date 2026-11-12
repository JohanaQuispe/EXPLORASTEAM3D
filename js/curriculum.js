/**
 * ExploraSTEAM 3D — Curriculum Database
 * 25 misiones (5 por isla). Contenido de Fase 1, videos de YouTube,
 * laboratorios 3D (Modo A), minijuegos (Modo B), cuestionarios (Fase 3)
 * y "Video de Pío" (deepDive): escenas con contenido NUEVO, no repetido.
 * Todas las preguntas de quiz tienen su respuesta dentro del texto de Fase 1.
 */
(function (global) {
  "use strict";

  const ISLANDS = [
    {
      id: "science", name: "Isla de Ciencias", icon: "🔬",
      tagline: "Fotosíntesis, fractales, ciclo del agua y el universo",
      image: "assets/img/island-science.jpg", color: "#51cf66",
      searchHint: "Exploración científica"
    },
    {
      id: "technology", name: "Isla de Tecnología", icon: "🤖",
      tagline: "Morphing, píxeles RGB, algoritmos y sensores",
      image: "assets/img/island-technology.jpg", color: "#3bc9db",
      searchHint: "Laboratorio digital"
    },
    {
      id: "engineering", name: "Isla de Ingeniería", icon: "🏗️",
      tagline: "Triángulos, puentes, engranajes y palancas",
      image: "assets/img/island-engineering.jpg", color: "#ffa94d",
      searchHint: "Taller de construcción"
    },
    {
      id: "art", name: "Isla de Arte", icon: "🎨",
      tagline: "Colores, líneas de Joan Miró, esculturas y simetría",
      image: "assets/img/island-art.jpg", color: "#ff8787",
      searchHint: "Taller de arte"
    },
    {
      id: "math", name: "Isla de Matemáticas", icon: "📐",
      tagline: "Figuras 3D, sumas, patrones, fracciones y medidas",
      image: "assets/img/island-math.jpg", color: "#b197fc",
      searchHint: "Reino de los números"
    }
  ];

  const YOUTUBE_SEARCH = function (query) {
    return "https://www.youtube.com/results?search_query=" + encodeURIComponent(query + " para niños");
  };

  const TOPICS = {
    /* =====================================================================
     * 🎨 ISLA DE ARTE
     * =================================================================== */
    art: [
      {
        id: "art-1", title: "Los Colores Primarios y la Mezcla Mágica", icon: "🖌️",
        phase1: "¡Hola! Soy Pío 🐥. ¿Sabías que solo existen 3 colores mágicos llamados primarios: el Rojo, el Azul y el Amarillo? Se llaman primarios porque no se pueden crear mezclando otros colores. Pero si mezclas Azul + Amarillo, ¡obtienes Verde! A los nuevos colores les llamamos colores secundarios.",
        videoId: "vc4BAUeL9wQ", videoTitle: "Colores primarios y secundarios para niños", videoSearch: YOUTUBE_SEARCH("colores primarios y secundarios"),
        lab: { type: "mixpaint", label: "Mezcla de Témpera Mágica 🖌️", min: 0, max: 100, step: 1, value: 50,
               caption: function (v) { return v < 35 ? "¡Mucho azul! La mezcla es azulada." : (v > 65 ? "¡Mucho amarillo! La mezcla es amarillenta." : "¡Mitad y mitad! Azul + Amarillo = VERDE 🟢"); } },
        game: { prompt: "Toca los 3 colores PRIMARIOS (los mágicos que no se pueden crear mezclando):", correct: ["🔴", "🔵", "🟡"], wrong: ["🟢", "🟣", "🟠", "🩷", "🤎", "⚪", "🩶", "⚫", "🩵"], goal: 3 },
        quiz: [
          { q: "¿Cuáles son los 3 colores mágicos llamados primarios?", options: ["🔴🔵🟡 Rojo, Azul y Amarillo", "🟢🩷🟣 Verde, Rosa y Morado", "⚪️🩶⬛️ Blanco y Negro"], answer: 0 },
          { q: "Si mezclas pintura Azul con Amarilla, ¿qué color obtienes?", options: ["🟢 Verde", "🔴 Rojo", "🤎 Marrón"], answer: 0 },
          { q: "¿Cómo se llaman los colores que nacen al mezclar dos primarios?", options: ["✨ Colores Secundarios", "🙈 Colores Ocultos", "🌙 Colores Oscuros"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Cada pigmento absorbe casi toda la luz y solo devuelve el suyo. Por eso mezclar pinturas SIEMPRE da un color un poco más oscuro; en cambio, mezclar luces (como en las pantallas) hace colores más brillantes."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Los diseñadores de autos, de moda y de videojuegos usan la rueda de colores para decidir combinaciones antes de gastar un solo tubo de pintura. Un buen diseño empieza eligiendo colores que hablen entre sí."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "En casa busca 3 objetos rojos, 3 azules y 3 amarillos. ¿Puedes encontrar un color de tu casa que NO se pueda crear mezclando solo esos tres? ¡Apuesta a que sí!"
          ,
          "image": "assets/img/deepdive/art-1.jpg"
        }
        ]

      },
      {
        id: "art-2", title: "Tipos de Líneas y la Magia de Joan Miró", icon: "〰️",
        phase1: "El famoso artista Joan Miró usaba líneas en sus pinturas para crear figuras fantásticas. La Línea Ondulada se mueve suavemente como las olas del mar, la Línea Recta es derecha como una regla y la Línea Zig-Zag sube y baja como dientes de sierra. Cuando juntas varias líneas y las cierras, ¡formas una figura geométrica!",
        videoId: "33RvJ4a1eJg", videoTitle: "Joan Miró, arte para niños", videoSearch: YOUTUBE_SEARCH("Joan Miró para niños"),
        lab: { type: "raster", label: "Pincel de Píxeles (Rasterización) 🖌️", min: 2, max: 22, step: 1, value: 10,
               caption: function (v) { return "Pincel de " + v + "px — recuerda: unir y cerrar líneas forma una figura geométrica 📐"; } },
        game: { prompt: "Toca las líneas de JOAN MIRÓ y las del mar (onduladas):", correct: ["〰️", "🌊", "➰"], wrong: ["📏", "⚡", "🧱", "🪵", "📐", "🔩"], goal: 3 },
        quiz: [
          { q: "¿Qué artista famoso usaba líneas y formas divertidas en sus pinturas?", options: ["🎨 Joan Miró", "🤖 Un Robot", "🐥 Pío"], answer: 0 },
          { q: "¿Qué línea se mueve suavemente como las olas del mar?", options: ["〰️ Línea Ondulada", "📏 Línea Recta", "⚡️ Línea Zig-Zag"], answer: 0 },
          { q: "¿Qué formas cuando juntas y cierras varias líneas?", options: ["📐 Una figura geométrica", "💨 Una nube de humo", "🧹 Un borrador"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Miró dibujaba como si fuera un juego, soñando despierto. Los psicólogos descubrieron que dibujar libre antes de pensar ayuda a resolver problemas: ¡hasta los matemáticos hacen bocetos desordenados primero!"
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Las líneas onduladas mandan en mapas de ríos, rutas de montaña rusa y logos de surf. La línea recta manda en planos de casas y rascacielos. El estilo de línea comunica la sensación antes de que leas una sola letra."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Toma una hoja y pinta una línea recta, una ondulada y una zig-zag… con los ojos casi cerrados. ¿Salieron como Miró o como un terremoto feliz? ¡Ambas valen!"
          ,
          "image": "assets/img/deepdive/art-2.jpg"
        }
        ]

      },
      {
        id: "art-3", title: "Esculturas 3D con Materiales Reciclados", icon: "♻️",
        phase1: "Para crear esculturas maravillosas no necesitas materiales caros. ¡Podemos cuidar el planeta usando materiales reciclados como tubos de cartón, cajas y tapas! Una escultura es un objeto de tres dimensiones (3D) porque la puedes tocar, mirar por delante, por detrás y por los lados.",
        videoId: "5BCrAdCwZu8", videoTitle: "Esculturas con material reciclado para niños", videoSearch: YOUTUBE_SEARCH("esculturas con material reciclado"),
        lab: { type: "tower", label: "Torre de Escultura Reciclada ♻️", min: 1, max: 12, step: 1, value: 7,
               caption: function (v) { return "Bloques apilados: " + v + " — tu escultura es 3D: ¡se puede tocar y mirar por todos lados! 👆"; } },
        game: { prompt: "Toca los materiales que RECICLARÍAS para una escultura:", correct: ["🧻", "📦", "🫙", "🥫", "♻️"], wrong: ["🔥", "🛍️", "🗑️", "💣"], goal: 4 },
        quiz: [
          { q: "¿Qué podemos usar para crear arte cuidando el planeta?", options: ["♻️ Materiales Reciclados", "🔥 Basura quemada", "🛍️ Plástico nuevo"], answer: 0 },
          { q: "¿Por qué una escultura es un objeto de tres dimensiones (3D)?", options: ["📦 Porque la puedes tocar y mirar por todos sus lados", "📄 Porque es plana como una hoja", "👻 Porque es invisible"], answer: 0 },
          { q: "¿Con qué herramienta podemos unir piezas de cartón para hacer un juguete?", options: ["🧪 Con pegamento o cinta adhesiva", "🥛 Con un vaso de agua", "💨 Con soplidos de aire"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Las esculturas tienen un centro de gravedad: el punto donde el peso queda en equilibrio. Los escultores lo calculan como los ingenieros: si el peso queda lejos de la base, la obra se cae."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "En el mundo hay museos de arte reciclado: ballenas hechas con chanclas en Brasil, peces gigantes con plástico de océano en Europa. El arte también es una forma de limpiar el planeta."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Mira tu cuarto como un escultor: ¿qué se convertirá en arte mañana? Cajas de cereal, tubos, tapas… ¡guárdalas una semana y diseña tu propia escultura!"
          ,
          "image": "assets/img/deepdive/art-3.jpg"
        }
        ]

      },
      {
        id: "art-4", title: "Luces, Sombras y Colores Cálidos vs. Fríos", icon: "🌗",
        phase1: "Los colores nos transmiten sensaciones de temperatura. El Rojo, Naranja y Amarillo son colores cálidos porque nos recuerdan al sol y al fuego. El Azul, Verde y Violeta son colores fríos porque nos recuerdan al hielo y al agua. Además, cuando la luz ilumina un objeto, del lado contrario se forma una sombra.",
        videoId: "h_IsAVN1ZCw", videoTitle: "Luz y sombra para niños", videoSearch: YOUTUBE_SEARCH("la luz y la sombra"),
        lab: { type: "lightangle", label: "Linterna Mágica de Colores 🔦", min: -60, max: 60, step: 1, value: 0,
               caption: function (v) { return "La luz viene desde " + (v < 0 ? "la izquierda" : v > 0 ? "la derecha" : "el centro") + " (" + v + "°) — ¡la sombra se forma del lado opuesto!"; } },
        game: { prompt: "Toca los colores CÁLIDOS (los que recuerdan al sol y al fuego):", correct: ["🔴", "🟠", "🟡", "🌞", "🔥"], wrong: ["🔵", "🟢", "🟣", "🧊", "🩵"], goal: 4 },
        quiz: [
          { q: "¿Qué colores son considerados cálidos porque nos recuerdan al sol?", options: ["☀️ Rojo, Naranja y Amarillo", "❄️ Azul y Violeta", "⬛️ Negro y Gris"], answer: 0 },
          { q: "¿Qué se forma en el lado opuesto de donde ilumina una linterna?", options: ["👤 Una Sombra", "🌈 Un Arcoíris", "💥 Una chispa"], answer: 0 },
          { q: "¿A qué nos recuerdan los colores fríos como el azul y el celeste?", options: ["🧊 Al hielo y al agua", "🔥 Al fuego hirviendo", "☀️ Al sol del mediodía"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Las sombras nunca son grises de verdad: toman prestado el azul del cielo. Los pintores impresionistas lo descubrieron hace 150 años y cambiaron la pintura para siempre: ¡hasta la sombra tiene color!"
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "En el cine, la luz cálida (naranja, dorada) hace sentir amor o nostalgia; la luz fría (azul, blanca) crea misterio o tecnología. Luz y color dirigen cómo te sientes sin que lo notes."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "A las 6 de la tarde pide permiso y mide tu sombra con una cinta. Luego compárala con la sombra del mediodía. ¿Cuál es más larga? El Sol nunca está quieto."
          ,
          "image": "assets/img/deepdive/art-4.jpg"
        }
        ]

      },
      {
        id: "art-5", title: "La Simetría en el Arte y la Naturaleza", icon: "🦋",
        phase1: "Decimos que un dibujo tiene simetría cuando trazas una línea por la mitad y ambos lados son exactamente iguales, como si fuera un espejo. La línea invisible que divide la figura en dos partes idénticas se llama eje de simetría. Un gran ejemplo de simetría en la naturaleza son las alas de una mariposa.",
        videoId: "jPU5bRKjiOA", videoTitle: "Simetría para niños", videoSearch: YOUTUBE_SEARCH("simetría para niños"),
        lab: { type: "symmetry", label: "Apertura de Alas Simétricas 🦋", min: 0, max: 100, step: 1, value: 60,
               caption: function (v) { return "Apertura: " + v + "% — el eje de simetría divide la mariposa en dos lados idénticos 🪞"; } },
        game: { prompt: "Toca las cosas que tienen SIMETRÍA (lados iguales como un espejo):", correct: ["🦋", "🌕", "❤️", "⭐"], wrong: ["🐍", "🪨", "🌊", "🍕"], goal: 4 },
        quiz: [
          { q: "¿Cuándo decimos que una figura tiene simetría?", options: ["🪞 Cuando ambos lados son exactamente iguales como un espejo", "🐘 Cuando un lado es gigante y otro enano", "🌀 Cuando no tiene forma"], answer: 0 },
          { q: "¿Cómo se llama la línea que divide una figura simétrica en dos partes iguales?", options: ["📏 Eje de simetría", "🧹 Línea borrada", "🔮 Círculo mágico"], answer: 0 },
          { q: "¿Qué animal de la naturaleza es un gran ejemplo de simetría en sus alas?", options: ["🦋 La Mariposa", "🐍 La serpiente enroscada", "🪨 Una piedra rugosa"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Tu cara es casi simétrica: dobla una foto tuya por la nariz y los lados se parecen muchísimo. Pero nadie es 100% simétrico… ¡y esa pequeñita diferencia es lo que te hace único!"
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Los ingenieros usan la simetría para que los aviones vuelen recto y los edificios resistan vientos fuertes. Los diseñadores de logos la usan porque tu cerebro recuerda más fácil lo simétrico."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Encuentra en tu cuarto 3 cosas con eje de simetría y 1 cosita totalmente asimétrica. Pista: tu peluche favorito probablemente no es simétrico. ¡Demuestra que Mago de los Espejos!"
          ,
          "image": "assets/img/deepdive/art-5.jpg"
        }
        ]

      }
    ],

    /* =====================================================================
     * 🔬 ISLA DE CIENCIAS
     * =================================================================== */
    science: [
      {
        id: "science-1", title: "La Fotosíntesis: La Cocina Secreta de las Plantas", icon: "🌿",
        phase1: "Las plantas fabrican su propio alimento mediante un proceso llamado Fotosíntesis. Para cocinar su comida necesitan 3 ingredientes principales: la luz del Sol, el agua de la tierra y el aire. Al cocinar su alimento, las plantas liberan un gas maravilloso llamado Oxígeno, que es el gas que todos los seres vivos necesitamos para respirar.",
        videoId: "mtGgo68VM54", videoTitle: "La fotosíntesis de las plantas", videoSearch: YOUTUBE_SEARCH("fotosíntesis para niños"),
        lab: { type: "sunlight", label: "Sol Power: Motor de la Fotosíntesis ☀️", min: 0, max: 100, step: 1, value: 70,
               caption: function (v) { return "Luz solar: " + v + "% — " + (v < 30 ? "¡la planta tiene hambre! Más sol, por favor 🌥️" : "¡La planta cocina y libera Oxígeno! 💨"); } },
        game: { prompt: "Toca los 3 INGREDIENTES que la planta necesita para cocinar:", correct: ["☀️", "💧", "🌬️", "🌱"], wrong: ["🍬", "🚗", "❄️", "🍪", "🥤"], goal: 3 },
        quiz: [
          { q: "¿Cómo se llama el proceso por el cual las plantas fabrican su propio alimento?", options: ["🌱 Fotosíntesis", "🌬️ Respiración", "🍎 Digestión"], answer: 0 },
          { q: "¿Cuáles son los 3 ingredientes que necesita la planta para hacer fotosíntesis?", options: ["☀️💧🌬️ Luz del Sol, Agua y Aire", "🍬🥤🍪 Caramelos y Soda", "❄️🌑 Hielo y Oscuridad"], answer: 0 },
          { q: "¿Qué gas tan importante nos regalan las plantas para poder respirar?", options: ["💨 Oxígeno", "🔥 Vapor picante", "🚗 Humo de carro"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "El verde de las hojas se llama clorofila y trabaja como un panel solar: captura la luz y la convierte en energía química. ¡Las plantas son centrales energéticas hechas de hojas!"
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Los científicos construyen 'hojas artificiales' que imitan la fotosíntesis para fabricar combustible limpio. Cada desayuno que comes empezó como luz solar guardada por una planta."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Con permiso, tapa una hoja pequeña con cinta negra una semana entera. ¿Qué le pasó a la parte tapada cuando la descubriste? La planta necesita luz como tú necesitas comer."
          ,
          "image": "assets/img/deepdive/science-1.jpg"
        }
        ]

      },
      {
        id: "science-2", title: "Patrones en la Naturaleza: El Árbol Fractal", icon: "🌳",
        phase1: "En la naturaleza existen patrones mágicos llamados Fractales. Un fractal es una forma que se repite exactamente igual en tamaño grande y en tamaño pequeño. Puedes ver fractales en los árboles: una rama pequeña tiene la misma forma que una rama mediana y que el tronco entero. ¡También podemos ver fractales en las verduras como el brócoli!",
        videoId: "84p_QKUhY5g", videoTitle: "Fractales en la naturaleza para niños", videoSearch: YOUTUBE_SEARCH("fractales naturaleza brócoli"),
        lab: { type: "lsystem", label: "Crecimiento Procedural (L-System) 🌳", min: 1, max: 3, step: 1, value: 2,
               caption: function (v) { return "Iteración L-System n=" + v + " — F → FF+[+F-F-F]-[-F+F+F] (una forma que se repite a toda escala)"; } },
        game: { prompt: "Toca las cosas que muestran un patrón FRACTAL (se repite en grande y pequeño):", correct: ["🌳", "🥦", "🌿", "❄️"], wrong: ["🪨", "🚗", "📄", "🪁"], goal: 3 },
        quiz: [
          { q: "¿Qué es un patrón fractal en la naturaleza?", options: ["🌳 Una forma que se repite en tamaño grande y pequeño", "🪨 Una piedra lisa", "👻 Un dibujo que se borra"], answer: 0 },
          { q: "¿En qué verdura de la cocina podemos ver claramente un patrón fractal?", options: ["🥦 En el Brócoli", "🥔 En la Papa", "🥚 En el Huevo"], answer: 0 },
          { q: "¿Qué parte del árbol tiene la misma forma repetida que el tronco principal?", options: ["🌿 Las ramas", "🦶 Las raíces bajo tierra", "❌ Ninguna parte"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Los matemáticos usan fractales para comprimir fotos: en vez de guardar cada punto, guardan patrones que se repiten. Así caben miles de fotos en tu teléfono sin pesar una tonelada."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Los médicos leen los pulmones en rayos X observando patrones fractales: las ramas del árbol bronquial crecen igualito que un árbol fractal. ¡Tu cuerpo también es un fractal!"
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Dibuja un árbol: un tronco, dos brazos, y cada rama se divide en dos más chiquitas. Repite 4 veces. Cuenta las puntitas… ¡acabas de programar un fractal a mano!"
          ,
          "image": "assets/img/deepdive/science-2.jpg"
        }
        ]

      },
      {
        id: "science-3", title: "El Ciclo del Agua: La Aventura de una Gotita", icon: "💧",
        phase1: "El agua de la Tierra nunca desaparece, viaja en un ciclo infinito llamado Ciclo del Agua. Cuando el Sol calienta el mar, el agua sube al cielo como vapor en un proceso llamado Evaporación. Arriba se enfría y forma las nubes (Condensación). Finalmente, cuando las nubes están muy pesadas, el agua cae a la tierra como lluvia (Precipitación).",
        videoId: "3QVj99UGk3Q", videoTitle: "El ciclo del agua para niños", videoSearch: YOUTUBE_SEARCH("ciclo del agua para niños"),
        lab: { type: "watercycle", label: "Temperatura del Ciclo del Agua 🌡️", min: 0, max: 100, step: 1, value: 55,
               caption: function (v) { return "Temperatura: " + v + "° — " + (v < 33 ? "Estado: SÓLIDO 🧊 (hielo)" : (v < 66 ? "Estado: LÍQUIDO 💧 (en el vaso)" : "Estado: GAS 💨 ¡evaporándose!")); } },
        game: { prompt: "Toca las etapas del CICLO DEL AGUA en orden mágico:", correct: ["💨", "☁️", "🌧️", "🌊"], wrong: ["🔥", "❄️", "🪨", "🌵"], goal: 4 },
        quiz: [
          { q: "¿Cómo se llama cuando el Sol calienta el agua del mar y esta sube al cielo como vapor?", options: ["💨 Evaporación", "❄️ Congelación", "💥 Explosión"], answer: 0 },
          { q: "¿De qué están hechas las nubes que se forman en la condensación?", options: ["☁️ De gotitas de agua helada en el cielo", "🍧 De algodón de azúcar", "🏭 De humo de chimenea"], answer: 0 },
          { q: "¿Cómo llamamos al momento en que el agua cae de las nubes en forma de lluvia?", options: ["🌧️ Precipitación", "🫠 Derretimiento", "🔥 Calentamiento"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Solo el 3% del agua del planeta es dulce, y la mayoría está congelada en los polos. La gota que bebes hoy ya fue bebida por dinosaurios, faraones y tatarabuelos. ¡El agua nunca se gasta, solo viaja!"
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "En los desiertos del mundo los ingenieros instalan 'atrapadores de niebla': redes gigantes que convierten la nube en agua potable. La idea la copiaron de un escarabajo del desierto."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Pon un vaso con hielos en el borde de la ventana y otro en la sombra. ¿En cuál se llena de gotitas afuera primero? Observa 10 minutos y cuenta las gotas."
          ,
          "image": "assets/img/deepdive/science-3.jpg"
        }
        ]

      },
      {
        id: "science-4", title: "Los Estados de la Materia: Sólido, Líquido y Gas", icon: "🧊",
        phase1: "Todas las cosas que nos rodean están hechas de materia y pueden cambiar según la temperatura. El agua se encuentra en 3 estados: es Sólida cuando está dura como un cubo de hielo, es Líquida cuando la tomamos en un vaso y se vuelve Gas (vapor) cuando hierve en una olla caliente.",
        videoId: "fxDKpEYAoSE", videoTitle: "Estados de la materia para niños", videoSearch: YOUTUBE_SEARCH("estados de la materia"),
        lab: { type: "watercycle", label: "Máquina de Cambiar la Materia 🧪", min: 0, max: 100, step: 1, value: 50,
               caption: function (v) { return "Temperatura: " + v + "° — " + (v < 33 ? "SÓLIDO 🧊 duro como el hielo" : (v < 66 ? "LÍQUIDO 💧 como el agua del vaso" : "GAS 💨 como el vapor de la olla")); } },
        game: { prompt: "Toca las cosas que están en estado SÓLIDO (duras, se pueden tocar):", correct: ["🧊", "🪨", "📕", "🪑"], wrong: ["💧", "☁️", "💨", "🥤"], goal: 4 },
        quiz: [
          { q: "¿En qué estado se encuentra un cubo de hielo duro?", options: ["🧊 Estado Sólido", "💧 Estado Líquido", "💨 Estado Gas"], answer: 0 },
          { q: "Si dejas un helado bajo el sol y se vuelve un charco, ¿a qué estado pasó?", options: ["💧 Estado Líquido", "🧊 Estado Sólido", "🪨 Estado Piedra"], answer: 0 },
          { q: "¿En qué estado se encuentra el vapor que sale de una olla de agua hirviendo?", options: ["💨 Estado Gas", "🧊 Estado Sólido", "🔩 Estado Duro"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Existe un cuarto estado que no enseñan mucho: el plasma, un gas súper caliente hecho de partículas con carga eléctrica. Los rayos, el Sol y hasta los letreros de neón ¡son plasma!"
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Los científicos usan nitrógeno líquido, a -196 grados, para congelar al instante helados, sangre para hospitales e incluso flores enteras. El frío extremo también es tecnología."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Pon un vaso de agua en el congelador con una moneda encima. Al día siguiente: ¿la moneda flotó o se hundió? El agua se EXPANDE al congelarse, y por eso flota en tu vaso."
          ,
          "image": "assets/img/deepdive/science-4.jpg"
        }
        ]

      },
      {
        id: "science-5", title: "El Sistema Solar y la Tierra", icon: "🪐",
        phase1: "Vivimos en un planeta llamado Tierra, el cual gira alrededor de una estrella gigante de fuego llamada Sol. La Tierra tarda un año entero en dar una vuelta completa alrededor del Sol. Además, la Tierra gira sobre sí misma como un trompo en un movimiento llamado Rotación, lo que genera el Día (cuando miramos al Sol) y la Noche (cuando quedamos de espaldas a él).",
        videoId: "3bm7weYMeJU", videoTitle: "El sistema solar para niños", videoSearch: YOUTUBE_SEARCH("sistema solar para niños"),
        lab: { type: "orbit", label: "Velocidad del Tiempo en el Espacio 🚀", min: 1, max: 12, step: 1, value: 4,
               caption: function (v) { return "Tiempo: " + v + "x — la Tierra gira sobre sí misma (rotación) y da la vuelta al Sol en un año"; } },
        game: { prompt: "Toca los cuerpos que viven en nuestro SISTEMA SOLAR:", correct: ["☀️", "🌍", "🌙", "🪐", "⭐"], wrong: ["🌧️", "🌈", "☁️", "🦆"], goal: 4 },
        quiz: [
          { q: "¿Cómo se llama la estrella gigante de fuego que le da luz y calor a la Tierra?", options: ["☀️ El Sol", "🌙 La Luna", "☄️ Un Cometa"], answer: 0 },
          { q: "¿Cómo se llama el movimiento de la Tierra girando sobre sí misma que crea el Día y la Noche?", options: ["🔄 Rotación", "🤸 Salto", "🛑 Detención"], answer: 0 },
          { q: "¿Qué parte del planeta está de Noche?", options: ["🌌 La parte que queda de espaldas al Sol", "☀️ La parte que mira directo al Sol", "🌍 Todo el planeta a la vez"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Si el Sol fuera un balón de fútbol, la Tierra sería un grano de arena a 30 pasos de distancia. El espacio es TAN grande que casi todo es vacío. ¡Cada punto de estrellita es un sol como el nuestro!"
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Los astronautas de la Estación Espacial Internacional ven 16 amaneceres cada día porque le dan la vuelta a la Tierra cada 90 minutos. Allá arriba, ¡la hora del almuerzo dura minutos!"
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Esta noche y las siguientes, busca la Luna a la misma hora. Cada noche aparece unos 50 minutos más tarde. Los astrónomos antiguos usaban ese retraso para medir los meses."
          ,
          "image": "assets/img/deepdive/science-5.jpg"
        }
        ]

      }
    ],

    /* =====================================================================
     * 📐 ISLA DE MATEMÁTICAS
     * =================================================================== */
    math: [
      {
        id: "math-1", title: "El Reino de las Figuras 3D (Cuerpos Geométricos)", icon: "⚽",
        phase1: "Las figuras planas son delgadas como una hoja de papel, pero los cuerpos geométricos 3D tienen volumen y ocupan un lugar en el espacio. Una pelota de fútbol tiene forma de Esfera. Un dado de juego tiene forma de Cubo y está formado por 6 caras cuadradas idénticas.",
        videoId: "bkzLaCfaPLg", videoTitle: "Figuras 3D para niños", videoSearch: YOUTUBE_SEARCH("cuerpos geométricos para niños"),
        lab: { type: "shapes", label: "Galería de Cuerpos 3D 📦", min: 0, max: 3, step: 1, value: 0,
               caption: function (v) { return ["⚽ Esfera — igual por todos lados, como la pelota", "🎲 Cubo — 6 caras cuadradas idénticas, como el dado", "🔺 Cono — base redonda y punta arriba, como el cucurucho", "🥫 Cilindro — 2 círculos y un costado curvo, como la lata"][v] || ""; } },
        game: { prompt: "Toca los objetos con forma de ESFERA (redonditos como pelota):", correct: ["⚽", "🏀", "🌍", "🍊"], wrong: ["🎲", "📦", "🔺", "🥫"], goal: 4 },
        quiz: [
          { q: "¿Qué cuerpo geométrico 3D tiene la forma perfecta de una pelota de fútbol?", options: ["⚽️ Esfera", "🎲 Cubo", "🔺 Triángulo plano"], answer: 0 },
          { q: "¿Cuántas caras cuadradas iguales tiene un cubo de juguete?", options: ["6️⃣ 6 caras", "2️⃣ 2 caras", "🔟 10 caras"], answer: 0 },
          { q: "¿Qué diferencia tiene un cuerpo geométrico 3D frente a un dibujo plano en papel?", options: ["📦 Tiene volumen y se puede sostener en las manos", "👻 Es invisible", "❌ No tiene forma"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Las abejas construyen panales hexagonales porque, entre todas las formas planas, el hexágono guarda más miel usando menos cera. Las abejas son ingenieras que no usan papel ni lápiz."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Los videojuegos dibujan dragones y castillos con 'mallas' de millones de triángulos. Tu juego favorito es geometría pura disfrazada de aventura."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Mira una lata, una pelota y un dado. ¿Cuántos vértices (esquinas) tiene cada uno? La pelota te hace trampa: ¡no tiene ninguna! Cuenten con el dedo."
          ,
          "image": "assets/img/deepdive/math-1.jpg"
        }
        ]

      },
      {
        id: "math-2", title: "La Balanza de Sumas y Restas", icon: "⚖️",
        phase1: "La Suma significa juntar o agregar objetos para tener una cantidad mayor, mientras que la Resta significa quitar o buscar lo que falta. Para que una balanza se mantenga recta y equilibrada, la cantidad total de peso en el lado izquierdo debe ser igual a la cantidad total del lado derecho.",
        videoId: "Sa_3MIlJwPs", videoTitle: "Sumas y restas con balanza para niños", videoSearch: YOUTUBE_SEARCH("suma y resta con balanza"),
        lab: { type: "balance", label: "Balanza del Equilibrio ⚖️", min: 0, max: 10, step: 1, value: 5,
               caption: function (v) { return v === 5 ? "¡EQUILIBRIO perfecto! 5 = 5 ✨" : (v < 5 ? "Izquierda más liviana… ¡agrega bloques! (izquierda = " + v + ")" : "Izquierda más pesada… ¡quita bloques! (izquierda = " + v + ")"); } },
        game: { prompt: "Toca los signos y acciones de SUMAR (juntar o agregar):", correct: ["➕", "🍎", "🧮", "🫴"], wrong: ["➖", "✂️", "🗑️", "🧹"], goal: 3 },
        quiz: [
          { q: "¿Qué hacemos cuando realizamos una Suma?", options: ["➕ Juntamos o agregamos objetos para tener más", "➖ Quitamos objetos", "🧹 Borramos los números"], answer: 0 },
          { q: "Si en una balanza pones un bloque de 8 a la izquierda, ¿qué números debes sumar a la derecha para equilibrarla?", options: ["⚖️ 5 + 3", "1 + 1", "10 + 10"], answer: 0 },
          { q: "Si tienes 7 manzanas en una canasta y te comes 2, ¿cuántas manzanas te quedan?", options: ["🍎 5 manzanas", "9 manzanas", "0 manzanas"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Las ecuaciones son balanzas con letras misteriosas: cuando ves 2x + 3 = 11, la x es una pesa escondida. Las matemáticas viven equilibrando cosas todo el día."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Las balanzas electrónicas del supermercado pesan más de mil veces por segundo y calculan el precio exacto. Cuando compras fruta, estás usando sumas y restas en acción."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Construye una mini balanza con una regla, un lápiz y dos vasitos colgados con cuerda. Equilibra monedas contra canicas. ¡Ingeniería y sumas con materiales de tu casa!"
          ,
          "image": "assets/img/deepdive/math-2.jpg"
        }
        ]

      },
      {
        id: "math-3", title: "Patrones Secuenciales: El Tren de las Formas", icon: "🚃",
        phase1: "Un Patrón es una regla o secuencia de figuras y colores que se repiten siempre en el mismo orden. Por ejemplo, si ves la serie: [🔴 Círculo Rojo, 🟦 Cubo Azul, 🔴 Círculo Rojo], sabrás que la figura que sigue por regla es el 🟦 Cubo Azul.",
        videoId: "1V2d6I9JBK0", videoTitle: "Patrones matemáticos para niños", videoSearch: YOUTUBE_SEARCH("patrones matemáticas para niños"),
        lab: { type: "pattern", label: "El Tren de los Patrones 🚂", min: 2, max: 8, step: 1, value: 5,
               caption: function (v) { return "Vagones visibles: " + v + " — recuerda la regla: Rojo, Azul, Rojo, Azul… ¡el que sigue es AZUL! 🔵"; } },
        game: { prompt: "Toca las secuencias que son PATRONES (se repiten en orden):", correct: ["🔴🔵🔴🔵", "⭐🌙⭐🌙", "🍎🍐🍎🍐"], wrong: ["🔴🟢🟡🟣", "🌀💭❓", "🍌🍎🍇🥦"], goal: 3 },
        quiz: [
          { q: "¿Qué es un patrón en matemáticas?", options: ["🔄 Una secuencia de figuras o colores que se repite en orden", "💭 Un número imaginario", "🌀 Un dibujo desordenado"], answer: 0 },
          { q: "En la secuencia [🟡 Estrella, 🟩 Triángulo, 🟡 Estrella, ___], ¿qué figura falta?", options: ["🟩 Triángulo", "🟡 Estrella", "🔴 Círculo"], answer: 0 },
          { q: "Si la secuencia de colores es [Azul, Amarillo, Azul, Amarillo], ¿qué color sigue?", options: ["💙 Azul", "💛 Amarillo", "❤️ Rojo"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Los patrones son la música de las matemáticas: tu corazón late en patrón, las olas rompen en patrón y las luces de Navidad se encienden siguiendo un ritmo exacto. Todo el universo repite reglas."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Los programadores usan patrones para cazar errores: si el orden del código se rompe, algo falló. Los músicos usan el mismo truco para componer canciones que tu cabeza memoriza."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Inventa un patrón con palmas y chasquidos. Enséñaselo a tu familia y pídeles que lo continúen sin ayuda. Si lo logran, tu cerebro fue claro como un algoritmo."
          ,
          "image": "assets/img/deepdive/math-3.jpg"
        }
        ]

      },
      {
        id: "math-4", title: "Fracciones Divertidas con Pizzas y Pasteles", icon: "🍕",
        phase1: "Usamos las Fracciones para nombrar las partes de un objeto entero que fue dividido en partes exactamente iguales. Si cortas una pizza por la mitad en 2 partes iguales, cada parte se llama Un Medio (1/2). Si la cortas en 4 partes iguales y te comes 1 pedazo, te has comido Un Cuarto (1/4).",
        videoId: "eW9oPLZiyuI", videoTitle: "Las fracciones con pizza para niños", videoSearch: YOUTUBE_SEARCH("fracciones pizza para niños"),
        lab: { type: "pizza", label: "Pizzería de las Fracciones 🍕", min: 2, max: 8, step: 1, value: 4,
               caption: function (v) { var names = {2:"UN MEDIO (1/2)",3:"UN TERCIO (1/3)",4:"UN CUARTO (1/4)",6:"UN SEXTO (1/6)",8:"UN OCTAVO (1/8)"}; return "Pizza cortada en " + v + " partes iguales — 1 pedazo = " + (names[v] || ("1/" + v)); } },
        game: { prompt: "Toca las pizzas cortadas en partes EXACTAMENTE IGUALES (fracción correcta):", correct: ["🍕", "🎂", "🍫"], wrong: ["🪨", "🧻", "👟"], goal: 3 },
        quiz: [
          { q: "Para poder usar fracciones, ¿cómo deben ser los pedazos en que dividimos un objeto?", options: ["📏 Exactamente iguales en tamaño", "🐘 Un pedazo gigante y uno chiquito", "🎨 De colores diferentes"], answer: 0 },
          { q: "Si divides una pizza entera en 2 partes iguales, ¿cómo se llama cada pedazo?", options: ["🍕 Un Medio (1/2)", "🎂 Un Entero", "💯 Un Ciento"], answer: 0 },
          { q: "Si cortas un pastel en 4 partes iguales y tomas 1 pedazo, ¿qué fracción tienes?", options: ["🍰 Un Cuarto (1/4)", "🎂 Todo el pastel", "🌓 La mitad"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Los antiguos egipcios, hace 4,000 años, solo usaban fracciones con el número 1 arriba: como 1/2 y 1/4. Con fracciones 'de uno' construyeron las pirámides y administraron sus cosechas."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Toda receta de cocina es un concierto de fracciones: una y media tazas de harina, un cuarto de cucharadita de sal. Un cocinero sin fracciones hace tortas tristes."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Divide una barra de chocolate con un hermano: ¿cómo repartirla justo si tú eliges primero? ¡Las fracciones también deciden la paz en casa!"
          ,
          "image": "assets/img/deepdive/math-4.jpg"
        }
        ]

      },
      {
        id: "math-5", title: "Unidades de Medida: El Metro y la Regla", icon: "📏",
        phase1: "Para saber el tamaño exacto de las cosas sin equivocarnos usamos unidades de medida oficiales. Para medir objetos pequeños en la escuela como lápices y cuadernos usamos los Centímetros (cm) con la regla. Para medir objetos más grandes como la altura de un árbol o el largo de un salón usamos el Metro (m). ¡Un Metro contiene 100 Centímetros!",
        videoId: "fVpNttaBELE", videoTitle: "El metro y el centímetro para niños", videoSearch: YOUTUBE_SEARCH("el metro y el centímetro"),
        lab: { type: "ruler", label: "Taller de Medidas 📏", min: 5, max: 100, step: 1, value: 15,
               caption: function (v) { return "Largo: " + v + " cm — " + (v >= 100 ? "¡Eso es 1 METRO! (100 cm = 1 m) 🌳" : "Usa la regla 📏 para cosas chicas, el metro para cosas grandes"); } },
        game: { prompt: "Toca las cosas que medirías con una REGLA (centimetros, cosas pequeñas):", correct: ["✏️", "📓", "📎", "🖍️"], wrong: ["🚌", "🌳", "🏫", "🌉"], goal: 4 },
        quiz: [
          { q: "¿Qué unidad de medida usamos en la escuela para medir objetos pequeños con una regla?", options: ["📏 Centímetros (cm)", "👣 Pasos gigantes", "⚖️ Kilogramos"], answer: 0 },
          { q: "¿Cuántos centímetros se necesitan para formar 1 Metro entero?", options: ["💯 100 centímetros", "🔟 10 centímetros", "2️⃣ 2 centímetros"], answer: 0 },
          { q: "¿Qué herramienta o unidad conviene usar para medir el largo de un autobús escolar?", options: ["🚌 El Metro (m)", "📏 Una regla diminuta de 5 cm", "🥛 Un vaso de agua"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Antes del metro nadie se ponía de acuerdo: cada pueblo tenía su propia pulgada, pie o codo. En 1793 se inventó el metro a partir del tamaño de la Tierra, ¡para que todos midieran igual!"
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Para las estrellas usamos el año luz: la distancia que la luz viaja en un año, ¡unos 9 mil 460 billones de kilómetros! Con centímetros, las estrellas estarían imposibles de medir."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Mide tu altura en centímetros y pásala a metros. Luego mide el sofá 'pasos de puntillas' y conviértelas a centímetros. ¿Por qué tu paso no sirve de unidad oficial?"
          ,
          "image": "assets/img/deepdive/math-5.jpg"
        }
        ]

      }
    ],

    /* =====================================================================
     * 🤖 ISLA DE TECNOLOGÍA
     * =================================================================== */
    technology: [
      {
        id: "technology-1", title: "Animación y Transformación 3D (Morphing)", icon: "🔮",
        phase1: "En los videojuegos y películas animadas, los objetos pueden cambiar de forma en la computadora. A esta transformación suave entre dos figuras se le llama Morphing. La computadora logra el Morphing moviendo miles de puntitos invisibles llamados vértices. Así, una esfera suave puede mover sus vértices hasta convertirse en la cabeza de un robot.",
        videoId: "S4skNFo5x3M", videoTitle: "Morphing 3D en animación", videoSearch: YOUTUBE_SEARCH("morphing animación 3D"),
        lab: { type: "morph", label: "Morphing en Vivo: Esfera ↔ Cubo 🔮", min: 0, max: 100, step: 1, value: 50,
               caption: function (v) { return "Influencia Morph Target: " + (v / 100).toFixed(2) + " — la GPU interpola los 625 vértices en tiempo real"; } },
        game: { prompt: "Toca las cosas donde se usa MORPHING y animación 3D:", correct: ["🎬", "🎮", "🤖", "👾"], wrong: ["📝", "🪨", "📰", "🧹"], goal: 4 },
        quiz: [
          { q: "¿Cómo se le llama en computación a la transformación suave entre dos figuras 3D?", options: ["🔮 Morphing", "❄️ Congelación", "✂️ Recorte de papel"], answer: 0 },
          { q: "¿Qué puntitos invisibles mueve la computadora para cambiar la forma de un objeto?", options: ["📍 Vértices", "🔘 Botones", "🔌 Cables"], answer: 0 },
          { q: "¿Dónde se utiliza la técnica de Morphing y animación 3D?", options: ["🎬 En videojuegos y películas animadas", "📝 En cuadernos de papel", "🪨 En pizarras de tiza"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "El Morphing funciona dibujando cientos de imágenes intermedias entre dos formas; tu ojo solo ve la última y la primera. Es pura ilusión óptica bien calculada, como los dibujitos animados clásicos."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Los dentistas usan morphing para mostrarte cómo crecerá tu sonrisa con brackets: mezclan en una pantalla tu cara de hoy con tu cara del futuro. ¡Tu rostro es el antes y el después!"
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Dibuja un círculo en una hoja y un cuadrado en otra. En dos hojas del medio, dibuja formas que se parezcan a ambas. ¡Acabas de programar morphing a mano!"
          ,
          "image": "assets/img/deepdive/technology-1.jpg"
        }
        ]

      },
      {
        id: "technology-2", title: "El Mundo de los Pixeles: Los Puntitos de Luz", icon: "📺",
        phase1: "Las pantallas de los televisores, celulares y computadoras forman sus imágenes mediante millones de cuadritos de luz diminutos llamados Pixeles. Cada pixel se enciende combinando 3 colores de luz principales: Rojo, Verde y Azul (llamado sistema RGB). Cuando juntamos miles de pixeles coloreados, ¡vemos las fotos y los juegos completos!",
        videoId: "TixItVN04vw", videoTitle: "¿Qué es un pixel? Para niños", videoSearch: YOUTUBE_SEARCH("qué es un pixel"),
        lab: { type: "pixels", label: "Cuadrícula RGB en Vivo 🔴🟢🔵", min: 2, max: 12, step: 1, value: 6,
               caption: function (v) { return "Resolución: " + v + "×" + v + " = " + (v * v) + " píxeles — cada uno mezcla Luz Roja + Verde + Azul (RGB)"; } },
        game: { prompt: "Toca los 3 colores de luz del sistema RGB:", correct: ["🔴", "🟢", "🔵"], wrong: ["🟡", "🟠", "🟣", "⚪", "🩷", "🤎"], goal: 3 },
        quiz: [
          { q: "¿De qué están compuestas las imágenes que vemos en las pantallas digitales?", options: ["📺 De cuadritos de luz llamados Pixeles", "🎨 De gotas de pintura fresca", "🧶 De hilos de lana"], answer: 0 },
          { q: "¿Cuáles son los 3 colores de luz que usan los pixeles de las pantallas (sistema RGB)?", options: ["🔴🟢🔵 Rojo, Verde y Azul", "🟡🩷🤎 Amarillo, Rosa y Marrón", "⚪️🩶⬛️ Blanco, Gris y Negro"], answer: 0 },
          { q: "Si miras una pantalla muy de cerca con una lupa, ¿qué verás en la imagen?", options: ["🔍 Muchísimos pixeles de colores juntos", "✏️ Un dibujo hecho con lápiz", "💧 Agua líquida"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Una foto normal de celular mide unos 12 millones de píxeles. Cada píxel tiene 3 subpíxeles de luz (rojo, verde y azul): ¡tu dedo se desliza sobre 36 millones de linternitas encendidas!"
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Las pantallas OLED apagan por completo el color negro, por eso una imagen oscura gasta mucho menos batería. Bajar el brillo por la noche protege tus ojos Y la Tierra."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Con permiso y sin tocar la pantalla, acércala a una lupa: verás el rojo, verde y azul separados como tres luces chiquitas. Cuenta cuántos caben en una sola letra."
          ,
          "image": "assets/img/deepdive/technology-2.jpg"
        }
        ]

      },
      {
        id: "technology-3", title: "Programación: Instrucciones para el Robot", icon: "🤖",
        phase1: "Un robot no puede pensar por sí solo. Para que pueda moverse necesita que un programador humano le dé una lista de instrucciones claras en orden paso a paso. A esta lista de instrucciones para resolver una tarea se le llama Algoritmo. Si le das la instrucción correcta, ¡el robot la obedecerá exactamente!",
        videoId: "kEsbHnlrh2Y", videoTitle: "¿Qué es un algoritmo? Programación para niños", videoSearch: YOUTUBE_SEARCH("algoritmo programación para niños"),
        lab: { type: "robot", label: "Ejecutor de Algoritmos 🤖", min: 0, max: 6, step: 1, value: 3,
               caption: function (v) { return "Instrucciones ejecutadas: " + v + " / 6 — un algoritmo es una lista de pasos EN ORDEN 📋"; } },
        game: { prompt: "Toca las cosas que SÍ son algoritmos (instrucciones ordenadas paso a paso):", correct: ["📋", "👟👟👟", "🍰📋", "🤖➡️"], wrong: ["💭", "🎲", "🌀", "💤"], goal: 3 },
        quiz: [
          { q: "¿Qué es un Algoritmo en programación?", options: ["📋 Una lista de instrucciones ordenadas paso a paso", "⚙️ Una pieza de metal", "📺 Una pantalla rota"], answer: 0 },
          { q: "¿Quién le enseña al robot lo que debe hacer mediante código?", options: ["🧑‍💻 El programador humano", "🤖 El robot se enseña a sí mismo", "📺 La televisión"], answer: 0 },
          { q: "Si quieres que el robot camine hacia adelante, ¿qué debes darle?", options: ["💬 Una instrucción o comando claro", "🧃 Un vaso de jugo", "❓ Nada, adivina solo"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Cuando buscas en internet, un algoritmo propone páginas usando más de 200 pistas distintas… y lo resuelve en milésimas de segundo. Tu buscador favorito es la receta más detallada del mundo."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Los algoritmos eligen qué video te sugieren, qué canción suena después y qué ruta toma el taxi. Todo es una receta de pasos en orden… y a veces la receta adivina mejor que tu memoria."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Escribe el algoritmo para atarte los zapatos con los ojos cerrados. Luego pídele a alguien que lo ejecute como un robot. ¿Logró terminar? Los bugs pasan en casa también."
          ,
          "image": "assets/img/deepdive/technology-3.jpg"
        }
        ]

      },
      {
        id: "technology-4", title: "Los Sensores: Los Sentidos de los Robots", icon: "📡",
        phase1: "Los seres humanos usamos los ojos, los oídos y las manos para percibir el mundo. Los robots usan componentes electrónicos llamados Sensores. Un Sensor de Proximidad ayuda al robot a medir la distancia para no chocar contra las paredes, y un Sensor de Luz le indica cuándo encender sus faros si se hace de noche.",
        videoId: "Hoyja_tjgrQ", videoTitle: "Sensores de robots para niños", videoSearch: YOUTUBE_SEARCH("sensores de robots"),
        lab: { type: "proximity", label: "Sensor de Proximidad en Vivo 📡", min: 5, max: 100, step: 1, value: 60,
               caption: function (v) { return "Distancia al obstáculo: " + v + " cm — " + (v < 30 ? "¡ALTO! Obstáculo muy cerca 🔴" : (v < 60 ? "Precaución, se acerca 🟡" : "Camino libre 🟢")); } },
        game: { prompt: "Toca los SENSORES que usan los robots para percibir el mundo:", correct: ["📡", "👁️", "🎤", "🖐️"], wrong: ["🛞", "🔩", "🔋", "💡"], goal: 4 },
        quiz: [
          { q: "¿Con qué componentes electrónicos sienten los robots lo que hay a su alrededor?", options: ["📡 Con Sensores", "🛞 Con las llantas", "🔩 Con los tornillos"], answer: 0 },
          { q: "¿Para qué sirve un Sensor de Proximidad en un auto inteligente?", options: ["🛑 Para medir la distancia y evitar chocar contra obstáculos", "🎨 Para cambiar el color de la pintura", "🎵 Para reproducir música"], answer: 0 },
          { q: "¿Qué hace un sensor de luz cuando se vuelve oscuro?", options: ["💡 Detecta la falta de luz y manda la orden de encender los faros", "🛞 Apaga las ruedas", "🧠 Borra la memoria"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Un sensor es un traductor: convierte algo del mundo (calor, luz, toque) en números que la máquina entiende. Sin esos traductores, los robots estarían ciegos, sordos y congelados."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Tu teléfono carga más de 10 sensores: giroscopio (sabe cómo lo inclinas), acelerómetro (sabe si te caes), barómetro (mide el aire). ¡Es una nave espacial en tu bolsillo!"
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Cierra los ojos. Que un amigo acerque su mano a la tuya sin tocarte. ¿Puedes sentir la brisa de su cercanía? Los insectos perciben ese mismo aire con sus antenas."
          ,
          "image": "assets/img/deepdive/technology-4.jpg"
        }
        ]

      },
      {
        id: "technology-5", title: "Realidad Virtual y Entornos Web 3D", icon: "🥽",
        phase1: "Mediante la tecnología y el lenguaje gráfico WebGL, los ingenieros pueden construir Mundos Virtuales en 3D dentro del navegador de internet. Esto nos permite explorar laboratorios, islas y parques temáticos educativos desde la computadora sin importar en qué parte del mundo te encuentres.",
        videoId: "8eTMtKlbKeI", videoTitle: "Realidad virtual para niños", videoSearch: YOUTUBE_SEARCH("realidad virtual para niños"),
        lab: { type: "lod", label: "Detalle 3D en Vivo (LOD) 🥽", min: 0, max: 4, step: 1, value: 2,
               caption: function (v) { return "Nivel de detalle LOD " + v + " — más vértices = más suave, pero más pesado para la GPU ⚡"; } },
        game: { prompt: "Toca las cosas que son MUNDOS VIRTUALES 3D que puedes explorar:", correct: ["🎮", "🌐", "🏝️", "🥽"], wrong: ["📄", "🖼️", "📰", "✉️"], goal: 4 },
        quiz: [
          { q: "¿Qué es un Entorno Virtual 3D en la computadora?", options: ["🌐 Un mundo tridimensional interactivo que puedes explorar", "📄 Una hoja de papel impresa", "🖼️ Una foto fija que no se mueve"], answer: 0 },
          { q: "¿Qué nos permite recorrer un mundo 3D desde la pantalla?", options: ["🎥 La cámara virtual y los controles de navegación", "✏️ Un lápiz de madera", "📏 Una regla"], answer: 0 },
          { q: "¿Cuál es una gran ventaja de los laboratorios virtuales educativos?", options: ["🛡️ Permiten aprender y experimentar de forma segura e interactiva", "⚠️ Son peligrosos", "🏠 Ocupan espacio en la casa"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "WebGL es un lenguaje que le pide permiso a la tarjeta gráfica de tu computadora para dibujar en 3D. Este mismo mundo flotante que exploras corre sobre WebGL… ¡lo estás viendo en acción!"
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Los cirujanos ensayan operaciones en realidad virtual cientos de veces antes de tocar a un paciente: corazones y pulmones digitales que dejan practicar sin riesgo. La RV entrena manos que salvan vidas."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Con permiso de un adulto, visita un museo virtual como el Louvre o la sala de la NASA. ¿Sabías que puedes viajar al espacio sin salir de la silla? ¡El navegador es tu nave!"
          ,
          "image": "assets/img/deepdive/technology-5.jpg"
        }
        ]

      }
    ],

    /* =====================================================================
     * 🏗️ ISLA DE INGENIERÍA
     * =================================================================== */
    engineering: [
      {
        id: "engineering-1", title: "La Fuerza del Triángulo en las Estructuras", icon: "📐",
        phase1: "Los ingenieros descubrieron que la figura geométrica más firme y resistente para construir es el Triángulo. A diferencia del cuadrado, el triángulo no se deforma ni se dobla cuando le pones peso encima. Por eso, las grúas gigantes y los puentes de acero se construyen juntando muchos triángulos de metal para repartir la fuerza.",
        videoId: "MSEpuSOualc", videoTitle: "El triángulo en la ingeniería para niños", videoSearch: YOUTUBE_SEARCH("triángulo estructuras ingeniería"),
        lab: { type: "truss", label: "Constructor de Cerchas Triangulares 🏗️", min: 2, max: 6, step: 1, value: 4,
               caption: function (v) { return "Cerchas: " + v + " triángulos unidos — la carga se reparte por los lados y NO se deforma 💪"; } },
        game: { prompt: "Toca las figuras que SÍ son triángulos (las más firmes):", correct: ["🔺", "📐", "🔻"], wrong: ["⭕", "🟦", "〰️", "⬛", "🟣"], goal: 3 },
        quiz: [
          { q: "¿Cuál es la figura geométrica más firme y resistente para construir estructuras?", options: ["📐 El Triángulo", "⭕️ El Círculo", "〰️ La Línea curva"], answer: 0 },
          { q: "¿Qué le pasa a una estructura triangular cuando le colocas peso encima?", options: ["💪 Soporta la fuerza sin deformarse", "📉 Se dobla de inmediato", "🌊 Se convierte en agua"], answer: 0 },
          { q: "¿Por qué las grúas grandes y torres de construcción tienen formas triangulares?", options: ["🏗️ Para repartir la fuerza y aguantar mucho peso", "🎨 Para gastar material", "📏 Para verse bajitas"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "El triángulo es la única figura rígida: no puede cambiar de forma sin doblar o romper un lado. El cuadrado sí se deforma como acordeón, por eso las construcciones se 'arriostran' con diagonales en X."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "La Torre Eiffel usa unas 18,000 piezas de hierro en patrón triangular y es tan liviana que casi todo lo que ocupa es aire. La estructura hueca triangular es la fuerza secreta del diseño."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Arma un triángulo y un cuadrado con pitillos y cuerda. Empuja ambos con un dedo. ¿Cuál de los dos se ríe de tu fuerza? ¡Acabas de correr una prueba estructural de ingeniería!"
          ,
          "image": "assets/img/deepdive/engineering-1.jpg"
        }
        ]

      },
      {
        id: "engineering-2", title: "El Taller de Puentes y Soporte de Peso", icon: "🌉",
        phase1: "Los puentes se diseñan para permitir que personas y vehículos crucen sobre ríos o abismos de forma segura. Para soportar el peso de los trenes y autos, los puentes utilizan Pilares de piedra o concreto firmemente clavados en el suelo, los cuales reciben todo el peso de la vía y lo trasladan de forma segura hacia la tierra.",
        videoId: "7ISsTeT0qQA", videoTitle: "Cómo funcionan los puentes para niños", videoSearch: YOUTUBE_SEARCH("cómo funcionan los puentes"),
        lab: { type: "pillars", label: "Ingeniero de Puentes: Altura de Pilares 🌉", min: 4, max: 24, step: 1, value: 12,
               caption: function (v) { return "Pilares de " + (v / 10).toFixed(1) + " m — reciben el peso de la vía y lo trasladan al suelo de forma segura 🏛️"; } },
        game: { prompt: "Toca las partes que hacen SEGURO a un puente:", correct: ["🏛️", "🔩", "💻", "🧱"], wrong: ["🎈", "🧻", "🍬", "🪶"], goal: 4 },
        quiz: [
          { q: "¿Qué función principal cumplen los Pilares en la construcción de un puente?", options: ["🏛️ Sostener la vía y trasladar el peso de forma segura al suelo", "🐟 Decorar el agua del río", "🛑 Frenar el paso de los peces"], answer: 0 },
          { q: "Antes de construir un puente real en la ciudad, ¿qué hacen los ingenieros?", options: ["💻 Prueban y simulan el diseño en la computadora", "🙈 Construyen a ciegas sin calcular", "🧪 Usan pegamento de papel"], answer: 0 },
          { q: "¿Por qué es importante calcular el peso que soportará un puente?", options: ["🛡️ Para garantizar que sea seguro y no colapse", "🎨 Para cambiarle el color", "📏 Para que sea más corto"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "El puente más largo del planeta, el Danyang–Kunshan en China, mide casi 165 kilómetros. Los trenes tardan más de dos horas en cruzarlo: ¡es tan largo que tiene su propio clima!"
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "El puente Golden Gate fue diseñado para vibrar con el viento como una guitarra gigante: si se pusiera rígido, la primera tormenta lo rompería. Flexibilidad extrema bien calculada."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Construye un puente con 20 palitos de helado y cinta para pegar. ¿Cuántos libros aguanta antes de colapsar? Los puentes reales pasan exactamente esta misma prueba."
          ,
          "image": "assets/img/deepdive/engineering-2.jpg"
        }
        ]

      },
      {
        id: "engineering-3", title: "Engranajes y Ruedas Dentadas", icon: "⚙️",
        phase1: "Un Engranaje es una rueda que tiene dientes a todo su alrededor. Cuando conectas dos engranajes, los dientes de uno encajan perfectamente en los del otro. Al girar la primera rueda hacia la derecha, obliga a la segunda rueda a girar hacia la izquierda (en sentido contrario), transmitiendo el movimiento en máquinas y relojes.",
        videoId: "ggm0wwP4E5Q", videoTitle: "Engranajes y ruedas dentadas", videoSearch: YOUTUBE_SEARCH("engranajes para niños"),
        lab: { type: "gears", label: "Taller de Engranajes ⚙️", min: 1, max: 10, step: 1, value: 5,
               caption: function (v) { return "Velocidad: " + v + " — el engranaje A gira a la derecha y el B (conectado) gira AL REVÉS 🔄"; } },
        game: { prompt: "Toca las máquinas que usan ENGRANAJES para funcionar:", correct: ["🚲", "⌚", "🚗", "⏰"], wrong: ["🛏️", "✏️", "🧸", "🍎"], goal: 4 },
        quiz: [
          { q: "¿Qué característica especial tiene una rueda de engranaje para transmitir movimiento?", options: ["⚙️ Tiene dientes a su alrededor que encajan con otros engranajes", "⚪️ Es completamente lisa", "📄 Es de papel delgado"], answer: 0 },
          { q: "Si el primer engranaje gira hacia la derecha, ¿hacia dónde gira el engranaje conectado a él?", options: ["🔄 Hacia la izquierda (sentido contrario)", "➡️ Hacia la derecha también", "🛑 No se mueve"], answer: 0 },
          { q: "¿En qué objetos de uso diario podemos encontrar engranajes trabajando?", options: ["🚲 En bicicletas, relojes y motores", "🛏️ En las almohadas", "✏️ En los lápices"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Un reloj mecánico suizo lleva más de 130 engranajes diminutos girando a ritmos distintos: desde una vuelta al año hasta varias por segundo. ¡Es una orquesta minúscula de metal!"
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Las bicicletas multiplican tu fuerza con engranajes: con marchas subes cuestas imposibles, sin marchas las piernas no perdonan. Los engranajes convierten tu esfuerzo en velocidad."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Busca dos piezas dentadas de juguete (o dos tapas de boca ancha). Haz girar una a la derecha: ¿hacia dónde gira la otra? Cuenta sus dientes y adivina cuál gira más rápido."
          ,
          "image": "assets/img/deepdive/engineering-3.jpg"
        }
        ]

      },
      {
        id: "engineering-4", title: "La Palanca y el Punto de Apoyo", icon: "🪨",
        phase1: "La Palanca es una máquina simple formada por una barra rígida que gira sobre un punto de apoyo. Nos permite levantar objetos muy pesados haciendo mucho menos esfuerzo. Mientras más lejos del punto de apoyo te sientes o empujes, ¡más fácil será levantar la carga! Un ejemplo de palanca en el parque es el juego del Sube y Baja.",
        videoId: "F5lFXhO84wM", videoTitle: "La palanca para niños", videoSearch: YOUTUBE_SEARCH("la palanca máquinas simples"),
        lab: { type: "lever", label: "Sube y Baja Gigante 🎢", min: 1, max: 10, step: 1, value: 6,
               caption: function (v) { return "Distancia al punto de apoyo: " + v + " unidades — ¡a más distancia, MENOS esfuerzo! 💪"; } },
        game: { prompt: "Toca las máquinas SIMPLES como la palanca:", correct: ["🪨➡️", "🎢", "⚖️", "🔧"], wrong: ["📺", "🛋️", "🎈", "🪞"], goal: 4 },
        quiz: [
          { q: "¿Qué es una Palanca en ingeniería?", options: ["🏗️ Una barra rígida que gira sobre un punto de apoyo para levantar peso con menos esfuerzo", "🛞 Una rueda inflada", "🔌 Un cable eléctrico"], answer: 0 },
          { q: "¿Qué juego del parque de diversiones funciona como una palanca?", options: ["🎢 El Sube y Baja", "🛝 La resbaladera lisa", "🎠 El columpio"], answer: 0 },
          { q: "¿Para qué nos sirven las máquinas simples como la palanca?", options: ["🛠️ Para realizar trabajos difíciles haciendo menos fuerza humana", "🤯 Para complicar las tareas", "🔋 Para gastar energía"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "Arquímedes alardeaba: '¡Dame un punto de apoyo y moveré el mundo!' Con una palanca suficientemente larga, una sola persona puede levantar un automóvil completo. La física no tiene miedo a los retos."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Tu propio brazo es una palanca: cuando levantas un vaso, el codo es el punto de apoyo y los músculos son la fuerza. Llevas dos palancas cruzando el pecho cada vez que saludas."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Con un palo de escoba (y mucho cuidado), intenta levantar una silla como palanca. Mueve el punto de apoyo de lugar y siente cuándo te cuesta menos. ¡Eso es física con las manos!"
          ,
          "image": "assets/img/deepdive/engineering-4.jpg"
        }
        ]

      },
      {
        id: "engineering-5", title: "Diseño de Vehículos: Aerodinámica y Ruedas", icon: "🏎️",
        phase1: "Los autos de carreras se diseñan con formas curvas y bajitas para cortar el aire fácilmente, una propiedad llamada Aerodinámica. Además, la invención de la Rueda revolucionó el transporte porque reduce la fricción contra el suelo, permitiendo mover cargas muy pesadas rodando suavemente en lugar de arrastrarlas.",
        videoId: "-u-Rwg6uCZE", videoTitle: "Aerodinámica y la rueda para niños", videoSearch: YOUTUBE_SEARCH("aerodinámica autos de carreras"),
        lab: { type: "car", label: "Túnel de Viento Mini 🏎️", min: 0, max: 100, step: 1, value: 60,
               caption: function (v) { return "Velocidad del aire: " + v + " km/h — la forma curva y bajita CORTA el aire (aerodinámica) 💨"; } },
        game: { prompt: "Toca las invenciones que ayudaron al TRANSPORTE:", correct: ["🛞", "🏎️", "🚌", "🚂"], wrong: ["🥄", "🛏️", "🎈", "🧹"], goal: 4 },
        quiz: [
          { q: "¿Por qué los autos de carreras tienen formas curvas y estilizadas por delante?", options: ["🏎️ Para cortar el aire con facilidad (Aerodinámica) y viajar más rápido", "📦 Para llevar más cajas", "📏 Para ser más altos"], answer: 0 },
          { q: "¿Qué gran invención de la historia permitió mover objetos pesados rodando en lugar de arrastrarlos?", options: ["🛞 La Rueda", "✏️ El lápiz", "🥄 La cuchara"], answer: 0 },
          { q: "¿Qué ocurre cuando las ruedas de un auto giran sobre el pavimento?", options: ["🔄 Reducen el esfuerzo permitiendo rodar suavemente", "🛑 Se frenan para siempre", "🚀 Hacen volar al auto"], answer: 0 }
        ],
        deepDive: [
          {
            "emoji": "🧠",
            "title": "Pío te revela…",
            "text": "El récord del auto más rápido del mundo, el ThrustSSC, llegó a 1,227 km/h. Su silueta fue diseñada copiando la trompa del delfín: la naturaleza ya resolvió el diseño hace millones de años."
          },
          {
            "emoji": "🌍",
            "title": "En la vida real",
            "text": "Los ciclistas profesionales se afeitan las piernas no por moda: el aire opone menos resistencia y ganan carreras por centímetros. Cada vello es un frenito que se prende."
          },
          {
            "emoji": "🕵️",
            "title": "El reto de Pío",
            "text": "Suelta desde la misma altura una hoja de papel plana y la misma hoja arrugada en bola. ¿Quién cae primero? El aire es como miel invisible… ¡puedes emboscarlo!"
          ,
          "image": "assets/img/deepdive/engineering-5.jpg"
        }
        ]

      }
    ]
  };

  const ORDINALS = { 2: "MEDIO", 3: "TERCIO", 4: "CUARTO", 5: "QUINTO", 6: "SEXTO", 7: "SÉPTIMO", 8: "OCTAVO" };

  function getIsland(id) {
    for (let i = 0; i < ISLANDS.length; i += 1) if (ISLANDS[i].id === id) return ISLANDS[i];
    return ISLANDS[0];
  }

  function getTopics(islandId) {
    return TOPICS[islandId] || [];
  }

  function getTopic(islandId, topicId) {
    const list = TOPICS[islandId] || [];
    for (let i = 0; i < list.length; i += 1) if (list[i].id === topicId) return list[i];
    return null;
  }

  function totalTopics() {
    return Object.keys(TOPICS).reduce(function (acc, k) { return acc + TOPICS[k].length; }, 0);
  }

  global.STEAM_CURRICULUM = {
    ISLANDS: ISLANDS,
    TOPICS: TOPICS,
    ORDINALS: ORDINALS,
    getIsland: getIsland,
    getTopics: getTopics,
    getTopic: getTopic,
    totalTopics: totalTopics
  };
})(window);
