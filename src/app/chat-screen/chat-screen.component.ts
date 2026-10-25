import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ThemeService } from '../theme.service';
import { LogoComponent } from '../logo/logo.component';

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
  imports: [CommonModule, ReactiveFormsModule, LogoComponent],
  templateUrl: './chat-screen.component.html',
  styleUrl: './chat-screen.component.css',
})
export class ChatScreen implements AfterViewChecked {
  chats: IChat[] = [];
  chatSelecionado: IChat | null = null;
  messages: IMessage[] = [];
  userMessage = new FormControl('');

  // Estado de carregamento: dá feedback visual enquanto a mensagem
  // é enviada e a IA "pensa", em vez de a tela simplesmente não
  // reagir a nada até a resposta chegar.
  enviandoMensagem = false;

  // No celular a barra lateral vira uma gaveta que abre pelo botão de menu.
  sidebarAberta = false;

  // Perguntas da tela inicial: clicar em uma cria a conversa e já envia.
  readonly exemplos = [
    'Explique a Lei de Ohm com um exemplo do dia a dia',
    'Como faço uma requisição HTTP em JavaScript?',
    'Monte um plano de estudos de lógica de programação para 2 semanas',
  ];

  // Caixa de "Nova conversa": substitui o prompt() do navegador.
  nomeNovoChat = new FormControl('');
  erroNovoChat = '';
  criandoChat = false;

  @ViewChild('chatMessagesEl') private chatMessagesEl?: ElementRef<HTMLDivElement>;
  @ViewChild('novoChatDialog') private novoChatDialog?: ElementRef<HTMLDialogElement>;
  private deveRolarParaFinal = false;

  private readonly apiBase = 'https://senai-gpt-api.azurewebsites.net';
  private readonly aiApiUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private readonly headers = {
    'content-type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('meuToken')}`,
  };

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    public theme: ThemeService,
  ) {}

  ngOnInit() {
    this.getChats();
  }

  ngAfterViewChecked(): void {
    if (this.deveRolarParaFinal) {
      this.rolarParaFinal();
      this.deveRolarParaFinal = false;
    }
  }

  private rolarParaFinal(): void {
    const el = this.chatMessagesEl?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  async getChats() {
    try {
      const response =
        (await firstValueFrom(
          this.http.get<IChat[]>(`${this.apiBase}/chats`, {
            headers: this.headers,
          }),
        )) || [];

      const userId = localStorage.getItem('meuId');
      this.chats = response.filter((chat) => chat.userId === userId);

      this.cd.detectChanges();
    } catch (err) {
      console.error('Erro ao buscar chats:', err);
    }
  }

  async onChatClick(chat: IChat) {
    this.sidebarAberta = false;

    try {
      this.chatSelecionado = chat;
      this.messages =
        (await firstValueFrom(
          this.http.get<IMessage[]>(
            `${this.apiBase}/messages?chatId=${chat.id}`,
            {
              headers: this.headers,
            },
          ),
        )) || [];

      this.deveRolarParaFinal = true;
      this.cd.detectChanges();
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
    }
  }

  // Só recarrega as mensagens se o usuário ainda estiver nessa conversa
  // (ele pode ter voltado para o início ou aberto outra enquanto a IA responde).
  private async atualizarSeAberto(chat: IChat) {
    if (this.chatSelecionado?.id === chat.id) {
      await this.onChatClick(chat);
    }
  }

  async sendMessage() {
    if (!this.chatSelecionado || !this.userMessage.value || this.enviandoMensagem) return;

    this.enviandoMensagem = true;
    const chat = this.chatSelecionado;

    try {
      const newMessageUser: Partial<IMessage> = {
        chatId: chat.id,
        userId: localStorage.getItem('meuId')!,
        text: this.userMessage.value,
      };

      await firstValueFrom(
        this.http.post(`${this.apiBase}/messages`, newMessageUser, {
          headers: this.headers,
        }),
      );

      this.userMessage.setValue('');
      await this.atualizarSeAberto(chat);

      const respostaIA: any = await firstValueFrom(
        this.http.post(
          this.aiApiUrl,
          {
            contents: [
              {
                parts: [
                  {
                    text: `${newMessageUser.text}. Me dê uma resposta objetiva`,
                  },
                ],
              },
            ],
          },
          {
            headers: {
              'content-type': 'application/json',
              'x-goog-api-key': 'AIzaSyDV2HECQZLpWJrqCKEbuq7TT5QPKKdLOdo',
            },
          },
        ),
      );

      const newAnswerIA: Partial<IMessage> = {
        chatId: chat.id,
        userId: 'chatbot',
        text:
          respostaIA?.candidates?.[0]?.content?.parts?.[0]?.text ||
          '[Sem resposta]',
      };

      await firstValueFrom(
        this.http.post(`${this.apiBase}/messages`, newAnswerIA, {
          headers: this.headers,
        }),
      );

      await this.atualizarSeAberto(chat);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      alert('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      this.enviandoMensagem = false;
      this.cd.detectChanges();
    }
  }

  onMessageKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Clicar no logo volta para a tela inicial (sem conversa aberta).
  irParaInicio() {
    this.chatSelecionado = null;
    this.messages = [];
    this.sidebarAberta = false;
  }

  novoChat() {
    this.nomeNovoChat.setValue('');
    this.erroNovoChat = '';
    this.sidebarAberta = false;
    this.novoChatDialog?.nativeElement.showModal();
  }

  fecharNovoChat() {
    if (this.criandoChat) return;
    this.novoChatDialog?.nativeElement.close();
  }

  // Clique fora da caixa (no fundo escurecido) fecha.
  onNovoChatDialogClick(event: MouseEvent) {
    if (event.target === this.novoChatDialog?.nativeElement) {
      this.fecharNovoChat();
    }
  }

  async confirmarNovoChat(event: Event) {
    event.preventDefault();
    if (this.criandoChat) return;

    const nomeChat = (this.nomeNovoChat.value || '').trim();
    if (!nomeChat) {
      this.erroNovoChat = 'Dê um nome para a conversa.';
      return;
    }

    this.criandoChat = true;
    const criado = await this.criarChat(nomeChat);
    this.criandoChat = false;

    if (criado) {
      this.novoChatDialog?.nativeElement.close();
    }
    this.cd.detectChanges();
  }

  async comecarComExemplo(texto: string) {
    const criado = await this.criarChat(texto);
    if (!criado) return;

    this.userMessage.setValue(texto);
    await this.sendMessage();
  }

  private async criarChat(titulo: string): Promise<boolean> {
    try {
      const novoChat: Partial<IChat> = {
        chatTitle: titulo,
        userId: localStorage.getItem('meuId')!,
      };

      const novoChatResponse = (await firstValueFrom(
        this.http.post<IChat>(`${this.apiBase}/chats`, novoChat, {
          headers: this.headers,
        }),
      )) as IChat;

      await this.getChats();
      await this.onChatClick(novoChatResponse);
      return true;
    } catch (err) {
      console.error('Erro ao criar novo chat:', err);
      alert('Não foi possível criar a conversa. Tente novamente.');
      return false;
    }
  }

  deslogar() {
    localStorage.clear();
    window.location.href = 'login';
  }

  /*
    BUG CORRIGIDO: o ícone de lixeira ao lado de cada chat na barra
    lateral nunca teve uma ação de exclusão de verdade — o botão
    inteiro (ícone incluído) só chamava onChatClick(chat), ou seja,
    clicar na "lixeira" apenas abria o chat, nunca o apagava. Só
    existia a opção de apagar TODAS as conversas de uma vez.

    Agora o ícone tem sua própria ação: apaga as mensagens do chat e
    depois o chat em si, atualiza a lista local e, se o chat apagado
    era o que estava aberto, limpa a área de mensagens.
  */
  async deletarChat(chat: IChat, event: Event) {
    event.stopPropagation();

    const confirmar = confirm(`Apagar a conversa "${chat.chatTitle}"?`);
    if (!confirmar) return;

    try {
      const mensagens = await firstValueFrom(
        this.http.get<IMessage[]>(`${this.apiBase}/messages?chatId=${chat.id}`, {
          headers: this.headers,
        }),
      );

      await Promise.all(
        (mensagens || []).map((msg) =>
          firstValueFrom(
            this.http.delete(`${this.apiBase}/messages/${msg.id}`, {
              headers: this.headers,
            }),
          ),
        ),
      );

      await firstValueFrom(
        this.http.delete(`${this.apiBase}/chats/${chat.id}`, {
          headers: this.headers,
        }),
      );

      this.chats = this.chats.filter((c) => c.id !== chat.id);

      if (this.chatSelecionado?.id === chat.id) {
        this.chatSelecionado = null;
        this.messages = [];
      }

      this.cd.detectChanges();
    } catch (err) {
      console.error('Erro ao apagar o chat:', err);
      alert('Não foi possível apagar essa conversa. Tente novamente.');
    }
  }

  async clearConversations() {
    const confirmar = confirm('Apagar todas as conversas? Isso não pode ser desfeito.');
    if (!confirmar) return;

    try {
      const chatsParaDeletar = [...this.chats];

      for (const chat of chatsParaDeletar) {
        const mensagens = await firstValueFrom(
          this.http.get<IMessage[]>(
            `${this.apiBase}/messages?chatId=${chat.id}`,
            { headers: this.headers },
          ),
        );

        await Promise.all(
          mensagens.map((msg) =>
            firstValueFrom(
              this.http.delete(`${this.apiBase}/messages/${msg.id}`, {
                headers: this.headers,
              }),
            ),
          ),
        );

        await firstValueFrom(
          this.http.delete(`${this.apiBase}/chats/${chat.id}`, {
            headers: this.headers,
          }),
        );
      }

      this.chats = [];
      this.chatSelecionado = null;
      this.messages = [];

      this.cd.detectChanges();
    } catch (err) {
      console.error('Erro ao limpar conversas:', err);
    }
  }
}
