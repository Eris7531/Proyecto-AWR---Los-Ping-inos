import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  colorSchemes: { light: true, dark: false },
  typography: {
    fontFamily: ["Roboto", "system-ui", "Helvetica", "Arial", "sans-serif"]
      .join(","),
  },
  shape: { borderRadius: 10 },
});

export default theme;
