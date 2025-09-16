import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface IChat {

  chatTitle: string;
  id: number;
  userId: string;
}

@Component({
  selector: 'app-chat-screen',
  imports: [HttpClientModule, CommonModule ],
  templateUrl: './chat-screen.component.html',
  styleUrl: './chat-screen.component.css'
})
export class ChatScreenComponent {

  chats : IChat [];

  constructor (private http: HttpClient) {
    this.chats = []
  }

  ngOnInit () {

    this.getChats();

  }

  async getChats () {

    let response = await this.http.get("https://senai-gpt-api.azurewebsites.net/chats", {
      headers: {
        "Authorization" : "Bearer " + localStorage.getItem("meuToken")
      }
    }).toPromise();
  
    if (response) {
    
      this.chats = response as [];

    }else {

      console.log("Eroo ao buscar os chats.");
      
    }

  }

}
