import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddCustomReportComponent } from '../components/general-reports/add-custom-report/add-custom-report.component';
import { GeneralReportsComponent } from '../components/general-reports/general-reports.component';


const routes: Routes = [
  { path: '', redirectTo: 'home/netvision/generalreports', pathMatch: 'full' },
  { path: 'home/netvision/generalreports', component: GeneralReportsComponent },
  { path: 'home/netvision/generalreports/addCustomReport', component: AddCustomReportComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
