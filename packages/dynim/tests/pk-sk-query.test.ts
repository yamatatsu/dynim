import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { expect, test } from "vitest";
import { Dynim } from "../src/index.js";

const dynim = new Dynim({
	logger: process.env.DEBUG ? console.log : undefined,
	tables: [],
});

const option = {
	endpoint: "http://127.0.0.1:8000",
	region: "local",
	credentials: {
		accessKeyId: "fakeMyKeyId",
		secretAccessKey: "fakeSecretAccessKey",
	},
};

const mockedClient = new DynamoDBClient(option);
dynim.addMiddleware(mockedClient);
const mockedDoc = DynamoDBDocument.from(mockedClient);

const doc = DynamoDBDocument.from(new DynamoDBClient(option));

test("put & query", async () => {});

test("query then no-item", async () => {});
