# 🚢 crane-generator

A CLI to generate TypeScript CRUD modules from a MySQL database.

---

## 📖 Description

`crane-generator` is a command-line tool that automates the creation of CRUD (Create, Read, Update, Delete) modules in TypeScript by introspecting an existing MySQL database. For each detected table, it generates model, service, controller, and route files.

---

## ⚡ Installation

```bash
npm install -g crane-generator
```
Or clone this repository and run locally:
```bash
git clone <repo-url>
cd crane-generator
npm install
npm run build
```

---

## 🚀 Usage

Run the generator from the command line:

```bash
crane \
  --host <host> \
  --user <user> \
  --password <password> \
  --database <database> \
  [--port <port>] \
  [--output <output-directory>]
```

### 🛠️ CLI Options
- `--host` (**required**) 🖥️: MySQL database host
- `--user` (**required**) 👤: Database user
- `--password` (**required**) 🔑: User password
- `--database` (**required**) 🗄️: Database name
- `--port` (default: 3306) 🚪: Connection port
- `--output` (default: `./src`) 📁: Output folder for generated modules
- `--tables` (optional) 📋: Comma-separated list of tables to generate (default: all tables)
- `--verbose` (flag) 🔍: Show detailed logs

### 💡 Examples

**Basic usage (all tables):**
```bash
crane --host localhost --user root --password 1234 --database my_db --output ./src
```

**Generate specific tables only:**
```bash
crane --host localhost --user root --password 1234 --database my_db --tables users,products,orders
```

**Verbose output:**
```bash
crane --host localhost --user root --password 1234 --database my_db --tables users,products --verbose
```

This will generate, for each specified table, the following files:
- `modules/<table>/<table>.model.ts`
- `modules/<table>/<table>.service.ts`
- `modules/<table>/<table>.controller.ts`
- `modules/<table>/<table>.routes.ts`

---

## 🗂️ Project Structure
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