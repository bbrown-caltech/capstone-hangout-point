const fs = require("fs")
const path = require("path")

try {
  fs.unlinkSync('./build/package.json');
  fs.unlinkSync('./build/package-lock.json');
} catch (e) {
  console.log(e);
}



const applicationPath = path.join(__dirname, "build/js/application")
const frameworkPath = path.join(__dirname, "build/js/framework")
const libsPath = path.join(__dirname, "build/js/libs")

const appendExtension = function(path, dir) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir)

    if (files.length > 0) {
      files.forEach(function(filename) {
        if (fs.statSync(dir + "/" + filename).isDirectory()) {
            const subdirectory = path.join(dir, filename)
            appendExtension(path, subdirectory)
        } else {
            const fileToEdit = path.join(dir, filename)
            let content = fs.readFileSync(fileToEdit).toString();
            const lines = content.split('\n')
            for (const line of lines) {
                // console.log(line.substring(line.length - 8, line.length - 3));
                if (line.indexOf('import {') > -1 && line.substring(line.length - 8, line.length - 3) !== '.html') {
                    // const newLine = line.substring(0, line.length - 3) + '.js\';'
                    const newLine = line.replace('\';', '.js\';');
                    console.log('Original Line:\t' + line)
                    console.log('New Line:\t' + newLine)
                    content = content.replace(line, newLine)
                }
            }
            fs.writeFileSync(fileToEdit, content);
        }
      })
    } else {
      console.log("No files found in directory " + dir + ".")
    }
  } else {
    console.log("Directory path " + dir + " not found.")
  }
  
}

appendExtension(path, applicationPath)
appendExtension(path, frameworkPath)
appendExtension(path, libsPath)