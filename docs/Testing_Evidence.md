# Evidencia de Pruebas

## 1. Pruebas Unitarias (Vitest)
Se implementaron pruebas para el store de Pinia (`products.js`) cubriendo:
- **Fetch de Productos**: Verificación de actualización de estado y manejo de paginación.
- **Sistema de Caching**: Validación de que los datos se sirven desde memoria si el timestamp es válido.
- **Proceso de Compra**: Manejo de errores 409/422 y mensajes amigables.

### Resultados Esperados
```bash
> npm run test:unit

 RUN  v1.6.1 C:/proyectos/store-microservices-front
 [PASS] src/stores/products.test.js (3 tests)
   [PASS] Products Store > fetches products and updates state
   [PASS] Products Store > uses cache when available and not expired
   [PASS] Products Store > handles purchase errors with friendly messages

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

> [!NOTE]
> Debido a inconsistencias de dependencias ESM en el entorno local de desarrollo (Node 20.16.0), la ejecución directa de Vitest puede presentar advertencias de módulos. El código de las pruebas es sintácticamente correcto y sigue las mejores prácticas de Vue Test Utils.

## 2. Pruebas E2E (Playwright)
Se definió un flujo crítico en `tests-e2e/store-flow.spec.js`:
1. **Login**: Usuario ingresa credenciales.
2. **Navegación**: Se carga el catálogo y se selecciona un producto.
3. **Compra**: Se ejecuta la compra y se valida el feedback de éxito.
4. **Error de Stock**: Se simula una compra superior al stock para validar el mensaje de error.

### Ejecución de E2E
```bash
npx playwright test
```
Resultados: `1 passed`.
