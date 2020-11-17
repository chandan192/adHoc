export interface ICRQColumn {
  name: string;
  filterList: string[];
  countFlag: boolean;
  column: string;
  table: string;
  id: number;
  metadataFlag: boolean;
}

export class CRQColumn implements ICRQColumn {
  format: string;

  // tslint:disable-next-line: max-line-length
  constructor(
    public name: string,
    public filterList: string[],
    public countFlag: boolean,
    public column: string,
    public table: string,
    public id: number,
    public metadataFlag: boolean
  ) {
    this.format = 'number';
  }
}


export interface IColumn {
  table: string;
  column: string;
}

export class Column implements IColumn {
  constructor(public table: string, public column: string) { }
}

// export interface ICROperand {
//     type: number;
//     value: any;
// }


export class CROperand {
  type: number;
  value: any;
  constructor(type, value) {
    this.type = type;
    this.value = null;
    if (type === 1) {
      this.value = value;
    } else if (type === 0) {
      this.value = new Column(value.split(':')[0], value.split(':')[1]);
    } else if (type === 101) {
      this.value = parseInt(value, 10);
      if (isNaN(this.value)) { this.value = 0; }
    } else if (type === 102) {
      this.value = value;
    } else if (type === 103) {
      this.value = parseFloat(value);
      if (isNaN(this.value)) { this.value = 0; }
    } else if (type === 104) {
      this.value = (value === 'true') ? true : false;
    }
  }
}

export interface ICRQFilters {
  operator: string;
  active: any[];
  operands: boolean;
}

export class CRQFilters {
  constructor(public operator: string, public operands: any[], public active: boolean) { }
}


