const write = require('./write');
const geojson = require('./geojson');
const prj = require('./prj');
const JSZip = require('jszip');

const defaultZipOptions = { compression: 'STORE', type: 'base64' };

module.exports = function(gj, options, zipOptions = defaultZipOptions) {

    const zip = new JSZip();
    const layers = zip.folder(options && options.folder ? options.folder : 'layers');

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
                    const fileName = options && options.types[l.type.toLowerCase()] ? options.types[l.type.toLowerCase()] : l.type;
                    layers.file(fileName + '.shp', files.shp.buffer, { binary: true });
                    layers.file(fileName + '.shx', files.shx.buffer, { binary: true });
                    layers.file(fileName + '.dbf', files.dbf.buffer, { binary: true });
                    layers.file(fileName + '.prj', prj);
                });
        }
    });

    const generateOptions = Object.assign(defaultZipOptions, zipOptions);

    if (generateOptions.type === 'nodebuffer' && generateOptions.streamFiles === true) {
        return zip.generateNodeStream(generateOptions);
    }
    return zip.generateAsync(generateOptions);
};
