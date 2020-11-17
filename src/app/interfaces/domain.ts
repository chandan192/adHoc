export class DomainName {
  id: number;
  name: string;
  // TODO: handle it properly.
  regex: string;

  constructor(dbRecord: any) {
    this.id = dbRecord.id;
    this.name = dbRecord.name;
    // TODO: handle for other parameters.
  }
}
