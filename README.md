# Proyecto-AWR---Los-Ping-inos
Repositorio para avanzar en el proyecto del ramo, mantener coordinación, separar en hitos el avance y mantener un registro de los cambios.

## Comando para levantar la base de datos y correr la pagina web.

hay que abrir dos terminales, en la primera terminal abrimos backend y corremos dos comandos, primero para poblar los datos:

```cmd
    npm run seed 
```

Luego para correr el backend

```cmd
    npm run dev 
```
Mientras que, en el segundo términal debemos ejecutar en frontend: 

```cmd
    npx json-server --watch db.json --port 3001
```