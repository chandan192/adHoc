export class BusinessProcess {
  id: number;
  name: string;
  pagelist: string;
  checkoutflag: any;
  channel: any;

  constructor(dbRecords) {
    this.id = dbRecords.bpid;
    this.name = dbRecords.bpname;
    this.pagelist = dbRecords.bppagelist;
    this.checkoutflag = dbRecords.checkoutflag;
    this.channel = dbRecords.channel;
  }
}

