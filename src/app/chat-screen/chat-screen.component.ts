import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
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
export class ChatScreen {
  chats: IChat[] = [];
  chatSelecionado: IChat | null = null;
  mensagens: IMessage[] = [];
  mensagemUsuario = new FormControl("");

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getChats();
  }

  // Busca os chats da API e filtra pelo userId do usuário logado
  async getChats() {
    try {
      const response = await firstValueFrom(
        this.http.get<IChat[]>("https://senai-gpt-api.azurewebsites.net/chats", {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("meuToken")
          }
        })
      );

      const userId = localStorage.getItem("meuId") || "";
      this.chats = response.filter(chat => chat.userId === userId);
    } catch (error) {
      console.error("Erro ao buscar os chats:", error);
    }
  }

  async onChatClick(chatClicado: IChat) {
    this.chatSelecionado = chatClicado;

    try {
      const response = await firstValueFrom(
        this.http.get<IMessage[]>(
          `https://senai-gpt-api.azurewebsites.net/messages?chatId=${chatClicado.id}`,
          {
            headers: {
              "Authorization": "Bearer " + localStorage.getItem("meuToken")
            }
          }
        )
      );

      this.mensagens = response;
      this.cd.detectChanges();
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  }

  async enviarMensagem() {
    if (!this.chatSelecionado || !this.mensagemUsuario.value?.trim()) {
      console.warn("Chat não selecionado ou mensagem vazia.");
      return;
    }

    const mensagemDoUsuario = this.mensagemUsuario.value.trim();

    const novaMensagemUsuario = {
      chatId: this.chatSelecionado.id,
      userId: localStorage.getItem("meuId"),
      text: mensagemDoUsuario
    };

    try {
      // Envia a mensagem do usuário
      await firstValueFrom(
        this.http.post(
          "https://senai-gpt-api.azurewebsites.net/messages",
          novaMensagemUsuario,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + localStorage.getItem("meuToken")
            }
          }
        )
      );

      // Limpa o input
      this.mensagemUsuario.setValue("");

      // Atualiza o chat
      await this.onChatClick(this.chatSelecionado);

      // Chama o Gemini (IA)
      const respostaIAResponse = await firstValueFrom(
        this.http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
          {
            contents: [
              {
                parts: [
                  {
                    text: mensagemDoUsuario
                  }
                ]
              }
            ]
          },
          {
            headers: {
              "content-type": "application/json",
              "x-goog-api-key": "AIzaSyDV2HECQZLpWJrqCKEbuq7TT5QPKKdLOdo"
            }
          }
        )
      ) as any;

      // Cria a mensagem da IA
      const novaRespostaIA = {
        chatId: this.chatSelecionado.id,
        userId: "chatbot",
        text: respostaIAResponse.candidates[0].content.parts[0].text
      };

      // Salva a resposta da IA
      await firstValueFrom(
        this.http.post(
          "https://senai-gpt-api.azurewebsites.net/messages",
          novaRespostaIA,
          {
            headers: {
              "Content-type": "application/json",
              "Authorization": "Bearer " + localStorage.getItem("meuToken")
            }
          }
        )
      );

      // Atualiza novamente as mensagens do chat
      await this.onChatClick(this.chatSelecionado);
    } catch (error) {
      console.error("Erro ao enviar mensagem ou obter resposta da IA:", error);
    }
  }

  async novoChat() {
    const nomeChat = prompt("Digite o nome do novo chat");

    if (!nomeChat || !nomeChat.trim()) {
      alert("Nome inválido.");
      return;
    }

    const novoChatObj = {
      chatTitle: nomeChat.trim(),
      userId: localStorage.getItem("meuId")
      // Backend gera o ID
    };

    try {
      const novoChatResponse = await firstValueFrom(
        this.http.post<IChat>(
          "https://senai-gpt-api.azurewebsites.net/chats",  // Rota correta para criar chat
          novoChatObj,
          {
            headers: {
              "Content-type": "application/json",
              "Authorization": "Bearer " + localStorage.getItem("meuToken")
            }
          }
        )
      );

      await this.getChats();
      await this.onChatClick(novoChatResponse);
    } catch (error) {
      console.error("Erro ao criar novo chat:", error);
      alert("Erro ao criar novo chat. Tente novamente.");
    }
  }

  deslogar() {
    localStorage.clear();
    window.location.href = "login";
  }
}
