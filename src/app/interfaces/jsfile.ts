export class JSFile {
  id: number;
  name: string;

  constructor(dbRecords) {
    this.id = dbRecords.id;
    this.name = dbRecords.name;
  }
}

