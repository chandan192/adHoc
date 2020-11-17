export class UserSegment {
  // TODO: Handling for the rules.
  id: number;
  name: string;
  icon: string;
  channel: number;

  constructor(dbrecord: any) {
    this.id = dbrecord.id;
    this.name = dbrecord.name;
    this.icon = dbrecord.icon;
    this.channel = dbrecord.channel;
  }
}
