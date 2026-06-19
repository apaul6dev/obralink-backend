## Diccionario De Datos

### Convenciones Generales

- `id`: identificador unico del registro.
- `company_id`: empresa tenant propietaria del dato.
- Campos terminados en `_id`: referencia a otra tabla o a un modulo externo.
- Campos terminados en `_user_id`: referencia externa al usuario del modulo `identity`.
- `created_at`, `updated_at`, `deleted_at`: auditoria tecnica de creacion, actualizacion y eliminacion logica.
- Montos `decimal`: valores monetarios o cuantitativos con precision fija.
- Estados `status`: deben modelarse como enums por modulo.

### commercial

#### CLIENT

Representa un cliente comercial atendido por una empresa usuaria del sistema. Puede ser persona o compania.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del cliente. |
| `company_id` | Empresa tenant que atiende al cliente. |
| `client_type` | Tipo de cliente: `PERSON` o `COMPANY`. |
| `display_name` | Nombre visible del cliente. |
| `legal_name` | Razon social cuando el cliente es compania. |
| `identification_type` | Tipo de identificacion, por ejemplo `EIN`, `ITIN`, `PASSPORT`, `DRIVER_LICENSE`, `STATE_ID`, `TAX_ID`, `OTHER`. |
| `identification_number` | Numero de identificacion del cliente. |
| `email` | Correo principal. |
| `phone` | Telefono principal. |
| `address_line1` | Direccion postal principal, linea 1. |
| `address_line2` | Direccion postal principal, linea 2. |
| `city` | Ciudad. |
| `state` | Estado de EE. UU. en codigo USPS cuando aplique. |
| `county` | Condado. |
| `postal_code` | ZIP o ZIP+4. |
| `country` | Pais, por defecto operativo `US`. |
| `status` | Estado del cliente. |

#### CLIENT_CONTACT

Representa una persona de contacto asociada a un cliente.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del contacto. |
| `client_id` | Cliente al que pertenece. |
| `name` | Nombre del contacto. |
| `role` | Cargo o relacion con el cliente. |
| `email` | Correo del contacto. |
| `phone` | Telefono del contacto. |
| `is_primary` | Indica si es el contacto principal del cliente. |

#### CONTRACTING_REQUEST

Representa la solicitud de contratacion que inicia el flujo comercial-tecnico-operativo.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la solicitud. |
| `company_id` | Empresa tenant que recibio la solicitud. |
| `client_id` | Cliente vinculado; puede ser nulo en solicitudes publicas pendientes de revision. |
| `client_contact_id` | Contacto que envio o representa la solicitud. |
| `created_by_user_id` | Usuario interno que creo la solicitud cuando el origen es interno. |
| `assigned_advisor_id` | Asesor comercial responsable. |
| `origin_channel` | Canal de origen: `INTERNAL`, `CLIENT_AUTH`, `PUBLIC_WEB`. |
| `status` | Estado de la solicitud. |
| `source` | Fuente comercial o canal especifico. |
| `requester_name` | Nombre capturado del solicitante. |
| `requester_email` | Correo capturado del solicitante. |
| `requester_phone` | Telefono capturado del solicitante. |
| `requester_identification` | Identificacion capturada si aplica. |
| `public_tracking_code` | Codigo publico para seguimiento de solicitudes sin usuario. |
| `email_verification_token` | Token de verificacion de correo en flujo publico. |
| `captcha_verified` | Indica si paso validacion captcha. |
| `source_ip` | IP de origen de la solicitud. |
| `user_agent` | User agent de origen. |
| `description` | Descripcion inicial de la necesidad. |
| `created_at` | Fecha de creacion. |

#### CONTRACTING_REQUEST_SITE

Representa una ubicacion donde debe ejecutarse una solicitud de contratacion. Una solicitud puede tener una o varias ubicaciones.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la ubicacion. |
| `contracting_request_id` | Solicitud a la que pertenece. |
| `address_line1` | Direccion del sitio de trabajo, linea 1. |
| `address_line2` | Direccion del sitio de trabajo, linea 2. |
| `city` | Ciudad del sitio de trabajo. |
| `state` | Estado del sitio de trabajo. |
| `county` | Condado del sitio de trabajo. |
| `postal_code` | ZIP o ZIP+4 del sitio. |
| `country` | Pais del sitio. |
| `reference` | Referencia adicional para ubicar el sitio. |
| `latitude` | Latitud opcional. |
| `longitude` | Longitud opcional. |
| `site_condition` | Condicion del sitio. |
| `requires_technical_visit` | Indica si esta ubicacion requiere visita tecnica. |
| `requires_permit_review` | Indica si esta ubicacion requiere revision de permisos. |
| `is_primary` | Indica si es la ubicacion principal de la solicitud. |
| `notes` | Notas especificas de la ubicacion. |
| `status` | Estado de la ubicacion: `PENDING_REVIEW`, `VISIT_REQUIRED`, `VISITED`, `READY_FOR_ESTIMATE`, `EXCLUDED`. |

#### PROJECT_CLASSIFICATION

Clasificacion inicial del tipo de proyecto solicitado.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la clasificacion. |
| `contracting_request_id` | Solicitud clasificada. |
| `project_type` | Tipo de proyecto. |
| `site_condition` | Condicion del sitio u obra. |
| `requires_technical_visit` | Indica si requiere visita tecnica. |
| `requires_technical_documentation` | Indica si requiere documentacion tecnica. |
| `requires_subcontracting` | Indica si requiere subcontratacion. |

#### CONTRACTING_REQUEST_REQUIREMENT_SUMMARY

Resumen consolidado de requerimientos de la solicitud.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del resumen. |
| `contracting_request_id` | Solicitud asociada. |
| `summary` | Resumen de requerimientos. |
| `constraints` | Restricciones conocidas. |
| `scope_notes` | Notas de alcance. |

#### PROFORMA

Contenedor comercial de versiones de proforma para una solicitud.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la proforma. |
| `company_id` | Empresa tenant. |
| `contracting_request_id` | Solicitud asociada. |
| `current_version_id` | Version vigente de la proforma. |
| `status` | Estado general de la proforma. |
| `created_at` | Fecha de creacion. |
| `updated_at` | Fecha de ultima actualizacion. |

#### PROFORMA_VERSION

Version formal o de trabajo de una proforma.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la version. |
| `proforma_id` | Proforma padre. |
| `version_number` | Numero secuencial de version. |
| `status` | Estado de la version. |
| `scope_summary` | Resumen del alcance cotizado. |
| `internal_cost` | Costo interno estimado. |
| `external_cost` | Costo externo o subcontratado. |
| `subtotal` | Subtotal antes de impuestos. |
| `taxes` | Impuestos. |
| `total` | Total presentado. |
| `sent_at` | Fecha de envio al cliente. |
| `approved_at` | Fecha de aprobacion. |
| `approved_by_user_id` | Usuario que registro la aprobacion si aplica. |
| `approval_source` | Origen de aprobacion: `CLIENT` o `COMMERCIAL_ADVISOR`. |
| `approval_evidence` | Evidencia o referencia de aceptacion. |

#### PROFORMA_LINE

Linea de detalle de una version de proforma.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la linea. |
| `proforma_version_id` | Version de proforma asociada. |
| `description` | Descripcion del item. |
| `quantity` | Cantidad. |
| `unit_price` | Precio unitario. |
| `total` | Total de la linea. |

#### COMMERCIAL_NEGOTIATION

Registro de negociacion comercial asociada a una proforma.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la negociacion. |
| `company_id` | Empresa tenant. |
| `contracting_request_id` | Solicitud negociada. |
| `proforma_id` | Proforma negociada. |
| `requested_by` | Identificador de quien solicito la negociacion. |
| `requested_at` | Fecha de solicitud. |
| `reason` | Motivo de la negociacion. |
| `client_comments` | Comentarios del cliente. |
| `status` | Estado de la negociacion. |

#### COMMERCIAL_NEGOTIATION_ITEM

Detalle de un cambio solicitado durante negociacion comercial.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del item. |
| `negotiation_id` | Negociacion asociada. |
| `change_type` | Tipo de cambio: alcance, precio, tiempo, condiciones, materiales u otro. |
| `description` | Descripcion del cambio. |
| `impact_amount` | Impacto monetario estimado. |
| `impact_days` | Impacto en dias. |
| `accepted` | Indica si el cambio fue aceptado. |

### technical

#### TECHNICAL_VISIT

Visita tecnica programada para una solicitud.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la visita. |
| `company_id` | Empresa tenant. |
| `contracting_request_id` | Solicitud asociada. |
| `contracting_request_site_id` | Ubicacion especifica asociada cuando la visita aplica a un sitio. |
| `scheduled_at` | Fecha programada. |
| `assigned_user_id` | Tecnico asignado. |
| `status` | Estado de la visita. |

#### TECHNICAL_INSPECTION

Resultado de inspeccion realizada durante o despues de una visita tecnica.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la inspeccion. |
| `technical_visit_id` | Visita asociada. |
| `inspected_at` | Fecha de inspeccion. |
| `observations` | Observaciones de campo. |
| `status` | Estado de la inspeccion. |

#### REQUIREMENT

Requerimiento levantado por el equipo tecnico.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del requerimiento. |
| `technical_inspection_id` | Inspeccion donde se identifico. |
| `contracting_request_id` | Solicitud asociada. |
| `description` | Descripcion del requerimiento. |
| `priority` | Prioridad. |
| `affects_proforma` | Indica si impacta la proforma. |

#### TECHNICAL_SURVEY

Levantamiento tecnico adicional del sitio o proyecto.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del levantamiento. |
| `contracting_request_id` | Solicitud asociada. |
| `contracting_request_site_id` | Ubicacion especifica asociada cuando el levantamiento aplica a un sitio. |
| `performed_by_user_id` | Usuario que lo realizo. |
| `performed_at` | Fecha de levantamiento. |
| `summary` | Resumen tecnico. |
| `affects_proforma` | Indica si impacta la proforma. |

### documents

#### TECHNICAL_DOCUMENT

Documento tecnico asociado a solicitud, cliente u obra.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del documento. |
| `contracting_request_id` | Solicitud asociada. |
| `client_id` | Cliente propietario o relacionado. |
| `project_id` | Obra asociada cuando exista. |
| `document_type` | Tipo de documento tecnico. |
| `status` | Estado del documento. |

#### DOCUMENT_REVIEW

Revision formal de un documento tecnico.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la revision. |
| `technical_document_id` | Documento revisado. |
| `reviewed_by_user_id` | Usuario revisor. |
| `reviewed_at` | Fecha de revision. |
| `result` | Resultado de revision. |
| `observations` | Observaciones del revisor. |

#### DOCUMENT_REQUIREMENT

Documento requerido para una solicitud.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del requisito documental. |
| `contracting_request_id` | Solicitud asociada. |
| `document_type` | Tipo de documento requerido. |
| `required` | Indica si es obligatorio. |
| `status` | Estado del requisito. |

#### DOCUMENT_VERSION

Version de un documento tecnico, vinculada a un archivo fisico mediante `Attachment`.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la version. |
| `technical_document_id` | Documento padre. |
| `attachment_id` | Archivo almacenado en `attachments`. |
| `version_number` | Numero secuencial de version. |
| `status` | Estado de la version. |
| `created_at` | Fecha de creacion. |

### attachments

#### ATTACHMENT

Metadatos de un archivo almacenado en AWS S3, Azure Blob Storage u otro proveedor compatible.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del adjunto. |
| `company_id` | Empresa tenant propietaria. |
| `owner_module` | Modulo propietario logico. |
| `owner_type` | Tipo de entidad propietaria. |
| `owner_id` | Identificador de la entidad propietaria. |
| `file_category` | Categoria del archivo. |
| `storage_provider` | Proveedor: `AWS_S3` o `AZURE_BLOB`. |
| `storage_region` | Region del proveedor. |
| `bucket_name` | Bucket S3 si aplica. |
| `container_name` | Contenedor Azure si aplica. |
| `object_key` | Ruta del objeto/blob. |
| `object_version_id` | Version del objeto si el proveedor lo soporta. |
| `original_filename` | Nombre original del archivo. |
| `content_type` | MIME type. |
| `file_size_bytes` | Tamano en bytes. |
| `checksum_sha256` | Hash SHA-256 para integridad. |
| `visibility` | Visibilidad: `PRIVATE`, `PUBLIC_READ`, `SIGNED_URL`. |
| `status` | Estado de carga y disponibilidad. |
| `scan_status` | Resultado del escaneo antivirus/malware. |
| `encryption_method` | Metodo de cifrado. |
| `kms_key_id` | Llave KMS o CMK usada si aplica. |
| `uploaded_at` | Fecha de carga. |
| `available_at` | Fecha desde la que esta disponible. |
| `expires_at` | Fecha de expiracion para temporales. |
| `uploaded_by_user_id` | Usuario interno que subio el archivo. |
| `uploaded_by_client_contact_id` | Contacto cliente que subio el archivo. |
| `uploaded_from_public_form` | Indica si proviene de formulario publico. |
| `metadata_json` | Metadata adicional del archivo. |
| `created_at` | Fecha de creacion. |
| `deleted_at` | Fecha de eliminacion logica. |

#### ATTACHMENT_ACCESS_LOG

Auditoria de accesos y acciones realizadas sobre adjuntos.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del log. |
| `attachment_id` | Adjunto auditado. |
| `company_id` | Empresa tenant. |
| `accessed_by_user_id` | Usuario interno que accedio. |
| `accessed_by_client_contact_id` | Contacto cliente que accedio. |
| `action` | Accion auditada: ver, descargar, eliminar, confirmar upload o solicitar URL firmada. |
| `source_ip` | IP de origen. |
| `user_agent` | User agent de origen. |
| `accessed_at` | Fecha de acceso. |

### permits

#### PERMIT

Catalogo de permisos que pueden aplicar a un proyecto.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del permiso. |
| `company_id` | Empresa tenant. |
| `name` | Nombre del permiso. |
| `authority` | Autoridad emisora. |
| `description` | Descripcion del permiso. |

#### PERMIT_REQUIREMENT

Permiso requerido para una solicitud especifica.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del permiso requerido. |
| `contracting_request_id` | Solicitud asociada. |
| `contracting_request_site_id` | Ubicacion especifica asociada cuando el permiso depende del sitio. |
| `permit_id` | Permiso de catalogo. |
| `status` | Estado del permiso requerido. |
| `required_at` | Fecha en que se detecto como requerido. |

#### PERMIT_CHECKLIST

Item de control para cumplir un permiso requerido.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del item. |
| `permit_requirement_id` | Permiso requerido asociado. |
| `item` | Descripcion del item. |
| `completed` | Indica si esta completado. |

#### PERMIT_STATUS_HISTORY

Historial de cambios de estado de un permiso requerido.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del historial. |
| `permit_requirement_id` | Permiso requerido asociado. |
| `status` | Estado registrado. |
| `changed_by_user_id` | Usuario que hizo el cambio. |
| `changed_at` | Fecha del cambio. |

### procurement

#### SUBCONTRACTOR

Proveedor o subcontratista externo.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del subcontratista. |
| `company_id` | Empresa tenant. |
| `display_name` | Nombre visible. |
| `identification_number` | Identificacion fiscal o comercial. |
| `email` | Correo principal. |
| `phone` | Telefono principal. |
| `status` | Estado del subcontratista. |

#### SPECIALTY

Especialidad requerida para subcontratacion.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la especialidad. |
| `company_id` | Empresa tenant. |
| `name` | Nombre de la especialidad. |
| `description` | Descripcion. |

#### SUBCONTRACTOR_QUOTE_REQUEST

Solicitud de cotizacion enviada a subcontratistas.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la solicitud de cotizacion. |
| `contracting_request_id` | Solicitud de contratacion asociada. |
| `specialty_id` | Especialidad requerida. |
| `scope_summary` | Resumen del alcance externo. |
| `requested_at` | Fecha de solicitud. |
| `status` | Estado de la solicitud. |

#### SUBCONTRACTOR_QUOTE

Cotizacion recibida de un subcontratista.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la cotizacion. |
| `quote_request_id` | Solicitud de cotizacion asociada. |
| `subcontractor_id` | Subcontratista que cotiza. |
| `amount` | Monto cotizado. |
| `estimated_days` | Dias estimados. |
| `scope` | Alcance incluido. |
| `status` | Estado de la cotizacion. |

#### EXTERNAL_COST_EVALUATION

Evaluacion de costos externos para integrar a la proforma.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la evaluacion. |
| `contracting_request_id` | Solicitud asociada. |
| `quote_id` | Cotizacion evaluada. |
| `proforma_version_id` | Version de proforma donde se integra. |
| `selected_amount` | Monto seleccionado. |
| `selected_days` | Dias seleccionados. |
| `evaluation_notes` | Notas de evaluacion. |

### contracts

#### CONTRACT

Contrato generado desde una proforma aprobada.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del contrato. |
| `company_id` | Empresa tenant. |
| `client_id` | Cliente firmante. |
| `contracting_request_id` | Solicitud origen. |
| `proforma_version_id` | Proforma aprobada base. |
| `current_version_id` | Version vigente del contrato. |
| `status` | Estado contractual. |
| `generated_at` | Fecha de generacion. |

#### CONTRACT_VERSION

Version legal del contrato, vinculada a un archivo mediante `Attachment`.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la version. |
| `contract_id` | Contrato padre. |
| `attachment_id` | Archivo de la version contractual. |
| `version_number` | Numero secuencial de version. |
| `status` | Estado de la version. |
| `created_at` | Fecha de creacion. |

#### CONTRACT_NEGOTIATION

Negociacion contractual posterior a la proforma aprobada.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la negociacion. |
| `contract_id` | Contrato negociado. |
| `reason` | Motivo de negociacion. |
| `status` | Estado. |
| `started_at` | Fecha de inicio. |

#### CONTRACT_CLAUSE

Clausula de una version contractual.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la clausula. |
| `contract_version_id` | Version contractual asociada. |
| `clause_type` | Tipo de clausula. |
| `content` | Contenido de la clausula. |

### billing

#### ADVANCE_PAYMENT

Anticipo requerido o recibido para un contrato.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del anticipo. |
| `contract_id` | Contrato asociado. |
| `amount` | Monto del anticipo. |
| `status` | Estado del anticipo. |
| `requested_at` | Fecha de solicitud. |
| `received_at` | Fecha de recepcion. |

#### PAYMENT_REQUEST

Solicitud de pago asociada a contrato o anticipo.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la solicitud de pago. |
| `contract_id` | Contrato asociado. |
| `advance_payment_id` | Anticipo asociado si aplica. |
| `amount` | Monto solicitado. |
| `due_date` | Fecha limite de pago. |
| `status` | Estado de la solicitud. |

#### PAYMENT_RECORD

Registro de un pago recibido.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del pago. |
| `payment_request_id` | Solicitud de pago asociada. |
| `amount` | Monto pagado. |
| `paid_at` | Fecha de pago. |
| `payment_method` | Metodo de pago. |
| `reference` | Referencia bancaria o externa. |

#### COLLECTION_FOLLOW_UP

Seguimiento de cobranza para una solicitud de pago.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del seguimiento. |
| `payment_request_id` | Solicitud de pago asociada. |
| `responsible_user_id` | Usuario responsable. |
| `follow_up_at` | Fecha de seguimiento. |
| `notes` | Notas del seguimiento. |
| `status` | Estado del seguimiento. |

### projects

#### PROJECT

Obra creada desde contrato aceptado o firmado.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador de la obra. |
| `company_id` | Empresa tenant. |
| `client_id` | Cliente propietario. |
| `contracting_request_id` | Solicitud origen. |
| `contract_id` | Contrato asociado. |
| `name` | Nombre de la obra. |
| `status` | Estado de la obra. |
| `created_at` | Fecha de creacion. |

#### WORK_SITE

Ubicacion fisica de la obra.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del sitio. |
| `project_id` | Obra asociada. |
| `contracting_request_site_id` | Ubicacion de solicitud que origino este sitio de obra. |
| `address_line1` | Direccion, linea 1. |
| `address_line2` | Direccion, linea 2. |
| `city` | Ciudad. |
| `state` | Estado. |
| `county` | Condado. |
| `postal_code` | ZIP o ZIP+4. |
| `country` | Pais. |
| `reference` | Referencia de ubicacion. |
| `latitude` | Latitud. |
| `longitude` | Longitud. |
| `site_condition` | Condicion del sitio. |

#### PROJECT_SCOPE

Alcance aprobado de la obra.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del alcance. |
| `project_id` | Obra asociada. |
| `proforma_version_id` | Version de proforma base. |
| `scope_summary` | Resumen del alcance. |
| `exclusions` | Exclusiones acordadas. |

#### PROJECT_MILESTONE

Hito de planificacion o ejecucion de la obra.

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador del hito. |
| `project_id` | Obra asociada. |
| `name` | Nombre del hito. |
| `planned_at` | Fecha planificada. |
| `completed_at` | Fecha de completado. |
| `status` | Estado del hito. |
