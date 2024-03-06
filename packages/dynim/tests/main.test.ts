import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { expect, test } from "vitest";

const client = new DynamoDBClient(
	process.env.VITEST
		? {
				endpoint: "http://127.0.0.1:8000",
				region: "local",
				credentials: {
					accessKeyId: "fakeMyKeyId",
					secretAccessKey: "fakeSecretAccessKey",
				},
		  }
		: {},
);
const doc = DynamoDBDocument.from(client);
client.middlewareStack.add(
	() => async (args) => {
		// const res = await next(args);
		console.log({ args });
		return {
			response: new Response(),
			output: { $metadata: { requestId: "test-requestId" } },
		};
	},
	{ step: "initialize" },
);
// doc.middlewareStack.add((next) => async (args) => {})

test("should pass", async () => {
	const res = await doc.get({
		TableName: "test-PREFIX-Device",
		Key: { yanecubeId: "aaa" },
	});

	expect(res).toEqual({ $metadata: { requestId: "test-requestId" } });
});
