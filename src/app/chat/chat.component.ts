import { UserService } from './../user.service';
import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { EncryptionService } from '../encryption.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  Users;
  groups;
  channels;
  audienceType = 'ENDUSER';
  constructor(private userService: UserService, private webSocket:WebsocketService,
              private encryptionService: EncryptionService ) { }

  ngOnInit() {
    this.getUser();
    this.getGroup();
    this.getChannel();
    this.webSocket.connect();

    this.webSocket.newConversationReceived()
    .subscribe(data => {
      const newData = this.encryptionService.decryptUsingAES256(data);
      console.log("Received Conversation",newData);
      this.newConversationAdded(newData);
    });
  }

  newConversationAdded(conversationData){
    if(conversationData.audienceType == 'ENDUSER'){
    for(let i=0;i<this.Users.length;i++){
      if(this.Users[i].userID == conversationData.audienceId){
        this.Users[i].conversationId = conversationData.conversationId;
        break;
      }
    }
    } else if (conversationData.audienceType == 'GROUP'){
      for(let i=0;i<this.groups.length;i++){
        if(this.groups[i].groupID == conversationData.audienceId){
          this.groups[i].conversationId = conversationData.conversationId;
          break;
        }
      }
    }else {
      for(let i=0;i<this.channels.length;i++){
        if(this.channels[i].channelID == conversationData.audienceId){
          this.channels[i].conversationId = conversationData.conversationId;
          break;
        }
      }
    }
  
  }

  getUser() {
    this.userService.getUsers(this.userService.getLoggedInUser().userID)
    .subscribe(users => {
      console.log(users)

      this.Users = users.json().data;
      // console.log(this.Users)
    });  
  }
  getGroup(){
    this.userService.getGroups(this.userService.getLoggedInUser().userID)
    .subscribe(groups => {
      console.log(groups)

      this.groups = groups.json().data;
      // console.log(this.Users)
    });  
  }
    getChannel(){
      this.userService.getChannels(this.userService.getLoggedInUser().userID)
      .subscribe(channels => {
        console.log(channels)
  
        this.channels = channels.json().data;
        // console.log(this.Users)
      });  
  }


  changeAudience(){

  }
}
