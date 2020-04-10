import { covid19Data } from 'src/assets/json/covid19Data.json';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation, ViewChild, HostListener } from '@angular/core';
import { TableModule } from 'primeng/table';
import { HomeService } from './home.service';
import { Observable, Subscription, of, BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import { ChartModule } from 'primeng/chart';
import { Covid19Data, DistrictData, StateWiseCases, CasesData } from './home.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class HomeComponent implements OnInit {

  public gridColumns: any;
  public treeTableColumns: any;
  public covid19Data: any;
  public covid19DisplayData: any;
  public districtWiseData: any;
  public lastUpdatedDate: string;
  public transformedDistrictWiseData: Array<DistrictData> = [];
  public lineChartData: any;
  public chartData: Array<CasesData>;
  public innerWidth: number;
  public options: any;
  @ViewChild('lineChart') lineChart: any;
  public paginator = {
    enable: false,
    isResizable: true,
    size: 0,
    isLazyEnabled: true,
    isLoading: false
  };

  constructor(private homeService: HomeService) {
    this.innerWidth = window.innerWidth;
   }

  ngOnInit(): void {
    this.gridColumns = this.homeService.getGridColumns();
    this.treeTableColumns = this.homeService.getTreeTableColumns();
    this.initializeCharts();
    this.getCovidData();
    this.getDistrictWiseData();
  }

  initializeCharts(): void {
    this.lineChartData = {
      labels: [],
      datasets: [
        {
        label: 'Total Confirmed',
        fill: false,
        borderColor: '#4bc0c0',
        data: []
      }
    ]
  };
    this.options = {
      title: {
        display: false,
        text: 'My Title',
        fontSize: 16
    },
      legend: {
        display: false,
        position: 'bottom'
      }
    };
  }

  public getCovidData(): void {
    this.paginator.isLoading = true;
    this.homeService.getCovid19Data().subscribe((data: Covid19Data) => {
      if (data !== null) {
        this.paginator.isLoading = false;
        this.covid19Data = data.statewise;
        this.chartData = data.cases_time_series;
        [this.covid19Data[0], this.covid19Data[this.covid19Data.length - 1]] =
        [this.covid19Data[this.covid19Data.length - 1], this.covid19Data[0]];
        this.lastUpdatedOn();
        this.prepareChartsData();
        this.covid19DisplayData = this.covid19Data.filter((cases: StateWiseCases) => {
            return (parseInt(cases.confirmed, 10) !== 0);
        });
      }
    }, (error) => {
      this.paginator.isLoading = false;
      console.log(error);
    });
  }

  prepareChartsData() {
    if (this.chartData && this.chartData.length > 0) {
      const tempData = this.chartData.slice(this.chartData.length - 31, this.chartData.length);
      tempData.forEach(element => {
        this.lineChartData.labels.push(element.date);
        this.lineChartData.datasets[0].data.push(parseInt(element.totalconfirmed, 10));
      });
      this.lineChart.refresh();
      if (this.innerWidth <= 475) {
        this.lineChart.chart.height = 170;
      }
    }
  }

  public getDistrictWiseData() {
    this.paginator.isLoading = true;
    this.homeService.getDistrictWiseData().subscribe((data) => {
      if (data !== null) {
        this.paginator.isLoading = false;
        this.districtWiseData = data;
        this.transformDistrictWiseData(this.districtWiseData);
      }
    }, (error) => {
      this.paginator.isLoading = false;
      console.log(error);
    });
  }

  transformDistrictWiseData(districtWiseData) {
    for (const [key, value] of Object.entries(districtWiseData)) {
      for (const [key1, value1] of Object.entries(value)) {
        for (const [key2, value2] of Object.entries(value1)) {
          this.transformedDistrictWiseData.push({ state: key, district: key2, confirmed: value2['confirmed'] });
        }
      }
    }
  }

  lastUpdatedOn() {
  this.lastUpdatedDate = moment(this.covid19Data[this.covid19Data.length - 1].lastupdatedtime, 'DD/MM/YYYY, h:mm:ss a').format('Do MMMM YYYY, h:mm:ss a');
  }

  onLazyLoad($event) {

  }

}
