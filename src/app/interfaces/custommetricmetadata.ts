export class CustomMetricMetadata {

  id: number;
  name: string;
  valueType: number;
  description: string;
  encryptFlag: boolean;

  constructor(dbRecord) {
    this.id = dbRecord.id;
    this.name = dbRecord.name;
    this.valueType = dbRecord.type;
    this.description = dbRecord.description;
    this.encryptFlag = dbRecord.encryptflag;
  }
}
