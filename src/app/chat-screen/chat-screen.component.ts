import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

interface IChat {
  id: number;
  chatTitle: string;
  userId: string;
}

interface IMessage {
  id: number;
  chatId: number;
  text: string;
  userId: string;
}

@Component({
  selector: 'app-chat-screen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat-screen.component.html',
  styleUrl: './chat-screen.component.css',
})
export class ChatScreen {
  chats: IChat[] = [];
  chatSelecionado: IChat | null = null;
  messages: IMessage[] = [];
  userMessage = new FormControl('');

  private readonly apiBase = 'https://senai-gpt-api.azurewebsites.net';
  private readonly aiApiUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private readonly headers = {
    'content-type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('meuToken')}`,
  };

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.getChats();
  }

  async getChats() {
    try {
      const response = (await firstValueFrom(
        this.http.get<IChat[]>(`${this.apiBase}/chats`, { headers: this.headers })
      )) || [];

      const userId = localStorage.getItem('meuId');
      this.chats = response.filter((chat) => chat.userId === userId);

      this.cd.detectChanges();
    } catch (err) {
      console.error('Erro ao buscar chats:', err);
    }
  }

  async onChatClick(chat: IChat) {
    try {
      this.chatSelecionado = chat;
      this.messages = (await firstValueFrom(
        this.http.get<IMessage[]>(`${this.apiBase}/messages?chatId=${chat.id}`, {
          headers: this.headers,
        })
      )) || [];

      this.cd.detectChanges();
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
    }
  }

  async sendMessage() {
    if (!this.chatSelecionado || !this.userMessage.value) return;

    try {
      const newMessageUser: Partial<IMessage> = {
        chatId: this.chatSelecionado.id,
        userId: localStorage.getItem('meuId')!,
        text: this.userMessage.value,
      };

      await firstValueFrom(
        this.http.post(`${this.apiBase}/messages`, newMessageUser, {
          headers: this.headers,
        })
      );

      await this.onChatClick(this.chatSelecionado);

      const respostaIA: any = await firstValueFrom(
        this.http.post(
          this.aiApiUrl,
          {
            contents: [
              {
                parts: [{ text: `${this.userMessage.value}. Me dê uma resposta objetiva` }],
              },
            ],
          },
          {
            headers: {
              'content-type': 'application/json',
              'x-goog-api-key': 'AIzaSyDV2HECQZLpWJrqCKEbuq7TT5QPKKdLOdo',
            },
          }
        )
      );

      const newAnswerIA: Partial<IMessage> = {
        chatId: this.chatSelecionado.id,
        userId: 'chatbot',
        text: respostaIA?.candidates?.[0]?.content?.parts?.[0]?.text || '[Sem resposta]',
      };

      await firstValueFrom(
        this.http.post(`${this.apiBase}/messages`, newAnswerIA, { headers: this.headers })
      );

      await this.onChatClick(this.chatSelecionado);
      this.userMessage.setValue('');
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  }

  async novoChat() {
    const nomeChat = prompt('Digite o nome do novo chat:');
    if (!nomeChat?.trim()) {
      alert('Nome inválido.');
      return;
    }

    try {
      const novoChat: Partial<IChat> = {
        chatTitle: nomeChat,
        userId: localStorage.getItem('meuId')!,
      };

      const novoChatResponse = (await firstValueFrom(
        this.http.post<IChat>(`${this.apiBase}/chats`, novoChat, { headers: this.headers })
      )) as IChat;

      await this.getChats();
      await this.onChatClick(novoChatResponse);
    } catch (err) {
      console.error('Erro ao criar novo chat:', err);
    }
  }

  deslogar() {
    localStorage.clear();
    window.location.href = 'login';
  }
}
