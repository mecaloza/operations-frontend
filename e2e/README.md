# E2E Tests - Operations Dashboard

Playwright test suite para Operations Dashboard.

## Estructura

```
e2e/
├── users.spec.ts          # Tests de gestión de usuarios
├── transcripts.spec.ts    # Tests de visualización de transcripts
├── epics.spec.ts          # Tests de épicas y tareas
├── navigation.spec.ts     # Tests de navegación
└── integration.spec.ts    # Tests de flujos completos
```

## Comandos

### Ejecutar todos los tests
```bash
npm run test:e2e
```

### Ejecutar con UI interactiva
```bash
npm run test:e2e:ui
```

### Ejecutar con navegador visible
```bash
npm run test:e2e:headed
```

### Ver reporte de tests
```bash
npm run test:e2e:report
```

### Ejecutar un archivo específico
```bash
npx playwright test e2e/users.spec.ts
```

### Ejecutar un test específico
```bash
npx playwright test -g "should create a new user"
```

## Coverage

Los tests cubren:

✅ **Usuarios y Equipos (Task #156)**
- Crear usuario
- Editar usuario
- Eliminar usuario
- Asignar agentes a usuarios
- Vista de equipos

✅ **Transcripts (Task #157)**
- Visualizar lista de transcripts
- Filtrar por tarea/épica
- Ver transcript completo
- Descargar transcript
- Buscar transcripts

✅ **Épicas y Tareas**
- Crear épica
- Ver detalles de épica
- Agregar tareas a épica

✅ **Navegación**
- Navegación por sidebar
- URLs correctas
- Sidebar collapse

✅ **Flujos Integrados**
- Flujo completo usuario + agente + tarea
- Creación de épica y asignación de tareas
- Roles y permisos
- Visualización y descarga de transcripts

## CI/CD

Los tests se ejecutan automáticamente en GitHub Actions en:
- Push a `main`/`master`
- Pull requests

Ver: `.github/workflows/playwright.yml`

## Notas

- Los tests están diseñados para funcionar con **mocks** o **backend real**
- Si un elemento no existe (ej. no hay usuarios), el test pasa sin fallar
- Tests usan `isVisible().catch()` para manejar elementos opcionales
- Timeout por defecto: 30s por test
