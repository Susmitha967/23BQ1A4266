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
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Badge,
  Chip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Notification,
  NotificationType,
  fetchNotifications,
  getViewedIds,
  markAllAsViewed,
} from "@/lib/notifications";
import NotificationCard from "@/components/NotificationCard";

const PAGE_SIZES = [5, 10, 20];
const TYPES: Array<NotificationType | ""> = ["", "Placement", "Event", "Result"];

export default function AllNotificationsPage() {
  const [all, setAll] = useState<Notification[]>([]);
  const [filtered, setFiltered] = useState<Notification[]>([]);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "">("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications({ notification_type: typeFilter || undefined });
      setAll(data);
      setViewedIds(getViewedIds());
      setPage(1);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setFiltered(typeFilter ? all.filter((n) => n.Type === typeFilter) : all);
    setPage(1);
  }, [all, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleMarkAllViewed() {
    markAllAsViewed(all.map((n) => n.ID));
    setViewedIds(getViewedIds());
  }

  function handleViewed(id: string) {
    setViewedIds((prev) => new Set([...prev, id]));
  }

  const newCount = all.filter((n) => !viewedIds.has(n.ID)).length;

  const typeCounts = TYPES.slice(1).reduce(
    (acc, t) => ({ ...acc, [t]: all.filter((n) => n.Type === t).length }),
    {} as Record<string, number>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Badge badgeContent={newCount} color="secondary" max={99}>
            <NotificationsIcon sx={{ color: "primary.main", fontSize: 28 }} />
          </Badge>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              All Notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filtered.length} notification{filtered.length !== 1 ? "s" : ""} total
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel>Per page</InputLabel>
            <Select
              value={pageSize}
              label="Per page"
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {PAGE_SIZES.map((v) => (
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

          <Button
            variant="contained"
            size="small"
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon />}
            onClick={load}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Type Filter */}
      <Box mb={2.5}>
        <ToggleButtonGroup
          value={typeFilter}
          exclusive
          onChange={(_, v) => { if (v !== null) setTypeFilter(v); }}
          size="small"
          sx={{ flexWrap: "wrap", gap: 0.5 }}
        >
          <ToggleButton value="">
            All&nbsp;
            <Chip label={all.length} size="small" sx={{ ml: 0.5, height: 16, fontSize: "0.65rem" }} />
          </ToggleButton>
          {TYPES.slice(1).map((t) => (
            <ToggleButton key={t} value={t}>
              {t}&nbsp;
              <Chip label={typeCounts[t] ?? 0} size="small" sx={{ ml: 0.5, height: 16, fontSize: "0.65rem" }} />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Divider sx={{ mb: 2, opacity: 0.2 }} />

      {/* List */}
      {loading && pageItems.length === 0 ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : pageItems.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography color="text.secondary">No notifications found.</Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={1.5} mb={3}>
            {pageItems.map((notif) => (
              <NotificationCard
                key={notif.ID}
                notification={notif}
                isNew={!viewedIds.has(notif.ID)}
                onViewed={handleViewed}
              />
            ))}
          </Stack>

          <Box display="flex" justifyContent="center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
              shape="rounded"
            />
          </Box>
        </>
      )}
    </Box>
  );
}
