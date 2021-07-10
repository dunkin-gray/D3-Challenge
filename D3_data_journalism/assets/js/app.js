//////////////// STEP 1: DEFINE CHART AREA //////////////////

// // Define SVG dimensions
var svgWidth = 960;
var svgHeight = 500;

// // Define the chart's margins as an object
var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
  };

// // Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// // Select scatter, append SVG area to it, and set its dimensions
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight + 40);

// // Append a group area, then set its margins
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// // Append textGroup to add all text to chart 
var textGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

//////////////////// STEP 2. SET UP ALL PARAMS /////////////////////

// //Initial Params
 var chosenXaxis = "poverty";
 var chosenYaxis = "healthcare";

//Update x-scale upon click on axis label
function xScale(demData, chosenXaxis) {
    var xLinearSCale = d3.scaleLinear()
        .domain([d3.min(demData , d => parseFloat(d[chosenXaxis]) * .9), d3.max(demData, d => parseFloat(d[chosenXaxis]) *1.10)])
        .range([0, width]);
    return xLinearSCale;
}

//Update x-scale transition upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

//Update y-scale upon click on axis label
function yScale(demData, chosenYaxis) {
    var yLinearSCale = d3.scaleLinear()
        .domain([4, d3.max(demData, d => (d[chosenYaxis]))])
        .range([height, 0]);
            
    return yLinearSCale;
}

//Update y-scale transition upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
           .duration(1000)
           .call(leftAxis);

    return yAxis;
}

// Update circles group with a transition for new circles 
function renderXCircles(circlesGroup, newXScale, chosenXaxis, circlesText) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXaxis]));

    circlesText.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXaxis]));
    
    return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYaxis, circlesText) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYaxis]));

    circlesText.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYaxis]));

    return circlesGroup;
}

// Update ToolTip upon hover and axes //*** not working for chosenYaxis. Doesn't work for x-axis when I move chosenYaxis as the first parameter. 
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup) {

    //conditions for x-axis
        if (chosenXaxis === "poverty") {
            var xLabel = "In Poverty: ";
        }
        else if (chosenXaxis === "age") {
            var xLabel = "Age (Median): ";
        } 
        else { var xLabel = "Household Income (Median): ";
        }
    
    console.log(`chosenXaxis: ${chosenXaxis}`);    

    //conditions for y-axis
        if (chosenYaxis === "obesity") {
            var yLabel = "Obese: ";
        }
        else if (chosenYaxis === "smokes") {
            var yLabel = "Smokes: "
        }
        else { var yLabel = "Lacks Healthcare: "}
    
    console.log(`chosenYaxis: ${chosenYaxis}`);

    //define toolTip
    var toolTip = d3.tip()
        .offset([120, -50])
        .attr("class", 'd3-tip')
        .html(function(d) {
            //display age without format for x-axis
            if (chosenXaxis ==="age") {
                return (`${d.state} <br> ${xLabel} ${d[chosenXaxis]} <br> ${yLabel}${d[chosenYaxis]}%`);
            }
            //display income in dollars
           else if (chosenXaxis === "income") {
                return (`${d.state} <br> ${xLabel}$${d[chosenXaxis]} <br> ${yLabel}${d[chosenYaxis]}%`);
           }
           //display poverty as a percent
           else {
               return (`${d.state} <br> ${xLabel} ${d[chosenXaxis]}% <br> ${yLabel}${d[chosenYaxis]}%`);
           }
        });

    circlesGroup.call(toolTip); 

    circlesGroup
    .on('mouseover', function(d) {
        toolTip.show(d, this);
    })
    .on('mouseout', function(d) {
         toolTip.hide(d);
    });

    return circlesGroup;
};

//////////////// STEP 3. IMPORT DATA AND APPEND GRAPH /////////////////////
    
    //import data
    var demData = d3.csv("assets/data/data.csv").then(demData => {
        console.log(demData)

      // Parse Data/Cast as numbers
      demData.forEach((data) => {
        data.obesity = +data.obesity;
        data.smokes = +data.smokes; 
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
    });

    // Define x linear scale function from above csv import
    var xLinearScale = xScale(demData, chosenXaxis);

    // Define y linear scale function from above csv import
    var yLinearScale = yScale(demData, chosenYaxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(demData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXaxis]))
        .attr("cy", d => yLinearScale(d[chosenYaxis]))
        .attr("r", "17")
        .attr("stroke-width", "1")
        .classed("stateCircle", true)
        .attr("opacity", 0.5);

    // Add text to each circle
    var circlesText = textGroup.selectAll("text")
        .data(demData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXaxis]))
        .attr("y", d => yLinearScale(d[chosenYaxis]))
        .attr("text-anchor", "middle")

    //Append group for three x-axes labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 30})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0 - margin.right +100)
        .attr("value", "poverty") //value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", - margin.right +80)
        .attr("value", "income") //value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age") //value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    // Append group for three y-axes labels
    var yLabelsGroup = chartGroup.append("g"); 

    var healthcareLabel = yLabelsGroup.append("text") 
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare") //value to grab for event listener
        .attr("y", 0 - margin.left +35) 
        .attr("x", 0 - (height / 2)) 
        .attr("dy", "1em")
        .classed("active", true)
        .text("Lacks Healthcare (%)");
  
    var obeseLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity") //value to grab for event listener
        .attr("y", 0 - margin.left +15) 
        .attr("x", 0 - (height / 2)) 
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Obese (%)");
  
    var smokesLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes") //value to grab for event listener
        .attr("y", 0 - margin.left -5)
        .attr("x", 0 - (height /2))
        .attr("dy", "1em") //wat??? 
        .classed("inactive", true)
        .text("Smokes (%)");

///////////// STEP 4. UPDATE TOOLTIP, AXES, CIRCLES, AND SCALE ////////////////

    // updates tooltip with new info
    var circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

    // x axis labels event listener
   xLabelsGroup.selectAll("text")
    .on("click", function() {
      
    // get value of selection
    var value = d3.select(this).attr("value");
      if (value !== chosenXaxis) {

        // replaces chosenXAxis with value
        chosenXaxis = value;
        console.log(chosenXaxis);

        //update x scales with new data
        var xLinearScale = xScale(demData, chosenXaxis);

        //updates x axes with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        //update circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXaxis, circlesText);

        //updates tooltips with new info
        circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

    //changes classes to change bold text
    if (chosenXaxis === "poverty") {
        povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
    }

    else if (chosenXaxis === "age") {
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        ageLabel
            .classed("active", true)
            .classed("inactive", false);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
    }

    else {
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
    }
    });

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var yValue = d3.select(this).attr("value");
        if (yValue !== chosenYaxis) {

        // replaces chosenXAxis with value
        chosenYaxis = yValue;
        console.log(chosenYaxis);

        //update y scales with new data
        var yLinearScale = yScale(demData, chosenYaxis);

        //update y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYaxis, circlesText);

        // updates tooltips with new info
         circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

        //changes classes to change bold text
        if (chosenYaxis === "obesity") {
            obeseLabel
                .classed("active", true)
                .classed("inactive", false);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
        }

        else if (chosenYaxis === "smokes") {
            obeseLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", true)
                .classed("inactive", false);
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
        }

        else {
            obeseLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
            }
    }})
});