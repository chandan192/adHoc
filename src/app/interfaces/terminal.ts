export class Terminal {
  strid: number;
  id: number;
  lastaccesstime: number;
  manufacturer: string;
  version: number;

  constructor(dbRecord) {
    this.strid = dbRecord.str_id;
    this.id = dbRecord.terminal_id;
    this.lastaccesstime = dbRecord.last_access_time;
    this.manufacturer = dbRecord.manufacturer;
    this.version = dbRecord.version;
  }
}
