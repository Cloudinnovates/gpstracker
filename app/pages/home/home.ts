import {Component,ElementRef, ViewChild} from '@angular/core';
import {NavController, Platform, ToastController} from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import {TrackingPage} from '../tracking/tracking';
declare var google;

/**
 * TODO
 * 
 * Auto tracking: faire un bouton start / stop et dessiner la trace après clic sur stop
 * détection GPS + data avant de lancer la geoloc au chargement
 * demander activation GPS lors de l'activation du tracking
 * dessin itinéraire (voir lib JS utilisée pour tests avec SL)
 * enregistrement en base des tracés point(lat, long, datetime, speed)
 * calcul de la durée du déplacement
 */

@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  position: any = {};
  watchID;
  path: any[]; // List of gps coordinates [new google.maps.LatLng(10.013566,76.331549)]

  constructor(public navCtrl: NavController, private toastController : ToastController) {}

  /**
   * Loading initial ion view
   */
  ionViewLoaded(){
    
    this.position = {lat:10.012404,long:76.326227};
    this.path = [
      new google.maps.LatLng(10.013566,76.331549),
      new google.maps.LatLng(10.013566,76.331463),
      new google.maps.LatLng(10.013503,76.331313),
      new google.maps.LatLng(10.013482,76.331205),
      new google.maps.LatLng(10.013419,76.330926),
      new google.maps.LatLng(10.013334,76.330712),
      new google.maps.LatLng(10.013313,76.330411),
      new google.maps.LatLng(10.013292,76.330175),
      new google.maps.LatLng(10.013228,76.329854),
      new google.maps.LatLng(10.013144,76.329553),
      new google.maps.LatLng(10.013059,76.329296),
      new google.maps.LatLng(10.012996,76.329017),
      new google.maps.LatLng(10.012869,76.328802),
      new google.maps.LatLng(10.012785,76.328545),
      new google.maps.LatLng(10.012700,76.328223),
      new google.maps.LatLng(10.012679,76.328030),
      new google.maps.LatLng(10.012658,76.327837),
      new google.maps.LatLng(10.012637,76.327600),
      new google.maps.LatLng(10.012573,76.327322),
      new google.maps.LatLng(10.012552,76.327043),
      new google.maps.LatLng(10.012552,76.326807),
      new google.maps.LatLng(10.012510,76.326613),
      new google.maps.LatLng(10.012447,76.326399),
      new google.maps.LatLng(10.012404,76.326227)
    ];

    this.drawRoute();
  }

  /**
   * Get current position and marker
   */
  geolocMe() {
    Geolocation.getCurrentPosition()
      .then((resp) => {
        console.log('Geolocation : ' + resp.coords.latitude + ', ' + resp.coords.longitude);
        this.position = {lat: resp.coords.latitude, long: resp.coords.longitude};
        
        // center on the location
        //this.map.setCenter({ lat: resp.coords.latitude, lng: resp.coords.longitude });
        let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
 
        let mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        this.addMarker();

        /* bike layer
        var m = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        var bikeLayer = new google.maps.BicyclingLayer();
        bikeLayer.setMap(m);

        this.map = bikeLayer;*/
      })
      .catch((error)=>{
        console.log(error)
      })
   }
   /**
    * Draw a route between GPS coordinates array
    */
   drawRoute(){
     Geolocation.getCurrentPosition()
      .then((resp) => {
        //var center= new google.maps.LatLng(10.012869,76.328802);
        var center= new google.maps.LatLng(this.position.lat, this.position.long);
        // Map options
        var myOptions = {
                  zoom: 18,
                  center: center,
                  mapTypeControl: true,
                  mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
                  navigationControl: true,
                  mapTypeId: google.maps.MapTypeId.TERRAIN
        }  
        /*
        Google mapType
        HYBRID	Displays a photographic map + roads and city names
        ROADMAP	Displays a normal, default 2D map
        SATELLITE	Displays a photographic map
        TERRAIN	Displays a map with mountains, rivers, etc.
        */
        // Map creation
        var m = new google.maps.Map(this.mapElement.nativeElement, myOptions);
        
        // Draw polyline
        var polyline = new google.maps.Polyline({
            path: this.path,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            editable: true
        });

        // Display map
        polyline.setMap(m);  
        this.map = polyline;        
      })
      .catch((error)=>{
        console.log(error)
      })
   }

   /**
    * Add marker on the map
    */
   addMarker(){
     let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: this.map.getCenter()
      });
    
      let content = "<h4>Information!</h4>";          
    
      this.addInfoWindow(marker, content);
   }

   /**
    * Marker information details
    */
   addInfoWindow(marker, content){
 
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
  
    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  openTracker(){
    this.navCtrl.push(TrackingPage);
  }
}
