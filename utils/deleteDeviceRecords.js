const { deleteDoc, doc } = require("firebase/firestore")
const db = require("./connectToFirebase")
const getId = require("./getIds")

const deleteRecords = async (devId) => {
    const toDelete = [
        {
            collectionName: "alerts",
            field: "device_id",
            ids: null
        },{
            collectionName: "deviceConfig",
            field: "device_id",
            ids: null
        },{
            collectionName: "devices",
            field: "device_id",
            ids: null
        },{
            collectionName: "energyHistory",
            field: "device_id",
            ids: null
        },{
            collectionName: "transactions",
            field: "device_id",
            ids: null
        },{
            collectionName: "reports",
            field: "device_id",
            ids: null
        }
    ]

    toDelete.forEach(async (coll) => {
        coll.ids = await getId(coll.collectionName, coll.field, devId)

        coll.ids.forEach(async (id) => {
            deleteDoc(doc(db, coll.collectionName, id))
        })
    })

    return
}

module.exports = deleteRecords