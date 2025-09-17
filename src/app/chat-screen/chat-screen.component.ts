import { HttpClient,  } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

interface IChat {

  chatTitle: string;
  id: number;
  userId: string;
}

interface IMessage {
  chatId: number;
  id: number;
  text: string;
  userId: string;
  
}

@Component({
  selector: 'app-chat-screen',
  imports: [CommonModule ],
  templateUrl: './chat-screen.component.html',
  styleUrl: './chat-screen.component.css'
})
export class ChatScreenComponent {

  chats : IChat[];
  chatSelecionado: IChat;
  mensagens: IMessage[];

  constructor (private http: HttpClient, private cd: ChangeDetectorRef) {
    this.chats = []
    this.chatSelecionado = null!;
    this.mensagens = [];
  }

  ngOnInit () {

    this.getChats();

  }

  async getChats () {

    let response = await firstValueFrom(this.http.get("https://senai-gpt-api.azurewebsites.net/chats", {
      headers: {
        "Authorization" : "Bearer " + localStorage.getItem("meuToken")
      }
    }));
  
    if (response) {
    
      this.chats = response as [];

    }else {

      console.log("Eroo ao buscar os chats.");
      
    }

    this.cd.detectChanges();

  }

  async onChatClick (chatClicado: IChat) {

    console.log(chatClicado);

    this.chatSelecionado = chatClicado;
    
    //logica para buscar as mensagens

    let response = await firstValueFrom(this.http.get("https://senai-gpt-api.azurewebsites.net/messages?chatId=" + chatClicado.id, {
      headers: {
        "Authorization" : "Bearer " + localStorage.getItem("meuToken")
      }
    }));

    console.log("MENSAGENS", response);

    this.mensagens = response as IMessage[];
    
  }
}
