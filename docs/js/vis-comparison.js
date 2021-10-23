Promise.all([
    d3.csv("./resources/ti10_fantasy_points.csv"),
    d3.csv("./resources/pre_ti10_fantasy_points.csv"),
  ])
  .then(function(rawData) {
    const ti10Data = rawData[0];
    const preData = rawData[1];

    // Initialize the canvas -------------------------------------------------------------------------------------------
    const canvasWidth = 1000;
    const canvasHeight = 500;

    const topPadding = 25;
    const rightPadding = 5;
    const bottomPadding = 50;
    const leftPadding = 50;

    const plotPadding = 5;

    d3.select("#vis-comparison")
      .append("svg")
      .attr("preserveAspectRatio", "xMidYMin meet")
      .attr("viewBox", [0, 0, canvasWidth, canvasHeight])
      .style("max-height", "100vh")
      .style("max-width", "100vw")
      .append("g")

    const svg = d3.select("#vis-comparison")
      .select("svg")

    const chartGroup = d3.select("#vis-comparison")
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
      .text("TI10 average fantasy points earned")
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
      .text("Pre-TI10 average fantasy points earned")
      .attr(
        "transform",
        "translate(" + (canvasWidth - leftPadding - rightPadding) / 2 + "," + (canvasHeight - bottomPadding + 50) + ")"
      )
      .style("text-anchor", "middle")
      .style("alignment-baseline", "text-after-edge")
      .style("font-size", axisTitleFontSize);

    // Render the legend -------------------------------------------------------------------------------------------
    const legendFontSize = 14;
    const legendItemSpacing = 25;
    const dimension = 20

    const legendGroup = svg.append("g")
      .attr("transform", "translate(" + (canvasWidth - rightPadding - 200) + ", 0)");

    legendGroup.append("line")
      .attr("x1", 0)
      .attr("x2", dimension)
      .attr("y1", dimension / 2)
      .attr("y2", dimension / 2)
      .style("stroke", "black")
      .style("stroke-width", 1);

    legendGroup.append("text")
      .text("Identity line (TI10 = Pre-TI10)")
      .attr("x", dimension + 4)
      .attr("y", dimension / 2)
      .style("text-anchor", "start")
      .style("alignment-baseline", "central")
      .style("font-size", legendFontSize);

    // Update the chart ------------------------------------------------------------------------------------------------
    var renderChart = function(filterPosition, filterOutcome) {
      // Filter the data
      let filteredTi10Data = ti10Data;
      let filteredPreData = preData;
      if (filterPosition != "all") {
        filteredTi10Data = filteredTi10Data.filter(d => d.position.toLowerCase() == filterPosition);
        filteredPreData = filteredPreData.filter(d => d.position.toLowerCase() == filterPosition);
      }
      if (filterOutcome != "all") {
        filteredTi10Data = filteredTi10Data.filter(d => d.outcome.toLowerCase() == filterOutcome);
      }

      const relevantTi10Data = d3.rollup(filteredTi10Data, g => d3.mean(g, d => d.total), d => d.player_name);
      const relevantPreData = new Map;
      filteredPreData.forEach(function(d) {
        relevantPreData.set(d.player_name, Number(d[filterOutcome]))
      });
      const relevantData = new Map;
      d3.map(filteredTi10Data, d => d.player_name).forEach(function(d) {
        const value = new Map;
        value.set("Pre-TI10", relevantPreData.get(d));
        value.set("TI10", relevantTi10Data.get(d));
        relevantData.set(d, value);
      });

      // Draw the axes
      const allValues = d3.map(relevantData, d => d[1].get("Pre-TI10"))
        .concat(d3.map(relevantData, d => d[1].get("TI10")))
      xScale.domain(d3.extent(d3.map(relevantData, d => d[1].get("Pre-TI10"))));
      yScale.domain(d3.extent(d3.map(relevantData, d => d[1].get("TI10"))));

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
          .attr("cx", d => xScale(d[1].get("Pre-TI10")) + canvasWidth - leftPadding - rightPadding)
          .attr("cy", d => yScale(d[1].get("TI10")))
          .attr("r", 4)
          .attr("fill", "#be64ac")
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
        .attr("title", d => "<b>" + d[0] + "</b><br>" + Number(d[1].get("TI10")).toFixed(2) + " (TI10)</b><br>" +
          Number(d[1].get("Pre-TI10")).toFixed(2) + " (Pre-TI10)")
        .transition()
        .duration(750)
        .attr("cx", d => xScale(d[1].get("Pre-TI10")))
        .attr("cy", d => yScale(d[1].get("TI10")))
        .style("opacity", 0.75);

      // Update the y=x line
      if (chartGroup.select("line").empty()) {
        chartGroup.append("line")
          .attr("x1", leftPadding + plotPadding)
          .attr("x2", canvasWidth - rightPadding)
          .attr("y1", canvasHeight - bottomPadding - plotPadding)
          .attr("y2", topPadding);
      }
      chartGroup.select("line")
        .transition()
        .duration(750)
        .attr(
          "x1",
          xScale(Math.max(d3.min(relevantData, d => d[1].get("TI10")), d3.min(relevantData, d => d[1].get("Pre-TI10"))))
        )
        .attr(
          "x2",
          xScale(Math.min(d3.max(relevantData, d => d[1].get("TI10")), d3.max(relevantData, d => d[1].get("Pre-TI10"))))
        )
        .attr(
          "y1",
          yScale(Math.max(d3.min(relevantData, d => d[1].get("TI10")), d3.min(relevantData, d => d[1].get("Pre-TI10"))))
        )
        .attr(
          "y2",
          yScale(Math.min(d3.max(relevantData, d => d[1].get("TI10")), d3.max(relevantData, d => d[1].get("Pre-TI10"))))
        )
        .style("stroke", "black")
        .style("stroke-width", 1);

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
    renderChart("all", "all");

    // Define button behaviour -----------------------------------------------------------------------------------------
    d3.select("#vis-comparison .btn-filter-position")
      .selectAll("button")
      .on("click", function() {
        d3.select("#vis-comparison .btn-filter-position").selectAll("button").classed("active", false);
        d3.select(this).classed("active", true);
        renderChart(
          filterPosition = d3.select("#vis-comparison .btn-filter-position .active").attr("d"),
          filterOutcome = d3.select("#vis-comparison .btn-filter-outcome .active").attr("d")
        );
      });

    d3.select("#vis-comparison .btn-filter-outcome")
      .selectAll("button")
      .on("click", function() {
        d3.select("#vis-comparison .btn-filter-outcome").selectAll("button").classed("active", false);
        d3.select(this).classed("active", true);
        renderChart(
          filterPosition = d3.select("#vis-comparison .btn-filter-position .active").attr("d"),
          filterOutcome = d3.select("#vis-comparison .btn-filter-outcome .active").attr("d")
        );
      });

    d3.select("#vis-comparison .btn-filter-indicator")
      .selectAll("button")
      .on("click", function() {
        d3.select("#vis-comparison .btn-filter-indicator").selectAll("button").classed("active", false);
        d3.select(this).classed("active", true);
        renderChart(
          filterPosition = d3.select("#vis-comparison .btn-filter-position .active").attr("d"),
          filterOutcome = d3.select("#vis-comparison .btn-filter-outcome .active").attr("d")
        );
      });

    // Define navbar behaviour
    d3.select("#navbar .btn-vis-comparison")
      .on("click", function() {
        if (!d3.select(this).classed("active")) {
          d3.select("#navbar").selectAll("button").classed("active", false);
          d3.select(this).classed("active", true);
          d3.selectAll(".visualization").style("display", "none");
          d3.select("#" + d3.select(this).attr("d")).style("display", "block");
          d3.selectAll("svg").select("g").selectAll("*").remove();
          renderChart(
            filterPosition = d3.select("#vis-comparison .btn-filter-position .active").attr("d"),
            filterOutcome = d3.select("#vis-comparison .btn-filter-outcome .active").attr("d")
          );
        }
      })
  })
