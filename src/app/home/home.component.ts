import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HomeService } from './home.service';
import * as moment from 'moment';
import { Covid19Data, DistrictData, StateWiseCases, CasesData, TestingData } from './home.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class HomeComponent implements OnInit {

  public POPULATION = 1377122402;

  /* colums */
  public gridColumns: any;
  public treeTableColumns: any;

   /* Data Variables */
  public covid19Data: any;
  public covid19DisplayData: any;
  public districtWiseData: any;
  public lastUpdatedDate: string;
  public transformedDistrictWiseData: Array<DistrictData> = [];

  /* CSS Related Variables */
  public lineChartData: any;
  public chartData: Array<CasesData>;
  public barChartData: Array<TestingData>;
  public barChartDisplayData: any;
  public barChartOptions: any;
  public customBarTooltips: any;
  public dailyConfirmedChart: any;
  public dailyConfirmedChartDisplayData: any;
  public dailyConfirmedChartOptions: any;
  public customDailyConfirmedTooltips: any;
  public innerWidth: number;
  public options: any;
  public colors: {};
  public customTooltips: any;
  @ViewChild('lineChart') lineChart: any;
  @ViewChild('barChart') barChart: any;
  @ViewChild('dailyConfirmedBarChart') dailyConfirmedBarChart: any;
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

  /**
   * Initializes and sets CSS for charts
   */
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
        display: true,
        text: 'CUMULATIVE CONFIRMED CASES',
        fontSize: 12,
        position: 'left'
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

    this.barChartDisplayData = {
      labels: [],
      datasets: [
        {
          label: 'Tested per million',
          fill: false,
          borderColor: '#D35400',
          backgroundColor: '#D35400',
          data: [],
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#D35400'
        }
      ]
    };

    this.barChartOptions = {
      title: {
        display: true,
        text: 'SAMLES TESTED PER MILLION',
        fontSize: 12,
        position: 'left'
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
            custom: this.customBarTooltips,
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

    this.dailyConfirmedChartDisplayData = {
      labels: [],
      datasets: [
        {
          label: 'Daily Confirmed Cases',
          fill: false,
          borderColor: '#D35400',
          backgroundColor: '#D35400',
          data: [],
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#D35400'
        }
      ]
    };

    this.dailyConfirmedChartOptions = {
      title: {
        display: true,
        text: 'DAILY CONFIRMED CASES',
        fontSize: 12,
        position: 'left'
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
            custom: this.customDailyConfirmedTooltips,
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

  /**
   * API call to get data.
   */
  public getCovidData(): void {
    this.paginator.isLoading = true;
    this.homeService.getCovid19Data().subscribe((data: Covid19Data) => {
      if (data !== null) {
        this.paginator.isLoading = false;
        this.covid19Data = data.statewise;
        this.chartData = data.cases_time_series;
        this.barChartData = data.tested;
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

  /**
   * Prepares Data for Line Chart.
   */
  prepareChartsData(): void {
    if (this.chartData && this.chartData.length > 0) {
      const tempData = this.chartData.slice(this.chartData.length - 41, this.chartData.length);
      tempData.forEach((element, index) => {
        this.lineChartData.labels.push(element.date);
        this.lineChartData.datasets[0].data.push(parseInt(element.totalconfirmed, 10));
      });
      this.lineChart.refresh();
    }

    if (this.barChartData && this.barChartData.length > 0) {
      const tempData = this.barChartData.slice(this.barChartData.length - 31, this.barChartData.length);
      tempData.forEach((element, index) => {
        if (element.totalpositivecases !== null && element.totalpositivecases !== '' &&
          element.totalsamplestested !== null && element.totalsamplestested !== '') {
          const positiveTested = parseInt(element.totalpositivecases, 10);
          const totalTested = parseInt(element.totalsamplestested, 10);
          const testedPerMillion = ((1000000 * totalTested) / this.POPULATION);
          this.barChartDisplayData.labels.push(moment(element.updatetimestamp, 'DD/MM/YYYY, h:mm:ss a').format('Do MMMM'));
          this.barChartDisplayData.datasets[0].data.push(parseFloat(testedPerMillion.toFixed(2)));
        }
      });
      this.barChart.refresh();
    }

    if (this.chartData && this.chartData.length > 0) {
      const tempData = this.chartData.slice(this.chartData.length - 41, this.chartData.length);
      tempData.forEach((element, index) => {
        this.dailyConfirmedChartDisplayData.labels.push(element.date);
        this.dailyConfirmedChartDisplayData.datasets[0].data.push(parseInt(element.dailyconfirmed, 10));
      });
      this.dailyConfirmedBarChart.refresh();
    }
  }

  /**
   * API call to get district wise data.
   */
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

  /**
   *
   * @param districtWiseData districtwiseData got from API call
   * Transforms API data.
   */
  transformDistrictWiseData(districtWiseData): void {
    for (const [key, value] of Object.entries(districtWiseData)) {
      for (const [key1, value1] of Object.entries(value)) {
        for (const [key2, value2] of Object.entries(value1)) {
          this.transformedDistrictWiseData.push({ state: key, district: key2, confirmed: value2['confirmed'] });
        }
      }
    }
  }

  /**
   * To set last updated on date.
   */
  lastUpdatedOn(): void {
    this.lastUpdatedDate = moment(this.covid19Data[this.covid19Data.length - 1].lastupdatedtime, 'DD/MM/YYYY, h:mm:ss a').format('Do MMMM YYYY, h:mm:ss a');
  }

  /**
   * Custom tooltip for Line Chart.
   */
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
    tooltipEl.style['margin-left'] = '37px';
    tooltipEl.style.color = '#D35400';
    tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
    tooltipEl.style.fontSize = '15px';
    tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
    tooltipEl.style.padding = tooltip.yPadding +
    'px ' +
    tooltip.xPadding +
    'px';
  };

    this.customBarTooltips = function(tooltip) {
    // Tooltip Element
    let tooltipEl = document.getElementById('chartjs-tooltip-bar');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.classList.add('create-box');
      tooltipEl.id = 'chartjs-tooltip-bar';
      tooltipEl.innerHTML = '<table></table>';
      this._chart.canvas.parentNode.appendChild(tooltipEl);
    }
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
    tooltipEl.style['margin-left'] = '37px';
    tooltipEl.style.color = '#D35400';
    tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
    tooltipEl.style.fontSize = '15px';
    tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
    tooltipEl.style.padding = tooltip.yPadding +
    'px ' +
    tooltip.xPadding +
    'px';
  };

    this.customDailyConfirmedTooltips = function(tooltip) {
    // Tooltip Element
    let tooltipEl = document.getElementById('chartjs-tooltip-bar-daily-confirmed');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.classList.add('create-box');
      tooltipEl.id = 'chartjs-tooltip-bar-daily-confirmed';
      tooltipEl.innerHTML = '<table></table>';
      this._chart.canvas.parentNode.appendChild(tooltipEl);
    }
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
    tooltipEl.style['margin-left'] = '37px';
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

}
