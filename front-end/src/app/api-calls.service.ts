import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';


let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
let backendUrl = environment.backendUrl;
@Injectable({
  providedIn: 'root'
})
export class ApiCallsService {

  constructor(private http: HttpClient) { }

  public moveDone(roomId:string,move:string,index:number) {
    let url = backendUrl + 'moveDone'
    return this.http.post(url, {roomId,move,index}, { headers })
  }

  public resetGame(roomId:string){
    let url = backendUrl + 'resetGame';
    return this.http.post(url, {roomId}, { headers })
  }

}
