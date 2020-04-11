import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HomeService } from './home.service';
import * as moment from 'moment';
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
  public colors: {};
  public customTooltips: any;
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
    this.buildCustomTooltip();
    this.lineChartData = {
      labels: [],
      datasets: [
        {
          label: 'Total Confirmed',
          fill: false,
          borderColor: '#D35400',
          data: [],
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#D35400'
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
      },
      hover: {
        intersect: false
      },
      tooltips: {
        enabled: false,
            mode: 'x-axis',
            position: 'nearest',
            custom: this.customTooltips,
      },
      scales: {
        xAxes: [{
          gridLines: { display: false },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 6
          }
        }],
        yAxes: [{
          gridLines: { display: true },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 6
          },
          position: 'right'
        }]
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

  prepareChartsData(): void {
    if (this.chartData && this.chartData.length > 0) {
      const tempData = this.chartData.slice(this.chartData.length - 31, this.chartData.length);
      tempData.forEach((element, index) => {
        this.lineChartData.labels.push(element.date);
        this.lineChartData.datasets[0].data.push(parseInt(element.totalconfirmed, 10));
      });
      this.lineChart.refresh();
      if (this.innerWidth <= 475) {
        this.lineChart.chart.height = 170;
      }
    }
  }

  public getDistrictWiseData(): void {
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

  transformDistrictWiseData(districtWiseData): void {
    for (const [key, value] of Object.entries(districtWiseData)) {
      for (const [key1, value1] of Object.entries(value)) {
        for (const [key2, value2] of Object.entries(value1)) {
          this.transformedDistrictWiseData.push({ state: key, district: key2, confirmed: value2['confirmed'] });
        }
      }
    }
  }

  lastUpdatedOn(): void {
    this.lastUpdatedDate = moment(this.covid19Data[this.covid19Data.length - 1].lastupdatedtime, 'DD/MM/YYYY, h:mm:ss a').format('Do MMMM YYYY, h:mm:ss a');
  }

  buildCustomTooltip(): void {
    this.customTooltips = function(tooltip) {
    // Tooltip Element
    let tooltipEl = document.getElementById('chartjs-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.classList.add('create-box');
      tooltipEl.id = 'chartjs-tooltip';
      tooltipEl.innerHTML = '<table></table>';
      this._chart.canvas.parentNode.appendChild(tooltipEl);
    }
    // Hide if no tooltip
    // if (tooltip.opacity === 0) {
    //   tooltipEl.style.opacity = 0 as any;
    //   return;
    // }
    // Set caret Position
    tooltipEl.classList.remove('above', 'below', 'no-transform');
    if (tooltip.yAlign) {
      tooltipEl.classList.add(tooltip.yAlign);
    } else {
      tooltipEl.classList.add('no-transform');
    }
    function getBody(bodyItem) {
      return bodyItem.lines;
    }
    // Set Text
    if (tooltip.body) {
      const titleLines = tooltip.title || [];
      const bodyLines = tooltip.body.map(getBody);
      let innerHtml = '<thead>';
      titleLines.forEach((title) => {
        innerHtml += '<tr><th>' + title + '</th></tr>';
      });
      innerHtml += '</thead><tbody>';
      bodyLines.forEach((body, i) => {
        const colors = tooltip.labelColors[i];
        let style = 'background:' + colors.backgroundColor;
        style += '; border-color:' + colors.borderColor;
        style += '; border-width: 2px';
        const span = '<span class="chartjs-tooltip-key" style="' +
        style +
        '"></span>';
        innerHtml += '<tr><td>' + span + body + '</td></tr>';
        console.log(bodyLines);
      });
      innerHtml += '</tbody>';
      const tableRoot = tooltipEl.querySelector('table');
      tableRoot.innerHTML = innerHtml;
    }
    const positionY = this._chart.canvas.offsetTop;
    const positionX = this._chart.canvas.offsetLeft;
    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1 as any;
    tooltipEl.style.left = positionX + '6px';
    tooltipEl.style.top = positionY + '6px';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style['margin-left'] = '43px';
    tooltipEl.style.color = '#D35400';
    tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
    tooltipEl.style.fontSize = '15px';
    tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
    tooltipEl.style.padding = tooltip.yPadding +
    'px ' +
    tooltip.xPadding +
    'px';
  };
  }

  onLazyLoad($event) {

  }

}
