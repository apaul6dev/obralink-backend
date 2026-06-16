## Diagrama Del Flujo

```mermaid
flowchart TD

    A([Inicio]) --> B[Captar cliente]
    B --> C[Registrar cliente]
    C --> D[Crear oportunidad comercial]
    D --> E[Clasificar tipo de proyecto]

    E --> F{¿Requiere visita técnica?}

    F -- Sí --> G[Programar visita técnica]
    G --> H[Realizar inspección técnica]
    H --> I[Levantar requerimientos]

    F -- No --> I

    I --> J{¿Obra nueva o existente?}

    J --> K{¿El proyecto requiere documentación técnica?}

    K -- No --> Q[Detectar permisos necesarios]

    K -- Sí --> L{¿Existe documentación técnica?}

    L -- Sí --> M[Revisar documentación técnica existente]
    M --> Q

    L -- No --> N{¿Es necesario generar documentación técnica?}

    N -- Sí --> O[Realizar levantamiento técnico]
    O --> P[Generar documentación técnica]
    P --> Q

    N -- No --> Q

    Q --> R{¿Requiere subcontratación?}

    R -- Sí --> S[Identificar especialidades externas]
    S --> T[Solicitar cotizaciones a subcontratistas]
    T --> U[Evaluar costos, tiempos y alcance externo]
    U --> V[Integrar costos de subcontratación]
    V --> W[Definir alcance interno del trabajo]

    R -- No --> W

    W --> X[Generar proforma]

    X --> Y{¿Cliente aprueba proforma?}

    Y -- No --> Z[Negociación comercial]
    Z --> AA{¿Nueva propuesta aceptada?}

    AA -- No --> AB[Cerrar oportunidad perdida]

    AA -- Sí --> AC[Actualizar proforma]
    AC --> X

    Y -- Sí --> AD[Negociación contractual]

    AD --> AE{¿Se requiere anticipo?}

    AE -- Sí --> AF[Solicitar anticipo]
    AF --> AG{¿Anticipo recibido?}

    AG -- No --> AH[Seguimiento de cobranza]
    AH --> AG

    AG -- Sí --> AI[Generar contrato]

    AE -- No --> AI

    AI --> AJ[Crear obra]

    AJ --> AK([Fin])
```

## Plan De Implementacion

### Objetivo

Implementar el flujo comercial-tecnico-operativo como un monolito modular, manteniendo limites claros entre dominios para que en el futuro cada modulo pueda extraerse como microservicio sin reescribir la logica central.

`identity` no debe absorber esta logica. `identity` queda limitado a empresas, sucursales, usuarios, roles, permisos, modulos funcionales y menu.

### Modulos Funcionales

#### 1. commercial

Responsable del inicio y gestion comercial del flujo.

Procesos:

- Captar cliente.
- Registrar cliente.
- Crear oportunidad comercial.
- Clasificar tipo de proyecto.
- Definir alcance interno del trabajo.
- Generar proforma.
- Actualizar proforma.
- Gestionar negociacion comercial.
- Cerrar oportunidad perdida.

Entidades sugeridas:

- `Client`
- `Opportunity`
- `ProjectClassification`
- `OpportunityRequirementSummary`
- `Proforma`
- `ProformaLine`
- `CommercialNegotiation`

Eventos sugeridos:

- `ClientRegistered`
- `OpportunityCreated`
- `OpportunityClassified`
- `ProformaGenerated`
- `ProformaRejected`
- `ProformaApproved`
- `OpportunityLost`

#### 2. technical

Responsable de visitas, inspecciones y levantamientos tecnicos.

Procesos:

- Programar visita tecnica.
- Realizar inspeccion tecnica.
- Levantar requerimientos.
- Identificar si la obra es nueva o existente.
- Realizar levantamiento tecnico.

Entidades sugeridas:

- `TechnicalVisit`
- `TechnicalInspection`
- `Requirement`
- `TechnicalSurvey`
- `ProjectSiteCondition`

Eventos sugeridos:

- `TechnicalVisitScheduled`
- `TechnicalInspectionCompleted`
- `RequirementsCollected`
- `TechnicalSurveyCompleted`

#### 3. documents

Responsable de documentacion tecnica.

Procesos:

- Determinar si se requiere documentacion tecnica.
- Revisar documentacion tecnica existente.
- Generar documentacion tecnica.
- Asociar documentos a oportunidad, cliente u obra.

Entidades sugeridas:

- `TechnicalDocument`
- `DocumentReview`
- `DocumentRequirement`
- `DocumentVersion`

Eventos sugeridos:

- `TechnicalDocumentationRequired`
- `TechnicalDocumentationReviewed`
- `TechnicalDocumentationGenerated`

#### 4. permits

Responsable de permisos requeridos por el proyecto.

Procesos:

- Detectar permisos necesarios.
- Registrar permisos requeridos.
- Controlar estado de permisos.

Entidades sugeridas:

- `Permit`
- `PermitRequirement`
- `PermitChecklist`
- `PermitStatusHistory`

Eventos sugeridos:

- `PermitRequirementsDetected`
- `PermitRequirementUpdated`

#### 5. procurement

Responsable de subcontratacion y costos externos.

Procesos:

- Identificar especialidades externas.
- Solicitar cotizaciones a subcontratistas.
- Evaluar costos, tiempos y alcance externo.
- Integrar costos de subcontratacion.

Entidades sugeridas:

- `Subcontractor`
- `Specialty`
- `SubcontractorQuoteRequest`
- `SubcontractorQuote`
- `ExternalCostEvaluation`

Eventos sugeridos:

- `ExternalSpecialtiesIdentified`
- `SubcontractorQuotesRequested`
- `SubcontractorCostsEvaluated`
- `SubcontractorCostsIntegrated`

#### 6. contracts

Responsable de la negociacion y generacion contractual.

Procesos:

- Negociacion contractual.
- Generar contrato.
- Versionar contrato.

Entidades sugeridas:

- `Contract`
- `ContractVersion`
- `ContractNegotiation`
- `ContractClause`

Eventos sugeridos:

- `ContractNegotiationStarted`
- `ContractGenerated`
- `ContractSigned`

#### 7. billing

Responsable de anticipos, pagos y seguimiento de cobranza.

Procesos:

- Determinar si se requiere anticipo.
- Solicitar anticipo.
- Registrar anticipo recibido.
- Seguimiento de cobranza.

Entidades sugeridas:

- `AdvancePayment`
- `PaymentRequest`
- `PaymentRecord`
- `CollectionFollowUp`

Eventos sugeridos:

- `AdvancePaymentRequired`
- `AdvancePaymentRequested`
- `AdvancePaymentReceived`
- `CollectionFollowUpCreated`

#### 8. projects

Responsable de la obra despues de la aprobacion comercial y contractual.

Procesos:

- Crear obra.
- Vincular obra con cliente, oportunidad, contrato y alcance aprobado.

Entidades sugeridas:

- `Project`
- `WorkSite`
- `ProjectScope`
- `ProjectMilestone`

Eventos sugeridos:

- `ProjectCreated`

### Estructura De Carpetas Por Modulo

Cada modulo nuevo debe seguir la misma organizacion base:

```text
src/modules/<module-name>
  application
    commands
    command-handlers
    queries
    query-handlers
    dto
    services
  domain
    constants
    entities
    enums
    events
    repositories
    services
  infrastructure
    persistence
      typeorm
        entities
        repositories
  presentation
    controllers
    presenters
  <module-name>.module.ts
```

### Reglas De Diseno Para Escalar A Microservicios

- Cada modulo debe ser dueno de sus propias tablas.
- Un modulo no debe leer repositorios internos de otro modulo.
- La comunicacion entre modulos debe hacerse mediante servicios de aplicacion o eventos de dominio/aplicacion.
- Las relaciones entre modulos deben guardar IDs externos, no depender de entidades ORM de otro modulo.
- Los contratos entre modulos deben expresarse con DTOs/eventos estables.
- Los permisos y menu de cada modulo deben registrarse en `identity` mediante seeds y constantes, no con strings sueltos.

### Flujo Entre Modulos

```text
commercial
  ClientRegistered
  OpportunityCreated
  OpportunityClassified
        |
        v
technical
  TechnicalVisitScheduled
  TechnicalInspectionCompleted
  RequirementsCollected
        |
        v
documents
  TechnicalDocumentationRequired
  TechnicalDocumentationReviewed
  TechnicalDocumentationGenerated
        |
        v
permits
  PermitRequirementsDetected
        |
        v
procurement
  SubcontractorQuotesRequested
  SubcontractorCostsIntegrated
        |
        v
commercial
  ProformaGenerated
  ProformaApproved
        |
        v
contracts
  ContractGenerated
  ContractSigned
        |
        v
billing
  AdvancePaymentRequested
  AdvancePaymentReceived
        |
        v
projects
  ProjectCreated
```

### Orden De Implementacion

#### Fase 1: Base Comercial

- Crear modulo `commercial`.
- Crear entidades `Client`, `Opportunity`, `ProjectClassification` y `Proforma`.
- Crear CRUD inicial de clientes.
- Crear CRUD inicial de oportunidades.
- Crear endpoints para clasificar oportunidad.
- Crear permisos y menu para clientes, oportunidades y proformas.

#### Fase 2: Visitas Y Requerimientos Tecnicos

- Crear modulo `technical`.
- Crear entidades `TechnicalVisit`, `TechnicalInspection` y `Requirement`.
- Crear endpoints para programar visita tecnica.
- Crear endpoints para completar inspeccion y levantar requerimientos.
- Conectar oportunidad con visita tecnica mediante `opportunityId`.

#### Fase 3: Documentacion Tecnica

- Crear modulo `documents`.
- Crear entidades `TechnicalDocument`, `DocumentReview` y `DocumentRequirement`.
- Crear endpoints para registrar documentacion existente.
- Crear endpoints para revisar o generar documentacion tecnica.

#### Fase 4: Permisos

- Crear modulo `permits`.
- Crear entidades `Permit`, `PermitRequirement` y `PermitChecklist`.
- Crear endpoints para detectar y administrar permisos requeridos.

#### Fase 5: Subcontratacion

- Crear modulo `procurement`.
- Crear entidades `Subcontractor`, `Specialty`, `SubcontractorQuoteRequest`, `SubcontractorQuote` y `ExternalCostEvaluation`.
- Crear endpoints para solicitar y evaluar cotizaciones.
- Integrar costos externos en la proforma.

#### Fase 6: Contratos

- Crear modulo `contracts`.
- Crear entidades `Contract`, `ContractVersion` y `ContractNegotiation`.
- Crear endpoints para negociacion contractual y generacion de contrato.

#### Fase 7: Anticipos Y Cobranza

- Crear modulo `billing`.
- Crear entidades `AdvancePayment`, `PaymentRequest`, `PaymentRecord` y `CollectionFollowUp`.
- Crear endpoints para solicitar anticipo y registrar pagos.

#### Fase 8: Creacion De Obra

- Crear modulo `projects`.
- Crear entidades `Project`, `WorkSite` y `ProjectScope`.
- Crear endpoint para crear obra desde contrato firmado.
- Mantener referencias a `clientId`, `opportunityId`, `contractId` y `companyId`.

### Primer Corte Recomendado

El primer incremento funcional debe cubrir:

- Registro de cliente.
- Creacion de oportunidad.
- Clasificacion de oportunidad.
- Decision de visita tecnica.
- Generacion basica de proforma.

Este corte crea la columna vertebral del flujo sin bloquearse por documentos, permisos, subcontratistas, contratos o pagos.
