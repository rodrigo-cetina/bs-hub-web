export interface IconListItem {
  assetName: string
}

const IconList:IconListItem[] = []

function getImagePaths(directory: __WebpackModuleApi.RequireContext) {
  let images:string[] = []
  directory.keys().map((item, index) => images.push(item.replace("./", "")))
  return images
}

const images = require.context('assets/icons-modal', false, /\.(svg)$/)
const imagePaths = getImagePaths(images)

const length:number = imagePaths.length

if(IconList.length !== length)
for(let i = 0; i < length; i++){
  const path = imagePaths[i]
  IconList.push({
    assetName: path,
  })
}

export default IconList