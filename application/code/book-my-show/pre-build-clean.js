const fs = require("fs")
const path = require("path")

const pathToDir = path.join(__dirname, "build")

const cleanBuildDir = function(path) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path)

    if (files.length > 0) {
      files.forEach(function(filename) {
        if (fs.statSync(path + "/" + filename).isDirectory()) {     
            if ((path + "/" + filename) !== pathToDir) {
                fs.rmdirSync((path + "/" + filename), { recursive: true });
            }
        } else {
          fs.unlinkSync(path + "/" + filename)
        }
      })
    } else {
      console.log("No files found in the directory.")
    }
  } else {
    console.log("Directory path not found.")
  }
  
}

cleanBuildDir(pathToDir)