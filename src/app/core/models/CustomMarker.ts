
import * as L from 'leaflet';
export class CustomMarker extends L.Marker {
  genBusId: any;
  private _index: any;
  constructor(latLng: L.LatLngExpression, options: L.MarkerOptions & { genBusId?: any,index?: any }) {
    super(latLng, options);
    this.genBusId = options.genBusId || null;
    this._index = options.index || null;
  }

  getIndex(): any {
    return this._index;
  }

  setIndex(value: any) {
    this._index = value;
  }

  getGenBusId() {
    return this.genBusId;
  }

  setGenBusId(genId: any) {
    this.genBusId = genId;
  }
}
