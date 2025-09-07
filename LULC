
// 1. Load Landsat 8 data
var image = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
.filter(ee.Filter.date('2024-01-01', '2024-04-30'))
.filter(ee.Filter.lt('CLOUD_COVER',5))
.median()
.clip(roi)

Map.addLayer(image, {}, 'Landsat 2024');

// 3. Create Training Data

var label = 'Class';
var bands = ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7']; 
var input = image.select(bands);

var training = Water.merge(Settlement).merge(Barrenland).merge(Cropland).merge(Vegetation);
print(training);

// 4. Overlay the points on the image to get training
var trainImage = input.sampleRegions({
  collection: training,
  properties: [label],
  scale: 30
});
print(trainImage);

var trainingData = trainImage.randomColumn();
var trainSet = trainingData.filter(ee.Filter.lessThan('random', 0.8));  // Training data
var testSet = trainingData.filter(ee.Filter.greaterThanOrEquals('random', 0.8));  // Validation data

// 5. Classification Model
var classifier = ee.Classifier.smileRandomForest(100).train(trainSet, label, bands);

// 6. Classify the image
var classified = input.classify(classifier);
print(classified.getInfo());

// 7. Define a palette for the classification.
var landcoverPalette = [
  '#113aff', //Water (0)
  '#d6a91a', //Settlement (1)
  '#19faff', //Barrenland (2)
  '#f6ff19', //Cropland (3)
  '#1f9715', //Vegetation (4)
 ];
Map.addLayer(classified, {palette: landcoverPalette, min: 0, max:4 }, 'classification'); 

// 8. Accuracy Assessment
//Classify the testSet and get a confusion matrix.
var confusionMatrix = ee.ConfusionMatrix(testSet.classify(classifier)
    .errorMatrix({
      actual: 'Class', 
      predicted: 'classification'
    }));

print('Confusion matrix:', confusionMatrix);
print('Overall Accuracy:', confusionMatrix.accuracy());
//print('Producers Accuracy:', confusionMatrix.producersAccuracy());
//print('Consumers Accuracy:', confusionMatrix.consumersAccuracy());

// 9. Export classified map to Google Drive
Export.image.toDrive({
  image: classified,
  description: 'Landsat_Classified_2024_CLS5',
  scale: 30,
  region: roi,
  maxPixels: 1e13,
});
