import { Component, OnInit, Inject,ViewEncapsulation } from '@angular/core';
import { io } from "socket.io-client";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

let headers = new HttpHeaders({ 'Content-Type': 'application/json' });


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  socket = io("http://localhost:3000");
  isMatchFound = false;
  CURRENT_COLOR = "red";
  isGameOver = false;
  arr: any = [];
  board: any;
  selectors: any;
  resetBtn: any;
  winner: any;

  constructor(private http: HttpClient,
    @Inject(DOCUMENT) private document: Document) {
    this.socket.on("connect", () => {
      console.log(this.socket.id); // x8WIv7-mJelg7on_ALbx
    });
    this.socket.on("moveDoneClient", (data) => {
      console.log("kjhjkh", data)
    })
    this.createBoard();
  }

  ngOnInit(): void {
  }

  getBoardColor(i: number, j: number) {
    if (this.arr[i][j])
      return { "background-color": this.arr[i][j] };
    else
      return { "background-color": "white" };
  }

  joinGame() {
    this.socket.emit("joinGame", { "roomId": "QWERTY" })
  }

  moveDone(index: number) {
    if(this.isGameOver) return
    console.log({ index })
    this.fillColor(index, this.CURRENT_COLOR)
    if (this.checkForWinner()) {
      this.isGameOver = true;

    } else {
      this.CURRENT_COLOR = this.CURRENT_COLOR === "red" ? "yellow" : "red";
    }
    // this.http.post("http://localhost:3000/moveDone", { "roomId": "QWERTY", "move": "yellow" }, { headers }).subscribe(response => {
    //   console.log("kj", response)
    // })
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
    this.arr = [];
    for (let i = 0; i < 6; i++) {
      this.arr.push(Array(7).fill(null));
    }
  }


}
