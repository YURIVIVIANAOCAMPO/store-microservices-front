# Arquitectura del Sistema (C4 Model)

## Contexto del Sistema (Nivel 1)
El sistema permite a los clientes finales explorar un catálogo de productos y realizar compras seguras.

```mermaid
graph TD
    User((Cliente))
    System[Store Ecosystem]
    ExternalAPI[External Payment - Optional]

    User --> System
    System -.-> ExternalAPI
```

## Contenedores (Nivel 2)
El ecosistema está compuesto por microservicios desacoplados que interactúan para garantizar la consistencia.

```mermaid
graph TD
    User((Cliente))
    
    subgraph "Frontend"
        VueApp[Vue 3 SPA]
    end

    subgraph "Microservicios"
        ProdS[Products Service - 8080]
        InvS[Inventory Service - 8081]
    end

    subgraph "Persistencia"
        ProdDB[(PostgreSQL 5432)]
        InvDB[(PostgreSQL 5433)]
    end

    User --> VueApp
    VueApp -->|Catálogo & Auth| ProdS
    VueApp -->|Inventario & Compras| InvS
    
    ProdS --> ProdDB
    InvS --> InvDB
    
    ProdS -.->|API Key Auth| InvS
```

### Componentes Clave
- **Vue 3 + Pinia**: Gestiona el estado local, cache de productos y la UI responsiva.
- **Products Service**: Gestiona el catálogo, usuarios y emite tokens JWT.
- **Inventory Service**: Gestión de stock físico, garantiza la idempotencia de las compras y previene sobreventas mediante bloqueo optimista.
