import Game from "../models/games";


interface InitialGame {
  name: string;
  image: string;
}

const initialGames: InitialGame[] = [
  {
    name: "Counter-Strike 2",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
  },
  {
    name: "League of Legends",
    image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
  },
  {
    name: "VALORANT",
    image: "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/fullportrait.png",
  },
];




const seedGames = async (): Promise<void> => {
  for (const gameData of initialGames) {
    await Game.updateOne(
      { name: gameData.name },
      { $setOnInsert: gameData },
      { upsert: true }
    );
  }

  console.log("Games seeded successfully.");
};

export default seedGames;
