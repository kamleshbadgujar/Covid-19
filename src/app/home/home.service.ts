import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { covid19Data } from 'src/assets/json/covid19Data.json';
import { covid19DistrcitWiseData } from 'src/assets/json/covid19DistrictWiseData.json';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }

  public getGridColumns() {
    const columns = [
      {
        field: 'blank', header: '', mobileHeader: '', style: { width: '2%', 'text-align': 'right'}
      },
      {
        field: 'state', header: 'STATE/UT', mobileHeader: 'STATE/UT', style: { width: '80px', 'min-width': '30px', 'max-width': '100px'}
      },
      {
        field: 'confirmed', header: 'CONFIRMED', mobileHeader: 'CNFM', style: { width: '50px', 'min-width': '10px', 'max-width': '100px'}
      },
      {
        field: 'active', header: 'ACTIVE', mobileHeader: 'ACTV', style: { width: '50px', 'min-width': '10px', 'max-width': '100px'}
      },
      {
        field: 'recovered', header: 'RECOVERED', mobileHeader: 'RCVD', style: { width: '50px', 'min-width': '10px', 'max-width': '100px'}
      },
      {
        field: 'deaths', header: 'DEATHS', mobileHeader: 'DTHS', style: { width: '50px', 'min-width': '10px', 'max-width': '100px'}
      },
    ];
    return columns;
  }

  public getTreeTableColumns() {
    const columns = [
      {
        field: 'district', header: 'DISTRICT', style: { width: '75px', 'min-width': '75px', 'max-width': '100px'}
      },
      {
        field: 'confirmed', header: 'CONFIRMED', style: { width: '75px', 'min-width': '75px', 'max-width': '100px'}
      }
    ];
    return columns;
  }

  public getCovid19Data() {
    return this.http.get('https://api.covid19india.org/data.json');
  }

  public getDistrictWiseData() {
    return this.http.get('https://api.covid19india.org/state_district_wise.json');
  }
}
