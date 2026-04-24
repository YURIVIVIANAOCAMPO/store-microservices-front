# Decisiones Técnicas

## 1. Gestión de Concurrencia (Backend/Frontend)
- **Desafío**: Múltiples usuarios comprando el mismo producto simultáneamente.
- **Solución**: El Inventory Service utiliza **Bloqueo Optimista** (`@Version` en JPA) para asegurar que una transacción solo se complete si el stock no ha cambiado desde que se leyó.
- **Frontend**: El estado `stock` se refresca inmediatamente después de cada compra para mantener la UI sincronizada.

## 2. Idempotencia
- **Desafío**: Reintentos de red que resultan en cobros o descuentos de stock duplicados.
- **Solución**: Se implementó un header `Idempotency-Key` en las peticiones de compra. El Inventory Service valida esta llave antes de procesar la transacción.
- **Frontend**: Se genera una llave única (uuid/timestamp) para cada intento de compra.

## 3. Resiliencia (Plus Senior)
- **Retry Logic**: Se implementó un interceptor en Axios que detecta fallos de comunicación (timeouts, errores 5xx temporales) y reintenta la petición hasta 3 veces con un backoff simple.
- **Circuit Breaker (Implícito)**: El frontend maneja estados de error claros si los reintentos fallan, permitiendo al usuario reintentar manualmente.

## 4. Estrategia de Caching
- **Implementación**: Pinia store con lógica de expiración.
- **Lógica**: Los productos se guardan en memoria con un timestamp. Si la petición ocurre dentro de los 5 minutos siguientes, se sirve desde el cache a menos que el usuario fuerce un refresco (Pull-to-refresh).
- **Invalidación**: El cache se invalida automáticamente tras una compra exitosa para asegurar que los datos de stock y precio sean precisos.

## 5. Diseño de Interfaz
- **Tailwind CSS**: Se eligió por su flexibilidad para crear una UI "SaaS-like" sin la sobrecarga de frameworks de componentes rígidos.
- **Accesibilidad**: Se utilizaron estados de `loading`, `empty`, `error` y `success` para guiar al usuario en todo el flujo.
