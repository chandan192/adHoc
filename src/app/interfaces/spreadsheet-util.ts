export default class SpreadsheetUtils {
  static getReportRange(startIndex: string, row: number, column: number) {
    let _column = startIndex.replace(/[0-9]+$/, '');

    let _row = parseInt(startIndex.match(/[0-9]+$/)[0], 10);

    let _lastcolumn = SpreadsheetUtils.NumberToColumn(SpreadsheetUtils.ColumnToNumber(_column) + column - 1);

    // FIXME:
    return {
      startRowIndex: _row,
      startColIndex: SpreadsheetUtils.ColumnToNumber(_column) + 1,
      endRowIndex: _row + row,
      endColIndex: SpreadsheetUtils.ColumnToNumber(_column) + 1 + column,
      headerRange: startIndex + ':' + _lastcolumn + (_row),
      range: startIndex + ':' + _lastcolumn + (_row + row)
    };
  }



  static ColumnToNumber(col: string): number {
    let len = col.length;
    let count = 0;
    let j = 0;
    while (len--) {
      count += Math.pow(26, j++) * (col.charCodeAt(len) - 65);
    }

    return count;
  }


  static NumberToColumn(col: number): string {
    let colstr = '';
    if (!col) {
      return 'A';
    }
    while (col) {
      colstr = String.fromCharCode((col % 26) + 65) + colstr;
      col = parseInt(col / 26 + '', 10);
    }

    return colstr;
  }
}

export class Report {
  constructor(
    public name: string,
    public headers: string[],
    public row: number,
    public column: number
  ) { }
}
