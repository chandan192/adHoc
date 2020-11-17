export class Channel {
  id: number;
  name: string;
  font: string;
  constructor(dbrecord: any) {
    this.id = dbrecord.id;
    this.name = dbrecord.name;
    let type = this.name.toLowerCase();
    if (type.indexOf('mobile') > -1) {
      this.font = 'fa fa-mobile';
    }
    else if (type.indexOf('tablet') > -1) {
      this.font = 'fa fa-tablet';
    }
    else if (type.indexOf('overall') > -1) {
      this.font = 'fa fa-sun-o';
    }
    else if (type.indexOf('desktop') > -1) {
      this.font = 'fa fa-desktop';
    }
    return this;
  }
}
