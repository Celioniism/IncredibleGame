import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamepageComponent } from './pages/gamepage/gamepage.component';
import { HomeComponent } from './shared/home/home.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'gamepage', component: GamepageComponent },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
