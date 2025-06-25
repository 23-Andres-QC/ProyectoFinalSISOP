-- Datos de ejemplo para las tablas de items

-- Items de botiquín escolar
INSERT INTO escolar_items (nombre) VALUES 
('Termómetro digital'),
('Gasas estériles'),
('Vendas elásticas'),
('Alcohol isopropílico'),
('Algodón'),
('Curitas'),
('Tijeras pequeñas'),
('Pinzas'),
('Guantes desechables'),
('Desinfectante en spray'),
('Analgésicos (ibuprofeno)'),
('Antihistamínicos'),
('Crema antibiótica'),
('Suero fisiológico'),
('Bolsa de hielo instantáneo')
ON CONFLICT DO NOTHING;

-- Items de botiquín de hogar
INSERT INTO hogar_items (nombre) VALUES 
('Termómetro digital'),
('Gasas estériles grandes'),
('Vendas elásticas variadas'),
('Alcohol isopropílico 70%'),
('Algodón hidrófilo'),
('Curitas variadas'),
('Tijeras médicas'),
('Pinzas de precisión'),
('Guantes de nitrilo'),
('Desinfectante'),
('Ibuprofeno 400mg'),
('Paracetamol 500mg'),
('Antihistamínico (loratadina)'),
('Pomada antibiótica'),
('Suero fisiológico'),
('Bolsa de agua caliente'),
('Bolsa de hielo'),
('Manta térmica'),
('Linterna LED'),
('Mascarillas N95')
ON CONFLICT DO NOTHING;

-- Items de botiquín de oficina
INSERT INTO oficina_items (nombre) VALUES 
('Termómetro infrarrojo'),
('Gasas estériles'),
('Vendas adhesivas'),
('Alcohol en gel'),
('Algodón'),
('Curitas profesionales'),
('Tijeras de oficina'),
('Pinzas metálicas'),
('Guantes desechables'),
('Desinfectante de manos'),
('Analgésicos básicos'),
('Antiácidos'),
('Pomada para quemaduras'),
('Gotas para ojos'),
('Spray desinfectante')
ON CONFLICT DO NOTHING;

-- Items de botiquín industrial
INSERT INTO industria_items (nombre) VALUES 
('Termómetro industrial'),
('Gasas estériles de gran tamaño'),
('Vendas compresivas'),
('Alcohol industrial'),
('Algodón industrial'),
('Parches hemostáticos'),
('Tijeras trauma'),
('Pinzas quirúrgicas'),
('Guantes de alta resistencia'),
('Desinfectante industrial'),
('Analgésicos potentes'),
('Antiespasmódicos'),
('Crema para quemaduras químicas'),
('Suero fisiológico en ampolla'),
('Manta ignífuga'),
('Máscara de emergencia'),
('Protector ocular'),
('Camilla plegable'),
('Inmovilizador cervical'),
('Kit de sutura básico')
ON CONFLICT DO NOTHING;

-- Items de botiquín de montaña
INSERT INTO montania_items (nombre) VALUES 
('Termómetro resistente'),
('Gasas impermeables'),
('Vendas cohesivas'),
('Alcohol en sachets'),
('Algodón compacto'),
('Parches de emergencia'),
('Tijeras multiuso'),
('Pinzas multiherramienta'),
('Guantes térmicos'),
('Toallitas desinfectantes'),
('Analgésicos de altura'),
('Medicamento para mal de altura'),
('Crema solar factor 50+'),
('Suero en polvo'),
('Manta térmica reflectante'),
('Silbato de emergencia'),
('Brújula básica'),
('Cuerda de emergencia 10m'),
('Bengala de señalización'),
('Botiquín compacto impermeable')
ON CONFLICT DO NOTHING;
