import { createTheme } from "@mantine/core";
import type { CSSVariablesResolver } from "@mantine/core";

export const theme = createTheme({
  colors: {
    brand: [
      "#ffffff", // shade 0
      "#212121", // shade 1
      "#303030", // shade 2
      "#414141", // shade 3
      "#0d0d0d80", // shade 4
      "#303030", // shade 5
      "#181818", // shade 6
      "#000000", // shade 7
      "#afafaf", // shade 8
      "#000d33", // shade 9
    ],
  },

  primaryColor: "gray",

  components: {}, // default theme (can be 'dark')
});

export const cssResolver: CSSVariablesResolver = () => ({
  variables: {
    // "--mantine-color-text-primary": theme.colors.brand[0],
    // "--mantine-color-text-secondary": theme.colors.black[1],
    // "--mantine-color-text-tertiary": theme.colors.black[8],
    // "--mantine-color-text-quaternary": theme.colors.black[2],
    // "--mantine-color-accent": theme.colors.red[1],
    // "--mantine-color-background": theme.colors.brand[7],
    // "--mantine-color-background-secondary": theme.colors.brand[1],
    // "--mantine-color-background-tertiary": theme.colors.brand[6],
  },
  light: {},
  dark: {},
});
