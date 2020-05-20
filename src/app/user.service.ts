import { HttpModule, Headers, Http } from '@angular/http';
import { Injectable, Host } from '@angular/core';
import{HOST} from './host'

@Injectable()
export class UserService {

  constructor(private http: Http) { }


  saveUser(user) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://10.6.106.97:3000/api/users', user, {headers: headers});
  }

  login(user) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(HOST+'socket/socketLogin', user, {headers: headers});
  }

  loggedIn() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user != null ? true : false;
  }

  getLoggedInUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  getUsers(userID) {
    const headers = new Headers();
    // headers.append('Content-Type', 'application/json');
     headers.append('x-access-token',localStorage.getItem('token'))
console.log("call",headers);

   return   this.http.get(HOST+'socket/contacts/'+userID.toString(),{headers:headers});
  }

  getGroups(userID) {
    const headers = new Headers();
    // headers.append('Content-Type', 'application/json');
     headers.append('x-access-token',localStorage.getItem('token'))
console.log("call",headers);

   return   this.http.get(HOST+'socket/groups/'+userID.toString(),{headers:headers});
  }

  
  getChannels(userID) {
    const headers = new Headers();
    // headers.append('Content-Type', 'application/json');
     headers.append('x-access-token',localStorage.getItem('token'))
console.log("call",headers);

   return   this.http.get(HOST+'socket/channels/'+userID.toString(),{headers:headers});
  }

  getConversationMessage(conversationId) {
    const headers = new Headers();
    headers.append('x-access-token',localStorage.getItem('token'))
    return this.http.get(HOST+'conversation/messages/'+conversationId+'?page=1&limit=10',{headers:headers});
  }

  fileUpload(conversationId,fileType,file){
    const headers = new Headers();
    headers.append('x-access-token',localStorage.getItem('token'));
    const payload = new FormData();
    payload.append('filename',file);
    return this.http.post(HOST+'conversation/fileUpload?conversationId='+conversationId+'&fileType='+fileType,payload,{headers:headers});
  }
}
