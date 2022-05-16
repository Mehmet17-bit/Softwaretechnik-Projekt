## RoboTaxi FleetManager Webinterface

### Teil der Abgabe Softwaretechnik Projekt WS21/22
- Dozent: Prof. Dr.-Ing. Seyed Eghbal Ghobadi


- Samir Faycal Tahar M'Sallem <samir.faycal.tahar.m.sallem@mni.thm.de>
- Mehmet Algül <mehmet.alguel@mni.thm.de>
- Murat Algül <murat.alguel@mni.thm.de>
- Mehmet Duhan Tercüman <mehmet.duhan.tercueman@mni.thm.de>


**Angular-basierte Webanwendung zur Visualisierung der GPS-Daten aus der Datenbank, unter Verwendung einer RestAPI als Middleware**


## Live Demo
  - Webapp: http://seg-swtp-ubuntu.mni.thm.de/ (`admin:12345`)
  - Code Quality Checks: https://scm.thm.de/sonar/dashboard?id=swtp_webinterface


## Features
- Anzeige von GPS-Daten in einer Karte
- Live-Verfolgung von Fahrzeugen, mittels Marker
- Zonen, um Fahrbereiche festzulegen
- Alerts für Events (Fahrzeugbewegung, Zone verlassen, System information)
- Vehicle und Zone Management (Löschen, Anlegen, Bearbeiten und Zurücksetzen)
- Visualisierung von Live Daten + Anzeige von Fahrtrouten
- LogBook um alle GPS-Daten zu allen Zeitpunkten einzusehen
- Total Distance / Average Speed Counter
- Responsive One Pager Design
- Performant, durch zustandlose Kommunikation via API über HTTP-Requests
- Session Handling für User Login
- DevOps Architektur enthalten
- Code Quality Testing


## Pipeline

Im Projekt wurden ebenfalls DevOps Ansätze implementiert.

Dies ermöglicht dem Kunden die Dienste leicht zu verwalten und es bedarf (nahezu keiner) Operations Ebene die die Architektur und die Prozesse überwacht.

Die Pipeline ist gegliedert in 
1. Build-Prozess 
    - baut aus den Projektdateien einen Docker-Container und pusht diesen in die Container Registry
    - damit kann die Webapp ohne weitere Einstellungen/Konfigurationen in einem Docker-Container in Betrieb genommen werden
2. Test-Prozess 
    - nach jedem Commit werden die Projektdateien in SonarQube analysiert und die Developer enthalten eine Rückmeldung über die Code-Qualität
    - https://scm.thm.de/sonar/dashboard?id=swtp_webinterface
3. Deploy Prozess
    - das Image des Services wurde über die Container Registry auf der VM gepullt und dann mit einem einzigen Befehl deployt
    

## Setup (mehrere Möglichkeiten):
1. Natives setup mit NodeJS und Angular CLI
   - NodeJS installieren
   - Im Projektordner:
     - ``npm install -g @angular/cli``
     - ``npm i``
     - ``ng serve`` führt die Webapp aus
     - Die Webapp ist unter http://localhost:4200 erreichbar
     - Admin Login credentials: ``admin:12345``

2. Containerized setup über Docker
    - Docker installieren
    - Entweder GitLab-Repo clonen und über Dockerfile das Image bauen
    - alternativ vorgebautes Image aus der GitLab Container Registry pullen
    - `docker run -p <zielport>:80 <containername> .`
    - Im Browser unter http://localhost:<zielport>/ aufrufen

## Code Quality und Testing

[![Coverage](https://scm.thm.de/sonar/api/project_badges/measure?project=swtp_webinterface&metric=coverage)](https://scm.thm.de/sonar/dashboard?id=swtp_webinterface)

Unit Test:

- Programm wie in Methode 1 installieren
- `ng test` führt Unit tests mit Framework Karma und Jasmine aus
- der obige Befehl ruft den Browser auf und führt die Tests aus

Code Quality Testing:

Die Pipeline enthält eine Testing-Stage in der ein SonarQube Scanner die Projektdaten im THM SonarQube analysiert.
- https://scm.thm.de/sonar/dashboard?id=swtp_webinterface


