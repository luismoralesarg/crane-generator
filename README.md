# crane-generator

CLI para generar módulos CRUD en TypeScript desde una base de datos MySQL.

## Descripción

`crane-generator` es una herramienta de línea de comandos que automatiza la creación de módulos CRUD (Create, Read, Update, Delete) en TypeScript, basándose en la introspección de una base de datos MySQL existente. Genera archivos de modelo, servicio, controlador y rutas para cada tabla detectada en la base de datos.

## Instalación

```bash
npm install -g crane-generator
```
O bien, clona este repositorio y ejecuta localmente:
```bash
git clone <repo-url>
cd crane-generator
npm install
npm run build
```

## Uso

Ejecuta el generador desde la línea de comandos:

```bash
crane \
  --host <host> \
  --user <usuario> \
  --password <contraseña> \
  --database <nombre_db> \
  [--port <puerto>] \
  [--output <directorio_destino>]
```

### Opciones CLI
- `--host` (**requerido**): Host de la base de datos MySQL
- `--user` (**requerido**): Usuario de la base de datos
- `--password` (**requerido**): Contraseña del usuario
- `--database` (**requerido**): Nombre de la base de datos
- `--port`: Puerto de conexión (por defecto: 3306)
- `--output`: Carpeta destino para los módulos generados (por defecto: el directorio actual)

### Ejemplo
```bash
crane --host localhost --user root --password 1234 --database mi_db --output ./src
```
Esto generará, por cada tabla, los archivos:
- `modules/<tabla>/<tabla>.model.ts`
- `modules/<tabla>/<tabla>.service.ts`
- `modules/<tabla>/<tabla>.controller.ts`
- `modules/<tabla>/<tabla>.routes.ts`

## Estructura del Proyecto
```
crane-generator/
├── src/
│   ├── bin/           # CLI principal
│   ├── db/            # Lógica de introspección MySQL
│   ├── generators/    # Generador de CRUD
│   └── utils/         # Utilidades
└── ...
```

## Requisitos
- Node.js >= 18
- Acceso a una base de datos MySQL

## Contribuciones
¡Las contribuciones son bienvenidas! Abre un issue o pull request.

## Licencia
MIT