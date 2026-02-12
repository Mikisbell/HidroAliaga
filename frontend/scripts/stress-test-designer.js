
import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración de carga: 50 usuarios virtuales durante 30 segundos
export let options = {
    stages: [
        { duration: '5s', target: 20 }, // Ramp up
        { duration: '20s', target: 50 }, // Stay at 50 users
        { duration: '5s', target: 0 },  // Ramp down
    ],
};

const BASE_URL = 'http://localhost:3002';

// Generar coordenadas aleatorias
function randomCoord() {
    return (Math.random() * 100).toFixed(4);
}

export default function () {
    // Simular creación de Nudo (optimizado sin revalidatePath)
    // Nota: Esto asume que tendríamos un endpoint API, pero como son server actions, 
    // simularemos la carga golpeando la API que las invoca o un endpoint equivalente si existe.
    // Dado que Next.js Server Actions son POSTs a la misma URL con headers específicos,
    // para simplificar el stress test apuntaremos a la API route si existe, o simularemos navegación.

    // Para este test específico de "estrés de área", vamos a golpear el endpoint de proyecto 
    // que anteriormente era lento por el revalidatePath.

    const projectId = '0e9f25ef-72a2-4b81-0081-8b9cad0e1f20'; // Usar un ID real o mock

    // 1. Cargar el diseñador (lectura)
    let res = http.get(`${BASE_URL}/proyectos/${projectId}`);
    check(res, { 'status is 200': (r) => r.status === 200 });

    // 2. Simular carga de API de nudos (lo que hace el cliente al iniciar)
    let resApi = http.get(`${BASE_URL}/api/proyectos/${projectId}/nudos`);
    check(resApi, { 'api status is 200': (r) => r.status === 200 });

    sleep(1);
}
