/*  sales overview chart */
var options = {
    series: [
      {
        name: "Income",
        data: [85, 65, 75, 38, 85, 35, 62],
      },
      {
        name: "Expenses",
        data: [20, 38, 38, 72, 55, 63, 43],
      },
    ],
    chart: {
      animations: {
        enabled: false,
      },
      height: 300,
      type: "bar",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        endingShape: "rounded",
        borderRadius: 0,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    stroke: {
      show: true,
      width: 3,
      colors: ["transparent"],
    },
    grid: {
      borderColor: "rgba(107 ,114 ,128,0.1)",
    },
    colors: ["rgb(90,102,241)", "rgb(79, 183, 227)"],
    yaxis: {
      title: {
        style: {
          color: "#adb5be",
          fontSize: "14px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          cssClass: "apexcharts-yaxis-label",
        },
      },
      labels: {
        style: {
          colors: "rgb(107 ,114 ,128)",
          fontSize: "12px",
        },
        formatter: function (y) {
          return y.toFixed(0) + "";
        },
      },
    },
    xaxis: {
      type: "month",
      categories: [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
      ],
      axisBorder: {
        show: true,
        color: "rgba(119, 119, 142, 0.05)",
        offsetX: 0,
        offsetY: 0,
      },
      axisTicks: {
        show: true,
        borderType: "solid",
        color: "rgba(119, 119, 142, 0.05)",
        width: 6,
        offsetX: 0,
        offsetY: 0,
      },
      labels: {
        rotate: -90,
        style: {
          colors: "rgb(107 ,114 ,128)",
          fontSize: "12px",
        },
      },
    },
  };
  var chart = new ApexCharts(document.querySelector("#salesOverview"), options);
  chart.render();
  function salesOverview() {
    chart.updateOptions({
        colors: ["rgb(79, 183, 227)" , `rgb(${myVarVal})`],
    });
  }

/* TargetDate Picker */
flatpickr("#targetDate", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
});
/* TargetDate Picker */
flatpickr("#targetDate1", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
});