"use client";
import { useState } from "react";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import StarIcon from "@mui/icons-material/Star";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SchoolIcon from "@mui/icons-material/School";
import PriorityInboxPage from "@/components/PriorityInbox";
import AllNotificationsPage from "@/components/AllNotifications";

const DRAWER_WIDTH = 220;

const NAV_ITEMS = [
  { key: "priority", label: "Priority Inbox", icon: <StarIcon /> },
  { key: "all", label: "All Notifications", icon: <NotificationsIcon /> },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("priority");
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const drawer = (
    <Box sx={{ height: "100%", bgcolor: "background.paper" }}>
      <Box display="flex" alignItems="center" gap={1.5} px={2.5} py={2.5}>
        <SchoolIcon sx={{ color: "primary.main", fontSize: 26 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
            Campus
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Notifications
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ opacity: 0.2 }} />
      <List sx={{ mt: 1, px: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.key}
            selected={activeTab === item.key}
            onClick={() => { setActiveTab(item.key); setMobileOpen(false); }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "rgba(108,99,255,0.18)",
                "&:hover": { bgcolor: "rgba(108,99,255,0.25)" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: activeTab === item.key ? "primary.main" : "text.secondary" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: "0.88rem",
                fontWeight: activeTab === item.key ? 600 : 400,
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box display="flex" minHeight="100vh" sx={{ bgcolor: "background.default" }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              borderRight: "1px solid rgba(108,99,255,0.1)",
              bgcolor: "background.paper",
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main */}
      <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
        {isMobile && (
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              bgcolor: "background.paper",
              borderBottom: "1px solid rgba(108,99,255,0.1)",
            }}
          >
            <Toolbar>
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <SchoolIcon sx={{ color: "primary.main", mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                Campus Notifications
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box flex={1} overflow="auto" p={{ xs: 2, md: 4 }}>
          {activeTab === "priority" && <PriorityInboxPage />}
          {activeTab === "all" && <AllNotificationsPage />}
        </Box>
      </Box>
    </Box>
  );
}
