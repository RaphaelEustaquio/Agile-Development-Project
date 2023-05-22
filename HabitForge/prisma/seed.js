const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// async function main() {
//     const trees = require("../data/trees.json");

//     for (let key in trees) {
//         const level = key;
//         const name = trees[key][0];
//         const message = trees[key][1];

//         await prisma.tree.create({
//             data: {
//                 id: parseInt(level),
//                 level: name,
//                 message: message,
//             },
//         });
//     }
// }

// main()
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });

async function main() {
  const trophies = [
    {
      id: 'I',
      name: 'A New Journey',
      description: 'Create An Account',
      image: 'I.png',
    },
    {
      id: 'II',
      name: 'An Apple a Day',
      description: 'Create Your First Habit',
      image: 'II.png',
    },
    {
      id: 'III',
      name: 'Baby Steps',
      description: 'Check in to a habit for the first time',
      image: 'III.png',
    },
    {
      id: 'IV',
      name: 'Halfway There',
      description: 'Check in halfway to a habit for the first time',
      image: 'IV.png',
    },
    {
      id: 'V',
      name: 'Breaking Good',
      description: 'Successfully Complete A Habit',
      image: 'V.png',
    },
    {
      id: 'VI',
      name: 'The Greatest Treasure',
      description: 'Make your first Friend',
      image: 'VI.png',
    },
    {
      id: 'VII',
      name: 'Iron Will',
      description: 'Break a long-term habit',
      image: 'VII.png',
    },
  ];

  for (const trophy of trophies) {
    await prisma.trophy.create({
      data: {
        id: trophy.id,
        name: trophy.name,
        description: trophy.description,
        image: trophy.image,
      },
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
