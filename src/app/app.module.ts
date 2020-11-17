import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './routes/app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GeneralReportsComponent } from './components/general-reports/general-reports.component';
import { GeneralReportChildComponent } from './components/general-reports/general-report-child/general-report-child.component';
import { AddCustomReportComponent } from './components/general-reports/add-custom-report/add-custom-report.component';
import { AccordionModule } from 'primeng/accordion';
import { LoaderComponent } from './components/loader/loader.component';
import { ChartModule } from 'angular-highcharts';
import { HighchartsService } from './services/highcharts.service';


import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeModule } from 'primeng/tree';
import { ContextMenuModule } from 'primeng/contextmenu';
import { StepsModule } from 'primeng/steps';
import { PanelModule } from 'primeng/panel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FieldsetModule } from 'primeng/fieldset';
import { CheckboxModule } from 'primeng/checkbox';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';


import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
  declarations: [
    AppComponent,
    GeneralReportsComponent,
    GeneralReportChildComponent,
    AddCustomReportComponent,
    LoaderComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ChartModule,

    // primeng
    AccordionModule,
    TreeModule,
    ContextMenuModule,
    StepsModule,
    PanelModule,
    SelectButtonModule,
    FieldsetModule,
    CheckboxModule,
    DropdownModule,
    ToolbarModule,
    MenuModule,
    DialogModule,
    RadioButtonModule,
    CalendarModule,
    TableModule,
    MultiSelectModule,
    TreeTableModule,

    // material
    MatSnackBarModule


  ],
  providers: [HighchartsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
