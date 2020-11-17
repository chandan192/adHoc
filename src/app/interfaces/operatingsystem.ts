export class OS {
  id: number;
  name: string;
  version: string;
  icon: string;
  constructor(dbrecord: any) {
    this.id = dbrecord.id;
    this.name = dbrecord.name;
    this.version = dbrecord.version;
    this.icon = dbrecord.icon || '/../../assets/chrome.png';
  }


}
