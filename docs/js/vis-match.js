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

    d3.select("#vis-match")
      .append("svg")
      .attr("preserveAspectRatio", "xMidYMin meet")
      .attr("viewBox", [0, 0, canvasWidth, canvasHeight])
      .style("max-height", "100vh")
      .style("max-width", "100vw")
      .append("g")

    const svg = d3.select("#vis-match")
      .select("svg")

    const chartGroup = d3.select("#vis-match")
      .select("svg")
      .select("g")

    // Render the empty chart area and axes ----------------------------------------------------------------------------
    const xScale = d3.scaleLinear()
      .rangeRound([leftPadding, canvasWidth - rightPadding]);
    const yScale = d3.scaleLinear()
      .rangeRound([canvasHeight - bottomPadding, topPadding]);
    const yHeight = d3.scaleLinear()
      .rangeRound([0, canvasHeight - topPadding - bottomPadding])

    const axisTitleFontSize = 14;
    const axisFontSize = 12;
    const axisTickLength = 10;

    const yAxis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + (leftPadding - plotPadding) + ", 0)")

    const yLabel = svg.append("text")
      .text("Fantasy points earned")
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

    const xLabel = svg.append("text")
      .text("Match duration in minutes")
      .attr(
        "transform",
        "translate(" + (canvasWidth - leftPadding - rightPadding) / 2 + "," + (canvasHeight - bottomPadding + 50) + ")"
      )
      .style("text-anchor", "middle")
      .style("alignment-baseline", "text-after-edge")
      .style("font-size", axisTitleFontSize);

    // Update the chart ------------------------------------------------------------------------------------------------
    // var renderChart = function(filterPosition, filterOutcome, filterHero, filterIndicator) {
    var renderChart = function(filterPosition, filterOutcome, filterIndicator) {
      // Filter the data
      let filteredData = rawData;
      if (filterPosition != "all") {
        filteredData = filteredData.filter(d => d.position.toLowerCase() == filterPosition)
      }
      if (filterOutcome != "all") {
        filteredData = filteredData.filter(d => d.outcome.toLowerCase() == filterOutcome)
      }
      // if (filterHero.toLowerCase() != "all") {
      //   filteredData = filteredData.filter(d => d.hero_name == filterHero)
      // }
      const relevantData = filteredData;

      // Draw the axes
      xScale.domain(d3.extent(relevantData, d => Number(d.match_duration / 60)));
      yScale.domain(d3.extent(relevantData, d => Number(d[filterIndicator])));

      yAxis.transition()
        .duration(750)
        .call(d3.axisLeft(yScale).tickSize(5));
      yAxis.selectAll("text")
        .style("font-size", axisFontSize);
      yAxis.selectAll("path, line")
        .style("stroke-width", 1);

      xAxis.transition()
        .duration(750)
        .call(d3.axisBottom(xScale).tickSize(5));
      xAxis.selectAll("text")
        .style("font-size", axisFontSize);
      xAxis.selectAll("path, line")
        .style("stroke-width", 1);

      // Plot the chart
      chartGroup.selectAll("circle")
        .data(relevantData)
        .join(
          enter => enter.append("circle")
          .attr("cx", d => xScale(d.match_duration / 60) + canvasWidth - leftPadding - rightPadding)
          .attr("cy", d => yScale(d[filterIndicator]))
          .attr("r", 4)
          .attr("fill", "#5ac8c8")
          .style("opacity", 0),
          update => update,
          exit => exit.transition()
          .duration(750)
          .attr("transform", "translate(" + (canvasWidth - leftPadding - rightPadding) + ", 0)")
          .style("opacity", 0)
          .remove()
        )
        .attr("data-bs-toggle", "tooltip")
        .attr("data-bs-html", "true")
        .attr("title", d => "<b>" + d.player_name + " | " + d.hero_name + "</b><br>" +
          Number(d[filterIndicator]).toFixed(2))
        .transition()
        .duration(750)
        .attr("cx", d => xScale(d.match_duration / 60))
        .attr("cy", d => yScale(d[filterIndicator]))
        .style("opacity", 0.75);

      // Activate tooltips
      var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
      var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
      })

      // Define mouseover behaviour
      chartGroup.selectAll("circle")
        .on("mouseover", function() {
          d3.select(this)
            .style("fill", d3.color(d3.select(this).attr("fill")).brighter(1));
        })
        .on("mouseout", function() {
          d3.select(this)
            .style("fill", d3.color(d3.select(this).attr("fill")));
        })
    }
    // renderChart("carry", "all", "all", "total");
    renderChart("carry", "all", "total");

    // Add hero dropdown options
    // const heroList = new Set(rawData.map(d => d.hero_name));
    // d3.sort(heroList).forEach(function(d) {
    //   d3.select("#vis-match .btn-filter-hero ul")
    //     .append("li")
    //     .classed("dropdown-item", true)
    //     .html(d);
    // });

    // Define button behaviour -----------------------------------------------------------------------------------------
    d3.select("#vis-match .btn-filter-position")
      .selectAll("button")
      .on("click", function() {
        d3.select("#vis-match .btn-filter-position").selectAll("button").classed("active", false);
        d3.select(this).classed("active", true);
        renderChart(
          filterPosition = d3.select("#vis-match .btn-filter-position .active").attr("d"),
          filterOutcome = d3.select("#vis-match .btn-filter-outcome .active").attr("d"),
          // filterHero = d3.select("#vis-match .btn-filter-hero button").html(),
          filterIndicator = d3.select("#vis-match .btn-filter-indicator .active").attr("d")
        );
      });

    d3.select("#vis-match .btn-filter-outcome")
      .selectAll("button")
      .on("click", function() {
        d3.select("#vis-match .btn-filter-outcome").selectAll("button").classed("active", false);
        d3.select(this).classed("active", true);
        renderChart(
          filterPosition = d3.select("#vis-match .btn-filter-position .active").attr("d"),
          filterOutcome = d3.select("#vis-match .btn-filter-outcome .active").attr("d"),
          // filterHero = d3.select("#vis-match .btn-filter-hero button").html(),
          filterIndicator = d3.select("#vis-match .btn-filter-indicator .active").attr("d")
        );
      });

    // d3.select("#vis-match .btn-filter-hero")
    //   .selectAll("li")
    //   .on("click", function() {
    //     d3.select("#vis-match .btn-filter-hero").select("button").html(d3.select(this).html());
    //     renderChart(
    //       filterPosition = d3.select("#vis-match .btn-filter-position .active").attr("d"),
    //       filterOutcome = d3.select("#vis-match .btn-filter-outcome .active").attr("d"),
    //       filterHero = d3.select("#vis-match .btn-filter-hero button").html(),
    //       filterIndicator = d3.select("#vis-match .btn-filter-indicator .active").attr("d")
    //     );
    //   });

    d3.select("#vis-match .btn-filter-indicator")
      .selectAll("button")
      .on("click", function() {
        d3.select("#vis-match .btn-filter-indicator").selectAll("button").classed("active", false);
        d3.select(this).classed("active", true);
        renderChart(
          filterPosition = d3.select("#vis-match .btn-filter-position .active").attr("d"),
          filterOutcome = d3.select("#vis-match .btn-filter-outcome .active").attr("d"),
          // filterHero = d3.select("#vis-match .btn-filter-hero button").html(),
          filterIndicator = d3.select("#vis-match .btn-filter-indicator .active").attr("d")
        );
      });

    // Define navbar behaviour
    d3.select("#navbar .btn-vis-match")
      .on("click", function() {
        if(!d3.select(this).classed("active")) {
          d3.select("#navbar").selectAll("button").classed("active", false);
          d3.select(this).classed("active", true);
          d3.selectAll(".visualization").style("display", "none");
          d3.select("#" + d3.select(this).attr("d")).style("display", "block");
          d3.selectAll("svg").select("g").selectAll("*").remove();
          renderChart(
            filterPosition = d3.select("#vis-match .btn-filter-position .active").attr("d"),
            filterOutcome = d3.select("#vis-match .btn-filter-outcome .active").attr("d"),
            // filterHero = d3.select("#vis-match .btn-filter-hero button").html(),
            filterIndicator = d3.select("#vis-match .btn-filter-indicator .active").attr("d")
          );
        }
      })
  })
