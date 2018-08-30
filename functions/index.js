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

		admin
			.firestore()
			.collection('users')
			.where('id', '==', idTo)
			.get()
			.then(querySnapshot => {
				querySnapshot.forEach(documentSnapshot => {
					console.log(`Push notification to ${documentSnapshot.data().nickname}`)
					if (documentSnapshot.data().pushToken) {
						const payload = {
							notification: {
								title: `You have a message from ${idFrom}`,
								body: content,
								badge: '1',
								sound: 'default',
							},
						}

						admin.messaging().sendToDevice(documentSnapshot.data().pushToken, payload)
					} else {
						console.log('Can not find pushToken target user')
					}
				})

				console.log('----------------end function--------------------')
			})
	})
