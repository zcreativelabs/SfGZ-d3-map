
document.addEventListener("DOMContentLoaded", () => {

  d3.json("/ch.json")
    .then(ch => {
      
      const initiatives = [
        {
          id: 0,
          name: "Erleichterte Einbürgerung der dritten Ausländergeneration",
          datum: "12.02.2017",
        },
        {
          id: 1,
          name: "Atomausstiegsinitiative",
          datum: "27.11.2016",
        },
      ]
      
      let currentInitiative = initiatives[0]

      const width = 800
      const height = 600

      const svg = d3.select("svg")

      const projection = d3.geoMercator()
        .translate([width/2, height/2])
        .rotate([-7.43864, -46.95108, 0])
        .center([0.54, -0.1])
        .scale(13000)

      const path = d3.geoPath().projection(projection)

      const cantons = svg.selectAll("path")
        .data(ch.features)
        .enter()
        .append("path")
          .attr("d", path)
          .attr("stroke", "#FFF")
          .attr("stroke-width", 1)

      const colorScale = d3.scaleLinear()
        .domain([20, 50, 50.01, 80])
        .range(["#FF585D", "#FFF6F6", "#F2F9F9", "#008C95"])

      cantons.attr("fill", d => {
        return colorScale(d.properties.initiatives[currentInitiative.id].ja)
      })

      const initiativeSelector = d3.select("#initiativeSelector")
        .on("change", e => {
          currentInitiative = initiatives[e.target.value]
          cantons
            .transition()
            .duration(250)
            .attr("fill", d => {
              return colorScale(d.properties.initiatives[currentInitiative.id].ja)
            })
        })

      cantons
        .on("mouseenter", (e, d) => {
          const initiativeData = d.properties.initiatives[currentInitiative.id]
          const passed = initiativeData.passed
          const ja = initiativeData.ja
          const cantonName = d.properties.name
      
          d3.select("#info")
            .style("color", passed ? "#008C95" : "#FF585D")
            .text(cantonName + " — " + (passed ? ja + "% Ja" : 100 - ja + "% Nein"))
        })
        .on("mouseleave", () => {
          d3.select("#info").text("")
        })

    })

})
