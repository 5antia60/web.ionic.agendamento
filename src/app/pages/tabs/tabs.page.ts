//#region Imports

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase/compat/app';
import { collection, getFirestore, onSnapshot, query, addDoc } from 'firebase/firestore';
import { environment } from '../../../environments/environment';
import { MeetProxy } from '../../models/proxies/meet.proxy';
import { PersonProxy } from '../../models/proxies/person.proxy';

//#endregion

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  //#region Constructor

  constructor(
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  //#endregion

  //#region Properties

  public isSentTime: boolean = false;
  public selectedTimeIndex?: number;
  public meeting?: MeetProxy;
  public invited?: PersonProxy;
  public db: any;

  //#endregion

  //#region LifeCycle Events

  public async ngOnInit(): Promise<void> {
    let app = firebase.initializeApp(environment.firebase);
    this.db = getFirestore(app);

    await Promise.all([
      this.getReuniao(),
      this.getPessoa(),
    ]);
  }

  //#endregion

  //#region Methods

  public getPessoa(): void {
    const invitedId = this.activatedRoute.snapshot.paramMap.get('invitedId');

    // Where não funcionou, decidimos filtrar após a requisição
    onSnapshot(query(collection(this.db, "Pessoa")), (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const id = doc.id;

        if (id == invitedId) {
          const result: any = doc.data();
          this.invited = {
            id: invitedId,
            nome: result.nome,
            email: result.email,
            celular: result.celular,
          };
        }
      });
    });

    setTimeout(() => {
      if (!this.invited) {
        this.isSentTime = true;
        alert('Não conseguimos identificar você e seu endereço...');
      }
    }, 500);
  }

  public getReuniao(): void {
    const meetingId = this.activatedRoute.snapshot.paramMap.get('meetId');

    // Where não funcionou, decidimos filtrar após a requisição
    onSnapshot(query(collection(this.db, "Reuniao")), (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const id = doc.id;

        if (id == meetingId) {
          const result: any = doc.data();
          this.meeting = {
            id: meetingId,
            data: result.data,
            horarios: result.horarios,
            duracao: result.duracao.replace(':', 'h'),
            assunto: result.assunto,
            convidados: result.convidados,
          };
        }
      });
    });

    setTimeout(() => {
      if (!this.meeting) {
        this.isSentTime = true;
        alert('Nenhuma reunião foi encontrada');
      }
    }, 500);
  }

  public selectTimeIndex(index: number): void {
    this.selectedTimeIndex = index;
  }

  public async onSubmit(): Promise<void> {
    if (!this.selectedTimeIndex && this.selectedTimeIndex !== 0)
      return alert('Selecione um horário disponível...');

    if (!this.meeting?.horarios[this.selectedTimeIndex])
      return alert('Horário inválido...');

    try {
      await addDoc(collection(this.db, "ReuniaoRespostas"), {
        horario: this.meeting?.horarios[this.selectedTimeIndex],
        id_pessoa: this.invited?.id,
        id_reuniao: this.meeting?.id,
      });

      this.isSentTime = true;
      alert('Resposta enviada com sucesso!');
    } catch (error) {
      alert(error || 'Erro inesperado');
    }
  }

  //#endregion

}
