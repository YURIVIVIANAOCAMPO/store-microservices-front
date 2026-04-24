# Store Microservices Frontend (Vue 3)

Este proyecto es la interfaz gráfica de la plataforma Store Microservices, construida bajo estándares de ingeniería Senior. Utiliza un ecosistema de microservicios para gestionar productos, usuarios e inventarios.

##  Requisitos Técnicos Cumplidos
- **Vue 3 + Vite**: Reactividad de alto rendimiento.
- **Router + Pinia**: Gestión de estado con cache local y expiración.
- **Tailwind CSS**: Diseño consistente con estética SaaS moderna.
- **Resiliencia**: Reintentos automáticos y manuales en Axios.
- **Consistencia**: Bloqueo optimista y llaves de idempotencia integradas.

##  Configuración y Ejecución

### Requisitos
- **Node.js** v20.16.0 o superior.
- **Docker & Docker Compose**.

### Variables de Entorno (`.env`)
Crea un archivo `.env` en la raíz con:
```env
VITE_PRODUCTS_URL=http://localhost:8080
VITE_INVENTORY_URL=http://localhost:8081
```

### Ejecución Local
```bash
npm install
npm run dev
```

### Ejecución con Docker Compose
Desde la raíz del ecosistema (donde está el archivo compose):
```bash
docker-compose up --build
```

---

##  Pruebas
### Unitarias (Vitest)
```bash
npm run test:unit
```
*Prueban la lógica de caching en Pinia y el manejo de errores de API.*

### E2E (Playwright)
```bash
npx playwright test
```
*Valida el flujo completo de Compra -> Stock insuficiente -> Éxito.*

---

##  Documentación del Proyecto
Puedes encontrar detalles profundos en la carpeta `docs/`:
1. [Arquitectura (C4 Model)](docs/Architecture.md)
2. [Decisiones Técnicas (Concurrencia, Resiliencia)](docs/Technical_Decisions.md)
3. [Evidencia de Pruebas](docs/Testing_Evidence.md)

##  Postman
Se ha incluido el archivo `Products.postman_collection.json` en la raíz para facilitar las pruebas de los endpoints de backend.

---

**Desarrollado con enfoque en Calidad, Escalabilidad y UX.**
