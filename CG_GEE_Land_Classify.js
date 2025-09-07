// =================================================================================
// 1. DATA ACQUISITION & PRE-PROCESSING (Done once for all indices)
// =================================================================================

// Load Sentinel-2 Surface Reflectance image collection
var s2 = ee.ImageCollection('COPERNICUS/S2_SR')
    .filterBounds(aoi) // Filter by the Area of Interest
    .filterDate('2022-01-01', '2022-01-31') // Filter by a specific date range
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10)); // Filter by cloud cover

// Create a single, cloud-reduced composite image and clip to the AOI
var image = s2.median().clip(aoi);

// Center the main map on the AOI
Map.centerObject(aoi, 11);


// =================================================================================
// 2. CALCULATE ALL INDICES
// =================================================================================

// Select bands required for all calculations
var blue = image.select('B2');
var green = image.select('B3');
var red = image.select('B4');
var nir = image.select('B8');
var swir1 = image.select('B11');

// a) Calculate NDVI (Normalized Difference Vegetation Index)
var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');

// b) Calculate NDWI (Normalized Difference Water Index)
var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');

// c) Calculate BSI (Bare Soil Index)
var bsi = swir1.add(red).subtract(nir.add(blue))
    .divide(swir1.add(red).add(nir.add(blue)))
    .rename('BSI');

// d) Calculate NDBI (Normalized Difference Built-up Index)
var ndbi = image.normalizedDifference(['B11', 'B8']).rename('NDBI');


// =================================================================================
// 3. DEFINE VISUALIZATION PARAMETERS
// =================================================================================

var ndviVisParams = {
    min: 0,
    max: 0.8,
    palette: ['#FFFFFF', '#CE7E45', '#DF923D', '#F1B555', '#FCD163', '#99B718',
        '#74A901', '#66A000', '#529400', '#3E8601', '#207401', '#056201',
        '#004C00', '#023B01', '#012E01', '#011D01', '#011301'
    ]
};

var ndwiVisParams = {
    min: -0.5,
    max: 0.5,
    palette: ['#ff0000', '#ffff00', '#00ffff', '#0000ff']
};

var bsiVisParams = {
    min: -0.1,
    max: 0.4,
    palette: ['#2fff38', '#ffc820', '#d7851f'] // Green -> Yellow -> Brown
};

var ndbiVisParams = {
    min: -0.2,
    max: 0.5,
    palette: ['green', 'yellow', 'red']
};


// =================================================================================
// 4. CREATE THE SIDE-BY-SIDE MAP LAYOUT
// =================================================================================

// Create four map widgets
var map_NDVI = ui.Map();
var map_NDWI = ui.Map();
var map_BSI = ui.Map();
var map_NDBI = ui.Map();

// Add the respective layers to each map
map_NDVI.addLayer(ndvi, ndviVisParams, 'NDVI');
map_NDWI.addLayer(ndwi, ndwiVisParams, 'NDWI');
map_BSI.addLayer(bsi, bsiVisParams, 'BSI');
map_NDBI.addLayer(ndbi, ndbiVisParams, 'NDBI');

// Add titles to each map
map_NDVI.add(ui.Label('NDVI (Vegetation)', {
    position: 'bottom-right'
}));
map_NDWI.add(ui.Label('NDWI (Water)', {
    position: 'bottom-right'
}));
map_BSI.add(ui.Label('BSI (Bare Soil)', {
    position: 'bottom-right'
}));
map_NDBI.add(ui.Label('NDBI (Built-up)', {
    position: 'bottom-right'
}));


// Link the four maps so they move together
var linker = ui.Map.Linker([map_NDVI, map_NDWI, map_BSI, map_NDBI]);

// Create a grid panel to hold the maps
var mapGrid = ui.Panel(
    [
        ui.Panel([map_NDVI, map_BSI], null, {
            stretch: 'both'
        }),
        ui.Panel([map_NDWI, map_NDBI], null, {
            stretch: 'both'
        })
    ],
    ui.Panel.Layout.Flow('horizontal'), {
        stretch: 'both'
    }
);

// Set the AOI as the center for the first map, which will propagate to the others
map_NDVI.centerObject(aoi, 11);

// Clear the root and add the new grid layout
ui.root.clear();
ui.root.add(mapGrid);

// =================================================================================
// 5. EXPORT IMAGES TO GOOGLE DRIVE
// =================================================================================

// Note: Each Export call creates a task in the 'Tasks' tab. You must
// manually click 'Run' on each task to start the export.

// a) Export the NDVI Image
Export.image.toDrive({
    image: ndvi,
    description: 'NDVI_Export',
    folder: 'GEE_exports',
    fileNamePrefix: 'ndvi_image',
    region: aoi,
    scale: 10,
    crs: 'EPSG:4326',
    maxPixels: 1e9
});

// b) Export the NDWI Image
Export.image.toDrive({
    image: ndwi,
    description: 'NDWI_Export',
    folder: 'GEE_exports',
    fileNamePrefix: 'ndwi_image',
    region: aoi,
    scale: 10,
    crs: 'EPSG:4326',
    maxPixels: 1e9
});

// c) Export the BSI Image
Export.image.toDrive({
    image: bsi,
    description: 'BSI_Export',
    folder: 'GEE_exports',
    fileNamePrefix: 'bsi_image',
    region: aoi,
    scale: 10,
    crs: 'EPSG:4326',
    maxPixels: 1e9
});

// d) Export the NDBI Image
Export.image.toDrive({
    image: ndbi,
    description: 'NDBI_Export',
    folder: 'GEE_exports',
    fileNamePrefix: 'ndbi_image',
    region: aoi,
    scale: 10,
    crs: 'EPSG:4326',
    maxPixels: 1e9
});
