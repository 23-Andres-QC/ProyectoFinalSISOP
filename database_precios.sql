-- Agregar campo PrecioTotal a la tabla compras
ALTER TABLE compras ADD COLUMN IF NOT EXISTS precio_total DECIMAL(10,2) DEFAULT 0.00;

-- Agregar precios a tabla escolar_items
ALTER TABLE escolar_items ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2) DEFAULT 0.00;

-- Actualizar precios para items escolares
UPDATE escolar_items SET precio = 15.00 WHERE nombre = 'Termómetro digital';
UPDATE escolar_items SET precio = 2.50 WHERE nombre = 'Gasas estériles (4x4)';
UPDATE escolar_items SET precio = 3.00 WHERE nombre = 'Vendas elásticas medianas';
UPDATE escolar_items SET precio = 1.50 WHERE nombre = 'Apósitos adhesivos (curitas)';
UPDATE escolar_items SET precio = 2.00 WHERE nombre = 'Cinta médica (micropore)';
UPDATE escolar_items SET precio = 3.50 WHERE nombre = 'Alcohol de 70%';
UPDATE escolar_items SET precio = 3.00 WHERE nombre = 'Solución salina estéril';
UPDATE escolar_items SET precio = 4.00 WHERE nombre = 'Guantes descartables (mínimo 3 pares)';
UPDATE escolar_items SET precio = 6.00 WHERE nombre = 'Tijeras punta roma';
UPDATE escolar_items SET precio = 0.25 WHERE nombre = 'Lista de contactos de emergencia médica';
UPDATE escolar_items SET precio = 0.50 WHERE nombre = 'Registro de atención (nombre, fecha, motivo)';
UPDATE escolar_items SET precio = 0.00 WHERE nombre = 'Medicamentos autorizados por apoderado (solo con permiso por escrito)';

-- Agregar precios a tabla hogar_items
ALTER TABLE hogar_items ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2) DEFAULT 0.00;

-- Actualizar precios para items de hogar
UPDATE hogar_items SET precio = 3.50 WHERE nombre = 'Alcohol 70%';
UPDATE hogar_items SET precio = 2.00 WHERE nombre = 'Agua Oxigenada';
UPDATE hogar_items SET precio = 2.50 WHERE nombre = 'Gasas Esteriles';
UPDATE hogar_items SET precio = 3.00 WHERE nombre = 'Vendas elasticas';
UPDATE hogar_items SET precio = 1.50 WHERE nombre = 'Curitas';
UPDATE hogar_items SET precio = 4.00 WHERE nombre = 'Anticepticos';
UPDATE hogar_items SET precio = 15.00 WHERE nombre = 'termómetro';
UPDATE hogar_items SET precio = 1.00 WHERE nombre = 'Paracetamol';
UPDATE hogar_items SET precio = 6.00 WHERE nombre = 'Tijeras con punta redondeada';
UPDATE hogar_items SET precio = 4.50 WHERE nombre = 'Pinzas metálicas';
UPDATE hogar_items SET precio = 4.00 WHERE nombre = 'Guantes descartables';
UPDATE hogar_items SET precio = 5.00 WHERE nombre = 'Gel para quemaduras';
UPDATE hogar_items SET precio = 2.00 WHERE nombre = 'Parches adhesivos';
UPDATE hogar_items SET precio = 2.00 WHERE nombre = 'Cinta médica';

-- Agregar precios a tabla industria_items
ALTER TABLE industria_items ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2) DEFAULT 0.00;

-- Actualizar precios para items de industria
UPDATE industria_items SET precio = 5.00 WHERE nombre = 'Manta térmica de emergencia (aluminizada)';
UPDATE industria_items SET precio = 20.00 WHERE nombre = 'Férulas rígidas (para brazos y piernas)';
UPDATE industria_items SET precio = 15.00 WHERE nombre = 'Collarín cervical blando';
UPDATE industria_items SET precio = 4.00 WHERE nombre = 'Vendas elásticas (medianas y grandes)';
UPDATE industria_items SET precio = 3.00 WHERE nombre = 'Vendas triangulares';
UPDATE industria_items SET precio = 3.50 WHERE nombre = 'Gasas estériles (4x4 y 10x10)';
UPDATE industria_items SET precio = 5.00 WHERE nombre = 'Apósitos grandes (para hemorragias)';
UPDATE industria_items SET precio = 3.00 WHERE nombre = 'Cinta médica resistente al sudor';
UPDATE industria_items SET precio = 10.00 WHERE nombre = 'Tijeras de trauma (punta roma, corta ropa)';
UPDATE industria_items SET precio = 7.00 WHERE nombre = 'Suero fisiológico estéril (botella de 500 ml y ampollas)';
UPDATE industria_items SET precio = 3.50 WHERE nombre = 'Alcohol 70%';
UPDATE industria_items SET precio = 6.00 WHERE nombre = 'Clorhexidina o yodopovidona';
UPDATE industria_items SET precio = 6.00 WHERE nombre = 'Guantes reforzados (nitrilo o vinilo)';
UPDATE industria_items SET precio = 4.50 WHERE nombre = 'Mascarillas de protección respiratoria (N95 o similar)';
UPDATE industria_items SET precio = 3.50 WHERE nombre = 'Compresas frías de activación instantánea';
UPDATE industria_items SET precio = 45.00 WHERE nombre = 'Oxímetro de pulso portátil';
UPDATE industria_items SET precio = 1.00 WHERE nombre = 'Registro de accidentes (formato impreso)';
UPDATE industria_items SET precio = 8.00 WHERE nombre = 'Manual de atención en trauma industrial';

-- Agregar precios a tabla montania_items
ALTER TABLE montania_items ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2) DEFAULT 0.00;

-- Actualizar precios para items de montaña
UPDATE montania_items SET precio = 5.00 WHERE nombre = 'Gasas estériles (mínimo 10 unidades)';
UPDATE montania_items SET precio = 6.00 WHERE nombre = 'Vendas elásticas (2 unidades)';
UPDATE montania_items SET precio = 3.00 WHERE nombre = 'Venda triangular';
UPDATE montania_items SET precio = 2.50 WHERE nombre = 'Cinta médica adhesiva (micropore o tela)';
UPDATE montania_items SET precio = 3.00 WHERE nombre = 'Curitas de varios tamaños (al menos 10)';
UPDATE montania_items SET precio = 5.00 WHERE nombre = 'Apósitos grandes estériles (2 unidades)';
UPDATE montania_items SET precio = 2.50 WHERE nombre = 'Algodón en rollo o bolitas';
UPDATE montania_items SET precio = 2.50 WHERE nombre = 'Toallitas antisépticas (mínimo 5)';
UPDATE montania_items SET precio = 3.00 WHERE nombre = 'Alcohol en gel (frasco pequeño)';
UPDATE montania_items SET precio = 3.50 WHERE nombre = 'Suero fisiológico (ampollas o botellitas)';
UPDATE montania_items SET precio = 5.00 WHERE nombre = 'Gel para quemaduras (aloe vera o similar)';
UPDATE montania_items SET precio = 6.00 WHERE nombre = 'Apósitos antiampollas (hidrocoloides, 2-3)';
UPDATE montania_items SET precio = 1.00 WHERE nombre = 'Aguja estéril';
UPDATE montania_items SET precio = 15.00 WHERE nombre = 'Termómetro digital';
UPDATE montania_items SET precio = 1.00 WHERE nombre = 'Paracetamol 500 mg (6 tabletas)';
UPDATE montania_items SET precio = 1.50 WHERE nombre = 'Ibuprofeno 400 mg (6 tabletas)';
UPDATE montania_items SET precio = 1.50 WHERE nombre = 'Antidiarreico (loperamida, 4 tabletas)';
UPDATE montania_items SET precio = 1.50 WHERE nombre = 'Antiemético (metoclopramida, 4 tabletas)';
UPDATE montania_items SET precio = 1.50 WHERE nombre = 'Antialérgico oral (loratadina o cetirizina, 4 tabletas)';
UPDATE montania_items SET precio = 2.00 WHERE nombre = 'Sales de rehidratación oral (4 sobres)';
UPDATE montania_items SET precio = 4.00 WHERE nombre = 'Crema con hidrocortisona o calamina';
UPDATE montania_items SET precio = 5.00 WHERE nombre = 'Repelente de insectos';
UPDATE montania_items SET precio = 4.50 WHERE nombre = 'Pinzas metálicas';
UPDATE montania_items SET precio = 6.00 WHERE nombre = 'Tijeras pequeñas de punta roma';
UPDATE montania_items SET precio = 4.00 WHERE nombre = 'Guantes estériles (mínimo 2 pares)';
UPDATE montania_items SET precio = 7.00 WHERE nombre = 'Compresas frías instantáneas (2 unidades)';
UPDATE montania_items SET precio = 5.00 WHERE nombre = 'Manta térmica de emergencia';
UPDATE montania_items SET precio = 10.00 WHERE nombre = 'Linterna o frontal con pilas';
UPDATE montania_items SET precio = 2.00 WHERE nombre = 'Silbato';
UPDATE montania_items SET precio = 3.00 WHERE nombre = 'Encendedor o pedernal';
UPDATE montania_items SET precio = 1.50 WHERE nombre = 'Espejo pequeño';
UPDATE montania_items SET precio = 3.00 WHERE nombre = 'Libreta impermeable y lápiz';
UPDATE montania_items SET precio = 2.00 WHERE nombre = 'Bolsas ziplock (3 unidades)';
UPDATE montania_items SET precio = 0.25 WHERE nombre = 'Tarjeta con datos personales y contacto de emergencia';
UPDATE montania_items SET precio = 0.00 WHERE nombre = 'Medicación personal (si aplica)';

-- Agregar precios a tabla oficina_items (asumiré precios similares a otros)
ALTER TABLE oficina_items ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2) DEFAULT 0.00;

-- Actualizar algunos precios básicos para oficina (deberás ajustar según tus datos)
UPDATE oficina_items SET precio = 15.00 WHERE nombre LIKE '%termómetro%' OR nombre LIKE '%Termómetro%';
UPDATE oficina_items SET precio = 2.50 WHERE nombre LIKE '%gasas%' OR nombre LIKE '%Gasas%';
UPDATE oficina_items SET precio = 3.00 WHERE nombre LIKE '%vendas%' OR nombre LIKE '%Vendas%';
UPDATE oficina_items SET precio = 3.50 WHERE nombre LIKE '%alcohol%' OR nombre LIKE '%Alcohol%';
UPDATE oficina_items SET precio = 4.00 WHERE nombre LIKE '%guantes%' OR nombre LIKE '%Guantes%';
UPDATE oficina_items SET precio = 6.00 WHERE nombre LIKE '%tijeras%' OR nombre LIKE '%Tijeras%';
UPDATE oficina_items SET precio = 1.50 WHERE nombre LIKE '%curitas%' OR nombre LIKE '%Curitas%';
