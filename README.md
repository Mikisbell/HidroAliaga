# H-Redes Perú
## Sistema de Diseño, Análisis y Optimización de Redes de Distribución de Agua Potable

Aplicación web interactiva para el diseño, análisis y optimización de redes de distribución de agua potable (abiertas, cerradas y mixtas), integrando el marco normativo peruano vigente (RNE y RM 192-2018) y motores de cálculo robustos con transparencia académica.

### Características Principales

- **Motor Hidráulico Híbrido**: Implementación del método de Hardy Cross para redes cerradas, cálculo determinístico para redes abiertas, y algoritmos híbridos para redes mixtas.
- **Visualización GIS**: Integración con Leaflet para mapas interactivos con cotas automáticas desde DEM.
- **Optimizador de Diámetros**: Algoritmo Genético para minimizar costos cumpliendo normativas.
- **Copiloto Normativo**: Asistente LLM para consultas sobre normativa peruana.
- **Transparencia Académica**: Tabla de iteraciones completa para validación y aprendizaje.

### Stack Tecnológico

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Python (FastAPI) + WNTR
- **Base de Datos**: PostgreSQL + PostGIS
- **IA/ML**: DEAP (Algoritmos Genéticos), WNTR (Simulación Hidráulica)

### Normativa Implementada

- **RNE**: Norma OS.050
- **RM 192-2018-VIVIENDA**: Ámbito Rural
- **RM 107-2025-VIVIENDA**: Dotaciones según clima
- **RM 192-2018**: Presiones mínimas y dotaciones

### Licencia

MIT
