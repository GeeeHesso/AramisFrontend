import * as L from 'leaflet';

export class CustomMarker extends L.Marker {
  genId: any;

  constructor(latLng: L.LatLngExpression, options: L.MarkerOptions) {
    super(latLng, options);
    this.options = options
  }

  getGenId() {
    return this.genId;
  }

  setGenId(genId: any) {
    this.genId = genId;
  }
}
