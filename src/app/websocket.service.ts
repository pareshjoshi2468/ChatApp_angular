import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';

import { HOST, socketHOST } from './host';
import { Subject } from 'rxjs/Subject';
import { takeUntil, takeWhile } from 'rxjs/operators';

@Injectable()
export class WebsocketService {

  // private socket;
  private ngUnsubscribe = new Subject();

  alive: boolean = true


  private socket //= io(socketHOST+'?token='+localStorage.getItem('token'));
  private socketAudio;
  constructor() {

    console.log("Call");
   }

  connect(){
    console.log("Socket",this.socket);
    if(!this.socket || this.socket.disconnected){

    console.log(socketHOST+'?token='+localStorage.getItem('token'));
    // this.socket = io(socketHOST+'?token='+localStorage.getItem('token')+'&audienceType='+audienceType+'&audienceId='+audienceId);

    this.socket = io(socketHOST+'?token='+localStorage.getItem('token'));
    }
    // this.socketAudio = io('http://localhost:8000');
  }

  joinConversation(data){
    this.socket.emit('onJoinConversation',data)
  }

  sendMessage(data) {
    this.socket.emit('onMessageEndUserSent', data);
  }

  sendImage(data) {
    this.socket.emit('onImageEndUserSent', data);
  }

  sendAudio(data) {
    this.socket.emit('onAudioEndUserSent', data);
  }

  sendAudioStream(data) {
    this.socket.emit('onRealTimeAudioStreamEndUserSent', data);
  }

  sendLocation(data) {
    this.socket.emit('onLocationMessageSent', data);
  }

  requestLocationData(data) {
    this.socket.emit('onLocationMessageRequestByReceiver', data);
  }

  sendLocationStream(data) {
    this.socket.emit('onLocationMessageStreamSent', data);
  }

  endLocationStream(data) {
    this.socket.emit('onLocationMessageStreamEnd', data);
  }

  sendUserTrackLocation(data) {
    this.socket.emit('onUserTrackLocationSent', data);
  }



  onConnectionReady(){
    console.log("on connection ready");
  
    const observable = new Observable<any>(observer => {
      this.socket.on('onConnectionReady', (data) => {
        
        observer.next(data);
      });
      return () => {
        console.log("Socket disconnect")
        this.socket.disconnect();
      };
    });
    return observable.pipe(takeWhile(() =>this.alive));
  }

  onConversationReady(){
    console.log("on conversation ready");
  
    const observable = new Observable<any>(observer => {
      this.socket.on('onConversationReady', (data) => {
        
        observer.next(data);
      });
      return () => {
        console.log("Socket disconnect")
        this.socket.disconnect();
      };
    });
    return observable.pipe(takeWhile(()=>this.alive));
  
  }

  newConversationReceived(){
  
    const observable = new Observable<any>(observer => {
      this.socket.on('newConversationReceived', (data) => {
        
        observer.next(data);
      });
      return () => {
        console.log("Socket disconnect")
        this.socket.disconnect();
      };
    });
    return observable.pipe(takeWhile(()=>this.alive));
  
  }


  onEvent(){
    this.alive = true;
  }

  destroyEvent(){
    this.alive = false
  }

  MessageReceivedbySender() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onMessageEndUserReceivedBySender', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  
  imageMessageReceivedbySender() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onImageMessageEndUserReceivedBySender', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  locationMessageReceivedbySender() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onLocationMessageReceivedBySender', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  audioMessageReceivedbySender() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onAudioMessageEndUserReceivedBySender', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  realTimeAudioStreamFileReceivedbySender() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onRealTimeAudioStreamFileEndUserReceivedBySender', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  newMessageReceived() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onMessageEndUserReceived', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  newImageMessageReceived() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onImageMessageEndUserReceived', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  newLocationMessageReceived() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onLocationMessageReceived', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  newLocationRequestReceived() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onLocationMessageRequest', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  newLocationMessageStreamReceived() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onLocationMessageStreamReceived', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  newLocationMessageStreamEndReceived() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onLocationMessageStreamEndReceived', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }


  newAudioMessageReceived() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onAudioMessageEndUserReceived', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

   newRealTimeAudioStreamMessageReceived() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onRealTimeAudioStreamEndUserReceived', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  newRealTimeAudioStreamFileReceived() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onRealTimeAudioStreamFileEndUserReceived', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  newUserTrackLocationReceived() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onUserTrackLocationReceived', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  newUserOfflineForLocation() {
    const observable = new Observable<any>(observer => {
      this.socket.on('onUserOfflineForLocation', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  onAudioUpload(data){
    this.socket.emit('onAudioSliceUpload', data);
  }

  requestAudioUpload() {
    const observable = new Observable<any>(observer => {
      this.socket.on('requestAudioUpload', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }


  endAudioUpload() {
    const observable = new Observable<any>(observer => {
      this.socket.on('endAudioUpload', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  

  typing(data) {
    this.socket.emit('typing', data);
  }

  receivedTyping() {
    const observable = new Observable<{ isTyping: boolean}>(observer => {
      this.socket.on('typing', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  socketDisconnect() {
    this.socket.disconnect();
  }

}
