
// Download Landsat 9 Images using Google Earth Engine (No Scaling)

// 1. Load Landsat 9
var dataset = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filterDate('2023-03-01', '2023-08-31')
  .filterBounds(roI)
  .filterMetadata('CLOUD_COVER', 'less_than', 10);

// 2. Get median composite
var landsat9 = dataset.median().clip(roI);

// 3. Set visualization parameters for **unscaled raw reflectance**
var visualization = {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],  // SR_Bx are raw integer bands
  min: 8300,
  max: 10727                          // Raw range
};

// 4. Map display
Map.centerObject(roI, 10);
Map.addLayer(landsat9, visualization, 'Landsat 9 (Unscaled)');

// 5. Export to Drive
Export.image.toDrive({
  image: landsat9.select(['SR_B4', 'SR_B3', 'SR_B2']).int16(),
  description: 'Landsat9_LMB',
  folder: 'GEE_exports',
  fileNamePrefix: 'Landsat9_LMB_Unscaled',
  region: roI,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
