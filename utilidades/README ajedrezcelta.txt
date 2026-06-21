 README: Fidchell Asimétrico
🎯 ¿Qué es esto?
Un juego de tablero táctico por turnos basado en el Hnefatafl (ajedrez vikingo) y el Fidchell celta. La partida enfrenta a dos bandos asimétricos: un defensor que intenta que su rey escape por un borde del tablero, y un atacante que intenta capturarlo. Incluye tropas especiales inspiradas en la mitología celta, un panel de configuración en tiempo real ("Arquitecto"), inteligencia artificial adaptativa y modos de juego alternativos como el "Rey Loco". Todo en un solo archivo HTML, jugable en escritorio y móvil.

🏗️ Arquitectura del código
El juego está organizado en módulos (clases y funciones) dentro de un único archivo. Sigue las premisas acordadas: modularidad, flujos y eventos, buenas prácticas, comentarios y cero duplicidades.

Estructura:
text
CONFIG (objeto global mutable)
├── Board (tablero, bosques)
├── RuleEngine (movimiento, captura, victoria)
├── Funciones auxiliares (_evaluate*, _explodeBerserkers, _getAllMoves)
├── CercoAttackerAI (IA atacante)
├── EscapeDefenderAI (IA defensora)
├── CrazyKingMode (modo Rey Loco)
├── Renderer (dibujado del tablero y piezas)
├── DifficultyManager (ajuste de profundidad de IA)
├── Architect (panel de configuración)
└── FidchellGame (bucle principal, turnos, eventos)
Flujo de juego:
El jugador humano (defensor o atacante) hace clic en una pieza propia y luego en una casilla destino válida.

Se ejecuta el movimiento, se aplican capturas por custodia y se verifica la explosión de berserkers.

Si el rey escapó o fue capturado, termina la partida.

Cambia el turno. Si el nuevo turno es de la IA, esta calcula su mejor movimiento (con profundidad variable según la dificultad) y lo ejecuta automáticamente.

Cada 5 turnos (configurable), puede aparecer un bosque en una casilla aleatoria.

Si el modo "Rey Loco" está activo, el rey defensor mueve automáticamente hacia el borde tras cada turno.

⚔️ Reglas del juego
Tablero
Tamaño configurable: 7x7, 9x9 o 11x11 (por defecto 11x11).

Casillas claras y oscuras estilo ajedrez.

El centro del tablero es la posición inicial del rey.

Piezas
Pieza	Bando	Símbolo	Movimiento	Captura	Habilidades especiales
Rey	Defensor	♚	1 casilla ortogonal	No captura	Gana al llegar a un borde. Solo capturable por rodeo completo (4 atacantes).
Guardia	Defensor	●	1 casilla ortogonal	Custodia (flanqueo)	-
Berserker	Defensor	☠	1 casilla ortogonal	Custodia (flanqueo)	Al ser rodeado completamente, explota eliminando todas las piezas adyacentes (amigas y enemigas).
Druida	Defensor	✦	1 casilla diagonal	No puede capturar	Inmune a captura por custodia; solo puede ser eliminado por rodeo completo (como el rey).
Cazador	Atacante	▲	2 casillas ortogonales*	Custodia (flanqueo)	-
Sabueso	Atacante	⚡	2 casillas ortogonales*	Captura por contacto simple	Si al final de su movimiento está adyacente a un enemigo que está contra un borde o tiene otro atacante detrás, lo captura directamente.
* El movimiento de 2 casillas para los atacantes es parte del "movimiento asimétrico", configurable desde el Arquitecto. Si se desactiva, todos mueven 1.

Captura por custodia (regla general)
Una pieza es capturada cuando dos piezas enemigas la flanquean en línea recta ortogonal (una a cada lado). La pieza que se mueve para completar el flanqueo no puede ser capturada por ese mismo movimiento.

Captura del rey (rodeo completo)
El rey debe ser rodeado por los 4 lados ortogonales por atacantes. Si está en un borde, requiere 3 lados; en una esquina, 2. Los bosques no cuentan para el rodeo.

Victoria
Defensor gana si el rey llega a cualquier casilla del borde del tablero.

Atacante gana si el rey es rodeado completamente (o eliminado por explosión de un berserker aliado).

Bosques
Cada cierto número de turnos (configurable, por defecto 5), aparece un bosque en una casilla vacía aleatoria (nunca en el borde).

Los bosques bloquean el movimiento y la captura (no se puede mover a un bosque ni flanquear a través de él).

Duran 3 turnos y desaparecen.

🧠 Inteligencias Artificiales
IA Atacante (CercoAttackerAI)
Función de evaluación: Maximiza la distancia del rey al borde, minimiza su movilidad (casillas libres adyacentes) y maximiza el control de rutas de escape (cazadores cerca de esas rutas).

Profundidad: 1 (voraz), 2 (táctica, mira una respuesta del defensor) o 3 (estratégica). Ajustable desde Arquitecto o automáticamente por la dificultad adaptativa.

IA Defensora (EscapeDefenderAI)
Función de evaluación: Minimiza la distancia del rey al borde, maximiza su movilidad y minimiza el número de atacantes cercanos.

Profundidad: 1 (básica) o 2 (astuta, mira una respuesta del atacante).

Uso de habilidades: La IA evalúa si un berserker debe explotar (si está rodeado de enemigos y no dañará al rey) y lo incentiva en su puntuación. Para druidas y otras tropas, la estructura está preparada para añadir condiciones similares.

Dificultad adaptativa (DifficultyManager)
Registra las victorias de cada bando.

Si el defensor gana más del 70% de las partidas, la IA atacante sube de profundidad.

Si el defensor gana menos del 30%, la IA atacante baja de profundidad.

Análogo para el atacante humano: si gana mucho, la IA defensora se vuelve más astuta.

🛠️ Panel de Arquitecto
Accesible con el botón ⚙️. Permite modificar en tiempo real (se aplica al reiniciar la partida):

Parámetro	Descripción
Jugar como	Elegir bando humano: Defensor o Atacante
Tamaño tablero	7x7, 9x9, 11x11
Profundidad IA	Ajustar independientemente la profundidad de cada IA
Movimiento asimétrico	Activado: atacantes mueven 2, defensores 1. Desactivado: todos 1
Nº Guardias / Berserkers / Druidas / Sabuesos	Cantidad inicial de cada tropa especial
Frecuencia bosques	Turnos entre aparición de bosques (0 = desactivado)
Modo Rey Loco	El rey defensor mueve automáticamente hacia el borde
🐛 Fallos conocidos y limitaciones
Símbolos Unicode: Dependiendo del sistema operativo y la fuente, algunos caracteres (☠, ✦, ⚡) pueden no renderizarse correctamente. Si ves ? o cuadrados, el archivo debe guardarse como UTF-8 sin BOM. Se recomienda usar las letras de colores como fallback (círculo con borde y letra).

IA defensora con druidas: Sabe moverlos en diagonal, pero no tiene una estrategia avanzada para ellos (los usa como bloqueadores básicos).

Rendimiento en profundidad 3: En tableros grandes (11x11) con muchas piezas, la IA atacante a profundidad 3 puede tardar unos segundos en decidir. Es normal.

Bosques sobre piezas: No se generan sobre piezas existentes, por lo que no afectan a posiciones ocupadas.

Rey Loco + IA defensora: Si el humano juega como atacante y la IA defensora está activa, el Rey Loco NO se activa (solo funciona con defensor humano).

🚧 Próximas mejoras posibles
Añadir más tropas especiales (Torre, Ariete, Centinela).

Efectos de sonido básicos (movimiento, captura, explosión).

Modo campaña con niveles predefinidos.

Sistema de puntos de destino y desbloqueo de tropas.

Mejora de la interfaz visual con sprites reales.

Créditos: Diseño original por el usuario, implementación por IA, iteraciones conjuntas. Que lo disfrutes, druida.