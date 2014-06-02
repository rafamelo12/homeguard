# Repository for Home Guard project.
 Home Guard intends to build a home surveillance system using Raspberry Pi
 Bluemix and cloud applications.

## Developers:
* Rafael Melo de Oliveira
* Higor Ernandes
* Felipe Santos
* Nelson Antunes
* Guilherme Borges Oliveira

## Observations: 
To run the app locally, please comment the following lines in the app.js file.
* cache = require('./routes/cache'),
* app.get("/cache/:key", cache.getCache);
* app.put("/cache", cache.putCache);
* app.delete("/cache/:key", cache.removeCache);

###### Developed during the internship at Big Data University (Sponsored by IBM)