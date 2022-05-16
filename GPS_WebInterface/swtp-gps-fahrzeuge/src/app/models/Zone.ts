export class Zone {

  name: string;
  latitude: number;
  longitude: number;
  radius: number;


  constructor(name: string, latitude: number, longitude: number, radius: number) {
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.radius = radius;
  }
}
