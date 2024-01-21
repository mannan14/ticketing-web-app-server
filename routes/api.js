import express from "express";
import db from "../src/dbconnect.js";
const api = express();

// routes
api.post('/support-agents', async (req, res) => {
    // client.connect(err => {
    //     if (err) {
    //         res.status(500).send(err)
    //     }
    //     const agent_data = req.body 
    //     const data = client.db("ticketing-system").collection("agents")
    //     data.insertOne(agent_data, (err, result) => {
    //         if(err){
    //             res.status(500).send(err)
    //         }
    //         if(result){
    //             console.log("agent created")
    //             res.json(result)
    //         }
    //         client.close()
    //     })
    // })
    let collection = await db.collection("agents");
    let newDocument = req.body;
    newDocument.active = false;
    newDocument.dateCreated = new Date();
    let result = await collection.insertOne(newDocument);
    if(result){
        res.status(204).send(result);
    }
    else{
        res.status(500).send(err)
    }
})

api.get('/support-tickets', async (req, res) => {
    let collection = await db.collection("tickets");
    const page = parseInt(req.params.page) || 0
    const sort = req.params.sort || "dateCreated"
    const ticketPerPage = 3
    if(sort === "dateCreated"){
        // await collection.find()
        // .sort({dateCreated: -1})
        // .skip(page * ticketPerPage)
        // .limit(ticketPerPage)
        // .toArray((err, result) => {
        //     if(err){
        //         res.status(500).send(err)
        //     }
        //     if(result){
        //         res.json(result)
        //         // res.status(200).send(results);
        //     }
        // });
        
        let results = await collection.aggregate([
            {"$sort": {"dateCreated": -1}},
            {"$skip": page * ticketPerPage},
            {"$limit": ticketPerPage},
        ]).toArray();
        res.send(results).status(200);
    }
    else if(sort === "resolvedOn"){
        // await collection.find()
        // .sort({resolvedOn: -1})
        // .skip(page * ticketPerPage)
        // .limit(ticketPerPage)
        // .toArray((err, result) => {
        //     if(err){
        //         res.status(500).send(err)
        //     }
        //     if(result){
        //         res.json(result)
        //         // res.status(200).send(results);
        //     }
        // });
        let results = await collection.aggregate([
            {"$sort": {"resolvedOn": -1}},
            {"$skip": page * ticketPerPage},
            {"$limit": ticketPerPage},
        ]).toArray();
        res.send(results).status(200);
    }
    else{
        // await collection.find()
        // .sort({dateCreated: -1})
        // .skip(page * ticketPerPage)
        // .limit(ticketPerPage)
        // .toArray((err, result) => {
        //     if(err){
        //         res.status(500).send(err)
        //     }
        //     if(result){
        //         res.json(result)
        //         // res.status(200).send(results);
        //     }
        // });
        let results = await collection.aggregate([
            {"$sort": {"dateCreated": -1}},
            {"$skip": page * ticketPerPage},
            {"$limit": ticketPerPage},
        ]).toArray();
        res.send(results).status(200);
    }
})

// Initialize a variable to keep track of the last assigned agent index
let lastAssignedIndex = 0;
let supportAgents = []

// Function to get the next active support agent using round-robin
const getNextSupportAgent = async () => {
    // get all the agents
    let collection = await db.collection("agents");
    await collection.find({active: false})
    .toArray((err, result) => {
        if(err){
            res.status(500).send(err)
            // console.log(err)
        }
        if(result){
            // res.json(result)
            supportAgents = result;
            // res.status(200).send(results);
        }
    });

    // Filter out inactive agents
    // const activeAgents = supportAgents.filter((agent) => !agent.active);
    console.log(activeAgents)
    if (activeAgents.length === 0) {
        // No active agents available
        return null;
    }

    // Get the next support agent using round-robin logic
    const nextAgentIndex = (lastAssignedIndex + 1) % activeAgents.length;
    lastAssignedIndex = nextAgentIndex;

    return activeAgents[nextAgentIndex];
};

api.post('/support-tickets',async (req, res) => {
    // Creating a new support ticket and assigning to a agent, setting agent to active
    let collection = await db.collection("tickets");
    let newDocument = req.body;

    // Get the next active support agent using round-robin logic
    const assignedTo = getNextSupportAgent();
    
    if (!assignedTo) {
        newDocument.assignedTo = "";
        newDocument.dateCreated = new Date();
        newDocument.status = "New";
        let result = await collection.insertOne(newDocument);
        if(result){
            res.status(204).send(newDocument);
        }
        else{
            res.status(500).send(err)
        }
    }
    else{
        newDocument.assignedTo = assignedTo;
        newDocument.dateCreated = new Date();
        newDocument.status = "Assigned";
        let result = await collection.insertOne(newDocument);
        if(result){
            res.status(204).send(newDocument);
        }
        else{
            res.status(500).send(err)
        }
        // Update the assignedTo field in the agent document to set the agent to active
        collection = await db.collection("agents");
        let updateQuery = { _id: assignedTo._id };
        let updateDocument = { $set: { active: true } };
        await collection.updateOne(updateQuery, updateDocument);
    }
})

export default api;