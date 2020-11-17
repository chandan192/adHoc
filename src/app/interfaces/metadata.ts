import { Browser } from './browser';
import { Event } from './event';
import { Location } from './location';
import { OS } from './operatingsystem';
import { Channel } from './channel';
import { PageName } from './page';
import { MobileCarrier } from './mobileCarrier';
import { DomainName } from './domain';
import { ResourceName } from './resource';
import { Store } from './store';
import { BusinessProcess } from './businessprocess';
import { CustomMetricMetadata } from './custommetricmetadata';
import { ScreenResolution } from './screenresolution';
import { Terminal } from './terminal';
import { UserSegment } from './usersegment';
import { ConnectionType } from './connectiontype';
import { JSError } from './jserrorcollection';
import { JSFile } from './jsfile';

// import { Http } from '@angular/http';

export class Metadata {
  // These are the hashcode. Will be index by an id.
  browserMap: any;
  locationMap: any;
  eventMap: any;
  osMap: any;
  storeMap: any;
  channelMap: any;
  pageNameMap: any;
  domainNameMap: any;
  resourceNameMap: any;
  mobileCarrierMap: any;
  pageNameMapByName: any;
  screenMap: any;
  userSegmentMap: any;
  bpMap: Map<number, BusinessProcess>;
  customMetricMap: any;
  connectionMap: any;
  terminalMap: any;
  strugglingEvent = [];
  jsFileMap: any;
  jsErrorMap: any;
  static getMetaDataObj(dbRecord: any) {
    // validate dbRecord.
    if (!dbRecord.browser || !dbRecord.location || !dbRecord.events || !dbRecord.platform || !dbRecord.channel || !dbRecord.pages) {
      return null;
    }

    const metadata = new Metadata();

    dbRecord.browser.forEach((record) => {
      const d = new Browser(record);
      metadata.browserMap.set(d.id, d);
    });

    dbRecord.channel.forEach((record) => {
      const f = new Channel(record);
      metadata.channelMap.set(f.id, f);
    });

    dbRecord.location.forEach((record) => {
      const d = new Location(record);
      metadata.locationMap.set(d.id, d);
    });

    dbRecord.pages.forEach((record) => {
      const d = new PageName(record);
      metadata.pageNameMap.set(d.id, d);
      metadata.pageNameMapByName.set(d.name, d);
    });
    if (dbRecord.domainList) {
      dbRecord.domainList.forEach((record) => {
        const d = new DomainName(record);
        metadata.domainNameMap.set(d.id, d);
      });
    }
    if (dbRecord.resourceList) {
      dbRecord.resourceList.forEach((record) => {
        const d = new ResourceName(record);
        metadata.resourceNameMap.set(d.id, d);
      });
    }
    if (dbRecord.mobileCarrierList) {
      dbRecord.mobileCarrierList.forEach((record) => {
        const d = new MobileCarrier(record);
        metadata.mobileCarrierMap.set(d.id, d);
      });
    }
    if (dbRecord.jsFile) {
      dbRecord.jsFile.forEach((record) => {
        const d = new JSFile(record);
        metadata.jsFileMap.set(d.id, d);
      });
    }
    if (dbRecord.jsErrors) {
      dbRecord.jsErrors.forEach((record) => {
        const d = new JSError(record);
        metadata.jsErrorMap.set(d.id, d);
      });
    }
    dbRecord.platform.forEach((record) => {
      const d = new OS(record);
      metadata.osMap.set(d.id, d);
    });

    dbRecord.events.forEach((record) => {
      const d = new Event(record);
      metadata.eventMap.set(d.id, d);
    });


    dbRecord.stores.forEach((record) => {
      const d = new Store(record);
      metadata.storeMap.set(d.id, d);
    });

    dbRecord.screensize.forEach((record) => {
      const d = new ScreenResolution(record);
      metadata.screenMap.set(d.id, d);
    });

    dbRecord.customData.forEach((record) => {
      const d = new CustomMetricMetadata(record);
      metadata.customMetricMap.set(d.id, d);
    });

    dbRecord.connectiontype.forEach((record) => {
      const d = new ConnectionType(record);
      metadata.connectionMap.set(d.id, d);
    });


    dbRecord.bpData.forEach((record) => {
      const d = new BusinessProcess(record);
      metadata.bpMap.set(d.id, d);
    });



    dbRecord.segment.forEach((record) => {
      const d = new UserSegment(record);
      metadata.userSegmentMap.set(d.id, d);
    });

    dbRecord.strugglingEvents.forEach((record) => {
      metadata.strugglingEvent.push('' + record.id);
    });
    return metadata;
  }

  isStrugglingUser(events, metadata) {
    if (events === null || events === '') { return false; }
    const eventsList = events.split(',');
    for (let a = 0; a < eventsList.length; a++) {
      if (metadata.strugglingEvent.indexOf(eventsList[a]) > -1) {
        return true;
      }
    }
  }

  constructor() {
    this.browserMap = new Map<number, Browser>();
    this.channelMap = new Map<number, Channel>();
    this.eventMap = new Map<number, Event>();
    this.osMap = new Map<number, OS>();
    this.storeMap = new Map<number, Store>();
    this.pageNameMap = new Map<number, PageName>();
    this.domainNameMap = new Map<number, DomainName>();
    this.resourceNameMap = new Map<number, ResourceName>();
    this.mobileCarrierMap = new Map<number, MobileCarrier>();
    this.pageNameMapByName = new Map<string, PageName>();
    this.locationMap = new Map<number, Location>();
    this.screenMap = new Map<number, ScreenResolution>();
    this.customMetricMap = new Map<number, CustomMetricMetadata>();
    this.connectionMap = new Map<number, ConnectionType>();
    this.terminalMap = new Map<number, Terminal>();
    this.bpMap = new Map<number, BusinessProcess>();
    this.userSegmentMap = new Map<number, UserSegment>();
    this.jsFileMap = new Map<number, JSFile>();
    this.jsErrorMap = new Map<number, JSError>();
    this.strugglingEvent = [];
  }


  // TODO: In case if any other id comes then we should return others entry if possible

  getChannel(id: number) {
    if (this.channelMap.get(id) !== undefined) {
      return this.channelMap.get(id);
    } else {
      return {
        id,
        name: 'Others'
      };
    }
  }


  getChannelByName(name: string) {
    let channel: Channel;
    this.channelMap.forEach((record) => {
      if (name === record.name) {
        channel = record;
      }
    });
    return channel;
  }

  getBrowser(id: number) {
    if (this.browserMap.get(id) !== undefined) {
      return this.browserMap.get(id);
    } else {
      return {
        id,
        name: 'Others',
        version: 'Other',
        icon: '/netvision/images/countryIcons/questionmark.png'
      };
    }
  }

  getBrowserByName(name: string) {
    let browser: Browser;
    this.browserMap.forEach((record) => {
      if (name === record.name) {
        browser = record;
      }
    });
    return browser;
  }

  getLocation(id: number) {
    if (this.locationMap.get(id)) {
      return this.locationMap.get(id);
    } else {
      return {
        id,
        country: 'Others',
        state: '',
        icon: '/netvision/images/countryIcons/questionmark.png'
      };
    }
  }

  // format name : Country OR State,Country
  getLocationFromName(cname: string) {
    if (!cname) {
      return {
        id: -1,
        country: 'Others',
        state: '',
        icon: '/netvision/images/countryIcons/questionmark.png'
      };
    }
    let name = cname;
    let state = null;
    if (cname.indexOf(',') != -1) {
      state = cname.split(',')[0];
      name = cname.split(',')[1];
    }
    // let location:Location;
    let location = [];
    this.locationMap.forEach((record) => {
      if (name === record.country) {
        if (state === null) {
          location.push(record);
        } else if (state === record.state) {
          location.push(record);
        }
        /*if(record.country === "USA")
        {
          if(record.state === "Others")
            location =  record;
        }
        else
           location.push(record);*/
      }
    });
    if (location.length == 0) {
      location = [{
        id: -1,
        country: 'Others',
        state: '',
        icon: '/netvision/images/countryIcons/questionmark.png'
      }];
    }
    return location;
  }


  getPageName(id: number) {
    if (this.pageNameMap.get(id)) {
      return this.pageNameMap.get(id);
    } else {
      return {
        id,
        name: 'Others'
      };
    }
  }

  getOS(id: number) {
    if (this.osMap.get(id)) {
      return this.osMap.get(id);
    } else {
      return {
        id,
        name: 'Others',
        version: 'Others',
        icon: '/netvision/images/countryIcons/questionmark.png'
      };
    }
  }

  getOSByName(name: string, version: string) {
    let os: OS;
    this.osMap.forEach((record) => {
      // In case of version not found return the overall os.
      if (name === record.name) {
        os = record;
        if (version === record.version) {
          os = record;
        }
      }
    });
    return os;
  }

  getStore(id: number) {
    if (this.storeMap.get(id) !== undefined) {
      return this.storeMap.get(id);
    } else {
      return {
        id,
        name: 'Others',
        districtId: -1,
        countryId: -1,
        city: 'Others',
        street: 'Others',
        region: 'Others',
        _storenameforfilter: 'Others'
      };
    }
  }

  getEvent(id: number) {
    if (this.eventMap.get(id) !== undefined) {
      return this.eventMap.get(id);
    } else {
      return {
        id,
        name: 'Others',
        icon: '/netvision/images/countryIcons/questionmark.png',
        description: 'Others'
      };
    }
  }

  getEventFromName(name: string) {
    let event: Event;
    this.eventMap.forEach((record) => {
      if (name === record.name) {
        event = record;
      }
    });
    return event;
  }

  getPageFromName(name: any) {
    const page = this.pageNameMapByName.get(name);

    if (page !== undefined) {
      return page;
    } else {
      return {
        id: -1,
        name
      };
    }
  }

  getScreen(id: any) {

    const s: ScreenResolution = this.screenMap.get(id);
    if (s === undefined) {
      const height = (id & 0xFFFF0000) >> 16;
      const width = id & 0xFFFF;
      const dim = height + 'x' + width;
      return new ScreenResolution({
        id: id,
        name: dim
      });
    }
    return s;
  }

  getUserSegment(id: number) {
    if (this.userSegmentMap.get(id) !== undefined) {
      return this.userSegmentMap.get(id);
    } else {
      return {
        id,
        name: 'Others',
        icon: '/netvision/images/countryIcons/questionmark.png'
      };
    }
  }

  getCustomMetric(id: number) {
    if (this.customMetricMap.get(id) !== undefined) {
      return this.customMetricMap.get(id);
    } else {
      return {
        id,
        name: 'Others',
        valueType: 0,
        description: '',
        encryptflag: false
      };
    }
  }

  getUserSegmentFromName(name: string) {
    let usersegment: UserSegment;
    this.userSegmentMap.forEach(function (record) {
      // In case of version not found return the overall os.
      if (name === record.name) {
        usersegment = record;
      }
    });
    return usersegment;
  }
  getDomainName(id: number) {
    if (this.domainNameMap.get(id)) {
      return this.domainNameMap.get(id);
    } else {
      return {
        id,
        name: 'Others'
      };
    }
  }
  getResourceName(id: number) {
    if (this.resourceNameMap.get(id)) {
      return this.resourceNameMap.get(id);
    } else {
      return {
        id,
        name: 'Others'
      };
    }
  }
  getMobileCarrier(id: number) {
    if (this.mobileCarrierMap.get(id)) {
      return this.mobileCarrierMap.get(id);
    } else {
      return {
        id,
        name: 'Others'
      };
    }
  }

  getConnectionType(id: number) {
    if (this.connectionMap.get(id) !== undefined) {
      return this.connectionMap.get(id);
    } else {
      return {
        id,
        name: 'Others'
      };
    }
  }

}
