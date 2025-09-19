import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

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
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat-screen.component.html',
  styleUrls: ['./chat-screen.component.css'] 
})
export class ChatScreenComponent {

  chats: IChat[] = [];
  chatSelecionado!: IChat;
  mensagens: IMessage[] = [];
  mensagemUsuario = new FormControl("");

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getChats();
  }

  async getChats() {
    try {
      const response = await firstValueFrom(this.http.get<IChat[]>(
        "https://senai-gpt-api.azurewebsites.net/chats",
        {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("meuToken")
          }
        }
      ));

      this.chats = response;
    } catch (error) {
      console.error("Erro ao buscar os chats:", error);
    }

    this.cd.detectChanges();
  }

  async onChatClick(chatClicado: IChat) {
    this.chatSelecionado = chatClicado;

    try {
      const response = await firstValueFrom(this.http.get<IMessage[]>(
        "https://senai-gpt-api.azurewebsites.net/messages?chatId=" + chatClicado.id,
        {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("meuToken")
          }
        }
      ));

      this.mensagens = response;
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }

    this.cd.detectChanges();
  }

  async enviarMensagem() {
    const mensagem = this.mensagemUsuario.value?.trim();

    if (!mensagem || !this.chatSelecionado) return;

    const novaMensagemUsuario = {
      chatId: this.chatSelecionado.id,
      userId: localStorage.getItem("meuId"),
      text: mensagem
    };

    try {
      // Enviar nova mensagem
      await firstValueFrom(this.http.post(
        "https://senai-gpt-api.azurewebsites.net/messages", 
        novaMensagemUsuario,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("meuToken")
          }
        }
      ));

      // Buscar mensagens atualizadas
      const response = await firstValueFrom(this.http.get<IMessage[]>(
        "https://senai-gpt-api.azurewebsites.net/messages?chatId=" + this.chatSelecionado.id,
        {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("meuToken")
          }
        }
      ));

      this.mensagens = response;
      this.mensagemUsuario.setValue(""); 

    } catch (error) {
      console.error("Erro ao enviar ou buscar mensagens:", error);
    }

    this.cd.detectChanges();

    // IA responde
    let respostaIAResponse = await firstValueFrom(this.http.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      "contents" : [
        {
          "parts" :[
            {
              "text" : this.mensagemUsuario.value + ". Me de uma resposta objetiva."
            }
          ]
        }
      ]
    }, {
      headers: {
        "Content-Type" : "application/json",
        "X-goog-api-key": "AIzaSyDV2HECQZLpWJrqCKEbuq7TT5QPKKdLOdo"
      }
    })) as any;
  
    let novaRespostaIA = {
      chatId: this.chatSelecionado.id,
      userId: "chatbot",
      text: respostaIAResponse.candidates[0].content.parts[0].text
    }

    let novaRespostaIAResponse = await firstValueFrom(this.http.post("https://senai-gpt-api.azurewebsites.net/messages", novaRespostaIA, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("meuToken")
      }
    }));

    await this.onChatClick(this.chatSelecionado);
  }
}
