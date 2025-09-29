import { Timestamp } from "@angular/fire/firestore";

export interface Event {
  id?: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class EventModel implements Event {
  constructor(
    public title: string,
    public date: Date,
    public time: string,
    public location: string,
    public description: string,
    public createdBy: string,
    public createdAt: Date = new Date(),
    public id?: string,
    public updatedAt?: Date
  ) { }

  toFirestore() {
    return {
      title: this.title,
      date: Timestamp.fromDate(this.date),
      time: this.time,
      location: this.location,
      description: this.description,
      createdBy: this.createdBy,
      createdAt: Timestamp.fromDate(this.createdAt),
      updatedAt: this.updatedAt ? Timestamp.fromDate(this.updatedAt) : null
    };
  }

  static fromFirestore(data: any, id: string): EventModel {
    return new EventModel(
      data.title,
      data.date.toDate ? data.date.toDate() : new Date(data.date),
      data.time,
      data.location,
      data.description,
      data.createdBy,
      data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      id,
      data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)) : undefined
    );
  }

  get formattedDate(): string {
    return this.date.toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get shortDate(): string {
    return this.date.toLocaleDateString('ro-RO');
  }

  get isUpcoming(): boolean {
    const eventDateTime = new Date(this.date);
    const [hours, minutes] = this.time.split(':');
    eventDateTime.setHours(parseInt(hours), parseInt(minutes));
    return eventDateTime > new Date();
  }

  get isPast(): boolean {
    return !this.isUpcoming;
  }
}
