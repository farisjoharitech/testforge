import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import TopBar from './TopBar';

const SIDEBAR_WIDTH = 260;

export default function AppLayout() {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f7f8fa',
      }}
    >
      <Sidebar width={SIDEBAR_WIDTH} />

      <Box
        sx={{
          flexGrow: 1,
          ml: `${SIDEBAR_WIDTH}px`,
          minWidth: 0,
        }}
      >
        <TopBar />

        <Box
          component="main"
          sx={{
            p: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}