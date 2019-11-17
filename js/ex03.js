var ctx = {
  sampleSize : '*',
  scaleTypeLP : 'linear',
  scaleTypeSP : 'log',
  MIN_YEAR: 1988,
  DETECTION_METHODS: ["Radial Velocity", "Primary Transit", "Microlensing", "Imaging"],
  DM_COLORS: ['#cab2d6', '#fdbf6f', '#b2df8a', '#fb9a99']
}

var createMassScatterPlot = function(sampleSize, scaleType){
    var vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
        "data": {
            "url":"exoplanet.eu_catalog_20190924.csv",
        },
        "transform": [
            {"filter": {"field": "mass", "gt": 0}},
            {"filter": {"field": "star_mass", "gt": 0}},
            {"filter": {"field": "discovered", "gte": ctx.MIN_YEAR}},
            {"filter": {"field": "detection_type", "oneOf": ctx.DETECTION_METHODS}},
        ],
        "vconcat":[{
            "selection": {"exopl": {"type": "interval"}},
            "transform": [{"filter": {"selection": "dettype"}}],
            "mark":"point",
            "height": 700,
            "encoding": {
                "x":{"field": "star_mass", "type": "quantitative","scale":{"type":scaleType}},
                "y": {"field": "mass", "type": "quantitative","scale":{"type":scaleType}},
                "fill": {
                    "condition": {
                        "selection": "exopl",
                        "field": "discovered",
                        "type": "temporal",
                        "timeUnit": "year",
                        "legend": {"title": "Year Discovered"}
                    },
                    "value": "lightgray"
                },
            }
        },
        {
            "mark":"bar",
            "encoding" : {
                "x": {
                    "aggregate": "count",
                    "type": "quantitative",
                    "axis": {"title": "Count"}
                },
                "y": {
                    "field": "detection_type",
                    "type": "nominal",
                    "axis": {"title": "Detection Method"}
                },
                "color": {
                    "condition": {
                        "selection": "dettype",
                        "field": "detection_type",
                        "type": "nominal",
                        "scale": {"scheme": "dmcolors"},
                        "legend": null // prevent legend frm showing in SP above
                    },
                    "value": "lightgray"
                },
            },
            "selection": {"dettype": {"encodings": ["color"], "type": "single"}},
            "transform": [{"filter": {"selection": "exopl"}}]
        }]
    }
    if (sampleSize != "*"){
        vlSpec["transform"].push({"sample": parseInt(sampleSize)});
    }
    var vlOpts = {width:700, height:700, actions:false};
    vegaEmbed("#massScat", vlSpec, vlOpts);

    
};

var createMagV2DHisto = function(){

    vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
        "data": {
            "url":"exoplanet.eu_catalog_20190924.csv",
        },
        "mark":"rect",
        "encoding":{
            "x":{"field":"detection_type","type":"nominal"},
            "y":{"field":"mag_v", "type":"quantitative", "bin":{"maxbins": 45}},
            "color":{"aggregate":"count", "type":"quantitative"},
            
        },
        
        "transform":[{"filter":{"and":[{"field":"detection_type","oneOf":ctx.DETECTION_METHODS},{"field":"mag_v","valid":true}]}}]
    };
    vlOpts = {width:300, height:300, actions:false};
    vegaEmbed("#vmagHist", vlSpec, vlOpts);
};

var createDetectionMethodLinePlot = function(scaleType){
    // line plot: planet discovery count vs. year
    // vlSpec = {
    //     "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    //     "data": {
    //         //...
    //     },
    //     //...
    // };
    // vlOpts = {width:300, height:300, actions:false};
    // vegaEmbed("#discPlot", vlSpec, vlOpts);
};

var createViz = function(){
    vega.scheme("dmcolors", ctx.DM_COLORS);
    createMassScatterPlot('*', 'log');
    createMagV2DHisto();
    createDetectionMethodLinePlot('linear');
};

var handleKeyEvent = function(e){
    if (e.keyCode === 13){
        // enter
        e.preventDefault();
        setSample();
    }
};

var updateScatterPlot = function(){
    createMassScatterPlot(ctx.sampleSize, ctx.scaleTypeSP);
};

var setScaleSP = function(){
    ctx.scaleTypeSP = document.querySelector('#scaleSelSP').value;
    updateScatterPlot();
};

var setSample = function(){
    var sampleVal = document.querySelector('#sampleTf').value;
    if (sampleVal.trim()===''){
        return;
    }
    ctx.sampleSize = sampleVal;
    updateScatterPlot();
};

var updateLinePlot = function(){
    createDetectionMethodLinePlot(ctx.scaleTypeLP);
};

var setScaleLP = function(){
    ctx.scaleTypeLP = document.querySelector('#scaleSelLP').value;
    updateLinePlot();
};
