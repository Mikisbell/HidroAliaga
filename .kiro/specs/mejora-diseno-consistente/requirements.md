# Documento de Requisitos

## Introducción

Este documento especifica los requisitos para mejorar la consistencia visual entre la página principal (landing page) y el dashboard de la aplicación de ingeniería hidráulica. El objetivo es aplicar el sistema de diseño existente de manera uniforme, mejorar la jerarquía visual y el espaciado, y asegurar que los componentes UI sean consistentes en ambas páginas, sin cambiar el layout actual.

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
