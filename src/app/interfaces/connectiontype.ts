export class ConnectionType {
  id: number;
  name: string;
  version: string;

  constructor(dbRecord) {
    this.id = dbRecord.id;
    this.name = dbRecord.name;
    this.version = dbRecord.subversion;
  }
}

