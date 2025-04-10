// CSV data
const csvData = `Brand,Protein Density (protein per calories),Protein Economy (protein per weight-adjusted £)
Barebells,0.095,9.58
Eat Natural,0.04,11.75
Grenade,0.094,9.27
Huel,0.072,5.25
KIND,0.046,8.57
MyProtein,0.086,9.16
Nākd,0.039,7.58
Nutramino,0.072,5.4
Warrior,0.083,9.92`;

// CSV parser function
function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = isNaN(values[i]) ? values[i] : parseFloat(values[i]);
    });
    return obj;
  });
}

// Parse the data
const data = parseCSV(csvData);

// Initialize chart
function initChart() {
  const svg = document.getElementById('protein-chart');
  const width = 600;
  const height = 600;
  const padding = 60;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;
  
  // Extract values for scaling
  const densityValues = data.map(d => d['Protein Density (protein per calories)']);
  const economyValues = data.map(d => d['Protein Economy (protein per weight-adjusted £)']);
  
  const minDensity = Math.min(...densityValues);
  const maxDensity = Math.max(...densityValues);
  const medianDensity = [...densityValues].sort((a, b) => a - b)[Math.floor(densityValues.length / 2)];
  
  const minEconomy = Math.min(...economyValues);
  const maxEconomy = Math.max(...economyValues);
  const medianEconomy = [...economyValues].sort((a, b) => a - b)[Math.floor(economyValues.length / 2)];
  
  // Scale functions to make the dividing lines appear at the visual center
  function scaleX(value) {
    // Adjust scaling to make median appear in the middle visually
    if (value <= medianEconomy) {
      // Scale from min to median to use the first half of the chart
      return padding + (chartWidth/2) * (value - minEconomy) / (medianEconomy - minEconomy);
    } else {
      // Scale from median to max to use the second half of the chart
      return padding + chartWidth/2 + (chartWidth/2) * (value - medianEconomy) / (maxEconomy - medianEconomy);
    }
  }
  
  function scaleY(value) {
    // Adjust scaling to make median appear in the middle visually
    if (value <= medianDensity) {
      // For values below median (lower half of chart, which is upper part of SVG)
      return height - padding - (chartHeight/2) * (value - minDensity) / (medianDensity - minDensity);
    } else {
      // For values above median (upper half of chart, which is lower part of SVG)
      return height - padding - chartHeight/2 - (chartHeight/2) * (value - medianDensity) / (maxDensity - medianDensity);
    }
  }
  
  // Get quadrant for a data point
  function getQuadrant(density, economy) {
    if (density >= medianDensity && economy >= medianEconomy) {
      return "Champions";
    } else if (density >= medianDensity && economy < medianEconomy) {
      return "Protein Warriors";
    } else if (density < medianDensity && economy >= medianEconomy) {
      return "Value Leaders";
    } else {
      return "Niche Players";
    }
  }
  
  // Quadrant display names
  const quadrantDisplayNames = {
    "Champions": "Pound for Pound Champs",
    "Protein Warriors": "Finance Bro Fundamentals",
    "Value Leaders": "Functional Fuelers",
    "Niche Players": "Swole Survivors"
  };
  
  // Quadrant colors
  const quadrantColors = {
    "Champions": "#29DB1D",
    "Protein Warriors": "#1464DB",
    "Value Leaders": "#DB9F27",
    "Niche Players": "#853665"
  };
  
  // Create SVG elements
  svg.innerHTML = '';
  
  // Add axes
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", padding);
  xAxis.setAttribute("y1", height - padding);
  xAxis.setAttribute("x2", width - padding);
  xAxis.setAttribute("y2", height - padding);
  xAxis.setAttribute("stroke", "#666");
  svg.appendChild(xAxis);
  
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", padding);
  yAxis.setAttribute("y1", height - padding);
  yAxis.setAttribute("x2", padding);
  yAxis.setAttribute("y2", padding);
  yAxis.setAttribute("stroke", "#666");
  svg.appendChild(yAxis);
  
  // Add quadrant dividing lines
  const horizontalDivider = document.createElementNS("http://www.w3.org/2000/svg", "line");
  horizontalDivider.setAttribute("x1", padding);
  horizontalDivider.setAttribute("y1", scaleY(medianDensity));
  horizontalDivider.setAttribute("x2", width - padding);
  horizontalDivider.setAttribute("y2", scaleY(medianDensity));
  horizontalDivider.setAttribute("stroke", "#ccc");
  horizontalDivider.setAttribute("stroke-dasharray", "4");
  svg.appendChild(horizontalDivider);
  
  const verticalDivider = document.createElementNS("http://www.w3.org/2000/svg", "line");
  verticalDivider.setAttribute("x1", scaleX(medianEconomy));
  verticalDivider.setAttribute("y1", padding);
  verticalDivider.setAttribute("x2", scaleX(medianEconomy));
  verticalDivider.setAttribute("y2", height - padding);
  verticalDivider.setAttribute("stroke", "#ccc");
  verticalDivider.setAttribute("stroke-dasharray", "4");
  svg.appendChild(verticalDivider);
  
  // Add axis labels
  const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  xLabel.setAttribute("x", width / 2);
  xLabel.setAttribute("y", height - 10);
  xLabel.setAttribute("text-anchor", "middle");
  xLabel.setAttribute("font-size", "12px");
  xLabel.textContent = "Protein Economy (protein per weight-adjusted £)";
  svg.appendChild(xLabel);
  
  const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  yLabel.setAttribute("x", -height / 2);
  yLabel.setAttribute("y", 15);
  yLabel.setAttribute("text-anchor", "middle");
  yLabel.setAttribute("transform", "rotate(-90)");
  yLabel.setAttribute("font-size", "12px");
  yLabel.textContent = "Protein Density (protein % of calories)";
  svg.appendChild(yLabel);
  
  // Add quadrant watermark labels
  const quadrantLabels = [
    { 
      text: ["POUND FOR", "POUND", "CHAMPS"],
      x: (scaleX(maxEconomy) + scaleX(medianEconomy)) / 2,
      y: (scaleY(maxDensity) + scaleY(medianDensity)) / 2
    },
    { 
      text: ["FINANCE", "BRO", "FUNDAMENTALS"],
      x: (scaleX(minEconomy) + scaleX(medianEconomy)) / 2,
      y: (scaleY(maxDensity) + scaleY(medianDensity)) / 2
    },
    { 
      text: ["FUNCTIONAL", "FUELERS"],
      x: (scaleX(maxEconomy) + scaleX(medianEconomy)) / 2,
      y: (scaleY(minDensity) + scaleY(medianDensity)) / 2
    },
    { 
      text: ["SWOLE", "SURVIVORS"],
      x: (scaleX(minEconomy) + scaleX(medianEconomy)) / 2,
      y: (scaleY(minDensity) + scaleY(medianDensity)) / 2
    }
  ];
  
  quadrantLabels.forEach(label => {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", label.x);
    text.setAttribute("y", label.y - ((label.text.length - 1) * 12));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "18px");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("fill", "#e0e0e0");
    text.setAttribute("opacity", "0.7");
    
    label.text.forEach((line, i) => {
      const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      tspan.setAttribute("x", label.x);
      tspan.setAttribute("dy", i === 0 ? 0 : 24);
      tspan.textContent = line;
      text.appendChild(tspan);
    });
    
    svg.appendChild(text);
  });
  
  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);
  
  // Add data points with brand labels
  data.forEach(d => {
    const x = scaleX(d['Protein Economy (protein per weight-adjusted £)']);
    const y = scaleY(d['Protein Density (protein per calories)']);
    const quadrant = getQuadrant(d['Protein Density (protein per calories)'], d['Protein Economy (protein per weight-adjusted £)']);
    const color = quadrantColors[quadrant];
    
    // Label positioning logic
    let labelOffsetX = 0;
    let labelOffsetY = 0;
    
    // Specific brand positioning
    if (d.Brand === "MyProtein") {
      labelOffsetX = -40; // Left of dot
      labelOffsetY = -10;
    } else if (d.Brand === "Grenade") {
      labelOffsetX = -40; // Left of dot
      labelOffsetY = 15;  // Below MyProtein
    } else if (d.Brand === "Barebells") {
      labelOffsetX = -30;
      labelOffsetY = -25;
    } else if (d.Brand === "Warrior") {
      labelOffsetX = -30;
      labelOffsetY = 30;
    } else if (d.Brand === "Nutramino") {
      labelOffsetX = 0;
      labelOffsetY = 30;
    } else if (d.Brand === "Huel") {
      labelOffsetX = 15;
      labelOffsetY = -15;
    } else if (d.Brand === "Eat Natural") {
      labelOffsetX = -20;
      labelOffsetY = 15;
    } else {
      // Default positioning
      switch(quadrant) {
        case "Champions":
          labelOffsetX = 15;
          labelOffsetY = -15;
          break;
        case "Protein Warriors":
          labelOffsetX = 15;
          labelOffsetY = -15;
          break;
        case "Value Leaders":
          labelOffsetX = -15;
          labelOffsetY = 15;
          break;
        case "Niche Players":
          labelOffsetX = -15;
          labelOffsetY = 15;
          break;
      }
    }
    
    const labelX = x + labelOffsetX;
    const labelY = y + labelOffsetY;
    
    // Draw connecting line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x);
    line.setAttribute("y1", y);
    line.setAttribute("x2", labelX);
    line.setAttribute("y2", labelY);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke-opacity", "0.5");
    svg.appendChild(line);
    
    // Draw data point
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", "8");
    circle.setAttribute("fill", color);
    circle.setAttribute("fill-opacity", "0.7");
    circle.setAttribute("stroke", color);
    circle.setAttribute("stroke-width", "1");
    circle.setAttribute("data-brand", d.Brand);
    circle.setAttribute("data-density", d['Protein Density (protein per calories)']);
    circle.setAttribute("data-economy", d['Protein Economy (protein per weight-adjusted £)']);
    svg.appendChild(circle);
    
    // Add label
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", labelX);
    label.setAttribute("y", labelY);
    label.setAttribute("text-anchor", labelOffsetX >= 0 ? "start" : "end");
    label.setAttribute("dominant-baseline", labelOffsetY >= 0 ? "hanging" : "auto");
    label.setAttribute("fill", color);
    label.setAttribute("font-size", "12px");
    label.textContent = d.Brand;
    svg.appendChild(label);
    
    // Add hover events
    circle.addEventListener('mouseenter', function(e) {
      circle.setAttribute("fill-opacity", "1");
      circle.setAttribute("stroke", "#000");
      circle.setAttribute("stroke-width", "2");
      label.setAttribute("font-weight", "bold");
      
      // Show tooltip
      tooltip.innerHTML = `
        <h4>${this.getAttribute('data-brand')}</h4>
        <p>Protein Density: ${(parseFloat(this.getAttribute('data-density')) * 100).toFixed(1)}%</p>
        <p>Protein Economy: ${parseFloat(this.getAttribute('data-economy')).toFixed(2)}</p>
      `;
      tooltip.style.opacity = '1';
      tooltip.style.left = (e.pageX + 10) + 'px';
      tooltip.style.top = (e.pageY - 70) + 'px';
    });
    
    circle.addEventListener('mouseleave', function() {
      circle.setAttribute("fill-opacity", "0.7");
      circle.setAttribute("stroke", color);
      circle.setAttribute("stroke-width", "1");
      label.setAttribute("font-weight", "normal");
      
      // Hide tooltip
      tooltip.style.opacity = '0';
    });
    
    circle.addEventListener('mousemove', function(e) {
      tooltip.style.left = (e.pageX + 10) + 'px';
      tooltip.style.top = (e.pageY - 70) + 'px';
    });
  });
}

// Initialize chart when page loads
document.addEventListener('DOMContentLoaded', initChart);
