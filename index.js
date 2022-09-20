
// Set Constants

const notionDb = 'ADD_ME'
const notionToken = 'ADD_ME'
const eventUrlField = ''
const orgTitleField = ''
const contactNameField = ''
const contactEmailField = ''
const contactOrgField = ''
const registrationContactField = ''
const registrationEventField = ''


// Gather inputData

// Set Params

// Find Event

const eventFilter = {
  and: [
    {
      property: eventUrlField
      url: {
        equals: registrationUrl
      }
    }
  ]
}

const eventId = await notionFind(eventDB, eventFilter).then(results => results[0].id)

// Find Org

const orgFilter = {
  and: [
    {
      property: orgTitleField
      title: {
        equals: registrationOrg
      }
    }
  ]
}

const orgProperties = {
  {
    [orgTitleField]: {
      title: [{
          text: { content: registrationOrg}
      }]
    }
}

const orgId = await notionFindOrCreate(orgDb, orgFilter, orgProperties).then(results => results[0].id)

const contactFilter = {
  and: [
    {
      property: contactEmailField
      email: {
        equals: registrationEmail
      }
    }
  ]
}

//Create Contact

const contactProperties = {
  {
    [contactNameField]: {
      title: [{
          text: { content: registrationName}
      }]
    },
    [contactEmailField]: {
      email: [{
          text: { content: registrationEmail}
      }]
    },
    [contactOrgField]: {
      relation: [{
        id: orgId
      }]
    }
  }
}

const contactId = await notionFindorCreate(contactDB, contactFilter, contactProperties)

// Find or create registration

const registrationFilter = {
  and: [
    {
      property: registrationContactField,
      relation: {
        contains: contactId
      }
    },
    {
      property: registrationEventField,
      relation: {
        contains: eventId
      }
    }
  ]
}

const registrationProperties = {
  [registrationContactField]: {
    relation: [{
      id: contactId
    }]
  },
  [registrationEventField]: {
    relation: [{
      id: eventId
    }]
  }
}

const registrationid = await notionFindorCreate(registrationDb, registrationFilter, registrationProperties).then(results => results[0].id)

// Output

outputData = {registrationId}

// Define functions used above

const errorHandler = err => {
  return err.text().then(text => new Error(err.status + ': ' + err.statusText + "   " + text))
}


const notionFind = (db, filter) => {
  const url = 'https://api.notion.com/v1/databases/' + db + '/query'
  const params = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
      'Authorization': 'Bearer ' + notionToken
    },
    body: JSON.stringify({filter})
  }
  return fetch(url, params)
    .then(res => res.ok ? res.json() : errorHandler(res))
    .then(json => json.results)
}

const notionPost = (db, properties) => {
  const url = 'https://api.notion.com/v1/pages'
  const body = {
    parent: { type: "database_id", database_id: notionDb },
    properties,
  }
  const params = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
      'Authorization': 'Bearer ' + notionToken
    },
    body: JSON.stringify(body)
  }
  return fetch(url, params)
    .then(res => res.ok ? res.json() : errorHandler(res))
}

const notionFindOrCreate = (db, filter, properties) => {
  return notionFind(db, filter)
    .then(results => results.length > 0 ? results : notionPost(db, properties).then(json => [json]) )
 }
