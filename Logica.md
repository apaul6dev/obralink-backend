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