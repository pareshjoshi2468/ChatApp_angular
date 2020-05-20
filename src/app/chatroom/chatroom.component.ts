import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from './../user.service';
import { WebsocketService } from './../websocket.service';
import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import {Buffer} from 'buffer/';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from "rxjs/operators"



declare var MediaRecorder: any;
declare const google: any
@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css']
})
export class ChatroomComponent implements OnInit {

  @ViewChildren('gmap') gmapElement: any;
  map: any;

  isTracking = false;

  currentLat: any;
  currentLong: any;

  marker: any;

  username = null
  private userId;
  private audienceType = 'ENDUSER';
  private messageType = 'text';

  // private chatroom;
  message = '';
  messageArray = [];
  isTyping = false;
  

  private ngUnsubscribe = new Subject();


  constructor(
    private route: ActivatedRoute,
    private webSocketService: WebsocketService,
    private userService: UserService,
  ) {
  }

  private conversationId:String;

  
 private currentUser;
 private stream;
 private connection1;
 private connection2;

  ngOnInit() {
    // this.socketMedia = io('http://localhost:8000');
// setTimeout(()=>{    
//   var mapProp = {
//       center: new google.maps.LatLng(18.5793, 73.8143),
//       zoom: 15,
//       mapTypeId: google.maps.MapTypeId.ROADMAP
//     };
//     this.map = new google.maps.Map(document.getElementById('gmap'), mapProp);
//   },1000);

    navigator.mediaDevices.getUserMedia({ audio: true})
    .then(stream => {

      this.stream = stream
    });
    

    this.username = this.route.snapshot.queryParamMap.get('name');
    this.userId = parseInt(this.route.snapshot.queryParamMap.get('userID'));
    this.audienceType = this.route.snapshot.queryParamMap.get('audienceType');
    this.conversationId = this.route.snapshot.queryParamMap.get('conversationId');

     this.currentUser = this.userService.getLoggedInUser();
    // this.chatroom = this.username;
      this.webSocketService.connect();
      if(this.conversationId == 'null'){
       this.webSocketService.joinConversation(this.encryptUsingAES256({'audienceType':this.audienceType,'audienceId':this.userId}));
      }
    
    this.webSocketService.onConnectionReady()
    .subscribe(data => {
      console.log("Data",this.decryptUsingAES256(data));
      // this.conversationId = this.decryptUsingAES256(data).conversationId;
      });

      this.webSocketService.onConversationReady()
      .subscribe(data => {
        console.log("Data",this.decryptUsingAES256(data));
        this.conversationId = this.decryptUsingAES256(data).conversationId;
      });

     


        if(this.conversationId != 'null'){
        this.userService.getConversationMessage(this.conversationId).subscribe(messageData=>{
          console.log("API Data",this.decryptUsingAES256(messageData.text()));

          this.messageArray =  this.decryptUsingAES256(messageData.text()).data.sort((a, b)=>{
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          })
         });
        }
        //  });

     this.connection1 = this.webSocketService.MessageReceivedbySender().subscribe(data => {
        console.log("Message",this.decryptUsingAES256(data));
        this.messageArray.push(this.decryptUsingAES256(data));
      });

      this.webSocketService.imageMessageReceivedbySender().subscribe(data => {
        console.log("Image Message",this.decryptUsingAES256(data))
        this.messageArray.push(this.decryptUsingAES256(data));
      });

      this.webSocketService.locationMessageReceivedbySender().subscribe(data => {
        const locationData = this.decryptUsingAES256(data);
        console.log("Location Message",locationData);
        this.messageArray.push(locationData);
        this.getMapInitialize(locationData);
      });

      this.webSocketService.audioMessageReceivedbySender().subscribe(data => {
        console.log("Audio Message",this.decryptUsingAES256(data))
        this.messageArray.push(this.decryptUsingAES256(data));
      });

      this.webSocketService.realTimeAudioStreamFileReceivedbySender().subscribe(data => {
        console.log("Audio File Sender Message",this.decryptUsingAES256(data))
        this.messageArray.push(this.decryptUsingAES256(data));
      });

   this.connection2 = this.webSocketService.newMessageReceived().subscribe(data => {
      console.log("Message",this.decryptUsingAES256(data))
      this.messageArray.push(this.decryptUsingAES256(data));
      this.isTyping = false;
    });
    this.webSocketService.newImageMessageReceived().subscribe(data => {
      console.log("Image Message",this.decryptUsingAES256(data))
      this.messageArray.push(this.decryptUsingAES256(data));
      this.isTyping = false;
    });

    this.webSocketService.newLocationMessageReceived().subscribe(data => {
      const locationData = this.decryptUsingAES256(data);
      console.log("Location Message Received",locationData);
      this.messageArray.push(locationData);
      this.getMapInitialize(locationData);
      setTimeout(()=>{
        this.requestForLocation(locationData);
        },1000);
    });

    this.webSocketService.newLocationRequestReceived().subscribe(data => {
      const locationData = this.decryptUsingAES256(data);
      console.log("Location Request Received",locationData);
      // this.getMapInitialize(locationData);
      this.sendRequestLocationData(locationData);
    });

    this.webSocketService.newLocationMessageStreamReceived().subscribe(data => {
      const locationData = this.decryptUsingAES256(data);
      console.log("Location Message stream Received",locationData);
      this.getMapInitialize(locationData);
      this.sendEndLocationStream(locationData);
    });

    this.webSocketService.newLocationMessageStreamEndReceived().subscribe(data => {
      const locationData = this.decryptUsingAES256(data);
      console.log("Location Message stream end Received",locationData);
    });

    this.webSocketService.newAudioMessageReceived().subscribe(data => {
      console.log("Audio Message",this.decryptUsingAES256(data));
      this.messageArray.push(this.decryptUsingAES256(data));
      this.isTyping = false;
    });

    this.webSocketService.newUserTrackLocationReceived().subscribe(data => {
      console.log("User Track Location",this.decryptUsingAES256(data))
    });

    this.webSocketService.newUserOfflineForLocation().subscribe(data => {
      console.log("User Offline",this.decryptUsingAES256(data))
    });



    this.webSocketService.endAudioUpload().subscribe(data => {
    console.log("Audio upload",this.decryptUsingAES256(data));
    });

    this.webSocketService.requestAudioUpload().subscribe(data => {
      console.log("Audio Slice request",this.decryptUsingAES256(data));
      
      let place = this.decryptUsingAES256(data).currentSlice * 100000;
      let sliceData = this.audioBlob.slice(place, place + Math.min(100000, this.audioBlob.size - place)); 
      this.audioUpload(sliceData)
      });
  
      this.realTimeAudioFilePlay();
      this.webSocketService.newRealTimeAudioStreamMessageReceived().subscribe(data =>{
        this.callAudioStream(this.decryptUsingAES256(data));
      });
    
      this.webSocketService.newRealTimeAudioStreamFileReceived().subscribe(data =>{
        console.log("Audio File Message",this.decryptUsingAES256(data))
        this.messageArray.push(this.decryptUsingAES256(data));
      });
   
  }


  ngOnDestroy() {
    // this.webSocketService.destroyEvent();
    console.log("Subscribe",this.connection1);
    //  this.connection1.unsubscribe();
    //  this.connection2.unsubscribe();

}

  last = true;
  stopStream = true;

  endCall(){
  
    clearInterval(this.myInterval);
    this.mediaRecorder.stop();
    this.last = true;

  }

  endVoiceMessage(){
    clearInterval(this.myInterval);
   this.mediaRecorder.stop(); 
   this.stopStream = true;
  }

  private mediaRecorder;

  private myInterval;
  private audioBlob;
  private fileName;

  private audioType='voice'

  voiceMessage(){
    this.audioType = 'voice';
    this.last = false;
    this.audioCall();
  }

  realTimeVoiceMessage(){
    this.audioType = 'Real-Time';
    this.stopStream = false;
    this.audioCall();
    let that = this;
    this.myInterval = setInterval(function() {
                 that.mediaRecorder.requestData();
                // that.mediaRecorder.stop();
                // that.mediaRecorder.start();
          
        },200);

  }

  audioCall(){
    // this.last = false;
    let that = this;
    const mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder = mediaRecorder;
    this.fileName = new Date().getTime();

  
      mediaRecorder.start();
  
      let audioChunks = [];
  
      mediaRecorder.addEventListener("start", event => {
      audioChunks = [];
      this.audioBlob = [];
      });
      mediaRecorder.addEventListener("dataavailable", event => {
          console.log("Stream",event);
        
        audioChunks.push(event.data);
        if(this.audioType == 'Real-Time'){
          // const blobData = new Blob(audioChunks,{type:'audio/ogg'});

         this.audioUpload(event.data);
        }
      });
  
      mediaRecorder.addEventListener("stop", async () => {
          console.log("Stream",audioChunks);
  
          if(this.audioType =='voice'){
        this.audioBlob = new Blob(audioChunks,{type:'audio/wav'});
        console.log("Size",this.audioBlob.size);
         let sliceData = this.audioBlob.slice(0, 100000); 
        
          
        // let data = {
        //   // "messageID": messagedetails.messageID,
        //    "fromId": this.currentUser.userID,
        //    "toId": this.userId,
        //    "audienceType": this.audienceType,
        //    "messageType": 'audio',
        //    "message": sliceData,
        //    "timestamp": new Date(),
        //    "conversationId":this.conversationId,
        //  }
         this.audioUpload(sliceData);

        }
        
        // this.webSocketService.sendAudio(this.encryptUsingAES256(data));
      // });
        // }
      });
  
    //  this.myInterval = setInterval(function() {
    //            mediaRecorder.requestData();
        
    //   },200);
     
  
  
    
  }

  preview(file:any){
    console.log("File",file);
let message;
    this.userService.fileUpload(this.conversationId,'image',file[0]).subscribe(fileData=>{
      const filePayload = this.decryptUsingAES256(fileData.text());
      console.log("File upload",filePayload);
    // var reader = new FileReader();
    // reader.readAsDataURL(file[0]);
    // reader.onload = () =>{

    // console.log(reader.result);
    // message = reader.result;

    let data = {
       "fromId": this.currentUser.userID,
       "toId": this.userId,
       "audienceType": this.audienceType,
       "messageType": 'image',
       "message": filePayload.data.fileName,
       "timestamp": new Date(),
       "conversationId":this.conversationId
     }
     this.webSocketService.sendImage(this.encryptUsingAES256(data));
    
  });
   
  }

  sendMessage() {
    let data = {
      "fromId": this.currentUser.userID,
      "toId": this.userId,
      "audienceType": this.audienceType,
      "messageType": this.messageType,
      "message": this.message,
      "timestamp": new Date(),
      "conversationId":this.conversationId
    }
    this.webSocketService.sendMessage(this.encryptUsingAES256(data));
   
    this.message = '';
  }

  typing() {
    // this.webSocketService.typing({room: this.chatroom, user: this.userService.getLoggedInUser().username});
  }



  audioUpload(slice){
    let fileReader = new FileReader();

    fileReader.readAsDataURL(slice); 
    fileReader.onload = () =>{
      console.log("Filereader",fileReader.result);

      if(this.audioType == 'voice'){
    let data={
      name: this.fileName,
      message:JSON.stringify(fileReader.result),
      size:this.audioBlob.size,
      // last:this.last,
      "fromId": this.currentUser.userID,
      "toId": this.userId,
      "audienceType": this.audienceType,
      "messageType": 'audio',
      // "message": fileReader.result,
      "timestamp": new Date(),
      "conversationId":this.conversationId
    }

    this.webSocketService.sendAudio(this.encryptUsingAES256(data));
  }else{
    let data={
      name: this.fileName,
      message:fileReader.result,
      stopStream:this.stopStream,
      "fromId": this.currentUser.userID,
      "toId": this.userId,
      "audienceType": this.audienceType,
      "messageType": 'audio',
      "timestamp": new Date(),
      "conversationId":this.conversationId
    }

    this.webSocketService.sendAudioStream(this.encryptUsingAES256(data));
  }
   }
  }

  call = false;
sourceBuffer = null;
 player = document.createElement('audio');

  realTimeAudioFilePlay(){
    // if(!this.call){
    //       this.call = true;
    var mediaSource = new MediaSource();
  this.player.src = window.URL.createObjectURL(mediaSource);
 this.player.autoplay = true;
   mediaSource.addEventListener('sourceopen',()=>{
    
  console.log("Source Open")
  var mimeType = 'audio/webm; codecs="opus"';
  // data:audio/webm;codecs=opus;base64

  this.sourceBuffer = mediaSource.addSourceBuffer(mimeType);
  // console.log("data",data.data);
  });
  
  // 

  // this.sourceBuffer.appendBuffer(data.data);

  // player.play();

// }
}

callAudioStream(data){
  const media = data.message.replace(/^data:.*?;base64,/, '');

    const buffer = Buffer.from(media, 'base64');
    console.log("data",buffer);

       this.sourceBuffer.appendBuffer(buffer);
       if(data.stopStream){
         this.realTimeAudioFilePlay();
       }
}

playAudio(e){
  console.log("Play",e);
}


  SECRET_KEY="ameramerameramerameramerameramer"
  IV="0123456789abcdef"

  encryptUsingAES256(data) {
    console.log("Data",data)
    let encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data), CryptoJS.enc.Utf8.parse(this.SECRET_KEY), {
        iv: CryptoJS.enc.Utf8.parse(this.IV),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });
    return encrypted.toString();
  }
  decryptUsingAES256(data) {
  
     let decrypted=  CryptoJS.AES.decrypt(
      data, CryptoJS.enc.Utf8.parse(this.SECRET_KEY), {
        iv: CryptoJS.enc.Utf8.parse(this.IV),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      }).toString(CryptoJS.enc.Utf8);
      // console.log(decrypted)
      return JSON.parse(decrypted);
  }

  mapArr = [];

  getMapInitialize(locationData) {
    // const arr = this.gmapElement.toArray();
    // const ele = arr[0];
    let location = new google.maps.LatLng(locationData.latitude, locationData.longitude);
    console.log("Map Arr", this.mapArr);
    let mapObj = this.mapArr.find((ele) => ele.communication === locationData.communication);
    console.log("Map Obj",mapObj);

    if(!mapObj){
    setTimeout(()=>{
    console.log("communication",document.getElementById(locationData.communication) )
    var mapProp = {
      center: new google.maps.LatLng(18.5793, 73.8143),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    const map = new google.maps.Map(document.getElementById(locationData.communication), mapProp);
    map.panTo(location);
   const marker = new google.maps.Marker({
      position: location,
      map: map,
      title: locationData.userName
    });

    this.mapArr.push({
      map,marker,communication : locationData.communication
    });
  },0);
} else{
  mapObj.map.panTo(location);
  mapObj.marker.setPosition(location);
}
  }

   startDate = new Date();

  findMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.sendLocationData(position);

        // this.showPosition(position);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  


  showPosition(position) {
    this.currentLat = position.coords.latitude;
    this.currentLong = position.coords.longitude;

    let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    this.map.panTo(location);

    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: location,
        map: this.map,
        title: 'Got you!'
      });
    }
    else {
      this.marker.setPosition(location);
    }
  }

  trackMe(locationData) {
    if (navigator.geolocation) {
      this.isTracking = true;
      this.startDate = new Date();
     var watchId = navigator.geolocation.watchPosition((position) => {
        var checkDate = new Date();
        const data = {
          "fromId": this.currentUser.userID,
          "toId": this.userId,
          "audienceType": this.audienceType,
          "messageType": 'location',
          "locationType":2,
          "latitude": position.coords.latitude,
          "longitude": position.coords.longitude,
          "timestamp": new Date(),
          "conversationId":this.conversationId,
          "communication": locationData.communication
      }
        if ( ( checkDate.getTime() - this.startDate.getTime() ) < ( 1 * 60 * 1000 ) ) {
          // this.showTrackingPosition(position);
          // this.webSocketService.sendUserTrackLocation(this.encryptUsingAES256(data));
        
          this.webSocketService.sendLocationStream(this.encryptUsingAES256(data));
               } else {
                 console.log("Done sharing");
                 this.webSocketService.sendLocationStream(this.encryptUsingAES256(data));
                 navigator.geolocation.clearWatch(watchId);
                 this.isTracking = false;
               } 
               this.getMapInitialize(data);     
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  requestForLocation(locationData){
    const data = {
      "fromId": locationData.fromId,
      "toId": locationData.toId,
      "audienceType": locationData.audienceType,
      "timestamp": new Date(),
      "conversationId":locationData.conversationId,
      "communication": locationData.communication
  }
    this.webSocketService.requestLocationData(this.encryptUsingAES256(data));
  }
  sendRequestLocationData(locationData) {
    if (navigator.geolocation) {
    this.startDate = new Date();
    navigator.geolocation.getCurrentPosition((position) => {
        var checkDate = new Date();
        const data = {
          "fromId": locationData.fromId,
          "toId": locationData.toId,
          "audienceType": locationData.audienceType,
          "latitude": position.coords.latitude,
          "longitude": position.coords.longitude,
          "timestamp": new Date(),
          "conversationId":locationData.conversationId,
          "communication": locationData.communication
      }
        this.webSocketService.sendLocationStream(this.encryptUsingAES256(data));
    });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  sendEndLocationStream(locationData) {
    const data = {
      "fromId": locationData.fromId,
      "toId": locationData.toId,
      "audienceType": locationData.audienceType,
      "timestamp": new Date(),
      "conversationId":locationData.conversationId,
      "communication": locationData.communication,
      "locationType" : 2,
      "isLocationOn":false
  }
    this.webSocketService.endLocationStream(this.encryptUsingAES256(data));
  }

  sendLocationData(position) {
    console.log("Position",position);
    var data = {
      "fromId": this.currentUser.userID,
      "toId": this.userId,
      "audienceType": this.audienceType,
      "messageType": 'location',
      "message": position.coords.address,
      "locationType":2,
      "latitude": position.coords.latitude,
      "longitude": position.coords.longitude,
      "isLocationOn":true,
      "timestamp": new Date(),
      "conversationId":this.conversationId
    }

    // this.webSocketService.sendUserTrackLocation(this.encryptUsingAES256(data));
    this.webSocketService.sendLocation(this.encryptUsingAES256(data));

  }

  showTrackingPosition(position) {
    console.log(`tracking postion:  ${position.coords.latitude} - ${position.coords.longitude}`);
    this.currentLat = position.coords.latitude;
    this.currentLong = position.coords.longitude;

    let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    this.map.panTo(location);

    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: location,
        map: this.map,
        title: 'Got you!'
      });
    }
    else {
      this.marker.setPosition(location);
    }
  }
}
