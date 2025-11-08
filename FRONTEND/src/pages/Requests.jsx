import { useState } from "react";
import { useEquipment } from "../context/EquipmentContext";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Paper,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AssignmentReturn as AssignmentReturnIcon,
} from "@mui/icons-material";

const Requests = () => {
  const { requests, updateRequest, equipment } = useEquipment();
  const [error, setError] = useState("");
  const [loadingRequestId, setLoadingRequestId] = useState(null);

  const handleApprove = async (requestId) => {
    try {
      setError("");
      setLoadingRequestId(requestId);
      await updateRequest(requestId, { status: "approved" });
    } catch (err) {
      setError(err.message || "Failed to approve request");
      console.error("Error approving request:", err);
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setError("");
      setLoadingRequestId(requestId);
      await updateRequest(requestId, { status: "rejected" });
    } catch (err) {
      setError(err.message || "Failed to reject request");
      console.error("Error rejecting request:", err);
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleReturn = async (requestId) => {
    try {
      setError("");
      setLoadingRequestId(requestId);
      await updateRequest(requestId, { status: "returned" });
    } catch (err) {
      setError(err.message || "Failed to mark as returned");
      console.error("Error marking as returned:", err);
    } finally {
      setLoadingRequestId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "returned":
        return "info";
      default:
        return "default";
    }
  };

  const sortedRequests = [...requests].sort(
    (a, b) =>
      new Date(b.createdAt || b.borrow_date || 0) -
      new Date(a.createdAt || a.borrow_date || 0)
  );

  const pendingRequests = sortedRequests.filter(
    (req) => req.status === "pending"
  );
  const otherRequests = sortedRequests.filter(
    (req) => req.status !== "pending"
  );

  const RequestCard = ({ request }) => {
    const equipmentItem = equipment.find((eq) => eq.id === request.equipmentId);
    const isLoading = loadingRequestId === request.id;

    return (
      <Card
        elevation={2}
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {equipmentItem?.name ||
                  request.equipmentName ||
                  "Unknown Equipment"}
              </Typography>
            </Box>
            <Chip
              label={request.status}
              color={getStatusColor(request.status)}
              size="small"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="body2" gutterBottom>
              <strong>Category:</strong> {equipmentItem?.category || "N/A"}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Quantity:</strong> {request.quantity || 1}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Borrow Date:</strong>{" "}
              {request.startDate || request.borrow_date
                ? new Date(
                    request.startDate || request.borrow_date
                  ).toLocaleDateString()
                : "N/A"}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Return Date:</strong>{" "}
              {request.endDate || request.return_date
                ? new Date(
                    request.endDate || request.return_date
                  ).toLocaleDateString()
                : "N/A"}
            </Typography>
            {request.purpose && (
              <Typography variant="body2" gutterBottom>
                <strong>Purpose:</strong> {request.purpose}
              </Typography>
            )}
            {(request.createdAt || request.borrow_date) && (
              <Typography variant="body2" color="text.secondary">
                <strong>Requested:</strong>{" "}
                {new Date(
                  request.createdAt || request.borrow_date
                ).toLocaleString()}
              </Typography>
            )}
          </Box>
        </CardContent>

        {request.status === "pending" && (
          <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={
                isLoading ? <CircularProgress size={16} /> : <CheckCircleIcon />
              }
              onClick={() => handleApprove(request.id)}
              disabled={isLoading}
              size="small"
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={
                isLoading ? <CircularProgress size={16} /> : <CancelIcon />
              }
              onClick={() => handleReject(request.id)}
              disabled={isLoading}
              size="small"
            >
              Reject
            </Button>
          </CardActions>
        )}

        {request.status === "approved" && (
          <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <AssignmentReturnIcon />
                )
              }
              onClick={() => handleReturn(request.id)}
              disabled={isLoading}
              size="small"
            >
              Mark as Returned
            </Button>
          </CardActions>
        )}
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Borrowing Requests
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and manage equipment borrowing requests
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {requests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No requests found.
          </Typography>
        </Paper>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom fontWeight="bold" mb={2}>
                Pending Requests ({pendingRequests.length})
              </Typography>
              <Grid container spacing={3}>
                {pendingRequests.map((request) => (
                  <Grid item xs={12} md={6} key={request.id}>
                    <RequestCard request={request} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {otherRequests.length > 0 && (
            <Box>
              <Typography variant="h5" gutterBottom fontWeight="bold" mb={2}>
                All Requests ({otherRequests.length})
              </Typography>
              <Grid container spacing={3}>
                {otherRequests.map((request) => (
                  <Grid item xs={12} md={6} key={request.id}>
                    <RequestCard request={request} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Requests;
