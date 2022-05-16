import {AlertType} from "./AlertType";

export class Alert {
  message: string;
  duration: number;
  type: AlertType;


  constructor(message: string, duration: number, type: AlertType) {
    this.message = message;
    this.duration = duration;
    this.type = type;
  }
}
