import { GuestsProxy } from './guests.proxy';

export interface MeetProxy {
  id?: string;
  assunto: string;
  convidados: GuestsProxy[];
  data: string;
  duracao: string;
  horarios: string[];
}
