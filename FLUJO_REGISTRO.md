# Flujo de Registro de Botiquín

## Estructura de Base de Datos

### 1. Tabla de Cabecera: `registro_inventario`

```sql
CREATE TABLE registro_inventario (
  id_registro INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  fecha_registro DATE DEFAULT CURRENT_DATE
);
```

### 2. Tabla de Detalle: `detalle_inventario`

```sql
CREATE TABLE detalle_inventario (
  id_detalle INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_registro INT REFERENCES registro_inventario(id_registro) ON DELETE CASCADE,
  tipo_kit VARCHAR(20) CHECK (tipo_kit IN ('escolar', 'hogar', 'industria', 'montania', 'oficina')),
  id_item INT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad >= 0)
);
```

## Flujo de Registro

### Paso 1: Obtener Usuario Interno

- Se busca/crea el usuario en la tabla `usuarios` usando el email de Supabase Auth
- Se obtiene el `id_usuario` entero para usar en las relaciones

### Paso 2: Crear Registro Principal (Cabecera)

```javascript
// INSERT en registro_inventario
{
  id_usuario: id_usuario_interno,
  // fecha_registro se crea automáticamente
}
// RETORNA: { id_registro: 123, id_usuario: 456, fecha_registro: '2025-06-24' }
```

### Paso 3: Crear Detalles

```javascript
// Para cada item en itemsAgregados[]
// INSERT en detalle_inventario
{
  id_registro: 123,  // Del paso anterior
  tipo_kit: 'escolar', // Tipo del formulario
  id_item: 15,       // ID específico de escolar_items
  cantidad: 2        // Cantidad seleccionada
}
```

## Ejemplo de Datos

### Items Cargados desde `escolar_items`:

```javascript
;[
  { id_item: 1, nombre: 'Termómetro digital' },
  { id_item: 2, nombre: 'Gasas estériles (4x4)' },
  { id_item: 3, nombre: 'Vendas elásticas medianas' },
]
```

### Items Agregados por el Usuario:

```javascript
;[
  { id_item: 1, nombre: 'Termómetro digital', cantidad: 1 },
  { id_item: 2, nombre: 'Gasas estériles (4x4)', cantidad: 5 },
]
```

### Registro en BD:

**registro_inventario:**
| id_registro | id_usuario | fecha_registro |
|-------------|------------|----------------|
| 123 | 456 | 2025-06-24 |

**detalle_inventario:**
| id_detalle | id_registro | tipo_kit | id_item | cantidad |
|------------|-------------|----------|---------|----------|
| 1001 | 123 | escolar | 1 | 1 |
| 1002 | 123 | escolar | 2 | 5 |

## Verificación

Para verificar que funciona correctamente:

1. **Consola del navegador**: Debe mostrar logs detallados
2. **Base de datos**: Verificar que se crean registros en ambas tablas
3. **Relaciones**: `id_item` debe corresponder al ID real de `escolar_items`

## Problemas Comunes

1. **Usuario no autenticado**: Verificar que `user.value` tenga datos
2. **Tablas no existen**: Ejecutar `database_updates.sql`
3. **Permisos de Supabase**: Verificar RLS policies
4. **IDs incorrectos**: Verificar que `id_item` corresponda a la tabla correcta
