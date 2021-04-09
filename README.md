
# Die Schweiz in D3

**Jetzt da wir wissen wie man eine Karte in D3 rendert können wir eine Schweizerkarte der Kantone mit D3 generieren. Den Code für dieses Modul kannst du auf Github finden.**

## Übersicht

* Einführung und Ziel
* Base map
* Choroplethenkarte
* Interaktivität
* Bonus: Hover events

## Einführung und Ziel

Diese Karte der Schweiz werden wir von Grund auf in D3 gestalten. Die geografischen Daten wurden auf ein WGS84 Koordinatensystem umgewandelt damit sie einfacher zu benutzen sind mit d3-geo. Das Geojson file findest du in diesem Github Repo.

Die Kantone im Geojson enthalten auch metadaten als "properties" und können verwendet werden, um eine Visualisierung zu machen. In diesem Fall geht es um verschiedene Wahlresultate von Volksabstimmungen.

## Karte rendern

Um eine Schweizerkarte zu rendern müssen wir zuerst die geografischen Daten laden.

```js
// map.js

document.addEventListener("DOMContentLoaded", () => {

  d3.json("/ch.json")
    .then(ch => {

      // Visualisierung

    })

})
```

Die Daten sind bereits im geojson Format und somit vorbereitet für die Visualisierung mit d3-geo. Wir müssen also nur die Kartenprojektion und den Pfadgenerator definieren.

```js
d3.json("/ch.json")
  .then(ch => {

    const width = 800
    const height = 600

    const svg = d3.select("svg")

    // https://www.swisstopo.admin.ch/en/knowledge-facts/surveying-geodesy/reference-systems/map-projections.html
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

  })
```

## Choroplethenkarte

Jetzt haben wir eine Base-map die noch keine Farben zeigt aber bereits eine Schweiz mit Kantonsgrenzen. Im nächsten Schritt müssen wir die Abstimmungen definieren und dann die Daten an eine Farbskala binden damit wir die Kantone als eine Choroplethenkarte rendern können.

Weil wir zwischen beiden Abstimmungen hin und her wechseln wollen definieren wir auch eine `currentInitiative` Variabel,die die im Moment ausgewählte Abstimmung beinhaltet.

```js
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

// ...
```

Der obige Code kann am Anfang des Dokuments definiert werden und ist nicht von den Daten, die asynchron geladen werden abhängig.

Jetzt können wir die Farbskala und die Farbe unserer Kantone definieren.

```js
// ...

const colorScale = d3.scaleLinear()
  .domain([20, 50, 50.01, 80])
  .range(["#FF585D", "#FFF6F6", "#F2F9F9", "#008C95"])

cantons
  .attr("fill", d => {
    return colorScale(d.properties.initiatives[currentInitiative.id].ja)
  })
```

Hier definieren wir unsere Farbskala von 20-80 (unsere Abstimmungsresultate sind nie grösser oder kleiner als 80% und 20%). Obwohl es sich hier um eine divergierende Skala handelt definieren wir 4 Schnittstellen weil in einer Abstimmung 50% als nicht angenommen gilt. Somit muss 50 + 1 Stimme vorhanden sein um ein positives Resultat zu erzielen. In diesem Fall benutzen wir 50.01 um diese eine Stimme zu markieren (unsere Resultate sind nicht so genau und beschränken sich auf eine Dezimalstelle).

Wir bedienen uns der `cantons` Variabel, welche uns erlaubt unsere Kantone weiter zu definieren. Im Attribut `fill` berechnen wir unsere Farbe dynamisch mittels `colorScale` und dem Ja-Stimmenanteil.

## Interaktivität

Um unseren Benutzern zu erlauben zwischen den beiden Abstimmungen zu wechseln müssen wir ein Select-Element in HTML definieren und dann das Verhalten dieses Select-Elements in Javascript definieren.

```HTML
<div id="map">
  
  <!-- Select-Element -->
  <div class="select">
    <select id="initiativeSelector">
      <option value="0">
        Erleichterte Einbürgerung der dritten Ausländergeneration — 12.02.2017
      </option>
      <option value="1">
        Atomausstiegsinitiative — 27.11.2016
      </option>
    </select>
  </div>
  <!-- Select-Element -->

  <svg viewBox="0 0 800 600"></svg>
</div>
```

Jetzt da wir ein Select-Element haben können wir in Javascript einen sogenannten `onChange` handler registrieren. Mit d3 sieht das so aus:

```js
// ...

d3.select("#initiativeSelector")
  .on("change", e => {
    currentInitiative = initiatives[e.target.value]
    cantons
      .transition()
      .duration(250)
      .attr("fill", d => {
        return colorScale(d.properties.initiatives[currentInitiative.id].ja)
      })
  })
```

Wir holen uns das Select aus dem DOM mittels `d3.select()` und benutzen `.on()` um einen `"change"` handler zu definieren. In diesem handler ersetzen wir die `currentInitiative` Variabel mit der neu ausgewählten Abstimmung und benutzen diese neue `currentInitiative` Variabel um unsere Farben wiederum dynamisch zu definieren. Also bonus benutzen wir `.transition()` und `duration(250)` um eine mini-animation mit d3 hinzuzufügen.

Jetzt haben wir eine Karte mit einem Toggle zwischen zwei Abstimmungsresultaten.

## Bonus: Hover events

Als bonus können wir jetzt einen Hover-Event hinzufügen der uns erlaubt die Resultate für jeden Kanton unter der Karte zu sehen wenn wir den Mauszeiger über den Kanton auf der Karte halten.

Wieder müssen wir zuerst einen Paragraph für unseren Text in HTML definieren und dann können wir diesen Paragraph benutzen um den Text dynamisch in Javascript einzusetzen.

```HTML
<div class="map">

  <div class="select">
    <select id="initiativeSelector">
      <option value="0">
        Erleichterte Einbürgerung der dritten Ausländergeneration — 12.02.2017
      </option>
      <option value="1">
        Atomausstiegsinitiative — 27.11.2016
      </option>
    </select>
  </div>

  <svg viewBox="0 0 800 600"></svg>

  <!-- Paragraph -->
  <p id="info"></p>
  <!-- Paragraph -->

</div>
```

In Javascript können wir jetzt das Verhalten des Texts im Paragraph definieren.

```js
// ...

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

```

Das sieht vielleicht ein bisschen einschüchternd aus, aber das Prinzip ist relativ einfach. Wie zuvor bedienen wir uns der `cantons` Variabel um einen `mouseenter` und einen `mouseleave` Event mit `.on()` zu definieren. Das erlaubt uns auf den Mauszeiger zu reagieren.

Wenn wir mit dem Mauszeiger auf einem Kanton sind möchten wir unter der Karte den Namen und den Ja/Nein Stimmenanteil anzeigen, je nachdem ob im Kanton mehr Ja- oder Nein-Stimmen vorhanden waren.

Wir haben in unserem Datensatz den Ja-Stimmenanteil und ein Ja/Nein Feld, das uns sagt ob der Kanton Ja oder Nein gestimmt hat. Den Nein-Stimmenanteil berechnen wir in Fällen wo die `passed` Variabel `false` ist.

Im `mouseleave` Event müssen wir dann den ganzen Text wieder aus dem Infoparagraph entfernen.

Nun haben wir unsere erste Interaktive Karte in d3. In den nächsten Schritten würden wir eine Legende hinzufügen und noch weitere Informationen anzeigen (z.B. Stimmbeteiligung). Karten wie vieles Andere in Design sind halt nie wirklich fertig...
