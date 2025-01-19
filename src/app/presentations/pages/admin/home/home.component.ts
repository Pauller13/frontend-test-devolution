import { UsageInstance } from './../../../../../../node_modules/qrcode/node_modules/yargs/build/lib/usage.d';
import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BaseService } from '../../../../core/services/baseService/base-service.service';
import { environment } from '../../../../../environments/environmentDev';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';


registerLocaleData(localeFr)


@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatToolbarModule, MatButtonModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [
    {
      provide: LOCALE_ID, useValue: 'fr'
    }
  ]
})
export class HomeComponent implements OnInit {
  num_simulations!: number;
  num_subscriptions!: number;
  num_subscriptions_papillon!: number;
  num_subscriptions_douby!: number;
  num_subscriptions_douyou!: number;
  num_subscriptions_toutourisquou!: number;
  num_subscriptions_by_month!: any[];
  num_subscriptions_by_user!: any[];

  constructor(
    private baseService: BaseService,
  ) { }
  ngOnInit(): void {
    this.loadSimulation();
    this.loadSubscriptions();
    this.loadSubscriptionByProduit();
    this.loadSubscriptionsByMonth();
    this.loadSubscriptionsByUser();
  }

  loadSimulation() {
    this.baseService.getAll(`${environment.endPoint.simulations.list}`).subscribe(
      response => {
        this.num_simulations = response.length
      }
    );
  }
  loadSubscriptions() {
    this.baseService.getAll(`${environment.endPoint.subscriptions.list}`).subscribe(
      response => {
        this.num_subscriptions = response.length
      }
    );
  }
  loadSubscriptionByProduit() {
    this.baseService.getAll(`${environment.endPoint.subscriptions.list}`).subscribe(
      response => {
        this.num_subscriptions_papillon = response.filter((item: any) => item.produit === 'Papillon').length
        this.num_subscriptions_douby = response.filter((item: any) => item.produit === 'Douby').length
        this.num_subscriptions_toutourisquou = response.filter((item: any) => item.produit === 'Toutourisquou').length
        this.num_subscriptions_douyou = response.filter((item: any) => item.produit === 'Douyou').length
      }
    );
  }

  loadSubscriptionsByUser() {
    this.baseService.getAll(`${environment.endPoint.subscriptions.list}`).subscribe(
      (response: any) => {
        const subscriptions = response;

        // Créer un tableau d'observables pour récupérer les détails de chaque utilisateur
        const userRequests = subscriptions.map((subscription: any) =>
          this.getUserDetails(subscription.user).pipe(
            map((user: any) => ({
              user: user,
              subscriptionId: subscription.id
            }))
          )
        );

        forkJoin(userRequests).subscribe((userData: any) => {
          const subscriptionsByUser: { [key: string]: number } = {};

          userData.forEach((data: any) => {
            const user = data.user.username;
            if (user) {
              subscriptionsByUser[user] = (subscriptionsByUser[user] || 0) + 1;
            }
          });

          // Mise à jour de la liste des souscriptions par utilisateur
          this.num_subscriptions_by_user = Object.entries(subscriptionsByUser).map(([user, count]) => ({
            user,
            count
          }));
        });
      }
    );
  }


  loadSubscriptionsByMonth() {
    this.baseService.getAll(`${environment.endPoint.subscriptions.list}`).subscribe(
      (response: any) => {
        const subscriptions = response;

        const subscriptionsByMonth: { [key: string]: number } = {};

        subscriptions.forEach((subscription: any) => {
          const date = new Date(subscription.date_souscription);
          const month = date.getMonth();
          const year = date.getFullYear();

          const monthYearKey = `${year}-${month + 1}`;

          if (!subscriptionsByMonth[monthYearKey]) {
            subscriptionsByMonth[monthYearKey] = 0;
          }

          subscriptionsByMonth[monthYearKey]++;
        });

        this.num_subscriptions_by_month = Object.keys(subscriptionsByMonth).map(key => {
          return {
            monthYear: key,
            count: subscriptionsByMonth[key]
          };
        });
      },
    );
  }
  getUserDetails(user: number) {
    return this.baseService.getOne(`${environment.endPoint.users.retrieve}`, user);
  }
}
