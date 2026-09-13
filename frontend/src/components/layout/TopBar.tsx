import { AccountCircle, NotificationsNone } from '@mui/icons-material';

import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';

export default function TopBar() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'white',
        color: '#111827',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
          }}
        >
          Test Management
        </Typography>

        <Box>
          <IconButton>
            <NotificationsNone />
          </IconButton>

          <IconButton>
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}