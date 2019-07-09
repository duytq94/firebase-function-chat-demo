const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

exports.sendNotification = functions.firestore
  .document('messages/{groupId1}/{groupId2}/{message}')
  .onCreate((snap, context) => {
    console.log('----------------start function--------------------')

    const idFrom = snap.data().idFrom
    const idTo = snap.data().idTo
    const content = snap.data().content

    // Get push token user to (receive)
    admin
      .firestore()
      .collection('users')
      .where('id', '==', idTo)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(infoUserTo => {
          console.log(`Found user to: ${infoUserTo.data().nickname}`)
          if (infoUserTo.data().pushToken) {
            // Get info user from (sent)
            admin
              .firestore()
              .collection('users')
              .where('id', '==', idFrom)
              .get()
              .then(querySnapshot2 => {
                querySnapshot2.forEach(infoUserFrom => {
                  console.log(
                    `Found user from: ${infoUserFrom.data().nickname}`
                  )
                  const payload = {
                    notification: {
                      title: `You have a message from "${
                        infoUserFrom.data().nickname
                      }"`,
                      body: content,
                      badge: '1',
                      sound: 'default'
                    }
                  }
                  admin
                    .messaging()
                    .sendToDevice(infoUserTo.data().pushToken, payload)
                  console.log(`Notification is sent with content "${content}"`)
                })
              })
          } else {
            console.log('Can not find pushToken target user')
          }
        })
      })

    return null
  })
