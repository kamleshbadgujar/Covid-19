import { covid19Data } from 'src/assets/json/covid19Data.json';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TableModule } from 'primeng/table';
import { HomeService } from './home.service';
import { Observable, Subscription, of, BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import { Covid19Data, DistrictData, StateWiseCases } from './home.interface';

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
  public paginator = {
    enable: false,
    isResizable: true,
    size: 0,
    isLazyEnabled: true,
    isLoading: false
  };
  constructor(private homeService: HomeService) { }

  ngOnInit(): void {
    this.gridColumns = this.homeService.getGridColumns();
    this.treeTableColumns = this.homeService.getTreeTableColumns();
    this.getCovidData();
    this.getDistrictWiseData();
  }

  public getCovidData() {
    this.paginator.isLoading = true;
    this.homeService.getCovid19Data().subscribe((data: Covid19Data) => {
      if (data !== null) {
        this.paginator.isLoading = false;
        this.covid19Data = data.statewise;
        [this.covid19Data[0], this.covid19Data[this.covid19Data.length - 1]] =
        [this.covid19Data[this.covid19Data.length - 1], this.covid19Data[0]];
        this.lastUpdatedOn();
        this.covid19DisplayData = this.covid19Data.filter((cases: StateWiseCases) => {
            return (parseInt(cases.confirmed, 10) !== 0);
        });
      }
    }, (error) => {
      this.paginator.isLoading = false;
      console.log(error);
    });
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
  this.lastUpdatedDate = moment(this.covid19Data[0].lastupdatedtime, 'DD/MM/YYYY, h:mm:ss a').format('Do MMMM YYYY, h:mm:ss a');
  }

  onLazyLoad($event) {

  }

}
