import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { HomeService } from './home.service';
import { Observable, Subscription, of, BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  public gridColumns: any;
  public treeTableColumns: any;
  public covid19Data: any;
  public covid19DisplayData: any;
  public districtWiseData: any;
  public lastUpdatedDate: string;
  public transformedDistrictWiseData = [];
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
    this.homeService.getCovid19Data().subscribe((data) => {
      if (data !== null) {
        this.covid19Data = data['statewise'];
        this.lastUpdatedOn();
        this.covid19DisplayData = this.covid19Data.splice(1, this.covid19Data.length - 1);
      }
    }, (error) => {
      console.log(error);
    });
  }

  public getDistrictWiseData() {
    this.homeService.getDistrictWiseData().subscribe((data) => {
      if (data !== null) {
        this.districtWiseData = data;
        this.transformDistrictWiseData(this.districtWiseData);
      }
    }, (error) => {
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
