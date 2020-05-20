import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { UserService } from './../user.service';
import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isCollapsed = false;
  constructor(
    public userService: UserService,
    private fmService: FlashMessagesService,
    private router: Router,
    private webSocketService: WebsocketService,
  ) { }

  ngOnInit() {
  }

  onLogoutClick() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.webSocketService.socketDisconnect();
    this.fmService.show('Successfully logged-out', {
      cssClass: 'alert-success',
      timeout: 3000
    });
    this.router.navigate(['/']);
  }

}
