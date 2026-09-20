# Proyecto-AWR---Los-Ping-inos
Repositorio para avanzar en el proyecto del ramo, mantener coordinación, separar en hitos el avance y mantener un registro de los cambios.

## Comando para levantar la base de datos del db.json.

hay que abrir dos términales, uno para visualizar la vista del registro y del banner con el comando:

```cmd
    npm run dev 
```
Mientras que, en el segundo términal debemos ejecutar: 

```cmd
    npx json-server --watch db.json --port 3001
```
Esto es, para poder levantar la base de datos usando el archivo db.json.