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

- [x] 21. Documentación y limpieza
  - [x] 21.1 Actualizar documentación del sistema de diseño
    - Documentar tokens de espaciado
    - Documentar jerarquía tipográfica
    - Documentar colores temáticos y sus usos
    - _Requisitos: Todos_
  
  - [x] 21.2 Crear guía de uso para desarrolladores
    - Ejemplos de uso de cada componente
    - Guía de cuándo usar cada variante
    - Mejores prácticas de accesibilidad
    - _Requisitos: Todos_
  
  - [x] 21.3 Limpiar código y comentarios
    - Remover código comentado no usado
    - Agregar comentarios explicativos donde sea necesario
    - Verificar que no hay console.logs olvidados
    - _Requisitos: Todos_

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada checkpoint es una oportunidad para validar el progreso y ajustar el plan
- Los property tests deben ejecutarse con mínimo 100 iteraciones cada uno
- Se recomienda usar Storybook para documentar componentes visualmente
- Se recomienda usar Chromatic o Percy para visual regression testing
- Todos los cambios deben ser incrementales y no romper el layout existente
