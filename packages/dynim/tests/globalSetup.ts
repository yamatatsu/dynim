import {
	CreateTableCommand,
	CreateTableInput,
	DeleteTableCommand,
	DynamoDBClient,
	ListTablesCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
	endpoint: "http://127.0.0.1:8000",
	region: "local",
	credentials: {
		accessKeyId: "fakeMyKeyId",
		secretAccessKey: "fakeSecretAccessKey",
	},
});

export const setup = async () => {
	const { TableNames } = await client.send(new ListTablesCommand({}));
	if (!TableNames) {
		return;
	}

	await createTable(TableNames, {
		TableName: "dynim-test-pk-S-sk-S",
		KeySchema: [
			{ AttributeName: "pk", KeyType: "HASH" },
			{ AttributeName: "sk", KeyType: "RANGE" },
		],
		AttributeDefinitions: [
			{ AttributeName: "pk", AttributeType: "S" },
			{ AttributeName: "sk", AttributeType: "S" },
		],
		ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
	});
};

export const teardown = async () => {
	const { TableNames } = await client.send(new ListTablesCommand({}));
	if (!TableNames) {
		return;
	}

	await Promise.all(
		TableNames.map((TableName) =>
			client.send(new DeleteTableCommand({ TableName })),
		),
	);
};

async function createTable(tableNames: string[], input: CreateTableInput) {
	if (input.TableName && tableNames.includes(input.TableName)) {
		return;
	}
	await client.send(new CreateTableCommand(input));
}
