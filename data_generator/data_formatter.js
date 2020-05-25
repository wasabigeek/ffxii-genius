const fs = require('fs');

let bazaarItems = JSON.parse(fs.readFileSync('bazaar_items.json'));
let nodeSet = new Set()
let edges = []

bazaarItems.forEach(function(item) {
  const contents = item['Contents'].map(function(val) { return val['Name'] });
  const ingredients = item['IngredientsList']
  const ingredient_names = ingredients.map(function(val) { return val['Name'] });

  contents
    .concat(ingredient_names)
    .forEach(function(c) { nodeSet.add(c) })

  contents
    .forEach(function(content) {
      ingredients.forEach(function(ingredient) {
        edges.push({from: ingredient['Name'], to: content, label: `${ingredient['Amount'] ? "x" + ingredient['Amount'] + " " : '1 '}(${item['Item']})`})
      })
    })
})

let nodes = [];
for (const node of nodeSet) {
  nodes.push({id: node, label: node})
}

fs.writeFileSync(
  '../load_vis_data.js',
  "var nodes = new vis.DataSet(" + JSON.stringify(nodes) + ");\n\n"
  + "var edges = new vis.DataSet(" + JSON.stringify(edges) + ");\n\n"
);
