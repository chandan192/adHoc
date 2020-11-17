export class Browser {
  id: number;
  name: string;
  version: string;
  icon: string;
  constructor(dbrecord: any) {
    this.id = dbrecord.id;
    this.name = dbrecord.name;
    this.icon = dbrecord.icon;
    this.version = dbrecord.version;
    return this;
  }
}
