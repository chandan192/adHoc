export class JSError {
  id: number;
  timestamp: string;
  file: string;
  lineNumber: string;
  col: string;
  message: string;
  stackTrace: string;
  channelId: number;
  pageInstance: number;
  pageId: number;
  sid: string;
  tokenizedStackTrace: any;
  constructor(dbRecord) {
    this.id = dbRecord.jserrorid;
    this.timestamp = dbRecord.timestamp;
    this.file = dbRecord.filename;
    if (this.file === null || this.file === undefined)
      this.file = "-";
    this.lineNumber = (dbRecord.linenumber > -1) ? ("" + dbRecord.linenumber) : "-";
    this.col = (dbRecord.col > -1) ? ("" + dbRecord.col) : "-";
    this.message = dbRecord.errmessage;
    if (dbRecord.stacktrace === null || dbRecord.stacktrace === undefined)
      dbRecord.stacktrace = "Stacktrace not available.";
    this.stackTrace = decodeURIComponent(dbRecord.stacktrace).split(" at ").join("\n at ");
    this.channelId = dbRecord.channelid;
    this.pageInstance = dbRecord.pageinstance;
    this.pageId = dbRecord.pageid;
    this.sid = dbRecord.sid;
    this.tokenizedStackTrace = this.tokenizeScripts(this.stackTrace);
  }

  // method to separate urls and normal texts from stacktrace and put it in a list.
  tokenizeScripts(stacktrace) {
    let tokens = [];
    let urls = [];
    let urlPattern = new RegExp(/\http.*\b/g);  // e.g. http://10.10.60.4:9026/tours/jsscript2.js:3:4

    // getting all the urls of stack trace.
    urls = stacktrace.match(urlPattern);
    console.log(urls);
    /*
       type 0 : normal text
       type 1 : script/file sources
    */

    if (urls === null) // if no urls present
    {
      tokens.push({ type: 0, text: stacktrace });
      return tokens;
    }
    let startIndex = 0;
    let endIndex = 0;
    for (let i = 0; i < urls.length; i++) {
      endIndex = stacktrace.indexOf(urls[i]) - 1;
      if (i === 0) {
        let error = stacktrace.substring(startIndex, endIndex).split("at");
        if (error[0] != undefined)
          tokens.push({ type: -1, text: error[0].trim() });
        if (error[1] != undefined)
          tokens.push({ type: 0, text: "at " + error[1].trim() });
      }
      else
        tokens.push({ type: 0, text: stacktrace.substring(startIndex, endIndex) });
      endIndex++;
      startIndex = endIndex;
      endIndex += urls[i].length;
      let urlTokens = stacktrace.substring(startIndex, endIndex).split("/");
      let fileName = urlTokens[urlTokens.length - 1].split(":")[0];
      let fullFileName = stacktrace.substring(startIndex, endIndex).split(":")[0] + stacktrace.substring(startIndex, endIndex).split(":")[1];
      tokens.push({ type: 1, text: stacktrace.substring(startIndex, endIndex), file: fileName, url: fullFileName });
      startIndex = endIndex + 1;
    }

    return tokens;
  }

}
