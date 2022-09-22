
async function run() {

// Set Constants

const notionToken = ''

const contactDb = ''
const eventDb = ''
const orgDb = ''
const registrationDb = ''
const eventIdField = ''
const orgTitleField = ''
const contactNameField = ''
const contactEmailField = ''
const contactOrgField = ''
const contactTitleField = ''
const registrationContactField = ''
const registrationEventField = ''
const registrationStatusField = ''


// Gather inputData

// const inputData = {
//   name: 'David Jay',
//   email: 'davidgljay@gmail.com',
//   hasJoined: 'false',
//   lumaEventId: 'evt-PhSMp6DjpNLkEk1',
//   answers: 'Relationality Lab, Founder'
// }


const {name, lumaEventId, email, answers, hasJoined} = inputData

const org = answers.split(',')[0]
const title = answers.split(',')[1]

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
    parent: { type: "database_id", database_id: db },
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

 const notionUpdate = (id, properties) => {
   const url = 'https://api.notion.com/v1/pages/' + id
   const params = {
     method: 'PATCH',
     headers: {
       'Content-Type': 'application/json',
       'Notion-Version': '2022-06-28',
       'Authorization': 'Bearer ' + notionToken
     },
     body: JSON.stringify({properties})
   }
   return fetch(url, params)
     .then(res => res.ok ? res.json() : errorHandler(res))
 }

// Find Event

const eventFilter = {
  and: [
    {
      property: eventIdField,
      rich_text: {
        contains: lumaEventId
      }
    }
  ]
}

const eventId = await notionFind(eventDb, eventFilter).then(results => results[0].id)

// Find Org

const orgFilter = {
  and: [
    {
      property: orgTitleField,
      title: {
        equals: org
      }
    }
  ]
}

const orgProperties = {
    [orgTitleField]: {
      title: [{
          text: { content: org}
      }]
    }
}

const orgId = await notionFindOrCreate(orgDb, orgFilter, orgProperties).then(results => results[0].id)

const contactFilter = {
  and: [
    {
      property: contactEmailField,
      email: {
        equals: email
      }
    }
  ]
}

//Create Contact

const contactProperties = {
    [contactNameField]: {
      title: [{
          text: { content: name}
      }]
    },
    [contactEmailField]: {
      email: [{
          text: { content: email}
      }]
    },
    [contactOrgField]: {
      relation: [{
        id: orgId
      }]
    },
    [contactTitleField]: {
      rich_text: [{
        text: { content: title}
      }]
    }
}

const contactId = await notionFindOrCreate(contactDb, contactFilter, contactProperties).then(results => results[0].id)

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

const registrationId = await notionFindOrCreate(registrationDb, registrationFilter, registrationProperties).then(results => results[0].id)

// Update registration

const registrationUpdateProperties = {
  [registrationStatusField]: {
    select: {
          name: hasJoined ? "Attended" : "Registered"
      }
    }
}

await notionUpdate(registrationId, registrationUpdateProperties)

// Output

output = {registrationId}



}

run()
