export class Store {
  id: number;
  name: string;
  districtId: number;
  countryId: number;
  city: string;
  street: string;
  region: string;
  terminalId: string;
  _storenameforfilter: string;
  constructor(dbrecord: any) {
    this.id = dbrecord.str_id;
    this.name = dbrecord.str_nm;
    this.countryId = dbrecord.cntry_id;
    this.city = dbrecord.cty_nm;
    this.districtId = dbrecord.district;
    this.terminalId = dbrecord.terminalid;
    this.region = dbrecord.region;
    this.street = dbrecord.st_nm;
    this._storenameforfilter = dbrecord.str_nm + ' , ' + dbrecord.cty_nm + '(' + dbrecord.str_id + ')';
  }
}
