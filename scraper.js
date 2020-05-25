const rp = require('request-promise');
const $ = require('cheerio');
const fs = require('fs');

const url = 'https://finalfantasy.fandom.com/wiki/Bazaar_(Final_Fantasy_XII)#Zodiac_versions';
// const headers = ["Item", "Contents", "Ingredients", "Amount", "Cost", "Difference"]
const headers = ["Item", "Contents", "Name", "Amount", "Cost", "Difference"]
const shortHeaders = ["Name", "Amount"]

function parseContents(contentString) {
  if (contentString === undefined) {
    return
  }
  return contentString
    .split(', ')
    .map(function(val) {
      const [ name, amount ] = val.split(/\ x(?=\d+)/)
      return { 'Name': name, 'Amount': amount }
    })
}

function formatRow(node) {
  let row = {}
  let ingredient = {};

  const columns = $(node).find('td,th');
  // handle colspans
  if (columns.length == 6) {
    columns.each(function(i, c) {
      const text = sanitizeText($(c).text());
      if (i < 2 || i > 3) {
        row[headers[i]] = text;
      }
      else {
        ingredient[headers[i]] = text;
      }
    })
    row['IngredientsList'] = [ingredient];
  }
  else if (columns.length == 2) {
    columns.each(function(i, c) {
      const text = sanitizeText($(c).text());
      ingredient[shortHeaders[i]] = text;
    })
    row['IngredientsList'] = [ingredient];
  }
  else {
    console.log('Too many columns');
  }

  return row
}

function sanitizeText(text) {
  return text.replace('\n', '')
}

rp(url)
  .then(function(html) {
    // map on a cheerio object is different from regular array map
    // const headers = $('h2 + p + .FFXII.article-table tr.a th', html).map(function(i, c) { return sanitizeText($(c).text()) })
    const nodes = $('h2 + p + .FFXII.article-table tbody tr[class!=a]', html);
    let items = []
    nodes.each(function(i, node) {
      let item = formatRow(node, headers);
      item['Contents'] = parseContents(item['Contents'])
      // handle the colspans
      if ('Item' in item) {
        items.push(item)
      }
      else {
        const lastItem = items.pop()
        lastItem['IngredientsList'] = lastItem['IngredientsList'].concat(item['IngredientsList'])
        items.push(lastItem)
      }
    })
    // console.log(items)
    // return items;

    fs.writeFileSync('bazaar_items.json', JSON.stringify(items));
  })
  .catch(function(err) {
    console.log(err)
  });
