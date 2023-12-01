const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Server Side Start

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@atlascluster.8trrhzs.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

		//connect to the sever to database
		const coffeeCollection = client.db("coffeeDB").collection("coffee");

		const userCollection = client.db("coffeeDB").collection("user");
		// get form database
		app.get("/coffee", async (req, res) => {
			const cursor = coffeeCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		// get for update
		app.get("/coffee/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await coffeeCollection.findOne(query);
			res.send(result);
		});
		// put for update
		app.put("/coffee/:id", async (req, res) => {
			const id = req.params.id;
			const filter = { _id: new ObjectId(id) };
			const options = { upsert: true };
			const updatedCoffee = req.body;
			const coffee = {
				$set: {
					name: updatedCoffee.name,
					quantity: updatedCoffee.quantity,
					supplier: updatedCoffee.supplier,
					taste: updatedCoffee.taste,
					category: updatedCoffee.name,
					details: updatedCoffee.details,
					photo: updatedCoffee.photo,
				},
			};
			const result = await coffeeCollection.updateOne(filter, coffee, options);
			res.send(result);
		});

		// post receive data
		app.post("/coffee", async (req, res) => {
			const newCoffee = req.body;
			console.log(newCoffee);
			//  Db
			const result = await coffeeCollection.insertOne(newCoffee);
			res.send(result);
		});

		// delete
		app.delete("/coffee/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await coffeeCollection.deleteOne(query);
			res.send(result);
		});

		// delete operation for user table data
		app.delete("/user/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await userCollection.deleteOne(query);
			res.send(result);
		});

		// for update using patch
		app.patch("/user", async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const updatedDoc = {
				$set: {
					lastLoggedAt: user.lastLoggedAt,
				},
			};
			const result = await userCollection.updateOne(filter, updatedDoc);
			res.send(result);
		});

		// User related apis
		// get
		app.get("/user", async (req, res) => {
			const cursor = userCollection.find();
			const users = await cursor.toArray();
			res.send(users);
		});
		// post
		app.post("/user", async (req, res) => {
			const userData = req.body;
			console.log(userData);
			const result = await userCollection.insertOne(userData);
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);
// End of Server Side Code

app.get("/", (req, res) => {
	res.send("Coffee making server!");
});

app.listen(port, () => {
	console.log(`Server started on ${port}`);
});
