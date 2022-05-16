export class User {
  id: number;
  imei : number;
  name: string = "";
  count: number;
  zone: string;


  constructor(id: number, imei: number, name: string, count: number, zone: string) {
    this.id = id;
    this.imei = imei;
    this.name = name;
    this.count = count;
    this.zone = zone;
  }
}
