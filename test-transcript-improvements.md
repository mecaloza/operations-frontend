# Test Plan - Transcript Improvements

## Manual Testing Steps

### 1. Preview del Contenido
**Objetivo**: Verificar que se muestran las primeras líneas del contenido

**Steps**:
1. Navegar a `/transcripts`
2. Verificar que cada card muestra:
   - Título del transcript
   - **Preview** (2-3 líneas grises debajo del título)
   - Preview debe estar truncado con "..." si es muy largo
   - Markdown debe estar limpio (sin `#`, `**`, etc.)

**Expected**:
```
[Título del Transcript]
Esta es una vista previa del contenido sin formato markdown que muestra las...
```

### 2. Project Badges
**Objetivo**: Verificar que se muestran badges con colores correctos

**Steps**:
1. En `/transcripts`, verificar que los transcripts con proyectos asociados muestran badges
2. Verificar colores:
   - Action Experience: azul (`bg-blue-100 text-blue-800`)
   - Operations: verde (`bg-green-100 text-green-800`)
   - Action Colleague: morado (`bg-purple-100 text-purple-800`)
   - Newton AI: naranja (`bg-orange-100 text-orange-800`)
   - Otros: gris (`bg-gray-100 text-gray-800`)

**Expected**:
```
[Título]
[Preview...]
[Action Experience] [Operations]  ← Badges con colores
```

### 3. Editor de Proyectos - Abrir Modal
**Objetivo**: Verificar que el modal se abre correctamente

**Steps**:
1. En `/transcripts`, hacer clic en "🏷️ Edit Projects"
2. Verificar que se abre un modal con:
   - Fondo semi-transparente
   - Título: "Edit Projects for '[nombre transcript]'"
   - Lista de checkboxes con todos los proyectos disponibles
   - Botones "Save" y "Cancel"

**Expected**:
- Modal centrado en pantalla
- Overlay bloquea interacción con fondo
- Checkboxes reflejan proyectos actuales seleccionados

### 4. Editor de Proyectos - Seleccionar/Deseleccionar
**Objetivo**: Verificar que los checkboxes funcionan

**Steps**:
1. Abrir modal de edición
2. Seleccionar un proyecto nuevo
3. Deseleccionar un proyecto existente
4. Verificar que los checkboxes responden correctamente

**Expected**:
- Checkboxes se marcan/desmarcan al hacer clic
- Estado interno se actualiza correctamente

### 5. Editor de Proyectos - Guardar
**Objetivo**: Verificar que los cambios se guardan y actualizan la UI

**Steps**:
1. Abrir modal de edición
2. Cambiar selección de proyectos
3. Hacer clic en "Save"
4. Verificar que:
   - Aparece "Saving..." mientras se procesa
   - Modal se cierra automáticamente
   - Badges en la card se actualizan sin reload
   - Nuevos proyectos aparecen como badges

**Expected**:
```
[Antes]
[Action Experience]

[Después de agregar Operations]
[Action Experience] [Operations]
```

### 6. Editor de Proyectos - Cancelar
**Objetivo**: Verificar que cancelar descarta cambios

**Steps**:
1. Abrir modal de edición
2. Cambiar selección de proyectos
3. Hacer clic en "Cancel"
4. Volver a abrir modal
5. Verificar que los checkboxes reflejan el estado original

**Expected**:
- Cambios no guardados se descartan
- Estado original se mantiene

### 7. Múltiples Proyectos
**Objetivo**: Verificar que se pueden asignar múltiples proyectos

**Steps**:
1. Abrir modal de edición
2. Seleccionar 3-4 proyectos diferentes
3. Guardar
4. Verificar que todos los badges aparecen correctamente

**Expected**:
```
[Action Experience] [Operations] [Newton AI] [Action Colleague]
```

### 8. Error Handling
**Objetivo**: Verificar manejo de errores

**Steps**:
1. Desconectar backend (o simular error 500)
2. Intentar guardar cambios
3. Verificar que:
   - Aparece alert con mensaje de error
   - Modal permanece abierto
   - Estado no se corrompe

**Expected**:
- Alert: "Error updating projects. Check console for details."
- Console muestra error detallado

### 9. Loading State
**Objetivo**: Verificar que el estado de carga funciona

**Steps**:
1. Abrir modal
2. Hacer cambios y guardar
3. Verificar que durante el guardado:
   - Botón muestra "Saving..."
   - Botones están disabled
   - No se puede cerrar el modal

**Expected**:
- UI bloqueada durante guardado
- Feedback visual claro

### 10. Responsive Design
**Objetivo**: Verificar que funciona en diferentes tamaños de pantalla

**Steps**:
1. Abrir `/transcripts` en desktop (1920px)
2. Reducir a tablet (768px)
3. Reducir a mobile (375px)
4. Verificar que:
   - Preview se trunca correctamente
   - Badges se envuelven (flex-wrap)
   - Modal es responsive

**Expected**:
- Todo legible y funcional en todos los tamaños
- No overflow horizontal

## Backend Requirements Checklist

Antes de hacer testing completo, verificar que el backend tiene:

- [ ] `GET /projects` - Retorna lista de proyectos
- [ ] `PATCH /transcripts/{id}/projects` - Actualiza proyectos
- [ ] Respuesta de `/transcripts` incluye:
  - [ ] `project_ids: number[]`
  - [ ] `project_names: string[]`

## Testing con Backend Mock (Opcional)

Si el backend no está listo, puedes testear con datos mockeados:

```typescript
// En src/app/transcripts/page.tsx, agregar temporalmente:
useEffect(() => {
  // Mock data para testing
  setProjects([
    { id: "1", name: "Action Experience", description: "", status: "active", tasks: [], agents: [], created_at: "", updated_at: "" },
    { id: "2", name: "Operations", description: "", status: "active", tasks: [], agents: [], created_at: "", updated_at: "" },
    { id: "3", name: "Action Colleague", description: "", status: "active", tasks: [], agents: [], created_at: "", updated_at: "" },
    { id: "4", name: "Newton AI", description: "", status: "active", tasks: [], agents: [], created_at: "", updated_at: "" },
  ]);
  
  // Mock transcript con proyectos
  setTranscripts([
    {
      id: "1",
      title: "Test Transcript",
      content: "# Esto es un contenido de prueba\n\n- Item 1\n- Item 2\n\n**Bold text** y más contenido...",
      agent_name: "Marcel",
      agent_id: "marcel",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project_ids: [1, 2],
      project_names: ["Action Experience", "Operations"],
    }
  ]);
}, []);
```

## Success Criteria

✅ Todos los tests pasan
✅ No hay errores en consola
✅ Build de producción exitoso (`npm run build`)
✅ Performance aceptable (no lag al abrir modal)
✅ Accesibilidad básica (teclado funciona, contraste adecuado)

---

**Nota**: Este test plan asume que el backend está funcionando. Ejecutar una vez que Shosanna complete los endpoints necesarios.
