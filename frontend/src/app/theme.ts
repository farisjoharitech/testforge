import {
  createTheme,
} from "@mui/material/styles";

export const appTheme =
  createTheme({
    palette: {
      mode: "light",
    },

    shape: {
      borderRadius: 8,
    },

    typography: {
      fontFamily: [
        "Inter",
        "Roboto",
        "Arial",
        "sans-serif",
      ].join(","),

      h4: {
        fontWeight: 700,
      },

      h5: {
        fontWeight: 700,
      },

      h6: {
        fontWeight: 600,
      },
    },

    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });