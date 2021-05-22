const fs = require('fs');

module.exports.template = (path, params) => {
    fs.readFile(path, function(err, data) {
        let contents = data;
        for(const property in params){
            contents = contents.replace(new RegExp(`{{${property}}}`, 'g'), params[property]);
        }
        return contents;
    })
}
//i hope the async readfile works lmao