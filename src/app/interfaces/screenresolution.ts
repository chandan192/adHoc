export class ScreenResolution {
  id: number;
  dim: string;


  constructor(dbrecord: any) {
    this.id = dbrecord.id;
    this.dim = dbrecord.name;
  }
}
