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
		TableName: "test-PREFIX-Device",
		KeySchema: [{ AttributeName: "yanecubeId", KeyType: "HASH" }],
		AttributeDefinitions: [
			{ AttributeName: "yanecubeId", AttributeType: "S" },
			{ AttributeName: "institutionId", AttributeType: "S" },
		],
		GlobalSecondaryIndexes: [
			{
				IndexName: "institutionIdIndex",
				KeySchema: [{ AttributeName: "institutionId", KeyType: "HASH" }],
				Projection: { ProjectionType: "ALL" },
				ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
			},
		],
		ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
	});

	await createTable(TableNames, {
		TableName: "test-PREFIX-DeviceHistory",
		KeySchema: [
			{ AttributeName: "yanecubeId", KeyType: "HASH" },
			{ AttributeName: "timestamp", KeyType: "RANGE" },
		],
		AttributeDefinitions: [
			{ AttributeName: "yanecubeId", AttributeType: "S" },
			{ AttributeName: "timestamp", AttributeType: "S" },
		],
		ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
	});

	await createTable(TableNames, {
		TableName: "test-PREFIX-InstitutionAvailability",
		KeySchema: [
			{ AttributeName: "institutionId", KeyType: "HASH" },
			{ AttributeName: "date", KeyType: "RANGE" },
		],
		AttributeDefinitions: [
			{ AttributeName: "institutionId", AttributeType: "S" },
			{ AttributeName: "date", AttributeType: "S" },
		],
		GlobalSecondaryIndexes: [
			{
				IndexName: "dateIndex",
				KeySchema: [{ AttributeName: "date", KeyType: "HASH" }],
				Projection: { ProjectionType: "ALL" },
				ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
			},
		],
		ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
	});

	await createTable(TableNames, {
		TableName: "test-PREFIX-MarketPrice",
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
