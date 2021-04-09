
# Mapbox map

In this exercise we will make a Mapbox map together. Our goal is to render the public fountains in Zurich. There are some 1400 public fountains in the city of Zurich. Our goal is to create a map that allows users to explore these fountains and find out more about them.

Since there are 1400 of these fountains, regular markers are likely out of the question, because they would negatively impact the performance of our map. We therefore have to use the new data layers api of Mapbox to render our fountains geojson as points on a map of Zurich.

## Set up a mapbox account and get a token

Before you can get started on the map, you will have to set up a Mapbox account and get an api token. Once you have that you can clone the example repo and get started with coding your first Mapbox map. We can make our map in 5 steps.

## Steps

1. Add the mapbox token
2. Initialize map
3. Add map load event handler
4. Fetch fountains data
5. Render the fountains data as a geojson point layer

### 1. Add the mapbox token

```js
mapboxgl.accessToken = ""
```

### 2. Initialize map

```js
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v10",
    center: [8.54, 47.375],
    zoom: 12,
  })
```

Simple alternative map styles are:

```
style: "mapbox://styles/mapbox/streets-v11",
style: "mapbox://styles/mapbox/outdoors-v11",
style: "mapbox://styles/mapbox/light-v10",
style: "mapbox://styles/mapbox/dark-v10",
style: "mapbox://styles/mapbox/satellite-v9",
style: "mapbox://styles/mapbox/satellite-streets-v11",
```

### 3. Add map load event handler

```js
map.on("load", () => {
  // Stuff goes here...
})
```

### 4. Fetch fountains data

```js
fetch("/fountains.json")
   .then(res => res.json())
   .then(fountains => {
     // Do stuff with data here...
   })
```

### 5. Render the fountains data as a geojson point layer

Note that for the color of our circles we use the official "Züriblau" ([`#0F05A0`](https://www.stadt-zuerich.ch/prd/de/index/stadtarchiv/RechercheBenutzung/recherche/beliebteforschungsthemen/das_wappen_der_stadtzuerich.html#zueriblau)).

```js
map.addSource("fountains", {
  "type": "geojson",
  "data": fountains,
})

map.addLayer({
  "id": "fountainsLayer",
  "type": "circle",
  "source": "fountains",
  "paint": {
  "circle-radius": {
    "base": 1.75,
    "stops": [
      [12, 4],
      [20, 30],
    ],
  },
  "circle-color": "#0F05A0", // Züriblau
  "circle-stroke-color": "#FFFFFF",
  "circle-stroke-width": 1,
  },
})
```

## Simple markers vs. Geojson point layers

Simple markers are easier to make in Mapbox than the point layer we used. They are however much less performant. We want our map to feel modern and snappy, so we used the sligthtly more cumbersome point layer api.

If you are making a map that only shows a few points, you can consider Mapbox markers though. Here is some sample code showing how we would render the fountains as markers:

```js
fountains.features.map(d => {
  const marker = new mapboxgl.Marker()
    .setLngLat(d.geometry.coordinates)
    .addTo(map)
})
```
