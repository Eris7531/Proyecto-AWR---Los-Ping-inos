# Proyecto-AWR---Los-Ping-inos
Repositorio para avanzar en el proyecto del ramo, mantener coordinación, separar en hitos el avance y mantener un registro de los cambios.

## Cambios en esta rama (vista-juego)

Se agregó la **vista de selección de salas** para cada juego. Cuando haces click en un juego desde la página principal, ahora salen todas las salas disponibles con indicadores visuales de cuántos jugadores hay en cada una.

Cada sala muestra:
- Nombre de la sala
- 5 círculos que representan la capacidad máxima (azules = jugadores, grises = espacios libres)
- Botón "Unirse" (deshabilitado si la sala está llena)

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