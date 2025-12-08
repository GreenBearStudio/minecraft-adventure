import * as fs from "fs"
import * as path from "path"

const inputFile = path.join(__dirname, "../../files/images/uploaded_image_links.txt")
const outputFile = path.join(__dirname, "../assetsImageMap.tsx")

// Read the text file
const lines = fs.readFileSync(inputFile, "utf-8").split("\n").filter(Boolean)

// Build dictionary
const assets: Record<string, string> = {}
for (const line of lines) {
  const [key, value] = line.split("#").map(s => s.trim())
  if (key && value) {
    assets[key] = value
  }
}

// Generate TSX file
const content = `// Auto-generated from uploaded_image_links.txt
export const assetsImage: Record<string, string> = ${JSON.stringify(assets, null, 2)};
`

fs.writeFileSync(outputFile, content, "utf-8")

console.log("✅ assetsImageMap.tsx generated!")

