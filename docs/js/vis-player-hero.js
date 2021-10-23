d3.csv("./resources/ti10_fantasy_points.csv")
  .then(function(rawData) {
    // Initialize the canvas -------------------------------------------------------------------------------------------
    const canvasWidth = 1000;
    const canvasHeight = 500;

    const topPadding = 25;
    const rightPadding = 5;
    const bottomPadding = 185;
    const leftPadding = 50;

    const plotPadding = 5;

    d3.select("#vis-player-hero")
      .append("svg")
      .attr("preserveAspectRatio", "xMidYMin meet")
      .attr("viewBox", [0, 0, canvasWidth, canvasHeight])
      .style("max-height", "100vh")
      .style("max-width", "100vw")
      .append("g")

    const svg = d3.select("#vis-player-hero")
      .select("svg")

    const chartGroup = d3.select("#vis-player-hero")
      .select("svg")
      .select("g")

    // Render the empty chart area and axes ----------------------------------------------------------------------------
    const xScale = d3.scaleBand()
      .rangeRound([leftPadding, canvasWidth - rightPadding])
      .padding(0.2);
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

    // Update the chart ------------------------------------------------------------------------------------------------
    var renderChart = function(filterPosition, sort) {
      // Filter the data
      let filteredData = rawData;
      if (filterPosition != "all") {
        if (filterPosition == "support") {
          filteredData = filteredData.filter(d => ["soft support", "hard support"].includes(d.position.toLowerCase()));
        } else {
          filteredData = filteredData.filter(d => d.position.toLowerCase() == filterPosition);
        }
      }

      const relevantData = d3.group(filteredData, d => d.player_name, d => d.hero_name);
      relevantData.forEach(function(value, key) {
        value.forEach(function(subValue, subKey) {
          if (subValue.length < 5) {
            value.delete(subKey);
          } else {
            value.set(subKey, d3.mean(subValue, d => d.total));
          }
        })
      });

      const flattenedData = new Map;
      relevantData.forEach(function(value, key) {
        if (value.size > 0) {
          value.forEach((subValue, subKey) => flattenedData.set(key + " | " + subKey, subValue));
        }
      })

      // Sort the data
      let sortedData = [];
      switch (sort) {
        case "name":
          sortedData = d3.sort(
            flattenedData,
            (a, b) => d3.ascending(a.toString().toLowerCase(), b.toString().toLowerCase())
          );
          break;
        case "value":
          sortedData = d3.sort(flattenedData, d => d[1]);
          break;
      }

      // Draw the axes
      xScale.domain(sortedData.map(d => d[0]));
      yScale.domain([0, d3.max(sortedData, d => d[1])]);
      yHeight.domain([0, d3.max(sortedData, d => d[1])]);

      yAxis.transition()
        .duration(750)
        .call(d3.axisLeft(yScale).tickSize(5));
      yAxis.selectAll("text")
        .style("font-size", axisFontSize);
      yAxis.selectAll("path, line")
        .style("stroke-width", 1);

      xAxis.transition()
        .duration(750)
        .call(d3.axisBottom(xScale).tickSize(0));
      xAxis.selectAll("text")
        .attr("transform", "rotate(-90) translate(0, -5)")
        .style("text-anchor", "end")
        .style("alignment-baseline", "text-after-edge")
        .style("font-size", axisFontSize);
      xAxis.selectAll("path, line")
        .style("stroke", "none");

      // Plot the chart
      chartGroup.selectAll("rect")
        .data(sortedData)
        .join(
          enter => enter.append("rect")
          .attr("x", d => xScale(d[0]) + canvasWidth - leftPadding - rightPadding)
          .attr("y", d => yScale(d[1]))
          .attr("width", xScale.bandwidth())
          .attr("height", d => yHeight(d[1]))
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
        .attr("title", d => "<b>" + d[0] + "</b><br>" + d[1].toFixed(2))
        .transition()
        .duration(750)
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => yHeight(d[1]))
        .style("opacity", 1);

      // Activate tooltips
      var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
      var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
      })

      // Define mouseover behaviour
      chartGroup.selectAll("rect")
        .on("mouseover", function() {
          d3.select(this)
            .style("fill", d3.color(d3.select(this).attr("fill")).brighter(1));
        })
        .on("mouseout", function() {
          d3.select(this)
            .style("fill", d3.color(d3.select(this).attr("fill")));
        })
    }
    renderChart("all", "name");

    // Define button behaviour -----------------------------------------------------------------------------------------
    d3.select("#vis-player-hero .btn-filter-position")
      .selectAll("button")
      .on("click", function() {
        d3.select("#vis-player-hero .btn-filter-position").selectAll("button").classed("active", false);
        d3.select(this).classed("active", true);
        renderChart(
          filterPosition = d3.select("#vis-player-hero .btn-filter-position .active").attr("d"),
          sort = d3.select("#vis-player-hero .btn-sort .active").attr("d")
        );
      });

    d3.select("#vis-player-hero .btn-sort")
      .selectAll("button")
      .on("click", function() {
        d3.select("#vis-player-hero .btn-sort").selectAll("button").classed("active", false);
        d3.select(this).classed("active", true);
        renderChart(
          filterPosition = d3.select("#vis-player-hero .btn-filter-position .active").attr("d"),
          sort = d3.select("#vis-player-hero .btn-sort .active").attr("d")
        );
      });

    // Define navbar behaviour
    d3.select("#navbar .btn-vis-player-hero")
      .on("click", function() {
        if (!d3.select(this).classed("active")) {
          d3.select("#navbar").selectAll("button").classed("active", false);
          d3.select(this).classed("active", true);
          d3.selectAll(".visualization").style("display", "none");
          d3.select("#" + d3.select(this).attr("d")).style("display", "block");
          d3.selectAll("svg").select("g").selectAll("*").remove();
          renderChart(
            filterPosition = d3.select("#vis-player-hero .btn-filter-position .active").attr("d"),
            sort = d3.select("#vis-player-hero .btn-sort .active").attr("d")
          );
        }
      })
  })
