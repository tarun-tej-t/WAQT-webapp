TESTER = document.getElementById('myDiv');
Plotly.newPlot(TESTER, [{
    x: [0,200,1500, 3000, 4000],
    y: [0,90, 80,40, 100],
    type: 'scatter',
    mode:'markers'
  }], {
    images: [
        {
          "source": "https://raw.githubusercontent.com/tarun-tej-t/rutag-imgs/main/wilcox-empty.png",
          "xref": "x",
          "yref": "y",
          "x": -850,
          "y": 105,
          "sizex": 5400,
          "sizey": 125,
          "sizing": "stretch",
          "opacity": 0.9,
          "layer": "below"
        }
     
      ]
  })