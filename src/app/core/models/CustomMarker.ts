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

export var CustomMarkerV2 = L.Marker.include({
  options: {
    genId: null,
  },

  getGenId: function() {
    return this.options.genId;
  },

  setGenId: function(genId:any) {
    this.options.genId = genId;
  }
});
