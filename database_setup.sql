-- Tabla para registros de botiquín
CREATE TABLE IF NOT EXISTS botiquin_registros (
  id BIGSERIAL PRIMARY KEY,
  tipo_botiquin TEXT NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  datos JSONB NOT NULL,
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para órdenes de compra
CREATE TABLE IF NOT EXISTS ordenes_compra (
  id BIGSERIAL PRIMARY KEY,
  tipo_botiquin TEXT NOT NULL,
  numero_orden TEXT UNIQUE NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  items JSONB NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_botiquin_registros_tipo ON botiquin_registros(tipo_botiquin);
CREATE INDEX IF NOT EXISTS idx_botiquin_registros_fecha ON botiquin_registros(fecha);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_tipo ON ordenes_compra(tipo_botiquin);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_fecha ON ordenes_compra(fecha);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_estado ON ordenes_compra(estado);

-- Políticas de seguridad (RLS - Row Level Security)
ALTER TABLE botiquin_registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;

-- Permitir operaciones para usuarios autenticados (opcional)
-- Si no tienes autenticación, puedes usar estas políticas más permisivas:
CREATE POLICY "Permitir lectura pública" ON botiquin_registros FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública" ON botiquin_registros FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir lectura pública OC" ON ordenes_compra FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública OC" ON ordenes_compra FOR INSERT WITH CHECK (true);
