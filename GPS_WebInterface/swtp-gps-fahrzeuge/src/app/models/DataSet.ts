export class DataSet {
  id: number;
  latitude : number;
  longitude: number;
  timestamp: Date;


  constructor(id: number, latitude: number, longitude: number, timestamp: Date) {
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.timestamp = timestamp;
  }
}
