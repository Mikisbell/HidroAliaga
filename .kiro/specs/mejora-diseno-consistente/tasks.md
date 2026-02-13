# Plan de Implementación: Mejora de Diseño Consistente

## Visión General

Este plan implementa las mejoras de consistencia visual entre la página principal y el dashboard, aplicando el sistema de diseño de manera uniforme sin modificar el layout existente. El enfoque es incremental, validando cada cambio con tests antes de continuar.

## Tareas

- [x] 1. Auditar y documentar estilos actuales
  - Crear script de auditoría que extraiga todas las clases CSS usadas en page.tsx y dashboard/page.tsx
  - Generar reporte de inconsistencias (clases diferentes para mismo propósito)
  - Documentar todos los componentes UI y sus variantes actuales
  - _Requisitos: 1.1, 1.2, 1.3_

- [x] 2. Estandarizar componentes Button
  - [x] 2.1 Actualizar todos los botones primarios en page.tsx
    - Aplicar clases: `btn-primary text-white rounded-xl h-11 md:h-12 px-6 md:px-8 font-semibold`
    - Asegurar hover: `hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1`
    - Agregar transition: `transition-all duration-200`
    - _Requisitos: 1.1, 6.2, 6.3_
  
  - [x] 2.2 Actualizar todos los botones primarios en dashboard/page.tsx
    - Aplicar las mismas clases que en 2.1
    - Verificar consistencia visual entre ambas páginas
    - _Requisitos: 1.1, 6.2, 6.3_
  
  - [ ]* 2.3 Escribir property test para consistencia de botones
    - **Propiedad 1: Consistencia de Clases CSS en Componentes UI**
    - **Valida: Requisitos 1.1**
  
  - [ ]* 2.4 Escribir property test para transiciones hover de botones
    - **Propiedad 2: Duración y Easing de Transiciones Hover**
    - **Valida: Requisitos 1.4**

- [x] 3. Estandarizar componentes Card
  - [x] 3.1 Actualizar todas las Cards en page.tsx
    - Aplicar clases base: `glass-card rounded-xl md:rounded-2xl border border-border/20 p-5 md:p-6`
    - Aplicar hover: `hover:border-primary/30 hover:shadow-lg transition-all duration-300`
    - _Requisitos: 1.2, 2.2_
  
  - [x] 3.2 Actualizar todas las Cards en dashboard/page.tsx
    - Aplicar las mismas clases que en 3.1
    - Verificar que las Cards de capacidades tengan estructura consistente
    - _Requisitos: 1.2, 7.1_
  
  - [ ]* 3.3 Escribir property test para consistencia de Cards
    - **Propiedad 1: Consistencia de Clases CSS en Componentes UI**
    - **Valida: Requisitos 1.2**
  
  - [ ]* 3.4 Escribir property test para hover de Cards
    - **Propiedad 4: Consistencia de Hover entre Tarjetas**
    - **Valida: Requisitos 2.2**

- [x] 4. Estandarizar Stat Cards en Dashboard
  - [x] 4.1 Actualizar estructura de Stat Cards
    - Aplicar wrapper: `stat-card stat-card-{color} bg-card/80`
    - Aplicar content: `p-5`
    - Estructura: label (text-xs uppercase tracking-wider) + value (text-3xl font-bold {colorText}) + description (text-[10px] text-muted-foreground/60)
    - _Requisitos: 2.1, 2.4_
  
  - [x] 4.2 Verificar gradientes superiores en Stat Cards
    - Confirmar que cada stat-card-{color} tiene el gradiente correcto en ::before
    - Verificar colores: blue (230), green (160), amber (80), purple (300), cyan (200)
    - _Requisitos: 2.1_
  
  - [x] 4.3 Aplicar hover consistente en Stat Cards
    - Hover: `hover:-translate-y-2 hover:shadow-xl transition-all duration-300`
    - _Requisitos: 2.3_
  
  - [ ]* 4.4 Escribir property test para estructura de Stat Cards
    - **Propiedad 3: Estructura y Comportamiento de Stat Cards**
    - **Valida: Requisitos 2.1, 2.3, 2.4**

- [x] 5. Estandarizar tarjetas normativas en página principal
  - [x] 5.1 Actualizar tarjetas normativas (Quick Strip)
    - Aplicar estructura consistente con Stat Cards
    - Usar mismos colores temáticos para números
    - Aplicar mismo hover effect
    - _Requisitos: 2.2, 8.1, 8.4_
  
  - [ ]* 5.2 Escribir property test para formato normativo
    - **Propiedad 14: Formato de Información Normativa**
    - **Valida: Requisitos 8.1, 8.2, 8.3**

- [x] 6. Checkpoint - Verificar componentes base
  - Ejecutar todos los property tests creados hasta ahora
  - Verificar visualmente ambas páginas en modo claro y oscuro
  - Asegurar que no hay regresiones visuales
  - Preguntar al usuario si hay dudas o ajustes necesarios

- [x] 7. Estandarizar sistema de espaciado
  - [x] 7.1 Auditar y corregir espaciado en secciones
    - Aplicar espaciado consistente: `py-16 md:py-20` para secciones
    - Aplicar gaps: `space-y-8` para contenido de sección
    - Aplicar márgenes: `mb-12 md:mb-16` entre secciones
    - _Requisitos: 3.1, 3.4_
  
  - [x] 7.2 Crear utilidad de validación de espaciado
    - Función que verifica que todos los valores sean múltiplos de 4px
    - Integrar en proceso de build para advertir sobre valores incorrectos
    - _Requisitos: 3.4_
  
  - [ ]* 7.3 Escribir property test para sistema de espaciado
    - **Propiedad 5: Sistema de Espaciado Basado en Múltiplos de 4px**
    - **Valida: Requisitos 3.1, 3.4**

- [x] 8. Estandarizar jerarquía tipográfica
  - [x] 8.1 Actualizar títulos de sección
    - Hero title: `text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight`
    - Section title: `text-3xl md:text-4xl font-bold tracking-tight`
    - Card title: `text-base md:text-lg font-semibold`
    - _Requisitos: 3.2_
  
  - [x] 8.2 Actualizar subtítulos y descripciones
    - Hero subtitle: `text-lg md:text-xl text-muted-foreground/70`
    - Section subtitle: `text-muted-foreground/60 text-sm md:text-base`
    - Card description: `text-xs md:text-sm text-muted-foreground/70`
    - _Requisitos: 3.3_
  
  - [ ]* 8.3 Escribir property test para jerarquía tipográfica
    - **Propiedad 6: Jerarquía Tipográfica Consistente**
    - **Valida: Requisitos 3.2, 3.3**

- [x] 9. Estandarizar componentes Badge
  - [x] 9.1 Actualizar todos los Badges en ambas páginas
    - Base: `text-[10px] border-border/30 px-1.5 py-0.5 rounded-full`
    - Temáticos: `border-{color}-500/30 text-{color}-400`
    - _Requisitos: 1.3, 7.2, 8.3_
  
  - [ ]* 9.2 Escribir property test para consistencia de Badges
    - **Propiedad 1: Consistencia de Clases CSS en Componentes UI**
    - **Valida: Requisitos 1.3**

- [x] 10. Estandarizar tarjetas de capacidades
  - [x] 10.1 Actualizar FeatureCard component
    - Verificar estructura: icono + título + descripción + badges
    - Asegurar padding consistente: `p-8`
    - Verificar border-radius: `rounded-2xl`
    - _Requisitos: 7.1, 7.4_
  
  - [x] 10.2 Actualizar tarjetas de capacidades en Dashboard
    - Aplicar misma estructura que FeatureCard
    - Usar mismos colores temáticos para badges
    - Aplicar mismo hover effect
    - _Requisitos: 7.1, 7.2, 7.3_
  
  - [ ]* 10.3 Escribir property test para estructura de tarjetas de capacidades
    - **Propiedad 13: Estructura de Tarjetas de Capacidades**
    - **Valida: Requisitos 7.1, 7.2, 7.4**

- [x] 11. Checkpoint - Verificar estructura y espaciado
  - Ejecutar todos los property tests
  - Verificar espaciado y jerarquía visual en ambas páginas
  - Validar que el layout no ha cambiado
  - Preguntar al usuario si hay ajustes necesarios

- [x] 12. Estandarizar animaciones de entrada
  - [x] 12.1 Aplicar fade-in-up en página principal
    - Primera sección: `animate-fade-in-up`
    - Segunda sección: `animate-fade-in-up-delay-1` con `opacity-0`
    - Tercera sección: `animate-fade-in-up-delay-2` con `opacity-0`
    - Cuarta sección: `animate-fade-in-up-delay-3` con `opacity-0`
    - _Requisitos: 5.1_
  
  - [x] 12.2 Aplicar fade-in-up en dashboard
    - Aplicar mismos delays que en página principal
    - Asegurar opacity-0 inicial para elementos con delay
    - _Requisitos: 5.1_
  
  - [ ]* 12.3 Escribir property test para configuración de animaciones
    - **Propiedad 9: Configuración de Animaciones Fade-In-Up**
    - **Valida: Requisitos 5.1**

- [x] 13. Verificar y estandarizar transiciones hover
  - [x] 13.1 Auditar todas las transiciones hover
    - Listar todos los elementos con hover en ambas páginas
    - Verificar que usen transition-all
    - Verificar duraciones: 0.2s para botones, 0.3s para cards
    - _Requisitos: 1.4, 5.2_
  
  - [x] 13.2 Corregir transiciones inconsistentes
    - Aplicar transition-all con duración correcta
    - Asegurar easing function consistente (ease-in-out o ease)
    - _Requisitos: 5.2_
  
  - [ ]* 13.3 Escribir property test para transformaciones hover
    - **Propiedad 10: Transformaciones y Sombras en Elementos Interactivos**
    - **Valida: Requisitos 5.3**

- [x] 14. Verificar accesibilidad de animaciones
  - [x] 14.1 Verificar media query prefers-reduced-motion
    - Confirmar que existe en globals.css
    - Verificar que reduce todas las animaciones a 0.01ms
    - _Requisitos: 5.4_
  
  - [ ]* 14.2 Escribir property test para prefers-reduced-motion
    - **Propiedad 11: Respeto a Prefers-Reduced-Motion**
    - **Valida: Requisitos 5.4**
  
  - [ ]* 14.3 Escribir unit test para prefers-reduced-motion
    - Simular media query y verificar comportamiento
    - _Requisitos: 5.4_

- [x] 15. Estandarizar gradientes de texto y botones
  - [x] 15.1 Verificar clase text-gradient
    - Confirmar valor: `linear-gradient(135deg, oklch(0.70 0.18 230), oklch(0.75 0.15 200))`
    - Aplicar en todos los textos destacados de ambas páginas
    - _Requisitos: 6.1_
  
  - [x] 15.2 Verificar clase btn-primary
    - Confirmar gradiente y box-shadow
    - Verificar hover effect consistente
    - _Requisitos: 6.2, 6.3_
  
  - [ ]* 15.3 Escribir property test para consistencia de gradientes
    - **Propiedad 12: Consistencia de Gradientes**
    - **Valida: Requisitos 6.1, 6.2, 6.3, 6.4**

- [x] 16. Checkpoint - Verificar animaciones y gradientes
  - Ejecutar todos los property tests
  - Verificar animaciones en ambas páginas
  - Probar con prefers-reduced-motion activo
  - Verificar gradientes en modo claro y oscuro
  - Preguntar al usuario si hay ajustes necesarios

- [x] 17. Verificar y corregir modo oscuro
  - [x] 17.1 Auditar variables OKLCH en modo oscuro
    - Verificar que todas las variables de :root existen en .dark
    - Confirmar formato OKLCH correcto
    - _Requisitos: 4.4, 9.1_
  
  - [x] 17.2 Verificar glass-card en modo oscuro
    - Confirmar background: `oklch(0.15 0.02 250 / 60%)`
    - Confirmar border: `oklch(1 0 0 / 8%)`
    - _Requisitos: 9.2_
  
  - [x] 17.3 Verificar colores temáticos en modo oscuro
    - Para cada color (blue, green, amber, purple, cyan):
    - Verificar que hue y chroma se mantienen (±5° y ±0.02)
    - Verificar que solo cambia la luminosidad
    - _Requisitos: 9.3_
  
  - [ ]* 17.4 Escribir property test para variables de tema
    - **Propiedad 8: Variables OKLCH de Tema**
    - **Valida: Requisitos 4.4, 9.1**
  
  - [ ]* 17.5 Escribir property test para glass-card en modo oscuro
    - **Propiedad 15: Variables de Glass Card en Modo Oscuro**
    - **Valida: Requisitos 9.2**
  
  - [ ]* 17.6 Escribir property test para preservación de hue y chroma
    - **Propiedad 16: Preservación de Hue y Chroma en Modo Oscuro**
    - **Valida: Requisitos 9.3**
  
  - [ ]* 17.7 Escribir unit tests para modo oscuro
    - Test para cada componente en modo oscuro
    - Verificar valores computados de CSS
    - _Requisitos: 9.1, 9.2, 9.3_

- [x] 18. Implementar y verificar accesibilidad
  - [x] 18.1 Verificar outline de focus
    - Confirmar que todos los elementos interactivos tienen outline correcto
    - Valor: `outline: 2px solid oklch(0.65 0.18 230)` con `outline-offset: 2px`
    - _Requisitos: 10.1_
  
  - [x] 18.2 Verificar feedback visual en hover
    - Auditar todos los elementos interactivos
    - Confirmar que tienen al menos un cambio visual en hover
    - _Requisitos: 10.2_
  
  - [x] 18.3 Crear utilidad de validación de contraste
    - Función que calcula contraste WCAG entre texto y fondo
    - Verificar mínimo 4.5:1 para texto normal, 3:1 para texto grande
    - _Requisitos: 10.3_
  
  - [x] 18.4 Verificar áreas de click mínimas
    - Auditar todos los elementos interactivos
    - Confirmar que tienen al menos 44x44px
    - _Requisitos: 10.4_
  
  - [ ]* 18.5 Escribir property test para outline de focus
    - **Propiedad 17: Outline de Focus**
    - **Valida: Requisitos 10.1**
  
  - [ ]* 18.6 Escribir property test para feedback visual
    - **Propiedad 18: Feedback Visual en Hover**
    - **Valida: Requisitos 10.2**
  
  - [ ]* 18.7 Escribir property test para contraste de color
    - **Propiedad 19: Contraste de Color Mínimo**
    - **Valida: Requisitos 10.3**
  
  - [ ]* 18.8 Escribir property test para área de click
    - **Propiedad 20: Área de Click Mínima**
    - **Valida: Requisitos 10.4**
  
  - [ ]* 18.9 Escribir unit tests de accesibilidad con axe-core
    - Ejecutar axe-core en ambas páginas
    - Verificar que no hay violaciones WCAG 2.1 Level AA
    - _Requisitos: 10.1, 10.2, 10.3, 10.4_

- [x] 19. Verificar efectos de fondo
  - [x] 19.1 Verificar water-bg en página principal
    - Confirmar clase water-bg aplicada
    - Verificar animación waterFlow (15s ease-in-out infinite)
    - _Requisitos: 4.1_
  
  - [x] 19.2 Verificar burbujas de agua
    - Confirmar clase water-bubble en todas las burbujas
    - Verificar animación floatUp con duraciones entre 9s y 16s
    - _Requisitos: 4.3_
  
  - [ ]* 19.3 Escribir property test para animación de burbujas
    - **Propiedad 7: Animación de Burbujas de Agua**
    - **Valida: Requisitos 4.3**
  
  - [ ]* 19.4 Escribir unit tests para efectos de fondo
    - Test para water-bg en página principal
    - Test para fondo del dashboard
    - _Requisitos: 4.1, 4.2_

- [x] 20. Checkpoint final - Validación completa
  - Ejecutar todos los property tests (20 tests, 100 iteraciones cada uno)
  - Ejecutar todos los unit tests (~33 tests)
  - Verificar cobertura de código (mínimo 80%)
  - Ejecutar tests de accesibilidad con axe-core
  - Verificar visualmente ambas páginas en:
    - Modo claro y oscuro
    - Diferentes tamaños de pantalla (mobile, tablet, desktop)
    - Con prefers-reduced-motion activo
  - Preguntar al usuario si hay ajustes finales necesarios

- [x] 22. Mejorar Login/Register - Jerarquía Tipográfica
  - [x] 22.1 Estandarizar títulos y labels
    - Hero title: cambiar de `text-[2.75rem]` a `text-5xl md:text-6xl` (sistema)
    - Form title: cambiar de `text-[1.75rem]` a `text-2xl md:text-3xl` (sistema)
    - Labels: cambiar de `text-[11px]` a `text-xs` (12px, más legible)
    - Descriptions: cambiar de `text-[15px]` a `text-sm md:text-base` (sistema)
    - _Requisitos: 3.2, 3.3_
  
  - [x] 22.2 Unificar tamaños de badges y pills
    - Feature pills: mantener `text-[11px]` pero estandarizar padding a `px-3 py-1`
    - Norm badges: cambiar a `text-[10px]` con `px-2.5 py-1` (consistente)
    - Status badge: usar mismo estilo que feature pills
    - _Requisitos: 1.3, 7.2_
  
  - [ ]* 22.3 Escribir property test para jerarquía tipográfica en login
    - **Propiedad 6: Jerarquía Tipográfica Consistente**
    - **Valida: Requisitos 3.2, 3.3**

- [x] 23. Mejorar Login/Register - Sistema de Espaciado
  - [x] 23.1 Estandarizar espaciado en brand panel
    - Cambiar `gap-3`, `gap-4` a sistema consistente
    - Feature grid: usar `gap-3` (12px) consistente
    - Sections: usar `space-y-8` (32px) consistente
    - _Requisitos: 3.1, 3.4_
  
  - [x] 23.2 Estandarizar espaciado en auth form
    - Form wrapper: cambiar `space-y-8` a `space-y-6` (más compacto)
    - Input groups: usar `space-y-1.5` (6px) consistente
    - Buttons: usar `gap-4` (16px) entre elementos
    - _Requisitos: 3.1, 3.4_
  
  - [x] 23.3 Unificar padding de secciones
    - Brand panel: mantener `p-12` (48px)
    - Auth form: cambiar de `p-6 sm:p-12` a `p-8 md:p-12` (consistente con dashboard)
    - _Requisitos: 3.1_
  
  - [ ]* 23.4 Escribir property test para sistema de espaciado en login
    - **Propiedad 5: Sistema de Espaciado Basado en Múltiplos de 4px**
    - **Valida: Requisitos 3.1, 3.4**

- [x] 24. Mejorar Login/Register - Inputs y Estados
  - [x] 24.1 Aplicar principio "inset" a inputs
    - Cambiar background de `oklch(0.18 0.01 260)` a `oklch(0.16 0.01 260)` (más oscuro)
    - Esto señala visualmente "tipo aquí" sin borders pesados
    - Mantener focus ring actual (funciona bien)
    - _Requisitos: 10.1, 10.2_
  
  - [x] 24.2 Mejorar botón de Google
    - Cambiar de `background: white` a usar surface elevation del sistema
    - Aplicar `bg-elevated2 text-foreground` con border sutil
    - Mantener logo de Google pero integrar al sistema de colores
    - _Requisitos: 1.1, 4.4_
  
  - [x] 24.3 Estandarizar alerts
    - Error alert: usar `bg-destructive/15 border-destructive/25 text-destructive`
    - Success alert: usar `bg-green-500/15 border-green-500/25 text-green-400`
    - Padding: cambiar de `p-3.5` a `p-4` (sistema)
    - _Requisitos: 1.2, 8.1_
  
  - [ ]* 24.4 Escribir unit tests para estados de inputs
    - Test focus state con ring
    - Test error state con border destructive
    - Test disabled state con opacity
    - _Requisitos: 10.1, 10.2_

- [x] 25. Mejorar Login/Register - Depth y Elevación
  - [x] 25.1 Aplicar sistema de elevación a surfaces
    - Base canvas: `oklch(0.14 0.01 260)`
    - Feature cards: `bg-white/3` → `bg-elevated1` (OKLCH)
    - Inputs: aplicar elevated1 (ya hecho en 24.1)
    - _Requisitos: 4.2, 9.2_
  
  - [x] 25.2 Estandarizar borders
    - Feature cards: cambiar `border-white/6` a `border-border/20` (OKLCH)
    - Norm badges: cambiar `border-white/6` a `border-border/30` (OKLCH)
    - Dividers: cambiar `oklch(0.25 0.01 260)` a `border-border/30` (token)
    - _Requisitos: 4.4, 9.1_
  
  - [ ]* 25.3 Escribir property test para variables OKLCH en login
    - **Propiedad 8: Variables OKLCH de Tema**
    - **Valida: Requisitos 4.4, 9.1**

- [x] 26. Checkpoint - Verificar Login/Register
  - Ejecutar property tests de login
  - Verificar visualmente en modo claro y oscuro
  - Probar flujo completo de login y registro
  - Verificar responsive en mobile, tablet, desktop
  - Preguntar al usuario si hay ajustes necesarios

- [x] 27. Mejorar Dashboard - Stat Cards Uniformes
  - [x] 27.1 Unificar estructura de todas las stat cards
    - Todas deben usar `text-3xl` para valores (no `text-lg`)
    - Estructura consistente: label + value + description
    - Cards de "Norma", "Motor", "IA": cambiar valores a formato consistente
    - _Requisitos: 2.1, 2.4_
  
  - [x] 27.2 Mejorar expresión de stat cards según contenido
    - **Proyectos/Cálculos**: Número grande + unidad + descripción (actual, mantener)
    - **Norma**: Código grande + versión pequeña + descripción
    - **Motor**: Nombre técnico + método + descripción
    - **IA**: Stack (AG + LLM) + componentes + descripción
    - Cada una debe expresarse según su contenido, no todas iguales
    - _Requisitos: 2.1, 2.4_
  
  - [ ]* 27.3 Escribir property test para estructura de stat cards
    - **Propiedad 3: Estructura y Comportamiento de Stat Cards**
    - **Valida: Requisitos 2.1, 2.3, 2.4**

- [x] 28. Mejorar Dashboard - Capacidades Cards
  - [x] 28.1 Ajustar densidad de información
    - Iconos: cambiar de `w-10 h-10` a `w-12 h-12` (más presencia)
    - Título: mantener `text-sm font-semibold`
    - Descripción: cambiar de `text-xs` a `text-sm` (más legible)
    - Padding: mantener `p-5`
    - _Requisitos: 7.1, 7.4_
  
  - [x] 28.2 Mejorar badges de tecnologías
    - Cambiar de `text-[10px]` a `text-xs` (más legible)
    - Padding: cambiar de `px-1.5` a `px-2` (más cómodo)
    - Mantener colores temáticos actuales
    - _Requisitos: 7.2_
  
  - [ ]* 28.3 Escribir property test para estructura de capacidades cards
    - **Propiedad 13: Estructura de Tarjetas de Capacidades**
    - **Valida: Requisitos 7.1, 7.2, 7.4**

- [x] 29. Mejorar Dashboard - Normativa Quick Reference
  - [x] 29.1 Agregar indicadores visuales de rango
    - Crear componente de barra de progreso para rangos
    - P. Dinámica: 10 m.c.a. → mostrar en rango 0-50
    - P. Estática: 50 m.c.a. → mostrar en rango 0-60
    - Velocidad: 0.6-3.0 m/s → mostrar rango completo
    - _Requisitos: 8.1, 8.4_
  
  - [x] 29.2 Diferenciar importancia con hover
    - Cards críticas (presiones): hover más prominente
    - Cards informativas (diámetro): hover sutil
    - Usar transform y shadow diferenciados
    - _Requisitos: 2.2, 8.4_
  
  - [ ]* 29.3 Escribir property test para formato normativo
    - **Propiedad 14: Formato de Información Normativa**
    - **Valida: Requisitos 8.1, 8.2, 8.3**

- [x] 30. Mejorar Dashboard - Proyectos Recientes
  - [x] 30.1 Mejorar jerarquía visual
    - Nombre del proyecto: mantener `text-sm font-medium`
    - Metadata: reducir peso visual con `text-xs text-muted-foreground/50`
    - Status dot: aumentar tamaño de `w-2 h-2` a `w-2.5 h-2.5` (más visible)
    - _Requisitos: 3.2, 3.3_
  
  - [x] 30.2 Mejorar formato de fecha
    - Cambiar de `font-mono` a `font-sans` (no es dato técnico)
    - Mantener `text-[10px]` pero aumentar opacity
    - Formato: mantener dd/mm/yyyy
    - _Requisitos: 8.2_
  
  - [x] 30.3 Unificar padding de project cards
    - Cambiar de `p-3.5` a `p-4` (sistema)
    - Mantener `rounded-xl`
    - _Requisitos: 3.1, 7.4_

- [x] 31. Checkpoint - Verificar Dashboard
  - Ejecutar property tests de dashboard
  - Verificar visualmente en modo claro y oscuro
  - Probar con diferentes cantidades de proyectos (0, 1, 5, 10+)
  - Verificar responsive en mobile, tablet, desktop
  - Preguntar al usuario si hay ajustes necesarios

- [x] 32. Unificar Animaciones entre Login y Dashboard
  - [x] 32.1 Aplicar fade-in-up consistente
    - Login brand panel: aplicar delays progresivos
    - Login auth form: aplicar delays progresivos
    - Dashboard: ya tiene, verificar consistencia
    - _Requisitos: 5.1_
  
  - [x] 32.2 Estandarizar transiciones hover
    - Buttons: `duration-200` con `ease-in-out`
    - Cards: `duration-300` con `ease-in-out`
    - Inputs: `duration-200` con `ease-in-out`
    - _Requisitos: 1.4, 5.2_
  
  - [ ]* 32.3 Escribir property test para configuración de animaciones
    - **Propiedad 9: Configuración de Animaciones Fade-In-Up**
    - **Valida: Requisitos 5.1**

- [x] 33. Crear Componentes Reutilizables
  - [x] 33.1 Extraer StatusDot component
    - Props: status ('active' | 'draft' | 'error')
    - Estilos: tamaño, color, shadow según status
    - Usar en dashboard y futuras páginas
    - _Requisitos: 1.2_
  
  - [x] 33.2 Extraer NormBadge component
    - Props: norm (string), variant ('outline' | 'filled')
    - Estilos consistentes entre login y dashboard
    - _Requisitos: 1.3, 8.3_
  
  - [x] 33.3 Extraer StatCard component
    - Props: label, value, unit, description, color, gradient
    - Implementar signature: gradiente de presión superior
    - Usar en dashboard y futuras páginas
    - _Requisitos: 2.1, 2.4_

- [x] 34. Documentar Sistema de Diseño
  - [x] 34.1 Crear guía de componentes de login/register
    - Documentar brand panel structure
    - Documentar auth form patterns
    - Ejemplos de uso de inputs, buttons, alerts
    - _Requisitos: Todos_
  
  - [x] 34.2 Crear guía de componentes de dashboard
    - Documentar stat cards y sus variantes
    - Documentar capacidades cards
    - Documentar normativa cards con indicadores
    - _Requisitos: Todos_
  
  - [x] 34.3 Documentar signature element
    - Explicar gradiente de presión hidráulica
    - Mostrar cómo aplicarlo en nuevos componentes
    - Ejemplos de uso correcto e incorrecto
    - _Requisitos: 2.1, 6.1_

- [x] 35. Checkpoint Final - Validación Completa de Login y Dashboard
  - Ejecutar todos los property tests (incluyendo nuevos de login/dashboard)
  - Ejecutar todos los unit tests
  - Verificar cobertura de código (mínimo 80%)
  - Verificar visualmente todas las páginas:
    - Landing page
    - Login/Register
    - Dashboard
  - Probar flujos completos:
    - Registro → Email → Login → Dashboard
    - Login → Dashboard → Crear Proyecto
  - Verificar en todos los modos:
    - Modo claro y oscuro
    - Mobile, tablet, desktop
    - Con prefers-reduced-motion activo
  - Ejecutar tests de accesibilidad con axe-core
  - Preguntar al usuario si hay ajustes finales necesarios

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada checkpoint es una oportunidad para validar el progreso y ajustar el plan
- Los property tests deben ejecutarse con mínimo 100 iteraciones cada uno
- Se recomienda usar Storybook para documentar componentes visualmente
- Se recomienda usar Chromatic o Percy para visual regression testing
- Todos los cambios deben ser incrementales y no romper el layout existente


## Tareas de Efectos Visuales Modernos

- [ ] 36. Implementar Carrusel de Proyectos Destacados
  - [ ] 36.1 Instalar y configurar Embla Carousel
    - Instalar: `npm install embla-carousel-react embla-carousel-autoplay`
    - Configurar opciones: loop, align, autoplay (6s)
    - _Requisitos: 11.1, 11.2, 11.3_
  
  - [ ] 36.2 Crear componente ProjectCarousel
    - Implementar estructura de carrusel con viewport y container
    - Agregar navegación con flechas (prev/next)
    - Agregar dots indicadores con estado activo
    - _Requisitos: 11.1, 11.2_
  
  - [ ] 36.3 Crear tarjetas de proyecto para carrusel
    - Estructura: imagen + overlay + contenido
    - Hover effect: scale en imagen, fade en overlay
    - Badges temáticos con colores del dominio
    - _Requisitos: 11.4_
  
  - [ ] 36.4 Implementar responsive del carrusel
    - Mobile: 1 slide visible
    - Tablet: 2 slides visibles
    - Desktop: 3 slides visibles
    - _Requisitos: 11.5_
  
  - [ ]* 36.5 Escribir property test para configuración de carrusel
    - **Propiedad 21: Configuración de Carrusel**
    - **Valida: Requisitos 11.1, 11.2, 11.3, 11.5**

- [ ] 37. Implementar Background Animado con Partículas de Agua
  - [ ] 37.1 Crear componente WaterParticlesCanvas
    - Implementar canvas con requestAnimationFrame
    - Crear clase WaterParticle con movimiento orgánico
    - Implementar wobble horizontal y movimiento ascendente
    - _Requisitos: 12.1, 12.2_
  
  - [ ] 37.2 Configurar partículas con colores OKLCH del dominio
    - Usar blue (230°), cyan (200°) con baja saturación
    - Opacidad dinámica (0.1-0.4)
    - Tamaños variables (2-6px)
    - _Requisitos: 12.4_
  
  - [ ] 37.3 Optimizar performance del canvas
    - Limitar FPS a 60
    - Reducir partículas en mobile (25 en lugar de 50)
    - Implementar cleanup en unmount
    - _Requisitos: 12.1_
  
  - [ ] 37.4 Crear ondas SVG animadas para Dashboard
    - Diseñar 2-3 ondas con paths diferentes
    - Animar con CSS animations (20-25s)
    - Posicionar en bottom con baja opacidad
    - _Requisitos: 12.3_
  
  - [ ] 37.5 Implementar respeto a prefers-reduced-motion
    - Desactivar animaciones si está activo
    - Mostrar partículas estáticas o ninguna
    - _Requisitos: 12.5_
  
  - [ ]* 37.6 Escribir property test para partículas de agua
    - **Propiedad 22: Comportamiento de Partículas de Agua**
    - **Valida: Requisitos 12.1, 12.2, 12.4**

- [ ] 38. Checkpoint - Verificar Carrusel y Background Animado
  - Verificar carrusel en landing y dashboard
  - Probar autoplay y pausar en hover
  - Verificar background animado en ambas páginas
  - Medir performance (FPS, CPU usage)
  - Probar con prefers-reduced-motion activo
  - Preguntar al usuario si hay ajustes necesarios

- [ ] 39. Implementar Scroll Animations con Intersection Observer
  - [ ] 39.1 Crear hook useScrollAnimation
    - Implementar Intersection Observer con threshold 0.2
    - Retornar ref y estado isVisible
    - Desconectar observer después de primera animación
    - _Requisitos: 13.1, 13.4_
  
  - [ ] 39.2 Crear componente AnimatedSection
    - Wrapper que usa useScrollAnimation
    - Aplicar fade-in-up cuando isVisible
    - Transición: 700ms ease-out
    - _Requisitos: 13.1_
  
  - [ ] 39.3 Implementar stagger animation para stat cards
    - Aplicar delays incrementales (100ms)
    - Máximo 4 elementos con stagger
    - _Requisitos: 13.3_
  
  - [ ] 39.4 Aplicar scroll animations en secciones clave
    - Hero sections: fade-in-up
    - Stat cards: stagger animation
    - Feature cards: fade-in-up
    - _Requisitos: 13.1, 13.3_
  
  - [ ]* 39.5 Escribir property test para scroll animations
    - **Propiedad 23: Configuración de Scroll Animations**
    - **Valida: Requisitos 13.1, 13.4, 13.5**

- [ ] 40. Implementar Parallax Effect Sutil
  - [ ] 40.1 Crear hook useParallax
    - Implementar scroll listener con throttle
    - Usar transform para performance
    - Aplicar will-change hint
    - _Requisitos: 13.2_
  
  - [ ] 40.2 Aplicar parallax en hero sections
    - Background: velocidad 0.3x
    - Overlay: velocidad 0.5x
    - Solo en desktop (min-width: 1024px)
    - _Requisitos: 13.2_
  
  - [ ]* 40.3 Escribir unit test para parallax effect
    - Simular scroll y verificar transform
    - Verificar throttle funciona correctamente
    - _Requisitos: 13.2_

- [ ] 41. Implementar Microinteracciones en Componentes
  - [ ] 41.1 Crear hook useRipple para botones
    - Implementar ripple effect en click
    - Duración: 600ms
    - Color: oklch(1 0 0 / 0.3)
    - _Requisitos: 14.1, 14.2_
  
  - [ ] 41.2 Agregar microinteracciones de hover en botones
    - Scale(1.02) en hover
    - Scale(0.98) en active (100ms)
    - Shadow animado
    - _Requisitos: 14.1, 14.2_
  
  - [ ] 41.3 Agregar lift effect en cards
    - TranslateY(-4px) en hover
    - Shadow expansion
    - Border glow con primary color
    - _Requisitos: 14.3_
  
  - [ ] 41.4 Agregar pulse effect en input focus
    - Border glow animado
    - Ring con pulse animation (2s infinite)
    - _Requisitos: 14.4_
  
  - [ ] 41.5 Implementar spring animations
    - Usar cubic-bezier para movimiento natural
    - Aplicar en todas las microinteracciones
    - _Requisitos: 14.5_
  
  - [ ]* 41.6 Escribir property test para microinteracciones
    - **Propiedad 24: Microinteracciones en Componentes**
    - **Valida: Requisitos 14.1, 14.2, 14.3, 14.4**

- [ ] 42. Checkpoint - Verificar Scroll Animations y Microinteracciones
  - Verificar scroll animations en todas las secciones
  - Probar parallax effect en hero sections
  - Verificar microinteracciones en botones, cards, inputs
  - Probar ripple effect en clicks
  - Verificar con prefers-reduced-motion activo
  - Preguntar al usuario si hay ajustes necesarios

- [ ] 43. Implementar Carrusel de Testimonios
  - [ ] 43.1 Crear componente TestimonialCarousel
    - Usar Embla Carousel con fade transition
    - Autoplay: 6s con pause en hover
    - _Requisitos: 15.1, 15.3, 15.4_
  
  - [ ] 43.2 Crear tarjetas de testimonio
    - Estructura: quote + author + badges
    - Glass card con gradiente sutil
    - Avatar con ring de primary color
    - _Requisitos: 15.1, 15.2_
  
  - [ ] 43.3 Implementar dots con progreso circular
    - SVG circle con stroke-dasharray animado
    - Mostrar progreso del testimonio activo
    - _Requisitos: 15.4_
  
  - [ ] 43.4 Agregar badges de normas/proyectos
    - Colores temáticos del dominio
    - Formato: text-[10px] con border
    - _Requisitos: 15.5_
  
  - [ ]* 43.5 Escribir property test para carrusel de testimonios
    - **Propiedad 25: Configuración de Carrusel de Testimonios**
    - **Valida: Requisitos 15.1, 15.3, 15.4**

- [ ] 44. Implementar Loading States y Page Transitions
  - [ ] 44.1 Crear componente HydraulicLoader
    - SVG con animación de flujo de agua
    - Ondas animadas con path morphing
    - Colores: blue y cyan del dominio
    - _Requisitos: 16.1_
  
  - [ ] 44.2 Implementar page transitions con Framer Motion
    - Fade transition: 200ms
    - Overlay sutil durante transición
    - _Requisitos: 16.2_
  
  - [ ] 44.3 Crear skeleton loaders
    - Componentes: SkeletonText, SkeletonCard, SkeletonAvatar
    - Shimmer effect con gradiente animado
    - _Requisitos: 16.3_
  
  - [ ] 44.4 Crear sistema de toast notifications
    - Slide-in animation desde top-right
    - Auto-dismiss: 3-5s según tipo
    - Variantes: success, error, info, warning
    - _Requisitos: 16.4_
  
  - [ ] 44.5 Implementar respeto a prefers-reduced-motion
    - Desactivar animaciones de loader
    - Mostrar loader estático
    - Transiciones instantáneas
    - _Requisitos: 16.5_
  
  - [ ]* 44.6 Escribir unit tests para loading states
    - Test para HydraulicLoader
    - Test para skeleton loaders
    - Test para toast notifications
    - _Requisitos: 16.1, 16.3, 16.4_

- [ ] 45. Implementar Efectos de Partículas Interactivas
  - [ ] 45.1 Crear sistema de partículas de cursor
    - Generar partículas en movimiento del cursor
    - Limitar a 20 partículas activas
    - Lifetime: 1-2s con fade out
    - _Requisitos: 17.1, 17.3_
  
  - [ ] 45.2 Implementar ripple effect en clicks
    - Ondas concéntricas desde punto de click
    - Máximo 3 ripples simultáneos
    - Duración: 800ms
    - _Requisitos: 17.2_
  
  - [ ] 45.3 Configurar colores OKLCH del dominio
    - Usar blue, cyan con baja opacidad (0.1-0.3)
    - _Requisitos: 17.4_
  
  - [ ] 45.4 Optimizar para performance
    - Desactivar en mobile
    - Desactivar con prefers-reduced-motion
    - Limitar cantidad de partículas
    - _Requisitos: 17.5_
  
  - [ ]* 45.5 Escribir property test para partículas interactivas
    - **Propiedad 26: Comportamiento de Partículas Interactivas**
    - **Valida: Requisitos 17.1, 17.3, 17.4**

- [ ] 46. Checkpoint - Verificar Loading States y Partículas
  - Verificar loader hidráulico en transiciones
  - Probar skeleton loaders en dashboard
  - Verificar toast notifications
  - Probar partículas de cursor en hero sections
  - Verificar ripple effect en clicks
  - Medir performance y optimizar si es necesario
  - Preguntar al usuario si hay ajustes necesarios

- [ ] 47. Implementar Animaciones de Números y Contadores
  - [ ] 47.1 Crear hook useCounterAnimation
    - Animar desde 0 hasta valor final
    - Duración: 500ms base + 10ms por dígito
    - Easing: ease-out
    - _Requisitos: 18.1, 18.2_
  
  - [ ] 47.2 Integrar con useScrollAnimation
    - Iniciar animación cuando entra en viewport
    - Solo animar una vez
    - _Requisitos: 18.1_
  
  - [ ] 47.3 Implementar formato de números
    - Soportar decimales
    - Soportar separadores de miles
    - Mantener formato durante animación
    - _Requisitos: 18.3_
  
  - [ ] 47.4 Agregar pulse effect al completar
    - Scale(1.05) → Scale(1.0)
    - Duración: 300ms
    - _Requisitos: 18.4_
  
  - [ ] 47.5 Aplicar en stat cards del dashboard
    - Animar todos los números de stat cards
    - Respetar prefers-reduced-motion
    - _Requisitos: 18.1, 18.5_
  
  - [ ]* 47.6 Escribir property test para animaciones de números
    - **Propiedad 27: Animaciones de Contadores**
    - **Valida: Requisitos 18.1, 18.2, 18.5**

- [ ] 48. Implementar Efectos de Hover en Imágenes
  - [ ] 48.1 Agregar zoom effect en imágenes de proyecto
    - Scale(1.05) en hover
    - Overflow hidden en container
    - Transición: 400ms ease-out
    - _Requisitos: 19.1, 19.4_
  
  - [ ] 48.2 Implementar overlay gradient
    - Gradient de bottom a top
    - Opacity 0 → 1 en hover
    - _Requisitos: 19.2_
  
  - [ ] 48.3 Agregar filtros de imagen en hover
    - Brightness(1.1)
    - Saturate(1.1)
    - _Requisitos: 19.3_
  
  - [ ] 48.4 Asegurar aspect ratio y cursor pointer
    - Mantener aspect ratio en todas las imágenes
    - Cursor pointer en imágenes interactivas
    - _Requisitos: 19.5_
  
  - [ ]* 48.5 Escribir unit tests para efectos de imagen
    - Test para zoom effect
    - Test para overlay gradient
    - Test para filtros
    - _Requisitos: 19.1, 19.2, 19.3_

- [ ] 49. Implementar Grid Animado de Fondo
  - [ ] 49.1 Crear SVG pattern para grid
    - Tamaño: 40x40px
    - Color: oklch con opacidad 0.03-0.05
    - Stroke width: 1px
    - _Requisitos: 20.1, 20.3_
  
  - [ ] 49.2 Implementar animación de grid
    - Movimiento diagonal (up-right)
    - Duración: 25s
    - Loop perfecto con translate(40, 40)
    - _Requisitos: 20.2_
  
  - [ ] 49.3 Aplicar grid en secciones específicas
    - Hero sections de landing
    - Background de dashboard
    - Posición: absolute, z-index bajo
    - _Requisitos: 20.4_
  
  - [ ] 49.4 Implementar respeto a prefers-reduced-motion
    - Desactivar animación
    - Mantener grid estático
    - _Requisitos: 20.5_
  
  - [ ]* 49.5 Escribir property test para grid animado
    - **Propiedad 28: Configuración de Grid Animado**
    - **Valida: Requisitos 20.1, 20.2, 20.5**

- [ ] 50. Checkpoint Final - Validación Completa de Efectos Visuales
  - Ejecutar todos los property tests de efectos visuales (8 nuevos)
  - Ejecutar todos los unit tests de efectos visuales (~15 nuevos)
  - Verificar performance en todas las páginas:
    - FPS debe mantenerse > 55 en desktop
    - FPS debe mantenerse > 30 en mobile
    - CPU usage < 30% en idle
  - Verificar todos los efectos visuales:
    - Carrusel de proyectos y testimonios
    - Background animado con partículas
    - Scroll animations y parallax
    - Microinteracciones en todos los componentes
    - Loading states y transitions
    - Partículas interactivas
    - Animaciones de números
    - Efectos de hover en imágenes
    - Grid animado de fondo
  - Verificar accesibilidad:
    - Todos los efectos respetan prefers-reduced-motion
    - Navegación por teclado funciona correctamente
    - Screen readers no son interrumpidos por animaciones
  - Verificar responsive:
    - Mobile: efectos optimizados o desactivados
    - Tablet: efectos funcionan correctamente
    - Desktop: todos los efectos activos
  - Medir y optimizar:
    - Lighthouse Performance Score > 90
    - Lighthouse Accessibility Score > 95
    - Bundle size incrementado < 50KB
  - Preguntar al usuario si hay ajustes finales necesarios

## Notas Adicionales sobre Efectos Visuales

- Todos los efectos visuales deben estar relacionados al dominio hidráulico (agua, flujo, presión, tuberías)
- Priorizar performance: usar requestAnimationFrame, throttle, debounce donde sea necesario
- Respetar prefers-reduced-motion en TODOS los efectos animados
- Optimizar para mobile: reducir o desactivar efectos pesados
- Mantener consistencia con el sistema de diseño OKLCH existente
- Los efectos deben ser sutiles y profesionales, no distractores
- Usar lazy loading para componentes pesados (carruseles, canvas)
- Implementar cleanup adecuado en useEffect para evitar memory leaks
- Considerar usar Web Workers para cálculos pesados si es necesario
- Documentar cada efecto con comentarios explicando la relación con el dominio hidráulico

