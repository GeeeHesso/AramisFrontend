
import * as L from 'leaflet';
export class CustomMarker extends L.Marker {
  genId: any;

  constructor(latLng: L.LatLngExpression, options: L.MarkerOptions & { genId?: any }) {
    super(latLng, options);
    this.genId = options.genId || null;
  }

  getGenId() {
    return this.genId;
  }

  setGenId(genId: any) {
    this.genId = genId;
  }
}
