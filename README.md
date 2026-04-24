# StoreMaster Frontend - Enterprise Dashboard

Interfaz de administración de activos desarrollada para StoreMaster Enterprise. Esta aplicación proporciona una consola de control centralizada, integrada con una arquitectura de microservicios para la gestión de inventarios y activos comerciales en tiempo real.

## Características Funcionales
*   **Interfaz de Usuario Avanzada:** Estética corporativa optimizada para la visualización de datos y flujos de trabajo administrativos.
*   **Sincronización de Datos:** Integración bidireccional con los servicios de catálogo e inventario.
*   **Gestión de Accesos:** Implementación de flujos de autenticación basados en estándares JWT.
*   **Arquitectura Adaptativa:** Diseño responsivo compatible con dispositivos móviles y estaciones de trabajo.

## Tecnologías Utilizadas
*   **Framework:** Vue 3 (Composition API)
*   **Herramienta de Construcción:** Vite
*   **Estilizado:** Tailwind CSS
*   **Estado Global:** Pinia
*   **Cliente HTTP:** Axios
*   **Iconografía:** Lucide Vue

## Configuración del Entorno Local

### Requisitos Técnicos
*   Node.js versión 18 o superior
*   Gestor de paquetes npm o yarn

### Instrucciones de Instalación
1.  **Instalación de dependencias:**
    ```bash
    npm install
    ```
2.  **Configuración de Variables de Entorno:**
    Crear un archivo `.env` en el directorio raíz con las siguientes definiciones:
    ```env
    VITE_PRODUCTS_URL=http://localhost:8080
    VITE_INVENTORY_URL=http://localhost:8081
    ```
3.  **Ejecución en modo desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

## Pruebas y Calidad del Frontend
Para garantizar el cumplimiento de los estándares de calidad exigidos, se han implementado las siguientes suites de pruebas:

### Pruebas Unitarias (Vitest)
*   **Módulos Evaluados:** Gestión de estado global con Pinia (autenticación y productos) y lógica de componentes críticos.
*   **Comando de ejecución:** `npm run test:unit`

### Pruebas de Extremo a Extremo (Playwright)
Se han automatizado los flujos de usuario más críticos:
*   **Flujo Principal:** Listado de productos -> Navegación al detalle -> Ejecución de compra exitosa.
*   **Gestión de Errores:** Validación de la respuesta del sistema ante stock insuficiente o fallo en la comunicación con el microservicio de inventario.
*   **Comando de ejecución:** `npm run test:e2e`

## Despliegue en Entornos de Producción (Vercel)
La plataforma Vercel ha sido seleccionada basándose en su capacidad de entrega mediante CDN y su integración nativa con flujos de CI/CD.

### Configuración de Variables
Es imperativo definir las siguientes variables de entorno en el panel de Vercel:
*   `VITE_PRODUCTS_URL`: Endpoint de producción del servicio de productos.
*   `VITE_INVENTORY_URL`: Endpoint de producción del servicio de inventario.

## Justificación de Infraestructura
La arquitectura aprovecha las capas gratuitas de Render y Vercel para demostrar la viabilidad de una solución de microservicios distribuida con costo operativo cero.

## Documentación Técnica
Para una comprensión profunda de las decisiones de diseño y el cumplimiento de los requisitos, consulte:
*   [Decisiones Técnicas (Concurrencia, Resiliencia e Idempotencia)](./docs/technical_decisions.md)
*   [Arquitectura del Sistema (Diagrama C4)](./docs/Architecture.md)
*   [Evidencia de Ejecución de Pruebas](./docs/Testing_Evidence.md)

---
*StoreMaster Enterprise - Documentación Técnica Oficial.*



