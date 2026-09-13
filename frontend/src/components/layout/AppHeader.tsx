import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

import MenuIcon
  from "@mui/icons-material/Menu";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({
  onMenuClick,
}: AppHeaderProps) {
  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",

        width: {
          md: "calc(100% - 240px)",
        },

        ml: {
          md: "240px",
        },
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{
            mr: 2,
            display: {
              md: "none",
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="body1"
          fontWeight={600}
        >
          Test Plan & Automation Management
        </Typography>
      </Toolbar>
    </AppBar>
  );
}