# torre-oscura
juego rol
# Torre9 Engine + Juego

## Descripción

**Torre9** es un **engine modular orientado a eventos** con render intercambiable, diseñado para **demostrar sistemas emergentes**.  
El juego incluido funciona como ejemplo y prueba de las capacidades del motor.

Características principales del motor:

- **Modularidad**: Managers, módulos y renderers separados, intercambiables.
- **Sistema de eventos**: La lógica del juego fluye mediante eventos en cascada, reduciendo dependencias directas.
- **Render intercambiable**: Compatible con HTML, ASCII y otros posibles renderers.
- **Datos externos**: Mundo, reglas y enciclopedia en archivos YAML para fácil modificación y expansión.
- **Reutilizable**: El motor puede ser usado como base para otros juegos o experimentos personales.

---

## Estructura del proyecto

/torre9/
├── engine/ # Core + managers + módulos
├── game/ # Juego de demostración (torre10)
├── renderers/ # HTML + ASCII
├── data/ # Mundo, reglas, enciclopedia
└── README.md


---

## Prueba rápida

1. Clona el repositorio:  
```bash
git clone <repo-url>
Abre index.html en tu navegador.

El juego correrá usando el motor.

Puedes cambiar renderer entre HTML y ASCII.

El contenido se puede modificar en data/.


Puedes experimentar y crear variantes personales, siempre que no se comercialicen 

Contribuciones
Este repositorio está pensado principalmente como sandbox personal.
Si quieres aportar o experimentar, hazlo pero no le rompas los huevos al autor. 
Nota final
Torre9 nació como un juguete personal, pero ha crecido hasta convertirse en un engine modular.
La intención principal es demostrar sistemas emergentes y probar ideas, mientras se mantiene la integridad y control del autor sobre monetización y distribución.
