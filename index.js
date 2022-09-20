
// Set Constants

// Gather inputData

// Set Params

// Find Event

// Find or create registration

outputData = {}

const notionFind (db, filter) => {
  const url = 'https://api.notion.com/v1/databases/' + db + '/query'
  const params = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
      'Authorization': 'Bearer ' + notionToken
    },
    body: filter
  }
  return fetch(url, params)
}
