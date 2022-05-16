## RoboTaxi FleetManager Android App

### Teil der Abgabe Softwaretechnik Projekt WS21/22
- Dozent: Prof. Dr.-Ing. Seyed Eghbal Ghobadi


- Samir Faycal Tahar M'Sallem <samir.faycal.tahar.m.sallem@mni.thm.de>
- Mehmet Algül <mehmet.alguel@mni.thm.de>
- Murat Algül <murat.alguel@mni.thm.de>
- Mehmet Duhan Tercüman <mehmet.duhan.tercueman@mni.thm.de>


**Android App um Fahrzeuge zu simulieren und Datenpakete (GPS Koordinaten) zu senden**


## Live Demo
- Die APK Datei aus ``app/release/app-release.apk`` auf ein Android Gerät laden und installieren
- Dabei müssen Installationen aus fremden Quellen zugelassen werden
- Anschließend die AnyConnect App runterladen und mit `vpn.thm.de` verbinden oder im THM Netz befinden
- App öffnen und weitere Schritt befolgen


## Features
- Admin Login um zum Admin Interface zu kommen (via API)
- Vehicle Login um sich zu registrieren
- Standortabfrage vom Gerät (IMEI ist hierbei vergleichbar mit Fahrgestellnummer beim Auto (da einzigartig))
- Senden von GPS Daten an die API
- Übersicht über Anzahl gesendeter Standorte 
- Übersicht der eigenen Fahrtroute (in einer Karte)
