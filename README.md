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

## Despliegue en Entornos de Producción (Vercel)

La plataforma Vercel ha sido seleccionada como host para el frontend por las siguientes razones técnicas:
*   **Optimización de Entrega:** Utilización de redes de entrega de contenido (CDN) globales para minimizar tiempos de respuesta.
*   **Escalabilidad:** Infraestructura preparada para el manejo de tráfico variable sin intervención manual.
*   **Integración Continua:** Flujos de despliegue automatizados para garantizar la integridad del código en producción.

### Configuración de Variables en Producción
Es imperativo configurar las siguientes variables en el panel de control del host:
*   `VITE_PRODUCTS_URL`: Endpoint oficial del servicio de productos.
*   `VITE_INVENTORY_URL`: Endpoint oficial del servicio de inventario.

## Justificación de Infraestructura
La arquitectura del sistema aprovecha las capacidades de las capas gratuitas de Render (Backend y Base de Datos) y Vercel (Frontend). Esta estrategia permite la validación de la arquitectura de microservicios y la entrega de un Producto Mínimo Viable (MVP) con alta fidelidad técnica y costo operativo nulo.

---
*StoreMaster Enterprise - Documentación Técnica Oficial.*
