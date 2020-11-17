export class Event {
  id: number;
  name: string;
  icon: string;
  description: string;
  count: number; // for instances
  sid: any;
  pageinstance: any;
  pageid: any;
  constructor(dbrecord: any) {
    this.id = dbrecord.id;
    this.name = dbrecord.name;
    this.icon = dbrecord.icon;
    this.description = dbrecord.description || "-";
    this.count = 2;
    this.sid = dbrecord.sid;
    this.pageinstance = dbrecord.pageinstance;
    this.pageid = dbrecord.pageid;
  }
}
