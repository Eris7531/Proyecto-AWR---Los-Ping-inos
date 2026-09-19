import {
    Card,
    CardActionArea,
    CardContent,
    Typography
} from "@mui/material";

export interface GamePreviewProps {
  id: number;
  name: string;
  image: string;
  usersInRooms: number;
  onClick: () => void;
}

function GamePreview({
  name,
  image,
  usersInRooms,
  onClick,
}: GamePreviewProps) {
  return (
    <Card
      sx={{
        height: 220,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: "100%",
          backgroundImage: `url("${image}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "white",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,.7), transparent 35%, rgba(0,0,0,.8))",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight : "bold" }}>
            {name}
          </Typography>

          <Typography align="right">
            {usersInRooms} Usuarios en salas
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default GamePreview;