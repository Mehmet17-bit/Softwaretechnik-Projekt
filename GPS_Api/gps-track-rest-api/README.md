# RoboTaxi FleetManager RESTful API

## Teil der Abgabe Softwaretechnik Projekt WS21/22
- Dozent: Prof. Dr.-Ing. Seyed Eghbal Ghobadi


- Samir Faycal Tahar M'Sallem <samir.faycal.tahar.m.sallem@mni.thm.de>
- Mehmet Algül <mehmet.alguel@mni.thm.de>
- Murat Algül <murat.alguel@mni.thm.de>
- Mehmet Duhan Tercüman <mehmet.duhan.tercueman@mni.thm.de>


**NodeJS/Express basierte REST API, um zustandlose, sichere Kommunikation zwischen den Diensten und der Datenbank herzustellen**
## Live Demo
   - API: http://seg-swtp-ubuntu.mni.thm.de:4001/ (`admin:12345`)
   - phpMyAdmin (Datenbankverwaltung): http://seg-swtp-ubuntu.mni.thm.de:7000/ (`swtp:123456789`)
   - Code Quality Checks: https://scm.thm.de/sonar/dashboard?id=swtp_restapi

## Features:
- Authentifizierung über Access-Token
- zustandlose Datenübertragung
- Error-Handling
- Einfache Verwaltung der Daten in der Datenbank durch Routen und Controller
- API als Middleware sorgt dafür, dass Services keine Verbindung zur Datenbank benötigen und verwalten müssen
- Datenbankcredentials werden sicher innerhalb des Projekts in .env gespeichert
- DevOps Architektur enthalten (API, Datenbank, phpMyAdmin)


## Pipeline
Die Pipeline ist gegliedert in 
1. Build-Prozess 
    - baut aus den Projektdateien einen Docker-Container und pusht diesen in die Container Registry
    - damit kann die RestAPI ohne weitere Einstellungen/Konfigurationen in einem Docker-Container in Betrieb genommen werden
2. Test-Prozess 
    - nach jedem Commit werden die Projektdateien in SonarQube analysiert und die Developer enthalten eine Rückmeldung über die Code-Qualität
    - https://scm.thm.de/sonar/dashboard?id=swtp_restapi
3. Deploy Prozess
    - das Image des Services wurde über die Container Registry auf der VM gepullt und dann in mit Hilfe des Befehls `docker-compose up` deployt
    - Dabei wird die vorgefertigte Docker-Compose File aufgerufen, welche neben der API auch die MySQL Datenbank und phpMyAdmin enthält 


## Setup (mehrere Möglichkeiten):
1. Natives setup mit NodeJS und XAMPP
   - NodeJS installieren, XAMPP installieren
   - Im Projektordner:
     - Eine MySQL Datenbank namens `swtp` erstellen und die `.sql` Datei aus /db/ importieren
     - Datenbank starten
     - ``npm install`` installiert alle notwendigen npm Pakete
     - ``node server.js`` führt die RestAPI aus
     - Erreichbar unter http://localhost:4001/
2. Containerized setup über Docker
   - Docker installieren
   - Im Repo: `docker-compose up -d`
     - führt 3 vorgefertigte Docker-Container aus
     - API unter http://localhost:4001/ erreichbar
     - Datenbank unter http://localhost:3306/, PhpMyAdmin unter http://localhost:7000/
     - zu http://localhost:7502/ connecten und einloggen `swtp:123456789`
     - Die Datenbank aus /db Ordner importieren
3. Pre-built Docker image
   - wie unsere VM auch können Sie auf die GitLab Container Registry zugreifen und das fertige Image pullen und direkt deployen
   - dies findet auch auf unserer VM statt!
   - normalerweise würde der Deploy-Prozess automatisch über die Pipeline erfolgen, aber da wir kein SSL-Zertifikat haben konnten wir das Image nicht über die Pipeline pullen
   - `docker login git-registry.thm.de` (Username ist Ihre THM Kennung, Passwort ist Access-Token generiert hier: https://git.thm.de/-/profile/personal_access_tokens)
   - Image holen: `docker pull -t git-registry.thm.de/sftm31/gps-track-rest-api:latest`
   - Anschließend wie in 3) `docker-compose up -d` ausführen

## Code Quality und Testing

Postman E2E Tests:

- Die .json Collection aus /tests/ in Postman importieren
- Tests ausführen und in der Test Pagination das Result anschauen
- Jeder Test sollte grün sein

SonarQube Quality Checks:
- Die Pipeline enthält eine Testing-Stage in der ein SonarQube Scanner die Projektdaten im THM SonarQube analysiert.
- https://scm.thm.de/sonar/dashboard?id=swtp_restapi


## Technical API explanation (routes, controller)

This repo contains the RestFul API connected to the MySQL DB using Express MYSQL Package.

Explanation:

   - HTTP REQUEST TYPE: `URL` explanation



API Controller Routes:


- **ADMIN INTERFACE (Webinterface + App Admin Interface)**
   
  - GET: `/auth` with headers `username, password` with correct credentials will send a token in `body`
    - token is needed for all routes except `/` as authentication in header
    - `"token": "123456789"`
  - GET: `/current ` all current positions of all users (vehicles)
  - GET: `/current/(id) ` current position of user (vehicle) by id
  - GET: `/history ` all positions of all users (vehicles)
  - GET: `/history/(id) ` all position of user (vehicle) by id
  - DELETE: `/reset ` reset total history of all vehicles
  - DELETE: `/reset/(id) ` reset history of positions of user (vehicle) by id
  - GET:`/users` all users (vehicles) `user information + assigned zone + count of sent datasets`
  - PUT: `/users/(id)` update existing user (vehicle), body: `imei, name, zone`
  - DELETE: `/users/(id)` remove user (vehicle) that matches id given in url parameter
  - GET: `/zones` get all zones where the company has its service
  - DELETE: `/zone` remove zone that matches name given in header: `name: "name"`
  - POST: `/zone` add or update existing zone, body: `name, latitude, longitude and radius`

  
- **CLIENTS (Vehicles) that send data (Android App)**
  - POST: `/register` with body `imei, name` will register new user for data sending, only possible if imei not registered
  - POST: `/post` post new position of user with request body of `imei, latitude, longitude`



### Requests input/output:


**RESPONSE WILL BE JSON FORMATTED**

response of GET requests (i.e `/current`):

`[
{
"id": 1,
"latitude": 50.12142911,
"longitude": 8.92537832,
"timestamp": "2021-11-05T09:57:12.000Z"
}
]`

request of POST (`/post`) should have request body like this:

`
{
"imei": 531264653846733,
"latitude": 50.12142911,
"longitude": 8.92537832
}
