# Reporte de Mejoras — PersonalFinance Backend

> Revisión estática completa del código fuente (`src/`, 18 archivos TypeScript).
> Ningún código fue modificado; este documento es solo diagnóstico.
> Fecha: 2026-06-23

---

## Resumen ejecutivo

La arquitectura de 5 capas está bien definida y la separación de responsabilidades es coherente.
Sin embargo, el proyecto tiene huecos críticos en seguridad, manejo de errores y validación que
lo hacen inadecuado para producción en su estado actual. El hallazgo más urgente —verificado
directamente— es que el archivo `.env` **está versionado en git** con tus credenciales de MongoDB.

| Criticidad | Cantidad |
|---|---|
| 🔴 Crítico | 2 |
| 🟠 Alto | 11 |
| 🟡 Medio | 11 |
| 🟢 Bajo / Mejora | 7 |
| **Total** | **31** |

---

## Leyenda de criticidad

| Nivel | Significado |
|---|---|
| 🔴 **Crítico** | Riesgo inmediato: seguridad o pérdida de datos. Atender ahora. |
| 🟠 **Alto** | Bug real o superficie de fallo con impacto en producción. |
| 🟡 **Medio** | Deuda técnica relevante: fragilidad, inconsistencia, mantenibilidad. |
| 🟢 **Bajo** | Mejora de calidad, convención o ergonomía del código. |

---

## 1. Seguridad

### 🔴 `.env` está versionado en git

**Archivo:** `.gitignore`, `.env` en raíz  
**Qué pasa:** El `.env` contiene tus credenciales de MongoDB y **está siendo rastreado por git** (`git ls-files` lo confirma). Las reglas en `.gitignore` son contradictorias (`!/*.env`, `!/.env` antes de `.env`) y el archivo no está ignorado.  
**Por qué importa:** Cualquiera con acceso al repositorio tiene acceso a tu base de datos. Si el repo alguna vez fue compartido o subido a GitHub, las credenciales están expuestas permanentemente en el historial.  
**Mejora propuesta:**
```bash
# 1. Sacarlo del tracking (sin borrarlo del disco)
git rm --cached .env

# 2. Corregir .gitignore — dejar solo esto:
.env

# 3. Crear .env.example con las variables sin valores reales
MONGO_CONN_STR=mongodb+srv://user:password@cluster/
MONGO_DB_NAME=mi-base
PORT=3000

# 4. Rotar las credenciales de MongoDB inmediatamente
```

---

### 🔴 Sin autenticación ni autorización en ningún endpoint

**Archivo:** `src/_routes.ts`, todos los archivos en `src/modules/routes/`  
**Qué pasa:** Toda la API es pública. Cualquier persona que conozca la URL puede leer, crear, modificar y eliminar movimientos y categorías sin ningún tipo de identidad verificada.  
**Por qué importa:** Es una API de finanzas personales. Exponer datos financieros sin auth no es deuda técnica, es un riesgo directo.  
**Mejora propuesta:** Implementar autenticación con JWT (jsonwebtoken) o sesiones. Agregar un middleware de auth que proteja todas las rutas. Como mínimo: `Authorization: Bearer <token>` validado en un middleware montado antes de las rutas en `_routes.ts`.

---

### 🟠 Sin `helmet`, sin CORS, sin rate limiting, sin límite de body

**Archivo:** `src/index.ts`  
**Qué pasa:** La app no configura ninguna cabecera de seguridad HTTP, no tiene política de CORS (acepta requests de cualquier origen), no limita la tasa de requests, y no limita el tamaño del body (un body gigante puede causar un crash de memoria).  
**Mejora propuesta:**
```ts
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

---

### 🟠 Mass-assignment en filtro de movimientos

**Archivo:** `src/modules/controllers/movement.controller.ts` — `getMovementsByFilters`  
**Qué pasa:** El handler copia directamente todas las claves de `req.body` al objeto de filtro Mongoose con `Object.keys(req.body).forEach(key => filter[key] = req.body[key])`. Un cliente puede inyectar claves arbitrarias en la query.  
**Por qué importa:** Aunque `sanitizeFilter: true` en la conexión mitiga los operadores de MongoDB (`$where`, `$regex`), la superficie de ataque sigue abierta. El filtro debería construirse con claves explícitas (`Type`, `Amount`, `Category`, etc.), no copiando el body entero.  
**Mejora propuesta:** Construir el filtro manualmente solo con las claves permitidas y tipadas.

---

### 🟡 Errores internos serializados al cliente

**Archivo:** `src/middlewares/responose.middleware.ts` — `errorResponse`  
**Qué pasa:** `message: any` — si se pasa un objeto de error Mongoose, su shape completo (con stack parcial, detalles internos) se serializa al cliente.  
**Mejora propuesta:** Sanitizar el mensaje antes de enviarlo. En producción, loguear el error completo y devolver solo un mensaje genérico para errores 500.

---

## 2. Manejo de errores

### 🟠 Sin middleware global de errores

**Archivo:** `src/index.ts`  
**Qué pasa:** No hay ningún `app.use((err, req, res, next) => {...})` registrado. Sin él, los errores que llegan vía `next(error)` los maneja Express de forma nativa (respuesta HTML sin formato, con el stack en development).  
**Mejora propuesta:** Registrar un error handler global al final de la cadena de middlewares, antes de `app.listen`:
```ts
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    errorResponse(res, 'Internal server error', 500);
});
```

---

### 🟠 Validators async hacen `throw` en lugar de pasar el error a `next`

**Archivo:** `src/modules/validators/movement.validator.ts` — `paramBodyValidator`, `paramDateValidator`, `idValidator`  
**Qué pasa:** Todos usan el patrón:
```ts
catch (error: any) { throw error; }
```
En Express 4, los middlewares `async` que lanzan un error **no lo captura Express automáticamente** (eso llegó en Express 5). El resultado es una `UnhandledPromiseRejection` que puede colapsar el proceso en lugar de devolver una respuesta HTTP.  
**Mejora propuesta:** Pasar el error a `next`:
```ts
catch (error) { next(error); }
```

---

### 🟠 Casi todos los errores terminan como HTTP 500

**Archivo:** Todos los controllers (`category.controller.ts`, `movement.controller.ts`)  
**Qué pasa:** El patrón en cada catch es:
```ts
errorResponse(res, error.message ?? error, error.status);
```
`error.status` es `undefined` en errores estándar de JavaScript y Mongoose. `errorResponse` tiene `statusCode = 500` como default, pero recibir `undefined` explícitamente también usa el default, entonces **todo error — incluyendo validaciones y cast errors que deberían ser 400 — se reporta como 500**.  
**Mejora propuesta:** Mapear tipos de error a status codes:
```ts
} catch (error) {
    if (error instanceof mongoose.Error.CastError) {
        return errorResponse(res, 'ID inválido', 400);
    }
    if (error instanceof mongoose.Error.ValidationError) {
        return errorResponse(res, error.message, 400);
    }
    errorResponse(res, 'Internal server error', 500);
}
```

---

### 🟡 Dos contratos de error distintos

**Archivo:** `src/interceptors/validator.interceptor.ts` vs `src/middlewares/responose.middleware.ts`  
**Qué pasa:** Los errores de validación de express-validator devuelven `{ errors: [...] }` mientras que `errorResponse` devuelve `{ message: string }` (o el objeto raw). El cliente tiene que manejar dos shapes distintos para errores.  
**Mejora propuesta:** Unificar en un solo contrato, por ejemplo `{ error: { message: string, details?: any[] } }`.

---

### 🟡 `MongoDB().then(...)` sin `.catch` en el arranque

**Archivo:** `src/index.ts`  
**Qué pasa:**
```ts
MongoDB().then((message) => {
    app.listen(port, () => { ... });
});
```
Si la conexión a MongoDB falla, la promesa rechaza sin handler → `UnhandledPromiseRejection`.  
**Mejora propuesta:**
```ts
MongoDB()
    .then((message) => {
        app.listen(port, () => { console.info(message); });
    })
    .catch((err) => {
        console.error('[Startup] Failed to connect to MongoDB:', err);
        process.exit(1);
    });
```

---

## 3. Base de datos y modelado

### 🟠 `Category` es `String` con `ref` — `populate` está roto

**Archivos:** `src/modules/models/Movement.model.ts`, `src/modules/services/movement.service.ts`, `src/modules/controllers/movement.controller.ts`  
**Qué pasa:** El campo `Category` en el schema de `Movement` está declarado como `type: String` con `ref: 'Category'`. Mongoose `populate` necesita que el campo sea `ObjectId` para resolver la referencia. Como es `String`, `populate('Category')` silenciosamente no hace nada útil.  
**Mejora propuesta:**
```ts
// Movement.model.ts
Category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
```
Y actualizar `MovementI` para que `Category` sea `Schema.Types.ObjectId | CategoryI` (cuando esté populado).

---

### 🟠 `update` devuelve el documento viejo y omite validación

**Archivo:** `src/modules/services/movement.service.ts` — `update`  
**Qué pasa:**
```ts
return MovementModel.findByIdAndUpdate(id, movement);
```
Sin `{ new: true }` devuelve el documento **antes** del update. El controller entonces le manda al cliente el estado viejo. Además sin `{ runValidators: true }` las validaciones del schema se saltan en updates.  
**Mejora propuesta:**
```ts
return MovementModel.findByIdAndUpdate(id, movement, { new: true, runValidators: true });
```

---

### 🟡 Sin estrategia de reconexión ni graceful shutdown

**Archivo:** `src/config/database.ts`  
**Qué pasa:** Si la DB se cae después de que el servidor arrancó, Mongoose intentará reconectarse solo (tiene reconexión automática por defecto), pero no hay listeners de eventos (`'disconnected'`, `'error'`) para loguear o alertar. Tampoco hay `graceful shutdown` que cierre la conexión al apagar el proceso.  
**Mejora propuesta:** Agregar listeners y manejar `SIGTERM`/`SIGINT`:
```ts
mongoose.connection.on('disconnected', () => console.warn('[MongoDB] Desconectado'));
process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    process.exit(0);
});
```

---

### 🟡 Sin paginación en consultas de listado

**Archivos:** `src/modules/services/category.service.ts` — `find`, `src/modules/services/movement.service.ts` — `find`  
**Qué pasa:** `CategoryModel.find(filter)` y `MovementModel.find(filter)` devuelven todos los documentos sin límite. Con datos reales esto degrada el rendimiento y puede saturar la memoria.  
**Mejora propuesta:** Agregar `limit` y opcionalmente `skip` para paginación:
```ts
static async find(filter = {}, page = 1, limit = 50): Promise<MovementI[]> {
    return MovementModel.find(filter).limit(limit).skip((page - 1) * limit);
}
```

---

### 🟢 Modelado inconsistente: `MovementI` extiende `Document`, `CategoryI` no

**Archivos:** `src/modules/interfaces/movement.interface.ts`, `src/modules/interfaces/category.interface.ts`  
**Qué pasa:** En Mongoose moderno (v6+) se desaconseja que la interface del documento extienda `Document`. Además, `MovementI` se usa como DTO de request body en los controllers, lo cual es incorrecto conceptualmente: un `Document` tiene métodos de Mongoose que un body de request no tiene.  
**Mejora propuesta:** Separar la interface del documento de la del DTO:
```ts
// DTO (request body)
interface CreateMovementDto { Amount: number; Type: TypeMovement; ... }
// Documento Mongoose
type MovementDocument = HydratedDocument<CreateMovementDto>;
```

---

## 4. Validación

### 🟠 Validación de array en categorías no funciona

**Archivo:** `src/modules/validators/category.validator.ts` — `bodyValidator`  
**Qué pasa:** En el branch de array, las validaciones se corren contra `{ body: item }` (un objeto falso), pero luego se llama `validate(req, ...)` sobre el `req` real. `validationResult(req)` no tiene los errores de las corridas sobre el objeto falso → **la validación de los ítems del array nunca se aplica realmente**.  
**Mejora propuesta:** Usar el enfoque de `checkSchema` de express-validator con schemas dinámicos, o validar cada ítem manualmente acumulando errores en un array antes de responder.

---

### 🟠 POST de movimiento no valida campos requeridos

**Archivo:** `src/modules/validators/movement.validator.ts` — `addUpdateValidator`  
**Qué pasa:** En el flujo de POST (crear), el validator solo valida `Date`. Los campos `Type`, `Amount` y `Category` — todos `required` en el schema — no se validan en la capa HTTP. Si llegan vacíos o con tipo incorrecto, el error ocurre en Mongoose y regresa como HTTP 500 en lugar de 400.  
**Mejora propuesta:** Agregar validación explícita de los campos requeridos para POST dentro de `addUpdateValidator`:
```ts
if (req.method === 'POST') {
    await body('Type').isIn(['ingreso', 'egreso']).run(req);
    await body('Amount').isNumeric().run(req);
    await body('Category').notEmpty().run(req);
    return validate(req, res, next);
}
```

---

### 🟠 Doble `next()` en `addUpdateValidator`

**Archivo:** `src/modules/validators/movement.validator.ts` — `addUpdateValidator`  
**Qué pasa:**
```ts
if (!checkDate(date)) { next(new Error(messageErrorDate)); }
else if (typeof date === 'string') { req.body.Date = new Date(date); }
if (req.method === 'PUT') { ... return validate(req, res, next); }
next();
```
Si la fecha es inválida, se llama `next(error)` pero la ejecución **no se detiene** (falta `return`). El código continúa y puede llamar `next()` una segunda vez, causando comportamiento indefinido en Express.  
**Mejora propuesta:** Agregar `return` después de `next(error)`:
```ts
if (!checkDate(date)) { return next(new Error(messageErrorDate)); }
```

---

### 🟡 Rutas `/category/save` y `/movement/save` sin validator

**Archivos:** `src/modules/routes/category.route.ts`, `src/modules/routes/movement.route.ts`  
**Qué pasa:** Las rutas de bulk-save no tienen ningún middleware de validación. Cualquier payload llega directo al controller y al service.

---

### 🟡 `checkKeys` de categoría omite el campo `Icon`

**Archivo:** `src/modules/validators/category.validator.ts`  
**Qué pasa:** La whitelist es `['Name', 'Description', 'Type', 'Tag']` pero `Icon` es un campo válido en el schema. Enviar `{ Icon: '🏠', ...otrosCampos }` sería rechazado por `checkKeys` aunque el dato sea perfectamente válido.

---

### 🟡 `body('Card')` declarado dos veces

**Archivo:** `src/modules/validators/movement.validator.ts`  
**Qué pasa:** La chain `body('Card').optional().isString()` aparece duplicada en `paramBodyValidate`. No es un bug crítico, pero es ruido que puede confundir.

---

### 🟡 `idValidator` de movimientos no valida formato de MongoId

**Archivo:** `src/modules/validators/movement.validator.ts`  
**Qué pasa:** El validator de `/:id` solo usa `notEmpty()`, no `isMongoId()`. Un id como `"abc"` pasa la validación y llega a `findByIdAndDelete`, que lanza un `CastError` → 500.  
**Mejora propuesta:** Reemplazar `param('id').notEmpty()` por `param('id').isMongoId()`.

---

## 5. Routing

### 🟠 Ruta GET `/:month/:year` ensombrece a `/:startDate/:endDate`

**Archivo:** `src/modules/routes/movement.route.ts`  
**Qué pasa:**
```ts
router.get('/:month/:year', paramDateValidator, getSummaryByMonth);
router.get('/:startDate/:endDate', paramBodyValidator, getMovementsByFilters);
```
Ambas son rutas de dos segmentos. Express las matchea en orden de declaración, por lo que **cualquier GET de dos segmentos siempre cae en `getSummaryByMonth`**. `getMovementsByFilters` por GET es inalcanzable.  
**Mejora propuesta:** Diferenciar las rutas con prefijos explícitos:
```ts
router.get('/summary/:month/:year', paramDateValidator, getSummaryByMonth);
router.get('/filter/:startDate/:endDate', paramBodyValidator, getMovementsByFilters);
```

---

## 6. Tipado y calidad de código

### 🟡 `strict: true` socavado sistemáticamente

**Archivos:** Todos los controllers, validators, middlewares  
**Qué pasa:** `tsconfig.json` activa `strict: true`, pero el código lo evade constantemente con `error: any` en cada catch, `Record<string, any>`, `message: any`, `acc: any`, y `<T = any>`. El compilador no puede ayudar a detectar errores donde el tipo es `any`.  
**Mejora propuesta:** Usar tipos concretos. Para errores: `error instanceof Error ? error.message : String(error)`. Para el filtro Mongoose: `FilterQuery<MovementI>` en lugar de `Record<string, any>`.

---

### 🟡 Dependencias de tipos obsoletas o en mismatch

**Archivo:** `package.json`  
**Qué pasa:**
- `@types/mongoose@^5.11.96` es un paquete stub obsoleto. **Mongoose 8 incluye sus propios tipos**. Tener ambos puede generar conflictos.
- `@types/express@^5.0.0` no matchea `express@^4.21.1` (major version skew).

**Mejora propuesta:**
```bash
npm uninstall @types/mongoose
npm install --save-dev @types/express@^4
```

---

### 🟢 `successResponse` siempre responde 200

**Archivo:** `src/middlewares/responose.middleware.ts`  
**Qué pasa:** Creación de recursos (POST) debería devolver 201, y eliminación exitosa sin body podría devolver 204. Actualmente todo devuelve 200.  
**Mejora propuesta:** Permitir que el caller especifique el status code: `successResponse(res, data, 201)`.

---

### 🟢 Código muerto: clase `Validator` duplica helpers funcionales

**Archivo:** `src/interceptors/validator.interceptor.ts`  
**Qué pasa:** El archivo exporta tanto funciones (`validateContext`, `validateSchema`, `validate`) como una clase `Validator` con los mismos métodos estáticos. Solo se importa `validate` en los validators. El resto es código que no se usa.  
**Mejora propuesta:** Eliminar la clase `Validator` y las funciones no importadas, o documentar su uso previsto.

---

## 7. Tooling y Developer Experience

### 🟡 Sin tests

**Archivo:** `package.json`  
**Qué pasa:** `npm test` ejecuta `echo "Error: no test specified" && exit 1`. No hay test runner ni archivos de test. En una API de finanzas, los cálculos de fechas, el mapeo de movimientos y la lógica de filtros deberían estar cubiertos.  
**Mejora propuesta:** Agregar Vitest o Jest, y empezar por los casos críticos: cálculos de fecha en `getSummaryByMonth`, la lógica de filtros, y el comportamiento del upsert de categorías.

---

### 🟡 Sin ESLint ni Prettier

**Qué pasa:** No hay linter ni formateador configurado. Sin ellos, la consistencia del código depende del criterio de cada developer en cada commit.  
**Mejora propuesta:** Agregar `eslint` con `@typescript-eslint/eslint-plugin` y `prettier`. Añadir scripts en `package.json`:
```json
"lint": "eslint src --ext .ts",
"format": "prettier --write src"
```

---

### 🟡 `npm i` en cada corrida de `dev` y `build`

**Archivo:** `package.json`  
**Qué pasa:**
```json
"dev": "npm i && ts-node-dev ...",
"build": "npm i && tsc"
```
`npm install` en cada inicio de dev server o build hace los comandos innecesariamente lentos y no-determinísticos.  
**Mejora propuesta:** Remover `npm i &&` de ambos scripts. Si querés asegurar dependencias actualizadas, `npm ci` es el comando correcto para entornos de CI.

---

### 🟢 Typo en nombre de archivo de middleware

**Archivo:** `src/middlewares/responose.middleware.ts`  
**Qué pasa:** El nombre tiene un typo (`responose` en lugar de `response`). No genera un bug funcional, pero es ruido.  
**Mejora propuesta:** Renombrar a `response.middleware.ts` y actualizar los imports.

---

### 🟢 `.DS_Store` en el repo

**Qué pasa:** Hay archivos `.DS_Store` (metadata de macOS) en la raíz de `src/` y probablemente en otros directorios. Ya están en `.gitignore`, pero si fueron commiteados antes de agregarse al ignore, siguen en tracking.  
**Mejora propuesta:**
```bash
git rm -r --cached **/.DS_Store
```

---

### 🟢 Sin `.env.example`

**Qué pasa:** No hay documentación de qué variables de entorno requiere la app para funcionar. Un developer nuevo no puede arrancar sin leer el código o pedir el `.env`.  
**Mejora propuesta:** Crear `.env.example` con los nombres de variables y valores placeholder:
```
MONGO_CONN_STR=mongodb+srv://user:password@cluster/
MONGO_DB_NAME=personal-finance
PORT=3000
```

---

## Hoja de ruta sugerida

Orden recomendado para atacar las mejoras, de mayor a menor urgencia:

| Prioridad | Qué hacer | Impacto |
|---|---|---|
| 1 | Sacar `.env` del tracking + rotar credenciales | 🔴 Seguridad inmediata |
| 2 | Implementar autenticación (JWT o similar) | 🔴 Toda la API es pública |
| 3 | Agregar middleware global de errores | 🟠 Estabilidad base |
| 4 | Arreglar validators async (`throw` → `next(error)`) | 🟠 Crashes silenciosos |
| 5 | Agregar `helmet`, CORS y rate limiting | 🟠 Hardening básico |
| 6 | Corregir `Category` a `ObjectId` y el populate | 🟠 Feature rota |
| 7 | Arreglar `update` (`new: true`, `runValidators`) | 🟠 Devuelve datos viejos |
| 8 | Corregir shadowing de rutas en `movement.route.ts` | 🟠 Endpoint inalcanzable |
| 9 | Validar campos requeridos en POST de movimientos | 🟠 Errores como 500 |
| 10 | Configurar ESLint + Prettier | 🟡 Calidad sostenible |
| 11 | Reemplazar `any` con tipos concretos | 🟡 Type safety real |
| 12 | Agregar tests (Vitest o Jest) | 🟡 Confianza en cambios |
| 13 | Agregar paginación en listados | 🟡 Escalabilidad |
| 14 | Unificar contrato de respuestas de error | 🟡 Consistencia de API |
| 15 | Limpieza menor (typos, duplicados, DS_Store) | 🟢 Calidad del código |

---

*Reporte generado por revisión estática. No se ejecutó el código ni se probaron endpoints.*
