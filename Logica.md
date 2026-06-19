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

Nota: en este diagrama `Generar proforma` representa la generacion de una version formal presentable al cliente. El registro inicial de la proforma se crea antes, en estado `DRAFT`, al crear la oportunidad comercial.

## Diagrama De Casos De Uso

```mermaid
flowchart LR
    Cliente((Cliente))
    Asesor((Asesor comercial))
    Tecnico((Tecnico))
    Documental((Responsable documental))
    Compras((Responsable de compras))
    Contratos((Responsable contractual))
    Cobranzas((Responsable de cobranzas))
    Proyectos((Responsable de proyectos))
    Subcontratista((Subcontratista))

    subgraph Sistema["Sistema Obralink"]
        UC1[Registrar cliente]
        UC2[Crear oportunidad comercial]
        UC3[Clasificar tipo de proyecto]
        UC4[Programar visita tecnica]
        UC5[Realizar inspeccion tecnica]
        UC6[Levantar requerimientos]
        UC7[Revisar documentacion tecnica]
        UC8[Generar documentacion tecnica]
        UC9[Detectar permisos necesarios]
        UC10[Solicitar cotizaciones a subcontratistas]
        UC11[Evaluar costos y alcance externo]
        UC12[Integrar costos de subcontratacion]
        UC13[Definir alcance interno]
        UC14[Generar proforma]
        UC15[Enviar proforma]
        UC16[Gestionar negociacion comercial]
        UC17[Aprobar proforma]
        UC18[Negociar contrato]
        UC19[Solicitar anticipo]
        UC20[Registrar anticipo recibido]
        UC21[Generar contrato]
        UC22[Crear obra]
    end

    Cliente --> UC1
    Cliente --> UC17
    Cliente --> UC18
    Cliente --> UC20

    Asesor --> UC1
    Asesor --> UC2
    Asesor --> UC3
    Asesor --> UC13
    Asesor --> UC14
    Asesor --> UC15
    Asesor --> UC16
    Asesor --> UC17

    Tecnico --> UC4
    Tecnico --> UC5
    Tecnico --> UC6

    Documental --> UC7
    Documental --> UC8
    Documental --> UC9

    Compras --> UC10
    Compras --> UC11
    Compras --> UC12
    Subcontratista --> UC10

    Contratos --> UC18
    Contratos --> UC21

    Cobranzas --> UC19
    Cobranzas --> UC20

    Proyectos --> UC22

    UC2 -. incluye .-> UC14
    UC4 -. extiende .-> UC5
    UC5 -. incluye .-> UC6
    UC7 -. extiende .-> UC8
    UC10 -. incluye .-> UC11
    UC11 -. incluye .-> UC12
    UC14 -. incluye .-> UC15
    UC16 -. extiende .-> UC14
    UC17 -. habilita .-> UC18
    UC19 -. condiciona .-> UC21
    UC21 -. habilita .-> UC22
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
- `ClientContact`
- `Opportunity`
- `ProjectClassification`
- `OpportunityRequirementSummary`
- `Proforma`
- `ProformaVersion`
- `ProformaLine`
- `CommercialNegotiation`
- `CommercialNegotiationItem`

Eventos sugeridos:

- `ClientRegistered`
- `OpportunityCreated`
- `OpportunityClassified`
- `ProformaDraftCreated`
- `ProformaGenerated`
- `ProformaSent`
- `ProformaRejected`
- `CommercialNegotiationStarted`
- `CommercialNegotiationAccepted`
- `ProformaVersionCreated`
- `ProformaApproved`
- `OpportunityLost`

Gestion de proformas:

La proforma tiene dos momentos distintos:

- Creacion de proforma borrador.
- Generacion de proforma presentable al cliente.

Al crear una oportunidad comercial, el sistema debe crear automaticamente una proforma inicial en estado `DRAFT`. Esta proforma funciona como contenedor de alcance, cantidades, costos, impuestos, notas comerciales y condiciones que se van completando durante el proceso.

En el diagrama, el paso `Generar proforma` no significa crear el registro inicial, sino convertir la proforma trabajada en una version formal y presentable al cliente.

En el flujo:

```text
Crear oportunidad comercial
  -> Crear proforma DRAFT
  -> Completar analisis tecnico, documental, permisos, subcontratacion y alcance
  -> Definir alcance interno del trabajo
  -> Generar version formal de proforma
  -> Enviar al cliente
```

Antes de generar una proforma presentable al cliente deben existir, como minimo:

- Cliente registrado.
- Oportunidad comercial creada.
- Tipo de proyecto clasificado.
- Requerimientos base levantados.
- Condicion de obra nueva o existente identificada.
- Documentacion tecnica revisada o generada cuando aplique.
- Permisos necesarios detectados.
- Costos de subcontratacion integrados cuando aplique.
- Alcance interno del trabajo definido.

Estados sugeridos para `proformas`:

```text
DRAFT
IN_REVIEW
NEEDS_REVISION
GENERATED
SENT
UNDER_NEGOTIATION
APPROVED
REJECTED
CANCELLED
```

Reglas:

- `DRAFT`: se crea automaticamente al crear la oportunidad.
- `IN_REVIEW`: se esta alimentando con visitas, requerimientos, documentos, permisos, costos externos y alcance.
- `NEEDS_REVISION`: algun cambio tecnico, documental, de permisos, subcontratacion o alcance obliga a revisar.
- `GENERATED`: el alcance interno esta definido y existe una version formal lista para enviar.
- `SENT`: la version formal fue enviada al cliente.
- `UNDER_NEGOTIATION`: el cliente no aprobo y solicito modificaciones.
- `APPROVED`: el cliente aprobo la version vigente.
- Antes de `SENT`, se puede editar la version activa.
- Despues de `SENT`, cualquier cambio debe crear una nueva version.
- Despues de `APPROVED`, la proforma no se modifica directamente; cualquier cambio debe generar una nueva version o una solicitud formal de cambio.

Versionado sugerido:

```text
proformas
  id
  company_id
  opportunity_id
  current_version_id
  status
  created_at
  updated_at
  deleted_at

proforma_versions
  id
  proforma_id
  version_number
  status
  scope_summary
  internal_cost
  external_cost
  subtotal
  taxes
  total
  sent_at
  approved_at
  rejected_at
  created_at
  updated_at
```

Negociacion comercial cuando el cliente no aprueba:

Si el cliente no aprueba la proforma final y solicita modificaciones, el proceso sigue en `commercial`; no pasa a `contracts`.

Secuencia:

```text
Proforma SENT
  -> Cliente no aprueba
  -> Proforma UNDER_NEGOTIATION
  -> Crear commercial_negotiation
  -> Registrar cambios solicitados
  -> Evaluar impacto en alcance, costos y tiempos
  -> Crear nueva version de proforma
  -> Enviar nueva version al cliente
  -> Cliente aprueba o rechaza
```

Tablas sugeridas:

```text
commercial_negotiations
  id
  company_id
  opportunity_id
  proforma_id
  requested_by
  requested_at
  reason
  client_comments
  status              OPEN | ACCEPTED | REJECTED | CLOSED_LOST
  created_at
  updated_at
  deleted_at

commercial_negotiation_items
  id
  negotiation_id
  change_type         SCOPE | PRICE | TIME | PAYMENT_TERMS | MATERIALS | OTHER
  description
  impact_amount
  impact_days
  accepted
  created_at
  updated_at
```

Reglas de negociacion:

- Una proforma enviada no se modifica directamente.
- Si el cliente pide cambios, se registra una negociacion comercial.
- Si la nueva propuesta es aceptada, se crea una nueva version de proforma y se envia al cliente.
- Si la nueva propuesta no es aceptada, la oportunidad se cierra como perdida.
- `contracts` solo inicia cuando una version de proforma esta `APPROVED`.

Especificacion de clientes:

El cliente comercial puede ser una persona natural o una empresa. No debe reutilizarse la tabla `companies` para representar clientes comerciales, porque `companies` representa empresas tenant que usan el sistema. Los clientes comerciales deben vivir en `commercial.clients`.

```text
companies = empresas usuarias del sistema
clients   = clientes atendidos por una empresa usuaria
```

Campos sugeridos para `clients`:

```text
id
company_id
client_type              PERSON | COMPANY
display_name
legal_name
identification_type      CEDULA | RUC | PASSPORT | TAX_ID | OTHER
identification_number
email
phone
address
city
status
created_at
updated_at
deleted_at
```

Reglas:

- Si `client_type = PERSON`, `display_name` representa el nombre de la persona.
- Si `client_type = COMPANY`, `display_name` representa el nombre comercial y `legal_name` la razon social.
- `identification_number` debe ser unico por `company_id` cuando exista y el registro no este eliminado.
- Toda oportunidad comercial debe apuntar a `client_id`, sin importar si el cliente es persona o empresa.

Campos sugeridos para `client_contacts`:

```text
id
client_id
name
role
email
phone
is_primary
created_at
updated_at
deleted_at
```

Reglas de contactos:

- Un cliente tipo `COMPANY` puede tener varios contactos.
- Un cliente tipo `PERSON` puede tener contactos adicionales, pero no es obligatorio.
- Solo debe existir un contacto principal por cliente.

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
- `RequirementsChanged`
- `TechnicalSurveyCompleted`
- `TechnicalSurveyChanged`

Impacto sobre proformas:

La visita tecnica y el levantamiento tecnico pueden modificar la proforma, pero el modulo `technical` no debe actualizar directamente tablas de `commercial`.

Regla:

- Si una visita tecnica, inspeccion, requerimiento o levantamiento tecnico modifica alcance, cantidades, tiempos, restricciones, costos estimados o condiciones del sitio, `technical` debe emitir un evento.
- `commercial` debe consumir ese evento y decidir si la oportunidad vuelve a revision de alcance o costeo.
- Si ya existe una proforma vigente, debe marcarse como `NEEDS_REVISION` o crearse una nueva version.
- La version anterior de la proforma debe mantenerse como historial.
- Una proforma `APPROVED` no debe modificarse directamente; cualquier cambio posterior debe generar una nueva version o una solicitud formal de cambio.

Eventos de integracion sugeridos:

- `RequirementsChanged`
- `TechnicalSurveyChanged`
- `ProformaRevisionRequired`
- `ProformaVersionCreated`

Permisos sugeridos:

```text
technical.requirements.affect_proforma
technical.surveys.affect_proforma
commercial.proformas.mark_needs_revision
commercial.proformas.version
```

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
  ProformaDraftCreated
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
  ProformaSent
  CommercialNegotiationStarted
  ProformaVersionCreated
  ProformaApproved
        |
        v
contracts
  ContractNegotiationStarted
        |
        v
billing
  AdvancePaymentRequested
  AdvancePaymentReceived
        |
        v
contracts
  ContractGenerated
  ContractSigned
        |
        v
projects
  ProjectCreated
```

### Orden De Implementacion

#### Fase 1: Base Comercial

- Crear modulo `commercial`.
- Crear entidades `Client`, `ClientContact`, `Opportunity`, `ProjectClassification`, `Proforma`, `ProformaVersion`, `ProformaLine`, `CommercialNegotiation` y `CommercialNegotiationItem`.
- Crear CRUD inicial de clientes.
- Crear CRUD inicial de oportunidades.
- Crear proforma `DRAFT` automaticamente al crear oportunidad.
- Crear endpoints para clasificar oportunidad.
- Crear endpoints para versionar, generar y enviar proforma.
- Crear endpoints para registrar negociacion comercial y generar nueva version cuando el cliente solicita cambios.
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
- Crear endpoints para iniciar negociacion contractual despues de proforma aprobada.
- Definir si se requiere anticipo antes de generar contrato.

#### Fase 7: Anticipos Y Cobranza

- Crear modulo `billing`.
- Crear entidades `AdvancePayment`, `PaymentRequest`, `PaymentRecord` y `CollectionFollowUp`.
- Crear endpoints para solicitar anticipo y registrar pagos.
- Notificar a `contracts` cuando el anticipo requerido fue recibido.

#### Fase 8: Generacion Contractual

- Completar endpoints de `contracts` para generar contrato despues de anticipo recibido o cuando no se requiere anticipo.
- Registrar firma o aceptacion del contrato cuando aplique.

#### Fase 9: Creacion De Obra

- Crear modulo `projects`.
- Crear entidades `Project`, `WorkSite` y `ProjectScope`.
- Crear endpoint para crear obra desde contrato generado y aceptado o firmado, segun la regla contractual configurada.
- Mantener referencias a `clientId`, `opportunityId`, `contractId` y `companyId`.

### Primer Corte Recomendado

El primer incremento funcional debe cubrir:

- Registro de cliente.
- Creacion de oportunidad.
- Clasificacion de oportunidad.
- Decision de visita tecnica.
- Creacion automatica de proforma `DRAFT`.
- Generacion basica de una version formal de proforma.

Este corte crea la columna vertebral del flujo sin bloquearse por documentos, permisos, subcontratistas, contratos o pagos.
