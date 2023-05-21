const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const trees = require("../data/trees.json");

    for (let key in trees) {
        const level = key;
        const name = trees[key][0];
        const message = trees[key][1];

        await prisma.tree.create({
            data: {
                id: parseInt(level),
                level: name,
                message: message,
            },
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
