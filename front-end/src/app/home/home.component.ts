import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { io } from "socket.io-client";
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { ApiCallsService } from '../api-calls.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';

let backendUrl = environment.backendUrl;




@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  socket = io(backendUrl);
  isMatchFound = false;
  PLAYER_COLOR = "red";
  isGameOver = false;
  arr: any = [];
  board: any;
  selectors: any;
  resetBtn: any;
  winner: any;
  player1 = false;
  player2 = false;
  freezeMove = true;
  gameId = "";
  player = "";
  currentMove = ""; //This is to maintain the state of this code. 
  title = "";
  playerOnline: { [key: string]: boolean } = {   //Offline -false, Online - true
    "player1": false,
    "player2": false
  }

  constructor(private route: ActivatedRoute,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private apiCall: ApiCallsService,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard) {



    this.socket.on("connect", () => {
      //console.log(this.socket.id); // x8WIv7-mJelg7on_ALbx
    });
    this.socket.on("moveDoneClient", (data) => {
      let color = data.move == "player1" ? "red" : "yellow";
      this.fillColor(data.index, color);
      if (this.checkForWinner()) {
        this.isGameOver = true;
        if (this.currentMove == this.player) {
          this.playWinAudio();
        }
        else {
          this.playLoseAudio();
        }
        return
      }

      this.currentMove = this.currentMove == "player1" ? "player2" : "player1";
    })

    this.socket.on("playersStatus", (data) => {
      //console.log("kjkjh",data)
      let players = Array.from(data.roomData);

      if (players.length == 2) {
        this.playerOnline = {
          "player1": true,
          "player2": true
        }
      } else {
        if (players.includes(this.socket.id)) {
          //let a = this.player as keyof typeof this.playerOnline;
          this.playerOnline[this.player] = true;
          let otherPlayer = this.player1 ? "player2" : "player1";
          this.playerOnline[otherPlayer] = false;
        }
      }
      //console.log("lklk",players,this.playerOnline)

    })

    this.socket.on("resetGameClient", (data) => {
      this.createBoard();
    })


    this.createBoard();


    this.route.queryParams.subscribe((param) => {
      if (!param['gameId'] || !param['playerType']) { //When directly the URL is called by player 1
        let gameId = Math.floor(Math.random() * (89999)) + 10000
        let playerType = "player1"
        this.router.navigate([], { queryParams: { gameId, playerType } });
      }
      else {  //Proper URL
        this.player1 = param['playerType'] == "player1";
        this.player2 = param['playerType'] == "player2";
        this.player = param['playerType'];
        this.gameId = param['gameId'];
        //console.log("Details",this.player1,this.player2,this.gameId)
        //if(this.player1) this.freezeMove = false; //Player 1 Starts and then afer his move player 2 move is unfreezed
        this.PLAYER_COLOR = this.player1 ? "red" : "yellow"; //Player 1 Always get red and player 2 Yellow
        this.document.documentElement.style.setProperty('--boxColor', this.PLAYER_COLOR); //This is to display color in selectors
        this.joinGame(this.gameId);
        this.currentMove = "player1";
        this.title = this.player == "player1" ? "PLAYER 1" : "PLAYER 2"
      }
    })

  }

  ngOnInit(): void {
  }

  getBoardColor(i: number, j: number) {
    if (this.arr[i][j])
      return { "background-color": this.arr[i][j] };
    else
      return { "background-color": "white" };
  }

  joinGame(roomId: string) {
    this.socket.emit("joinGame", { "roomId": roomId })
  }

  moveDone(index: number) {
    if (this.currentMove != this.player) return

    if (!(this.playerOnline['player1'] && this.playerOnline['player2'])) {
      this.alertUser("All Players have not joined")
      return;
    }

    if (this.isGameOver) {

      return
    }

    this.playMoveAudio();


    this.apiCall.moveDone(this.gameId, this.player, index).subscribe((resp: any) => {
      if (resp.status == "success") {
        //this.alertUser("Move Success")
      } else {
        this.alertUser("Move Failed due to " + resp.response);
      }
    })

  }

  checkForWinner() {
    return (
      this.checkHorizontalWinner() ||
      this.checkVerticalWinner() ||
      this.checkDiagonalWinner() ||
      this.checkAntiDiagonalWinner()
    );
  }

  checkHorizontalWinner() {
    let colorToCheck = "";
    let isMatchFound = false;
    for (let i = 5; i >= 0; i--) {
      if (this.arr[i][3]) {
        colorToCheck = this.arr[i][3];
        for (let j = 0; j < 4; j++) {
          if (this.arr[i][j]) {
            let b1 = this.arr[i][j];
            let b2 = this.arr[i][j + 1];
            let b3 = this.arr[i][j + 2];
            let b4 = this.arr[i][j + 3];
            if (
              b1 == colorToCheck &&
              b2 == colorToCheck &&
              b3 == colorToCheck &&
              b4 == colorToCheck
            ) {
              isMatchFound = true;
              break;
            }
          }
        }
        if (isMatchFound) {
          break;
        }
      }
    }
    return isMatchFound;
  }

  checkVerticalWinner() {
    let colorToCheck = "";
    let isMatchFound = false;
    for (let i = 0; i < 7; i++) {
      if (this.arr[2][i]) {
        colorToCheck = this.arr[2][i];
        for (let j = 5; j >= 3; j--) {
          if (this.arr[j][i]) {
            let b1 = this.arr[j][i];
            let b2 = this.arr[j - 1][i];
            let b3 = this.arr[j - 2][i];
            let b4 = this.arr[j - 3][i];
            if (
              b1 == colorToCheck &&
              b2 == colorToCheck &&
              b3 == colorToCheck &&
              b4 == colorToCheck
            ) {
              isMatchFound = true;
              break;
            }
          }
        }
        if (isMatchFound) {
          break;
        }
      }
    }
    return isMatchFound;
  }

  checkDiagonalWinner() {
    let isMatchFound = false;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 7; j++) {
        let x = i * 10 + j;
        if ((+x + 33) % 10 <= 6) {
          if (this.arr[i][j]) {
            let colorToCheck = this.arr[i][j];
            let b1 = this.arr[i][j];
            let b2 = this.arr[i + 1][j + 1];
            let b3 = this.arr[i + 2][j + 2];
            let b4 = this.arr[i + 3][j + 3];
            if (
              b1 == colorToCheck &&
              b2 == colorToCheck &&
              b3 == colorToCheck &&
              b4 == colorToCheck
            ) {
              isMatchFound = true;
              break;
            }
          }
        }
      }
      if (isMatchFound) {
        break;
      }
    }
    return isMatchFound;
  }

  checkAntiDiagonalWinner() {
    let isMatchFound = false;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 7; j++) {
        let x = i * 10 + j;
        if ((+x + 27) % 10 <= 6) {
          if (this.arr[i][j]) {
            let colorToCheck = this.arr[i][j];
            let b1 = this.arr[i][j];
            let b2 = this.arr[i + 1][j - 1];
            let b3 = this.arr[i + 2][j - 2];
            let b4 = this.arr[i + 3][j - 3];
            if (
              b1 == colorToCheck &&
              b2 == colorToCheck &&
              b3 == colorToCheck &&
              b4 == colorToCheck
            ) {
              isMatchFound = true;
              break;
            }
          }
        }
      }
      if (isMatchFound) {
        break;
      }
    }
    return isMatchFound;
  }

  fillColor(index: number, color: string) {
    for (let i = 5; i >= 0; i--) {
      if (!this.arr[i][index]) {
        this.arr[i][index] = color;
        break;
      }
    }
  }


  createBoard() {
    this.isGameOver = false;
    this.currentMove = "player1";
    this.arr = [];
    for (let i = 0; i < 6; i++) {
      this.arr.push(Array(7).fill(null));
    }
  }

  resetBoard() {
    this.apiCall.resetGame(this.gameId).subscribe();
  }

  alertUser(message: string) {
    this.snackBar.open(message, 'Dismiss', { duration: 3000 })
  }

  openPlayer2() {
    const currentUrl = this.router.url.split('?')[0];
    const newParams = { "gameId": this.gameId, playerType: 'player2' }; // Define the route parameters

    const urlTree = this.router.createUrlTree([currentUrl], { queryParams: newParams });
    const url = environment.uiUrl + this.router.serializeUrl(urlTree);
    window.open(url, '_blank'); // Open the link in a new tab
    this.alertUser("Player 2 opened in new Tab");
  }

  copyPlayer2() {
    const currentUrl = this.router.url.split('?')[0];
    const newParams = { "gameId": this.gameId, playerType: 'player2' }; // Define the route parameters

    const urlTree = this.router.createUrlTree([currentUrl], { queryParams: newParams });
    const url = environment.uiUrl + this.router.serializeUrl(urlTree);
    this.clipboard.copy(url);
    this.alertUser("Player 2 Link Copied");
  }

  getPlayerStatusHtml(player: string) {
    return this.playerOnline[player] ? 'Online' : 'Offline';
  }

  playMoveAudio() {
    let audio = new Audio();
    audio.src = '../../assets/move.mp3';
    audio.load();
    audio.play();
  }

  playWinAudio() {
    let audio = new Audio();
    audio.src = '../../assets/success.mp3';
    audio.load();
    audio.play();
  }

  playLoseAudio() {
    let audio = new Audio();
    audio.src = '../../assets/failure.mp3';
    audio.load();
    audio.play();
  }

}
