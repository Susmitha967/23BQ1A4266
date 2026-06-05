"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Tooltip,
  Badge,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/Star";
import {
  Notification,
  fetchNotifications,
  getTopN,
  getViewedIds,
  markAllAsViewed,
  computePriorityScore,
} from "@/lib/notifications";
import NotificationCard from "@/components/NotificationCard";

export default function PriorityInboxPage() {
  const [all, setAll] = useState<Notification[]>([]);
  const [topN, setTopN] = useState<Notification[]>([]);
  const [n, setN] = useState<number>(10);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications();
      setAll(data);
      setViewedIds(getViewedIds());
      setLastRefresh(new Date());
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    setTopN(getTopN(all, n));
  }, [all, n]);

  function handleViewed(id: string) {
    setViewedIds((prev) => new Set([...prev, id]));
  }

  function handleMarkAllViewed() {
    markAllAsViewed(topN.map((n) => n.ID));
    setViewedIds(getViewedIds());
  }

  const newCount = topN.filter((n) => !viewedIds.has(n.ID)).length;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Badge badgeContent={newCount} color="secondary" max={99}>
            <StarIcon sx={{ color: "primary.main", fontSize: 28 }} />
          </Badge>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Priority Inbox
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Showing top {n} notifications by priority score
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Top N</InputLabel>
            <Select
              value={n}
              label="Top N"
              onChange={(e) => setN(Number(e.target.value))}
            >
              {[5, 10, 15, 20, 25].map((v) => (
                <MenuItem key={v} value={v}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            onClick={handleMarkAllViewed}
            disabled={newCount === 0}
          >
            Mark all viewed
          </Button>

          <Tooltip title={lastRefresh ? `Last: ${lastRefresh.toLocaleTimeString()}` : "Refresh"}>
            <Button
              variant="contained"
              size="small"
              startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon />}
              onClick={load}
              disabled={loading}
            >
              Refresh
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Bar */}
      {all.length > 0 && (
        <Box
          display="flex"
          gap={3}
          mb={2.5}
          p={1.5}
          sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid rgba(108,99,255,0.1)" }}
          flexWrap="wrap"
        >
          {[
            { label: "Total Fetched", value: all.length },
            { label: "New", value: newCount, color: "secondary.main" },
            {
              label: "Highest Score",
              value: topN[0] ? computePriorityScore(topN[0]).toFixed(2) : "—",
              color: "success.main",
            },
          ].map((stat) => (
            <Box key={stat.label} textAlign="center" minWidth={80}>
              <Typography variant="h6" fontWeight={700} color={stat.color ?? "text.primary"}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Divider sx={{ mb: 2, opacity: 0.2 }} />

      {/* List */}
      {loading && topN.length === 0 ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : topN.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography color="text.secondary">No notifications found.</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {topN.map((notif, idx) => (
            <NotificationCard
              key={notif.ID}
              notification={notif}
              isNew={!viewedIds.has(notif.ID)}
              rank={idx + 1}
              onViewed={handleViewed}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
