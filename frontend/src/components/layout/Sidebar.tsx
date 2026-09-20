import { Dashboard, Folder, SmartToy } from '@mui/icons-material';
import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate(); const { pathname } = useLocation();
  const [params] = useSearchParams();
  const automationActive = pathname.startsWith('/automation');
  const query = params.get('project') ? `?${new URLSearchParams({ project: params.get('project')! })}` : '';
  const projectActive = ['/projects', '/test-plans/', '/modules/', '/requirements/', '/scenarios/', '/test-cases/']
    .some((prefix) => pathname === prefix || pathname.startsWith(prefix));
  return <Box component="aside" sx={{ width: 260, minWidth: 260, height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
    <Box sx={{ px: 3, py: 2.5 }}><Typography variant="h5" fontWeight={800}>TestForge</Typography><Typography variant="caption" color="text.secondary">Test Management Platform</Typography></Box>
    <Divider />
    <Box sx={{ flex: 1, px: 1.5, py: 2 }}><Stack spacing={2.5}>
      <Box><Typography variant="overline" color="text.secondary" sx={{ px: 1.5 }}>Test Design</Typography><List disablePadding><ListItemButton selected={projectActive} onClick={() => navigate('/projects')}><ListItemIcon><Folder /></ListItemIcon><ListItemText primary="Projects" /></ListItemButton></List></Box>
      <Box><List disablePadding>
        <ListItemButton selected={automationActive} onClick={() => navigate(`/automation/management${query}`)}><ListItemIcon><SmartToy /></ListItemIcon><ListItemText primary="Automation" /></ListItemButton>
        <ListItemButton sx={{ pl: 7 }} selected={pathname === '/automation/management'} onClick={() => navigate(`/automation/management${query}`)}><ListItemText primary="Management" /></ListItemButton>
        <ListItemButton sx={{ pl: 7 }} selected={pathname === '/automation/configuration'} onClick={() => navigate(`/automation/configuration${query}`)}><ListItemText primary="Configuration" /></ListItemButton>
        <ListItemButton sx={{ pl: 7 }} selected={pathname === '/automation/git'} onClick={() => navigate(`/automation/git${query}`)}><ListItemText primary="Git Integration" /></ListItemButton>
      </List></Box>
      <Box><Typography variant="overline" color="text.secondary" sx={{ px: 1.5 }}>Reporting</Typography><List disablePadding><ListItemButton selected={pathname.startsWith('/dashboard')} onClick={() => navigate('/dashboard')}><ListItemIcon><Dashboard /></ListItemIcon><ListItemText primary="Dashboard" /></ListItemButton></List></Box>
    </Stack></Box>
    <Divider /><Box sx={{ px: 3, py: 2 }}><Typography variant="caption" color="text.secondary">TestForge POC</Typography></Box>
  </Box>;
}
