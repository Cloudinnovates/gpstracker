import {Component,ElementRef, ViewChild} from '@angular/core';
import {NavController, Platform, ToastController} from 'ionic-angular';
import { Geolocation } from 'ionic-native';
declare var google;

var path = [], bRefreshStartPoint = true, startLatitude = 0, startLongitude = 0;
var lastUpdateTime, minFrequency = 10000,
watchOptions = {timeout: 60*60*1000, maxAge: 0, enableHighAccuracy: true};

@Component({
  templateUrl: 'build/pages/tracking/tracking.html'
})
export class TrackingPage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  watchID;

  constructor(public navCtrl: NavController, private toastController : ToastController) {}

   /**
    * Draw a route between GPS coordinates array
    */
   drawRoute(){
     Geolocation.getCurrentPosition()
      .then((resp) => {
        
        var center= new google.maps.LatLng(startLatitude, startLongitude);
        // Map options
        var myOptions = {
                  zoom: 18,
                  center: center,
                  mapTypeControl: true,
                  mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
                  navigationControl: true,
                  mapTypeId: google.maps.MapTypeId.TERRAIN
        }  
        
        // Map creation
        var m = new google.maps.Map(this.mapElement.nativeElement, myOptions);
        
        // Draw polyline
        var polyline = new google.maps.Polyline({
            path: path,
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
   * Enable / disable tracking
   */
  refreshTracking(e){
    if(e.checked){
      this.startTracking();
    } else {
      this.stopTracking();
    }
  }

  /**
   * Success callback when tracking is working
   */
  onSuccess(position) {
    if(bRefreshStartPoint === true){
        startLatitude = position.coords.latitude;
        startLongitude = position.coords.longitude;
        bRefreshStartPoint = false;
    }
    var now = new Date();
    if(lastUpdateTime && now.getTime() - lastUpdateTime.getTime() > minFrequency){
        console.log("Ignoring position update");
        return;
    }
    path.push(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
    lastUpdateTime = now;
    /*console.log("current location : " + position.coords.latitude+" ; " + position.coords.longitude);
    console.log("refresh ? " + bRefreshStartPoint);
    console.log("path : " + JSON.stringify(path));
    if(bRefreshStartPoint === true){
        startLatitude = position.coords.latitude;
        startLongitude = position.coords.longitude;
        bRefreshStartPoint = false;
    }      
    path.push(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));*/
  }

  // onError Callback receives a PositionError object
  //
  onError(error) {
      alert('code: '    + error.code    + '\n' +
            'message: ' + error.message + '\n');
      this.stopTracking();
  }

  /**
   * Start auto tracking (every 3s)
   */
  startTracking(){
    bRefreshStartPoint = true;
    startLatitude = 0;
    startLongitude = 0;
    path = [];  // reset tracking dataset
    let toast = this.toastController.create({
      message: 'Tracking started',
      duration: 3000
    });
    toast.present();
    this.watchID = navigator.geolocation.watchPosition(this.onSuccess, this.onError, { timeout: 30000/*, enableHighAccuracy: true */});
  }

  /**
   * Stop tracking
   */
  stopTracking(){
    navigator.geolocation.clearWatch(this.watchID);
    let toast = this.toastController.create({
      message: 'Tracking stopped',
      duration: 3000
    });
    toast.present();
    this.drawRoute();
  }
}

