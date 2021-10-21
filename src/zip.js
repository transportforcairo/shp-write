var write = require('./write'),
    geojson = require('./geojson'),
    prj = require('./prj'),
    JSZip = require('jszip');

module.exports = function(gj, options, stream = false) {

    var zip = new JSZip(),
        layers = options && options.folder === null
          ? zip
          : zip.folder(options && options.folder ? options.folder : 'layers');

    [geojson.point(gj), geojson.line(gj), geojson.polygon(gj), geojson.multipolygon(gj), geojson.multiline(gj)]
        .forEach(function(l) {
        if (l.geometries.length && l.geometries[0].length) {
            write(
                // field definitions
                l.properties,
                // geometry type
                l.type,
                // geometries
                l.geometries,
                function(err, files) {
                    var fileName = options && options.types && options.types[l.type.toLowerCase()] ? options.types[l.type.toLowerCase()] : l.type;
                    layers.file(fileName + '.shp', files.shp.buffer, { binary: true });
                    layers.file(fileName + '.shx', files.shx.buffer, { binary: true });
                    layers.file(fileName + '.dbf', files.dbf.buffer, { binary: true });
                    layers.file(fileName + '.prj', prj);
                });
        }
    });

    var generateOptions = { compression:'STORE' };

    if (!process.browser) {
      generateOptions.type = 'nodebuffer';
    }
    if (stream) return zip.generateNodeStream({...generateOptions,streamFiles:true});
    else return zip.generateAsync(generateOptions);
};
