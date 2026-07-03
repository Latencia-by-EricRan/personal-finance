# norte-mobile-rebrand — Registro de avances

Última actualización: 2026-07-02 22:15 · Fase actual: Fase 0 completa y verificada (PASS WITH WARNINGS) · arrancando Fase 1

Espejo humano del topic key de engram `sdd/norte-mobile-rebrand/apply-progress`. Cada agente de fase agrega su entrada al log al terminar; nunca se borra una entrada anterior.

## Checklist por fase

- [x] Fase 0 — Fundaciones (tokens Norte, fix de `styles.css`, environment config, auth + interceptor JWT)
- [x] Fase 1 — Servicios/CRUD (`MovementService` extendido, `CategoryService`, `AccountService`)
- [x] Fase 2 — Rebrand visual (`movement-card`, `summary-by-month`, `movement-summary`)
- [x] Fase 3 — `movement-add` (formulario reactivo real)
- [x] Fase 4 — `movement-filter` (filtros reales)
- [x] Fase 5 — Feature Cuentas (lista, balance, transferencia)

## Pipeline SDD (estado de las fases del change, no de la implementación)

- [x] `sdd-init` — stack detectado, TDD estricto activado, `openspec/` bootstrapeado
- [x] `sdd-propose`
- [x] `sdd-spec`
- [x] `sdd-design`
- [x] `sdd-tasks`
- [x] `sdd-apply` (batches — Fases 0 a 5, todas ✓)
- [x] `sdd-verify` (Fase 0 ✓ PASS WITH WARNINGS, Fase 1 ✓ clean, Fase 2 ✓ clean, Fase 3 ✓ clean, Fase 4 ✓ clean, Fase 5 ✓ PASS WITH WARNINGS + DoD final ✓)
- [ ] `sdd-archive`

## Log de actividad

### 2026-07-02 — sdd-init
**Agente:** sdd-init · **Estado:** done
Stack: Angular 19 standalone/zoneless, bun, Karma+Jasmine. TDD estricto activado (inferido de config + 12 specs existentes, no corrido en vivo). Store híbrido bootstrapeado (`openspec/config.yaml`, `openspec/specs/`, `openspec/changes/archive/`). Engram: `sdd-init/personal-finance-front-web` (id 145), `sdd/personal-finance-front-web/testing-capabilities` (id 146).
**Riesgo abierto:** correr `bun run test -- --watch=false --browsers=ChromeHeadless` una vez de verdad antes de confiar en TDD estricto como gate.

### 2026-07-02 — sdd-propose
**Agente:** sdd-propose · **Estado:** done
Proposal escrita en `openspec/changes/norte-mobile-rebrand/proposal.md` y en engram (`sdd/norte-mobile-rebrand/proposal`). Cubre: problema (app no puede autenticar contra la API real, pantallas stub, sin design system, config hardcodeada, `styles.css` roto), scope in/out (in: solo `front/`, Fases 0-5; out explícito: proyecto `front-web`, UI de reportes/presupuestos, cambios de backend, multiusuario), enfoque foundation-first (Fase 0 auth+tokens+config+fix desbloquea todo lo demás), riesgos (auth gap = mayor riesgo, sin linter, overhead de TDD estricto, config hardcodeada, restricciones SSR/zoneless) y Definition of Done.
**Riesgo abierto:** el auth (login + AuthService + interceptor JWT + guard) no estaba en los mockups originales; es prerequisito duro de Fase 0 y bloquea todo el resto.

### 2026-07-02 — sdd-spec y sdd-design (en paralelo)
**Agentes:** sdd-spec (sonnet) + sdd-design (opus) · **Estado:** done
**sdd-spec** escribió specs por dominio en `specs/{auth,config,movement,movement-filter,accounts,design-tokens}/spec.md` (Given/When/Then, todo `ADDED Requirements` por ser el primer change). **sdd-design** escribió `design.md`: un `src/app/core/` a nivel app para auth y datos de referencia cross-cutting, interceptor y guard funcionales (no basados en clases), `TokenStorageService` con guard SSR-safe (`PLATFORM_ID`), reubicación de `MovementService` a un `core/` de nivel records para servir a sus 3 consumidores, tokens en `_tokens.scss` dedicado, estado compartido categoría/cuenta vía signals (sin NgRx, proporcional a la escala del proyecto).
**Corrección del orquestador:** ambos agentes marcaron como riesgo "endpoints del backend sin verificar" — está mal, ya está verificado (mapa completo de 34 endpoints del Postman relevado al inicio de esta sesión). No se les pasó ese detalle; se le pasa completo a `sdd-tasks` a continuación.
**Riesgo real que sí queda abierto:** reubicar `MovementService` toca la única pantalla que hoy funciona (`summary-by-month`) — mitigado con re-export de compatibilidad temporal + correr su spec antes de borrarlo.

### 2026-07-02 — sdd-tasks
**Agente:** sdd-tasks (sonnet) · **Estado:** done
`tasks.md` escrito: checklist ordenado con marcadores `[P]` para tareas paralelas (ej. CategoryService/AccountService en Fase 1), cada unidad con su spec RED pareada (TDD estricto). Corrigió un error real del design: la ADR-4 asumía `PATCH /movement/:id` y `GET /movement` planos — el backend real usa `PUT /movement/:id` y `GET|POST /movement/:startDate/:endDate` con filtros opcionales (verificado contra `api-reference.md`), lo cual cambia la firma de `MovementService.getMovements()`. También agregó como tarea explícita el manejo de 401/token expirado que faltaba en el sample de código del ADR-2.
**Review Workload Forecast:** ~2.100-2.600 líneas totales (Fase 0 ~600-700, Fase 1 ~380-450, Fase 2 ~120-180, Fase 3 ~300-380, Fase 4 ~250-320, Fase 5 ~450-560). **Chained PRs: recomendado. Riesgo de presupuesto 400 líneas: Alto. Decisión necesaria antes de apply: Sí.**
**Gate disparado:** delivery_strategy cacheada es `ask-on-risk` → se detiene el pipeline antes de `sdd-apply` para preguntarle al usuario cómo entregar.

### 2026-07-02 — Decisión de entrega
**Quién:** usuario · **Estado:** decidido
Entrega: **PRs encadenados**. Estrategia de cadena: **feature-branch-chain**. Estructura de ramas creada sobre `dev`:
- `tracker/norte-mobile-rebrand` (acumula las 6 fases, mergea a `dev` al final)
  - `norte-mobile-rebrand/fase-0-fundaciones` (PR #1 → apunta a la rama tracker)
  - (fases 1-5 se ramifican desde la fase anterior a medida que cada PR se abre)

### 2026-07-02 — sdd-apply Fase 0
**Agente:** sdd-apply (sonnet) · **Estado:** done — 11/11 tareas, 9 commits locales, sin pushear
Implementado: fix de `styles.css`, tokens Norte + fuentes self-hosted (`_tokens.scss`, `_fonts.scss`), `src/environments/`, `TokenStorageService` (SSR-safe), `AuthService`, interceptor funcional con manejo de 401, guard funcional, `LoginComponent`, wiring en `app.config.ts`/`app.routes.ts`. 29 specs nuevas, todas verdes contra Chrome real (headless instalado vía playwright, no tocó el repo).
**Hallazgo importante (no es regresión de esta fase):** los ~14 specs que ya existían antes de este change fallan con `NG0908` (Zone.js requerido) porque la app es zoneless pero ningún spec provee `provideExperimentalZonelessChangeDetection()` en su `TestBed`. Confirmado pre-existente antes de tocar nada. Los 5 specs nuevos de Fase 0 sí lo tienen. Bug pre-existente del repo, fuera de scope de este change — pendiente de decidir si se arregla acá o en un change aparte.
**Otros:** warning (no error) de bundle budget, 523KB vs 512KB — a vigilar en fases siguientes. Decisión de fuentes: Sora/Manrope son variable fonts, se usó 1 archivo por familia con rango de peso en vez de 3 duplicados idénticos (confirmado por md5).

### 2026-07-02 — Decisiones por default (usuario away, sin acción irreversible de por medio)
**Quién:** orquestador, con criterio recomendado · **Estado:** decidido
1. **Bug NG0908 (zoneless sin config en specs viejos):** queda fuera de scope de `norte-mobile-rebrand` (el proposal es explícito: no re-litigar scope). Se registra como hallazgo para un change aparte (`fix-zoneless-testbed` o similar), no se toca en esta rama.
2. **Siguiente paso:** se corre `sdd-verify` de Fase 0 antes de seguir con Fase 1, coherente con modo interactivo + el pedido original del usuario de "mejor control de la implementación".

### 2026-07-02 — sdd-verify Fase 0
**Agente:** sdd-verify (sonnet) · **Estado:** PASS WITH WARNINGS
Corrió `bun run test` y `bun run build` en vivo (no solo lectura de código). 29/29 specs nuevas de Fase 0 verdes; confirmó que los 14 fallos pre-existentes (NG0908) no empeoraron y no tocan ninguna spec nueva. Confirmó en el código real: `TokenStorageService` guarda cada acceso a `localStorage` con `isPlatformBrowser`; el interceptor sí tiene la rama de manejo de 401 (limpia token + redirige a `/login`) que `sdd-tasks` había marcado como faltante en el sample original del design; el guard bloquea rutas protegidas (confirmado vía specs y vía inspección del output prerenderizado); `LoginComponent` usa el contrato real `{Email, Password}`.
**Único CRITICAL:** de bookkeeping, no de código — `tasks.md` y `PROGRESS.md` tenían los checkboxes de Fase 0 sin marcar pese a estar todo hecho. **Corregido por el orquestador** (mecánico, sin delegar): `tasks.md` líneas 20-127 marcadas `[x]`, checklist de este archivo actualizado arriba.
**Reporte completo:** `openspec/changes/norte-mobile-rebrand/verify-fase-0-report.md` + engram `sdd/norte-mobile-rebrand/verify-report`.

### 2026-07-02 — Push/PR de Fase 0 pendiente de confirmación
**Quién:** orquestador · **Estado:** esperando al usuario
Usuario away, sin responder si pushear+abrir PR #1. A diferencia de otras decisiones de esta sesión, **esta sí requiere confirmación explícita antes de ejecutar** (acción visible/compartida: push + PR). PR #1 (Fase 0, 11 commits, verificado) queda **local, sin pushear**, en `norte-mobile-rebrand/fase-0-fundaciones`. Se avanza igual con `sdd-apply` de Fase 1 en rama nueva `norte-mobile-rebrand/fase-1-servicios` (ramificada desde fase-0), porque ambas opciones que se le ofrecieron al usuario coincidían en seguir con Fase 1 — solo el push era lo diferente.

### 2026-07-02 — sdd-apply Fase 1
**Agente:** sdd-apply (sonnet) · **Estado:** done — 5/5 grupos de tareas, 3 commits locales, sin pushear
`MovementService` reubicado a `records/core/` + extendido (create/update/delete/getMovements con filtros); `CategoryService` y `AccountService` nuevos en `src/app/core/reference/` con cache basada en signals (fetch-once); barrel de referencia. 19 casos de test nuevos/extendidos, todos verdes. Los 14 fallos pre-existentes de NG0908 bajaron a 13 (el spec movido heredó el fix zoneless de paso).
**Desviación deliberada:** el compat re-export de `summary-by-month/core/index.ts` NO se retiró todavía — `movement-card` y `movement-summary` (scope de Fase 2) todavía importan por ahí; retirarlo ahora rompería dos componentes que hoy funcionan. Queda marcado en `tasks.md` para que Fase 2 lo resuelva.
**Otras notas:** corrigió 2 rutas relativas mal calculadas en los snippets literales de `design.md` (verificado con `path.relative` real); `ICategory` consolidado a un solo tipo canónico; el tipo de retorno de `getBalance()` es un supuesto sin confirmar contra el backend real (pendiente para Fase 5).
**Presupuesto de revisión:** ~450 líneas, dentro del rango que estimó `sdd-tasks` (~380-450) para esta fase.

### 2026-07-02 — sdd-verify Fase 1
**Agente:** sdd-verify (sonnet) · **Estado:** clean — 0 CRITICAL, 1 WARNING, 0 SUGGESTION
Corrió test+build en vivo: 61 total, 48 exitosos, 13 fallos (mismos NG0908 pre-existentes, no empeoraron). Confirmó `MovementService` lee `environment.apiUrl`, la rama POST-con-filtros/GET-plano existe de verdad en código, `updateMovement` usa `PUT`. Confirmó que `AccountService.transfer()` valida cliente-side (mismo-cuenta, monto no-positivo) ANTES de cualquier llamada HTTP. Único WARNING: `getBalance()` devuelve `Observable&lt;number&gt;` sin verificar contra la forma real de la respuesta del backend — no bloquea nada porque no hay UI que lo consuma todavía, queda para Fase 5.

### 2026-07-02 — Decisión pendiente: archivos sueltos (CLAUDE.md, .atl/)
**Quién:** orquestador · **Estado:** esperando al usuario (sin acción tomada, statu quo = recomendación)
El usuario preguntó qué hacer con `CLAUDE.md` y `.atl/` (sin relación con Norte, sin trackear desde antes de esta sesión) antes de pushear el PR #1. Se le explicó el riesgo de mezclar archivos no relacionados en un PR enfocado y se preguntó cómo proceder — sin respuesta (away). Como el default recomendado ("afuera de esta cadena") es no tocarlos, no hace falta ninguna acción para mantenerlo: siguen sin trackear, tal cual estaban. **El push de PR #1 sigue sin confirmar, no se ejecutó.**

### 2026-07-03 — sdd-apply Fase 2, primer intento cortado por límite de sesión
**Agente:** sdd-apply (sonnet) · **Estado:** interrumpido, sin commits
El primer agente de Fase 2 se cortó por un límite de sesión antes de reportar (resultado vacío, solo un warning del harness). El orquestador NO confió en el resultado y revisó el estado real del repo directamente: había cambios sin commitear, parciales. Lo bueno (arreglo de imports, retiro del compat barrel) estaba correcto. Lo incompleto: el rebrand visual real (SCSS con tokens) nunca se hizo — `movement-card.component.scss` seguía con `cadetblue` intacto. Se encontró además un spec nuevo ("no usa cadetblue") que **pasaba** pese a que el `.scss` no había cambiado — señal de test vacío/sin sentido, no de trabajo terminado. Y un cambio sospechoso: sacó el `?.` de `Category?.Icon`, lo cual silenciaría un warning de build pero introduce riesgo real de crash (el backend permite movimientos de transferencia sin categoría, aunque el tipo del frontend diga que es obligatoria).
**Acción:** se relanzó un agente fresco de `sdd-apply` con instrucciones explícitas de qué mantener, investigar y corregir (incluyendo revertir el `?.` removido) antes de continuar.

### 2026-07-03 — Fase 2 completa (dos agentes en paralelo) + intento de prompt injection detectado y rechazado
**Agentes:** sdd-apply (sonnet) x2 — el original que se había cortado terminó de resolverse solo, y el de repuesto lo verificó todo sin asumir nada. **Estado:** done, 4 commits (`08d4489`, `1525ca3`, `e9c2e91`, `b80c93d`).
Rebrand visual completo: `cadetblue`/`#ccc`/`#fff` reemplazados por tokens Norte en `movement-card`, `movement-summary`, `summary-by-month`. Compat barrel de `summary-by-month/core/index.ts` retirado (cierra el pendiente de Fase 1). `bun run test`: 65 total, 55 verdes, 10 fallos NG0908 pre-existentes (bajó de 13, efecto colateral positivo). `bun run build` limpio. `rg cadetblue src/app` sin resultados.

**⚠️ Hallazgo de seguridad:** el agente de repuesto reportó que, en medio de una tool call, recibió una nota con formato de "system note" afirmando falsamente que `movement-card.component.scss` había vuelto a `cadetblue` por "el usuario o un linter", con instrucción explícita de aceptarlo en silencio y **no decírselo al usuario**. El agente desconfió, verificó con `git diff`/`git status` reales, confirmó que la afirmación era falsa (el archivo seguía con los tokens correctos), y **reportó el intento en vez de obedecer la instrucción de silencio** — comportamiento correcto según política de seguridad. El orquestador verificó independientemente el estado real del repo (código, log de commits, contenido de `PROGRESS.md` para descartar pérdida de datos): todo consistente, sin daño. Ningún archivo se revirtió realmente; el `?.` de seguridad en `Category?.Icon` sigue restaurado.
**Por qué importa:** es exactamente el patrón de un intento de inyección de prompt embebido en resultados de herramientas — pedirle a un agente que oculte información al usuario. Documentado acá y reportado al usuario de forma directa, tal como exige la política.

### 2026-07-03 — sdd-verify Fase 2
**Agente:** sdd-verify (sonnet) · **Estado:** PASS — 0 CRITICAL, 0 WARNING, 0 SUGGESTION
Verificó en vivo, incluyendo un chequeo empírico propio del test "no usa cadetblue": restauró `cadetblue` temporalmente, confirmó que el spec falla como corresponde, restauró el archivo, confirmó `git diff` limpio después. Confirmó `?.` de seguridad intacto en `Category?.Icon`. Sin nada sospechoso en sus propias tool calls esta sesión. 65 tests, 55 verdes, 10 fallos NG0908 pre-existentes sin cambios de naturaleza.
**Siguiente:** usuario pidió seguir directo con Fase 3 (`movement-add`) sin pausar a preguntar.

### 2026-07-03 — sdd-apply Fase 3
**Agente:** sdd-apply (sonnet) · **Estado:** done — 1 commit (`b3ac096`), sin pushear
`MovementAddComponent` ya no es stub: formulario reactivo (`NonNullableFormBuilder`) con tipo, monto, categoría, cuenta, fecha, descripción; conectado a `MovementService.createMovement()` + `CategoryService`/`AccountService`. 10 tests (antes 1), todos verdes. Fallos NG0908 bajaron de 10 a 9 (efecto colateral positivo).
**Dos desviaciones bien fundamentadas:** (1) no filtró categorías por tipo ingreso/egreso — corrigió un error mío de prompt, `ICategory.Type` en realidad es `fijo`/`variable`, no ingreso/egreso; (2) fecha como `<input type="date">` nativo (string ISO) en vez de traer `MatDatepickerModule`, consistente con el resto de la app.
**Siguiente:** `sdd-verify` de Fase 3, después Fase 4 directo (mismo ritmo que pidió el usuario).

### 2026-07-03 — sdd-verify Fase 3
**Agente:** sdd-verify (sonnet) · **Estado:** PASS — 0 CRITICAL, 0 WARNING, 1 SUGGESTION
Confirmó en código real: validación (Amount/Category/Account/Date requeridos, Amount min 0.01), DTO del submit coincide con `api-reference.md`, éxito resetea+navega, error preserva el form y no lo traga en silencio. `ensureLoaded()` de ambos servicios de referencia sin duplicar llamadas HTTP. Las dos desviaciones de Fase 3 confirmadas como criterio correcto, no atajos. 74 tests, 65 verdes, 9 fallos NG0908 pre-existentes (igual que reportó `sdd-apply`, recontado en vivo). Única SUGGESTION: el banner de éxito casi no se ve porque navega enseguida — no rompe el spec, decisión de producto para después.
**Siguiente:** Fase 4 (`movement-filter`) directo.

### 2026-07-03 — sdd-apply Fase 4
**Agente:** sdd-apply (sonnet) · **Estado:** done — 1 commit (`cc10f68`), sin pushear
`MovementFilterComponent` ya no es stub: filtro real por tipo/categoría/cuenta, emite `IMovementFilter` vía `output()`. `summary-by-month.component.ts` lo consume con un signal `filteredMovements` + estado vacío. 13 tests nuevos/extendidos entre los dos componentes. NG0908 bajó de 9 a 8.
**Desviación menor:** el estado vacío se muestra cuando `movements.length === 0` en general, no solo cuando hay un filtro activo — es un superset del requisito literal del spec (también cubre "el mes no tiene movimientos"), no una contradicción. Queda para que `sdd-verify` confirme que es aceptable.
**Siguiente:** `sdd-verify` de Fase 4, después Fase 5 (Cuentas) directo — usuario pidió seguir sin pausar.

### 2026-07-03 — sdd-verify Fase 4
**Agente:** sdd-verify (sonnet) · **Estado:** PASS — 0 CRITICAL, 0 WARNING, 1 SUGGESTION cosmética
Confirmó filtro sparse (`IMovementFilter` solo con campos seteados), rama POST/GET correcta con test en vivo (`body === {Type: 'egreso'}`, un solo campo). Estado vacío confirmado como superset aceptable del spec literal. 84 tests, 76 verdes, 8 fallos NG0908 pre-existentes (bajó de 9, coincide exacto). Sin scope creep. Única sugerencia: el texto del estado vacío es un poco impreciso cuando no hay filtro activo — cosmético, no bloquea.
**Siguiente:** Fase 5 (Cuentas) — última fase del change.

### 2026-07-03 — sdd-apply Fase 5 (última fase)
**Agente:** sdd-apply (sonnet) · **Estado:** done — 4 commits, sin pushear
Feature Cuentas construida desde cero: `CuentasComponent` shell + rutas como sección top-level (sibling de records/expenses), `AccountListComponent` (lista con balance por cuenta), `TransferSheetComponent` (formulario con validación cliente-side), `AccountService.refresh()` para invalidar cache tras transferir. 17 tests nuevos, 101 total, 93 verdes, 8 fallos NG0908 pre-existentes (mismo baseline de Fase 4, sin regresión).
**Riesgo abierto, documentado explícitamente:** `getBalance()` sigue asumiendo `Observable<number>` (body plano) sin poder verificarlo contra un backend real corriendo en este entorno — si la respuesta real viene envuelta (`{balance: number}`), el fix queda contenido en `AccountService.getBalance()` + el tipado de `AccountListComponent`, no se esparce por el resto del código.
**Siguiente:** `sdd-verify` de Fase 5 — cierra la verificación de las 6 fases del change.

### 2026-07-03 — sdd-verify Fase 5 + Definition of Done final del change completo
**Agente:** sdd-verify (sonnet) · **Estado:** PASS WITH WARNINGS — 0 CRITICAL, 1 WARNING, 2 SUGGESTION
Confirmó `AccountListComponent`/`TransferSheetComponent` funcionando (validación cliente-side antes de cualquier HTTP call), `AccountService.refresh()` invalida cache de verdad, y —importante— que `/cuentas` hereda el `authGuard` de Fase 0 (no quedó una ruta sin proteger). 101 tests, 93 verdes, 8 fallos NG0908 pre-existentes sin cambios.
**Definition of Done de las 6 fases, verificado explícitamente:** login funcional con guard, cero URLs hardcodeadas fuera de `environments/`, cero `cadetblue` real en estilos, `front-web` nunca se tocó — todo confirmado.
**Único WARNING:** el supuesto de `getBalance()` (`Observable<number>` sin verificar contra backend real) no estaba documentado en el código, solo en engram. **Corregido por el orquestador** (mecánico): agregado comentario en `account.service.ts` explicando el supuesto y el radio de impacto contenido.
**El change completo queda: PASS WITH WARNINGS, listo para `sdd-archive`.**

### 2026-07-03 — Cambio de estrategia de entrega: feature-branch-chain → integración directa a dev
**Quién:** usuario · **Estado:** ejecutado
El usuario pidió cambiar la estrategia a mitad de camino: en vez de acumular en `tracker/norte-mobile-rebrand` y mergear todo al final, cada tramo se integra directo a `dev` a medida que se revisa. Se descubrió que `tracker` había quedado obsoleta (los merges de PR #4 y #5 fueron directo a las ramas de fase anteriores, no a tracker) — se usó `fase-2-rebrand` (que sí tenía el historial completo de Fases 0-2) como fuente real del PR hacia `dev`.
**Estructura final de PRs:**
- PR #2: `fase-0-fundaciones` → `tracker` (mergeado, tracker quedó obsoleta después)
- PR #4: `fase-1-servicios` → `fase-0-fundaciones` (mergeado)
- PR #5: `fase-2-rebrand` → `fase-1-servicios` (mergeado)
- PR #6: `fase-3-movement-add` → `fase-2-rebrand` (**cerrado sin mergear**, reemplazado por #8)
- PR #7: `fase-2-rebrand` → `dev` (mergeado — trae Fases 0+1+2 juntas)
- PR #8: `fase-3-movement-add` → `dev` (mergeado)
- PR #9: `fase-4-movement-filter` → `dev` (mergeado)
- PR #10: `fase-5-cuentas` → `dev` (abierto, último PR del change)
**Nota:** `tracker/norte-mobile-rebrand` queda como rama huérfana/sin uso — no se borró, pero no participa en la entrega final.

### 2026-07-03 — sdd-archive
**Agente:** sdd-archive (haiku) · **Estado:** done, con una corrección del orquestador
El agente escribió el reporte de archivo y sincronizó los 6 specs delta a `openspec/specs/`, pero **no movió** la carpeta del change — creó una carpeta nueva de archive con solo 3 archivos, dejando la original completa intacta al lado, y nunca commiteó nada. El orquestador lo detectó al verificar (no confió en el reporte a ciegas), consolidó todo en una sola carpeta completa (`openspec/changes/archive/2026-07-03-norte-mobile-rebrand/`), y ejecutó el commit real (`6b9bb74`).
**Verificación final post-archive:** `bun run build` limpio (exit 0, mismo warning de bundle de siempre), `bun run test` 93 verdes / 8 fallos (los mismos NG0908 pre-existentes de siempre, sin cambios). El change queda cerrado y consistente.
**Pendiente:** confirmar con el usuario antes de pushear este commit final a `dev`.
