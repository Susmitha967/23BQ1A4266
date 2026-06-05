"use client";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import EventIcon from "@mui/icons-material/Event";
import AssessmentIcon from "@mui/icons-material/Assessment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Notification, markAsViewed } from "@/lib/notifications";

interface Props {
  notification: Notification;
  isNew: boolean;
  rank?: number;
  onViewed?: (id: string) => void;
}

const TYPE_META: Record<
  string,
  { color: "primary" | "success" | "warning" | "error"; icon: React.ReactNode; label: string }
> = {
  Placement: { color: "success", icon: <WorkIcon sx={{ fontSize: 14 }} />, label: "Placement" },
  Event: { color: "primary", icon: <EventIcon sx={{ fontSize: 14 }} />, label: "Event" },
  Result: { color: "warning", icon: <AssessmentIcon sx={{ fontSize: 14 }} />, label: "Result" },
};

function formatRelative(ts: string): string {
  const date = new Date(ts.replace(" ", "T"));
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationCard({ notification, isNew, rank, onViewed }: Props) {
  const meta = TYPE_META[notification.Type] ?? TYPE_META["Result"];

  function handleMarkViewed() {
    markAsViewed(notification.ID);
    onViewed?.(notification.ID);
  }

  return (
    <Card
      sx={{
        position: "relative",
        bgcolor: isNew ? "rgba(108, 99, 255, 0.06)" : "background.paper",
        opacity: isNew ? 1 : 0.75,
      }}
    >
      {isNew && (
        <FiberManualRecordIcon
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            fontSize: 10,
            color: "secondary.main",
          }}
        />
      )}
      <CardContent sx={{ pl: isNew ? 3 : 2, pb: "12px !important" }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.75}>
              {rank !== undefined && (
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: rank <= 3 ? "primary.main" : "text.secondary",
                    minWidth: 24,
                    fontSize: "0.7rem",
                  }}
                >
                  #{rank}
                </Typography>
              )}
              <Chip
                size="small"
                icon={meta.icon as React.ReactElement}
                label={meta.label}
                color={meta.color}
                variant="outlined"
                sx={{ height: 20 }}
              />
              {isNew && (
                <Chip
                  size="small"
                  label="NEW"
                  color="secondary"
                  sx={{ height: 16, fontSize: "0.6rem", fontWeight: 800 }}
                />
              )}
            </Box>
            <Typography variant="body1" fontWeight={isNew ? 600 : 400} sx={{ mb: 0.5 }}>
              {notification.Message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatRelative(notification.Timestamp)} &nbsp;·&nbsp;{" "}
              {notification.Timestamp}
            </Typography>
          </Box>

          {isNew && (
            <Tooltip title="Mark as viewed">
              <IconButton size="small" onClick={handleMarkViewed} sx={{ color: "text.secondary" }}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
