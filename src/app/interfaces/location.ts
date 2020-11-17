export class Location {
  id: number;
  country: string;
  state: string;
  icon: string;
  constructor(dbrecord: any) {
    this.id = dbrecord.id;
    this.country = dbrecord.country;
    this.state = dbrecord.region;
    this.icon = dbrecord.icon;
  }
}
