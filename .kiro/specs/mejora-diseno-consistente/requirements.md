# Documento de Requisitos

## Introducción

Este documento especifica los requisitos para mejorar la consistencia visual entre la página principal (landing page) y el dashboard de la aplicación de ingeniería hidráulica, además de agregar elementos modernos y efectos visuales avanzados. El objetivo es aplicar el sistema de diseño existente de manera uniforme, mejorar la jerarquía visual y el espaciado, asegurar que los componentes UI sean consistentes, e implementar efectos visuales modernos relacionados al dominio hidráulico (carruseles, backgrounds animados, scroll animations, microinteracciones) sin cambiar el layout actual.

## Glosario

- **Sistema_Diseño**: Conjunto de estilos, colores OKLCH, efectos (glass-card, water-bg), gradientes y animaciones definidos en globals.css
- **Página_Principal**: Landing page ubicada en `/` (frontend/src/app/page.tsx)
- **Dashboard**: Panel de control ubicado en `/dashboard` (frontend/src/app/(dashboard)/dashboard/page.tsx)
- **Stat_Card**: Componente de tarjeta estadística con colores temáticos (blue, green, amber, purple, cyan)
- **Glass_Card**: Efecto de tarjeta con fondo translúcido y backdrop-filter blur
- **OKLCH**: Espacio de color perceptualmente uniforme usado en el sistema de diseño
- **Componente_UI**: Elementos reutilizables como Button, Card, Badge de shadcn/ui
- **Jerarquía_Visual**: Organización de elementos visuales por importancia usando tamaño, color, espaciado y contraste
- **Layout**: Estructura y disposición de elementos en la página (no debe modificarse)
- **Carrusel_Proyectos**: Componente de carrusel para mostrar proyectos destacados con navegación y autoplay
- **Canvas_Animado**: Elemento canvas HTML5 con animaciones de partículas usando requestAnimationFrame
- **Intersection_Observer**: API del navegador para detectar cuando elementos entran en el viewport
- **Parallax_Effect**: Efecto visual donde elementos de fondo se mueven a diferente velocidad que el scroll
- **Microinteracción**: Animación sutil en respuesta a acciones del usuario (hover, click, focus)
- **Carrusel_Testimonios**: Componente de carrusel para mostrar testimonios de usuarios con transiciones fade
- **Loader_Hidráulico**: Indicador de carga con animación relacionada al flujo de agua
- **Skeleton_Loader**: Placeholder animado que simula la estructura del contenido mientras carga
- **Ripple_Effect**: Efecto de onda concéntrica que se expande desde el punto de interacción
- **Grid_Animado**: Patrón de grid de fondo con animación sutil de movimiento
- **Prefers_Reduced_Motion**: Media query CSS que detecta preferencia del usuario por animaciones reducidas

## Requisitos

### Requisito 1: Consistencia de Componentes UI

**Historia de Usuario:** Como usuario, quiero que los botones, tarjetas y badges se vean consistentes en toda la aplicación, para que la experiencia visual sea coherente.

#### Criterios de Aceptación

1. CUANDO se renderizan botones en la Página_Principal y el Dashboard, ENTONCES el Sistema_Diseño DEBERÁ aplicar los mismos estilos de btn-primary, border-radius, height y padding
2. CUANDO se muestran Cards en ambas páginas, ENTONCES el Sistema_Diseño DEBERÁ usar el mismo efecto glass-card, border-color y shadow
3. CUANDO se renderizan Badges en ambas páginas, ENTONCES el Sistema_Diseño DEBERÁ aplicar los mismos estilos de border, text-size y color según el variant
4. CUANDO se aplican transiciones hover en Componentes_UI, ENTONCES el Sistema_Diseño DEBERÁ usar la misma duración y easing function en ambas páginas

### Requisito 2: Consistencia de Stat Cards

**Historia de Usuario:** Como usuario, quiero que las tarjetas estadísticas tengan el mismo diseño visual, para que pueda identificar fácilmente la información clave.

#### Criterios de Aceptación

1. CUANDO se renderizan Stat_Cards en el Dashboard, ENTONCES el Sistema_Diseño DEBERÁ aplicar los efectos stat-card-blue, stat-card-green, stat-card-amber, stat-card-purple y stat-card-cyan con el gradiente superior
2. CUANDO se muestran tarjetas normativas en la Página_Principal, ENTONCES el Sistema_Diseño DEBERÁ aplicar los mismos efectos de hover y border-color que las Stat_Cards del Dashboard
3. CUANDO se aplica hover en cualquier Stat_Card, ENTONCES el Sistema_Diseño DEBERÁ aplicar transform translateY(-2px) y box-shadow consistente
4. PARA TODAS las Stat_Cards, el Sistema_Diseño DEBERÁ usar la misma estructura de padding, text-size y color de números

### Requisito 3: Jerarquía Visual y Espaciado

**Historia de Usuario:** Como usuario, quiero que el espaciado y la jerarquía visual sean consistentes, para que pueda navegar y entender la información fácilmente.

#### Criterios de Aceptación

1. CUANDO se renderizan secciones en la Página_Principal y el Dashboard, ENTONCES el Sistema_Diseño DEBERÁ usar el mismo sistema de espaciado (space-y-8, pb-20, etc.)
2. CUANDO se muestran títulos de sección, ENTONCES el Sistema_Diseño DEBERÁ aplicar los mismos tamaños de fuente (text-3xl, text-4xl) y tracking-tight en ambas páginas
3. CUANDO se renderizan subtítulos y descripciones, ENTONCES el Sistema_Diseño DEBERÁ usar los mismos valores de text-muted-foreground y opacity
4. CUANDO se aplican márgenes entre elementos, ENTONCES el Sistema_Diseño DEBERÁ seguir un sistema de espaciado consistente basado en múltiplos de 4px

### Requisito 4: Efectos de Fondo y Ambiente

**Historia de Usuario:** Como usuario, quiero que los efectos de fondo sean consistentes, para que la aplicación tenga una identidad visual unificada.

#### Criterios de Aceptación

1. CUANDO se renderiza la Página_Principal, ENTONCES el Sistema_Diseño DEBERÁ aplicar el efecto water-bg con animación waterFlow
2. CUANDO se renderiza el Dashboard, ENTONCES el Sistema_Diseño DEBERÁ aplicar un fondo consistente con el mismo esquema de colores OKLCH
3. CUANDO se muestran burbujas de agua en la Página_Principal, ENTONCES el Sistema_Diseño DEBERÁ aplicar la animación floatUp con los mismos parámetros
4. PARA TODAS las páginas, el Sistema_Diseño DEBERÁ mantener la consistencia de colores entre modo claro y oscuro usando las variables OKLCH definidas

### Requisito 5: Animaciones y Transiciones

**Historia de Usuario:** Como usuario, quiero que las animaciones sean suaves y consistentes, para que la experiencia sea fluida y profesional.

#### Criterios de Aceptación

1. CUANDO se cargan elementos en la Página_Principal y el Dashboard, ENTONCES el Sistema_Diseño DEBERÁ aplicar las animaciones fade-in-up con los mismos delays (0.1s, 0.2s, 0.3s)
2. CUANDO se aplican transiciones hover, ENTONCES el Sistema_Diseño DEBERÁ usar transition-all con duration 0.3s y ease-in-out en ambas páginas
3. CUANDO se muestran elementos interactivos, ENTONCES el Sistema_Diseño DEBERÁ aplicar transform y box-shadow con los mismos valores
4. PARA TODAS las animaciones, el Sistema_Diseño DEBERÁ respetar prefers-reduced-motion para accesibilidad

### Requisito 6: Gradientes de Texto y Botones

**Historia de Usuario:** Como usuario, quiero que los gradientes de texto y botones sean consistentes, para que los elementos destacados tengan el mismo impacto visual.

#### Criterios de Aceptación

1. CUANDO se aplica la clase text-gradient, ENTONCES el Sistema_Diseño DEBERÁ usar el mismo gradiente linear-gradient(135deg, oklch(0.70 0.18 230), oklch(0.75 0.15 200)) en ambas páginas
2. CUANDO se renderizan botones primarios, ENTONCES el Sistema_Diseño DEBERÁ aplicar btn-primary con el mismo gradiente y box-shadow
3. CUANDO se aplica hover en botones primarios, ENTONCES el Sistema_Diseño DEBERÁ aumentar box-shadow y aplicar translateY(-1px) consistentemente
4. PARA TODOS los gradientes, el Sistema_Diseño DEBERÁ mantener los mismos valores OKLCH en modo claro y oscuro

### Requisito 7: Tarjetas de Capacidades

**Historia de Usuario:** Como usuario, quiero que las tarjetas de capacidades tengan el mismo diseño, para que pueda comparar fácilmente las características del sistema.

#### Criterios de Aceptación

1. CUANDO se renderizan tarjetas de capacidades en la Página_Principal y el Dashboard, ENTONCES el Sistema_Diseño DEBERÁ usar la misma estructura de iconos, títulos, descripciones y badges
2. CUANDO se muestran badges dentro de tarjetas, ENTONCES el Sistema_Diseño DEBERÁ aplicar los mismos colores temáticos (blue-500/30, green-500/30, purple-500/30, etc.)
3. CUANDO se aplica hover en tarjetas de capacidades, ENTONCES el Sistema_Diseño DEBERÁ usar la misma transición de border-color
4. PARA TODAS las tarjetas de capacidades, el Sistema_Diseño DEBERÁ mantener el mismo padding, spacing y border-radius

### Requisito 8: Información Normativa

**Historia de Usuario:** Como usuario, quiero que la información normativa se presente de manera consistente, para que pueda identificar rápidamente los valores clave.

#### Criterios de Aceptación

1. CUANDO se muestran valores normativos en la Página_Principal y el Dashboard, ENTONCES el Sistema_Diseño DEBERÁ usar el mismo formato de números grandes (text-2xl o text-3xl) con colores temáticos
2. CUANDO se renderizan unidades de medida, ENTONCES el Sistema_Diseño DEBERÁ aplicar el mismo text-size y text-muted-foreground
3. CUANDO se muestran badges de normas (OS.050, RM 192, RM 107), ENTONCES el Sistema_Diseño DEBERÁ usar el mismo variant y border-color
4. PARA TODAS las tarjetas normativas, el Sistema_Diseño DEBERÁ aplicar el mismo efecto hover con border-color transition

### Requisito 9: Modo Claro y Oscuro

**Historia de Usuario:** Como usuario, quiero que el modo claro y oscuro sean consistentes, para que la experiencia visual sea coherente independientemente del tema.

#### Criterios de Aceptación

1. CUANDO se cambia al modo oscuro, ENTONCES el Sistema_Diseño DEBERÁ aplicar las variables OKLCH definidas en .dark para todos los componentes
2. CUANDO se renderizan glass-cards en modo oscuro, ENTONCES el Sistema_Diseño DEBERÁ usar background oklch(0.15 0.02 250 / 60%) y border oklch(1 0 0 / 8%)
3. CUANDO se muestran colores temáticos en modo oscuro, ENTONCES el Sistema_Diseño DEBERÁ ajustar la luminosidad manteniendo el hue y chroma
4. PARA TODOS los componentes, el Sistema_Diseño DEBERÁ mantener el mismo contraste relativo entre modo claro y oscuro

### Requisito 10: Accesibilidad y Usabilidad

**Historia de Usuario:** Como usuario con necesidades de accesibilidad, quiero que los elementos interactivos sean claramente identificables, para que pueda navegar la aplicación fácilmente.

#### Criterios de Aceptación

1. CUANDO un elemento recibe focus, ENTONCES el Sistema_Diseño DEBERÁ aplicar outline 2px solid oklch(0.65 0.18 230) con outline-offset 2px
2. CUANDO se aplica hover en elementos interactivos, ENTONCES el Sistema_Diseño DEBERÁ proporcionar feedback visual claro con cambio de color o transform
3. CUANDO se muestran textos sobre fondos, ENTONCES el Sistema_Diseño DEBERÁ mantener un contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande
4. PARA TODOS los elementos interactivos, el Sistema_Diseño DEBERÁ tener un área de click mínima de 44x44px según WCAG 2.1

### Requisito 11: Carrusel de Proyectos Destacados

**Historia de Usuario:** Como usuario, quiero ver proyectos destacados en un carrusel interactivo, para que pueda explorar ejemplos de manera dinámica y atractiva.

#### Criterios de Aceptación

1. CUANDO se renderiza el Carrusel_Proyectos en la Página_Principal o Dashboard, ENTONCES el Sistema_Diseño DEBERÁ mostrar tarjetas de proyectos con navegación por flechas y dots indicadores
2. CUANDO el usuario interactúa con el carrusel, ENTONCES el Sistema_Diseño DEBERÁ aplicar transiciones suaves (300-500ms) con easing ease-out
3. CUANDO el carrusel está en autoplay, ENTONCES el Sistema_Diseño DEBERÁ pausar al hacer hover y reanudar al salir, con intervalo de 5-7 segundos
4. CUANDO se muestran tarjetas en el carrusel, ENTONCES el Sistema_Diseño DEBERÁ aplicar glass-card effect con imagen, título, descripción y badges temáticos
5. PARA TODOS los carruseles, el Sistema_Diseño DEBERÁ ser responsive con 1 slide en mobile, 2 en tablet, 3 en desktop

### Requisito 12: Background Animado con Tema Hidráulico

**Historia de Usuario:** Como usuario, quiero ver backgrounds animados relacionados al dominio hidráulico, para que la aplicación tenga una identidad visual única y profesional.

#### Criterios de Aceptación

1. CUANDO se renderiza la Página_Principal, ENTONCES el Sistema_Diseño DEBERÁ mostrar un Canvas_Animado con partículas de agua flotantes usando requestAnimationFrame
2. CUANDO se muestran partículas de agua, ENTONCES el Sistema_Diseño DEBERÁ aplicar movimiento orgánico con velocidad variable (0.3-1.5 px/frame) y opacidad dinámica (0.1-0.4)
3. CUANDO se renderiza el Dashboard, ENTONCES el Sistema_Diseño DEBERÁ mostrar ondas sutiles animadas con SVG o CSS animations relacionadas al flujo hidráulico
4. CUANDO se aplican efectos de fondo, ENTONCES el Sistema_Diseño DEBERÁ usar colores OKLCH del dominio (blue 230°, cyan 200°) con baja saturación (chroma 0.02-0.05)
5. PARA TODOS los backgrounds animados, el Sistema_Diseño DEBERÁ respetar prefers-reduced-motion desactivando animaciones

### Requisito 13: Scroll Animations y Parallax Effects

**Historia de Usuario:** Como usuario, quiero que los elementos aparezcan con animaciones al hacer scroll, para que la experiencia sea más dinámica y guíe mi atención.

#### Criterios de Aceptación

1. CUANDO un elemento entra en el viewport, ENTONCES el Sistema_Diseño DEBERÁ aplicar animación fade-in-up usando Intersection Observer API
2. CUANDO se hace scroll en secciones hero, ENTONCES el Sistema_Diseño DEBERÁ aplicar parallax effect sutil (velocidad 0.3-0.5x) en elementos de fondo
3. CUANDO se muestran stat cards al hacer scroll, ENTONCES el Sistema_Diseño DEBERÁ aplicar stagger animation con delays incrementales (100ms entre elementos)
4. CUANDO se aplican scroll animations, ENTONCES el Sistema_Diseño DEBERÁ usar threshold de 0.2 (20% visible) para activar animaciones
5. PARA TODAS las scroll animations, el Sistema_Diseño DEBERÁ ejecutarse solo una vez por elemento y respetar prefers-reduced-motion

### Requisito 14: Microinteracciones en Componentes

**Historia de Usuario:** Como usuario, quiero que los botones y cards respondan con microinteracciones sutiles, para que la interfaz se sienta más viva y profesional.

#### Criterios de Aceptación

1. CUANDO se hace hover en un botón primario, ENTONCES el Sistema_Diseño DEBERÁ aplicar scale(1.02) con shadow animado y ripple effect sutil
2. CUANDO se hace click en un botón, ENTONCES el Sistema_Diseño DEBERÁ aplicar scale(0.98) momentáneo (100ms) para feedback táctil
3. CUANDO se hace hover en una Card, ENTONCES el Sistema_Diseño DEBERÁ aplicar lift effect (translateY -4px) con shadow expansion y border glow
4. CUANDO se hace focus en un Input, ENTONCES el Sistema_Diseño DEBERÁ aplicar border glow animado con pulse effect en el ring
5. PARA TODAS las microinteracciones, el Sistema_Diseño DEBERÁ usar spring animations (cubic-bezier) para movimiento natural

### Requisito 15: Carrusel de Testimonios y Casos de Éxito

**Historia de Usuario:** Como usuario potencial, quiero ver testimonios de otros ingenieros en un carrusel, para que pueda confiar en la calidad del sistema.

#### Criterios de Aceptación

1. CUANDO se renderiza el Carrusel_Testimonios en la Página_Principal, ENTONCES el Sistema_Diseño DEBERÁ mostrar tarjetas con foto, nombre, cargo, empresa y testimonio
2. CUANDO se muestran testimonios, ENTONCES el Sistema_Diseño DEBERÁ aplicar glass-card effect con gradiente sutil relacionado al dominio hidráulico
3. CUANDO el carrusel avanza, ENTONCES el Sistema_Diseño DEBERÁ aplicar fade transition (400ms) entre testimonios
4. CUANDO se muestran indicadores, ENTONCES el Sistema_Diseño DEBERÁ usar dots con animación de progreso circular para el testimonio activo
5. PARA TODOS los testimonios, el Sistema_Diseño DEBERÁ incluir badges de normas o proyectos relacionados con colores temáticos

### Requisito 16: Loading States y Page Transitions

**Historia de Usuario:** Como usuario, quiero ver estados de carga y transiciones entre páginas, para que la aplicación se sienta fluida y responsive.

#### Criterios de Aceptación

1. CUANDO se carga una página, ENTONCES el Sistema_Diseño DEBERÁ mostrar un Loader_Hidráulico con animación de flujo de agua (ondas o gotas)
2. CUANDO se navega entre páginas, ENTONCES el Sistema_Diseño DEBERÁ aplicar fade transition (200ms) con overlay sutil
3. CUANDO se cargan datos en el Dashboard, ENTONCES el Sistema_Diseño DEBERÁ mostrar skeleton loaders con shimmer effect en lugar de spinners
4. CUANDO se completa una acción, ENTONCES el Sistema_Diseño DEBERÁ mostrar toast notifications con slide-in animation y auto-dismiss (3-5s)
5. PARA TODOS los loading states, el Sistema_Diseño DEBERÁ usar colores del dominio hidráulico (blue, cyan) y respetar prefers-reduced-motion

### Requisito 17: Efectos de Partículas Interactivas

**Historia de Usuario:** Como usuario, quiero que el cursor genere efectos sutiles de partículas, para que la interfaz se sienta más interactiva sin ser distractora.

#### Criterios de Aceptación

1. CUANDO el cursor se mueve sobre secciones hero, ENTONCES el Sistema_Diseño DEBERÁ generar partículas sutiles (gotas de agua) que se desvanecen (1-2s)
2. CUANDO se hace click en áreas interactivas, ENTONCES el Sistema_Diseño DEBERÁ generar ripple effect con ondas concéntricas relacionadas al agua
3. CUANDO se generan partículas, ENTONCES el Sistema_Diseño DEBERÁ limitar la cantidad (máximo 20 activas) para optimizar performance
4. CUANDO se aplican efectos de cursor, ENTONCES el Sistema_Diseño DEBERÁ usar colores OKLCH con baja opacidad (0.1-0.3) del dominio hidráulico
5. PARA TODOS los efectos de partículas, el Sistema_Diseño DEBERÁ desactivarse en dispositivos móviles y respetar prefers-reduced-motion

### Requisito 18: Animaciones de Números y Contadores

**Historia de Usuario:** Como usuario, quiero ver los números en stat cards animarse al aparecer, para que los datos se presenten de manera más impactante.

#### Criterios de Aceptación

1. CUANDO una Stat_Card entra en el viewport, ENTONCES el Sistema_Diseño DEBERÁ animar el número desde 0 hasta el valor final con easing ease-out
2. CUANDO se animan números, ENTONCES el Sistema_Diseño DEBERÁ usar duración proporcional al valor (500ms base + 10ms por dígito)
3. CUANDO se muestran porcentajes o decimales, ENTONCES el Sistema_Diseño DEBERÁ animar con incrementos suaves manteniendo formato
4. CUANDO se completa la animación, ENTONCES el Sistema_Diseño DEBERÁ aplicar subtle pulse effect (scale 1.05 → 1.0) para énfasis
5. PARA TODAS las animaciones de números, el Sistema_Diseño DEBERÁ ejecutarse solo una vez y respetar prefers-reduced-motion mostrando valor final directamente

### Requisito 19: Efectos de Hover en Imágenes y Media

**Historia de Usuario:** Como usuario, quiero que las imágenes de proyectos respondan al hover con efectos sutiles, para que pueda identificar elementos interactivos.

#### Criterios de Aceptación

1. CUANDO se hace hover en una imagen de proyecto, ENTONCES el Sistema_Diseño DEBERÁ aplicar zoom sutil (scale 1.05) con overflow hidden
2. CUANDO se muestra una imagen en card, ENTONCES el Sistema_Diseño DEBERÁ aplicar overlay gradient que se intensifica en hover
3. CUANDO se hace hover en media, ENTONCES el Sistema_Diseño DEBERÁ aplicar brightness(1.1) y saturate(1.1) para realzar colores
4. CUANDO se aplican efectos de imagen, ENTONCES el Sistema_Diseño DEBERÁ usar transition duration de 400ms con ease-out
5. PARA TODAS las imágenes interactivas, el Sistema_Diseño DEBERÁ incluir cursor pointer y mantener aspect ratio

### Requisito 20: Sistema de Grid Animado de Fondo

**Historia de Usuario:** Como usuario, quiero ver un grid sutil animado en el fondo, para que la interfaz tenga profundidad sin ser distractora.

#### Criterios de Aceptación

1. CUANDO se renderiza una sección con Grid_Animado, ENTONCES el Sistema_Diseño DEBERÁ mostrar líneas de grid con opacidad muy baja (0.03-0.05)
2. CUANDO se aplica animación al grid, ENTONCES el Sistema_Diseño DEBERÁ usar movimiento lento (20-30s) con dirección diagonal relacionada al flujo
3. CUANDO se muestran líneas de grid, ENTONCES el Sistema_Diseño DEBERÁ usar colores OKLCH del dominio (blue 230°, cyan 200°) con chroma bajo
4. CUANDO se aplica el grid, ENTONCES el Sistema_Diseño DEBERÁ usar SVG pattern o CSS background con repeat
5. PARA TODOS los grids animados, el Sistema_Diseño DEBERÁ desactivar animación con prefers-reduced-motion manteniendo grid estático
