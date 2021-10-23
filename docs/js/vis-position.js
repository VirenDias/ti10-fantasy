d3.csv("./resources/ti10_fantasy_points.csv")
  .then(function(rawData) {
    // Initialize the canvas -------------------------------------------------------------------------------------------
    const canvasWidth = 1000;
    const canvasHeight = 500;

    const topPadding = 25;
    const rightPadding = 5;
    const bottomPadding = 50;
    const leftPadding = 50;

    const plotPadding = 5;

    d3.select("#vis-position")
      .append("svg")
      .attr("preserveAspectRatio", "xMidYMin meet")
      .attr("viewBox", [0, 0, canvasWidth, canvasHeight])
      .style("max-height", "100vh")
      .style("max-width", "100vw")
      .append("g")

    const svg = d3.select("#vis-position")
      .select("svg")

    const chartGroup = d3.select("#vis-position")
      .select("svg")
      .select("g")

    // Plot the chart --------------------------------------------------------------------------------------------------
    const relevantData = d3.rollup(rawData, g => d3.mean(g, d => d.total), d => d.position, d => d.outcome);
    relevantData.forEach(function(value, key) {
      value.set("All Games", d3.mean(rawData.filter(d => d.position == key), d => d.total));
      value.set("Wins", value.get("Win"));
      value.set("Losses", value.get("Loss"));
      value.delete("Win");
      value.delete("Loss");
    });

    const xScale = d3.scaleBand()
      .domain(["Carry", "Mid", "Off", "Soft Support", "Hard Support"])
      .rangeRound([leftPadding, canvasWidth - rightPadding])
      .padding(0.2);
    const xSubScale = d3.scaleBand()
      .domain(["All Games", "Wins", "Losses"])
      .rangeRound([0, xScale.bandwidth()])
      .padding(0.2);

    const yMax = Math.max(
      d3.max(relevantData, d => d[1].get("All Games")),
      d3.max(relevantData, d => d[1].get("Wins")),
      d3.max(relevantData, d => d[1].get("Losses"))
    )
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .rangeRound([canvasHeight - bottomPadding, topPadding]);
    const yHeight = d3.scaleLinear()
      .domain([0, yMax])
      .rangeRound([0, canvasHeight - topPadding - bottomPadding])

    function renderChart() {
      chartGroup.selectAll("g")
        .data(relevantData)
        .enter()
        .append("g")
        .attr("transform", d => "translate(" + (xScale(d[0]) + canvasWidth - leftPadding - rightPadding) + ", 0)")
        .style("opacity", 0)
        .transition()
        .duration(750)
        .attr("transform", d => "translate(" + xScale(d[0]) + ", 0)")
        .style("opacity", 1);

      chartGroup.selectAll("g")
        .selectAll("rect")
        .data(d => d[1])
        .enter()
        .append("rect")
        .attr("data-bs-toggle", "tooltip")
        .attr("data-bs-html", "true")
        .attr("title", d => "<b>" + d[0] + "</b><br>" + d[1].toFixed(2))
        .attr("x", d => xSubScale(d[0]))
        .attr("y", d => yScale(d[1]))
        .attr("width", xSubScale.bandwidth())
        .attr("height", d => yHeight(d[1]))
        .attr("fill", function(d) {
          switch (d[0]) {
            case "All Games":
              return "#3b4994";
            case "Wins":
              return "#5ac8c8";
            case "Losses":
              return "#be64ac"
          }
        });
    }
    renderChart();

    // Render the axes -------------------------------------------------------------------------------------------------
    const axisTitleFontSize = 14;
    const axisFontSize = 12;

    const yAxis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + (leftPadding - plotPadding) + ", 0)");
    yAxis.transition()
      .duration(750)
      .call(d3.axisLeft(yScale).tickSize(5));
    yAxis.selectAll("text")
      .style("font-size", axisFontSize);
    yAxis.selectAll("path, line")
      .style("stroke-width", 1);

    const yLabel = svg.append("text")
      .text("Average fantasy points earned")
      .attr(
        "transform",
        "translate(" + (leftPadding - 35) + "," + (topPadding + (canvasHeight - topPadding - bottomPadding) / 2) +
        ") rotate(-90)"
      )
      .style("text-anchor", "middle")
      .style("alignment-baseline", "text-after-edge")
      .style("font-size", axisTitleFontSize);


    const xAxis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0, " + (canvasHeight - bottomPadding + plotPadding) + ")");
    xAxis.transition()
      .duration(750)
      .call(d3.axisBottom(xScale).tickSize(0));
    xAxis.selectAll("text")
      .style("font-size", axisFontSize);
    xAxis.selectAll("path, line")
      .style("stroke", "none");

    // Render the legend -------------------------------------------------------------------------------------------
    const legendFontSize = 14;
    const legendItemSpacing = 25;
    const dimension = 20

    const legendGroup = svg.append("g")
      .attr("transform", "translate(" + (canvasWidth - rightPadding - 135) + ", 0)");

    legendGroup.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", dimension)
      .attr("height", dimension)
      .style("fill", "#3b4994");

    legendGroup.append("text")
      .text("All Games")
      .attr("x", dimension + 4)
      .attr("y", dimension / 2)
      .style("text-anchor", "start")
      .style("alignment-baseline", "central")
      .style("font-size", legendFontSize);

    legendGroup.append("rect")
      .attr("x", 0)
      .attr("y", legendItemSpacing)
      .attr("width", dimension)
      .attr("height", dimension)
      .style("fill", "#5ac8c8");

    legendGroup.append("text")
      .text("Wins")
      .attr("x", dimension + 4)
      .attr("y", legendItemSpacing + dimension / 2)
      .style("text-anchor", "start")
      .style("alignment-baseline", "central")
      .style("font-size", legendFontSize);

    legendGroup.append("rect")
      .attr("x", 0)
      .attr("y", 2 * legendItemSpacing)
      .attr("width", dimension)
      .attr("height", dimension)
      .style("fill", "#be64ac");

    legendGroup.append("text")
      .text("Losses")
      .attr("x", dimension + 4)
      .attr("y", 2 * legendItemSpacing + dimension / 2)
      .style("text-anchor", "start")
      .style("alignment-baseline", "central")
      .style("font-size", legendFontSize);

    // Activate tooltips -----------------------------------------------------------------------------------------------
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    // Define mouseover behaviour --------------------------------------------------------------------------------------
    chartGroup.selectAll("rect")
      .on("mouseover", function() {
        d3.select(this)
          .style("fill", d3.color(d3.select(this).attr("fill")).brighter(1));
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("fill", d3.color(d3.select(this).attr("fill")));
      })

    // Define navbar behaviour
    d3.select("#navbar .btn-vis-position")
      .on("click", function() {
        if (!d3.select(this).classed("active")) {
          d3.select("#navbar").selectAll("button").classed("active", false);
          d3.select(this).classed("active", true);
          d3.selectAll(".visualization").style("display", "none");
          d3.select("#" + d3.select(this).attr("d")).style("display", "block");
          d3.selectAll("svg").select("g").selectAll("*").remove();
          renderChart();
        }
      })
  })
