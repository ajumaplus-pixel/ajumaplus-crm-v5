import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Grid, CircularProgress, Alert, Divider, Chip, TextField } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import { Quotation } from '../../types';
import {
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Edit as ReviseIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';

const QuotationReview: React.FC = () => {
  const navigate = useNavigate();
  const { quotationId } = useParams<{ quotationId: string }>();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [revisionReason, setRevisionReason] = useState('');

  const loadQuotation = async () => {
    if (!quotationId) return;

    try {
      setIsLoading(true);
      setError('');
      
      const quotationData = await quotationService.getQuotationById(quotationId);
      setQuotation(quotationData);
    } catch (err: any) {
      console.error('Failed to load quotation:', err);
      setError(err.response?.data?.message || 'Failed to load quotation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotation();
  }, [quotationId]);

  const handleAccept = async () => {
    if (!quotation) return;

    try {
      setIsProcessing(true);
      await quotationService.acceptQuotation(quotation.id);
      
      // Reload quotation to get updated status
      await loadQuotation();
      
      // Navigate back to job details
      navigate(`/customer/jobs/${quotation.job_id}`);
    } catch (err: any) {
      console.error('Failed to accept quotation:', err);
      setError(err.response?.data?.message || 'Failed to accept quotation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!quotation) return;

    try {
      setIsProcessing(true);
      await quotationService.rejectQuotation(quotation.id, revisionReason);
      
      // Reload quotation to get updated status
      await loadQuotation();
      
      // Navigate back to job details
      navigate(`/customer/jobs/${quotation.job_id}`);
    } catch (err: any) {
      console.error('Failed to reject quotation:', err);
      setError(err.response?.data?.message || 'Failed to reject quotation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!quotation) return;

    try {
      setIsProcessing(true);
      await quotationService.requestRevision(quotation.id, {
        notes: revisionNotes,
      });
      
      // Reload quotation to get updated status
      await loadQuotation();
      
      setShowRevisionForm(false);
      setRevisionNotes('');
    } catch (err: any) {
      console.error('Failed to request revision:', err);
      setError(err.response?.data?.message || 'Failed to request revision. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'draft': return 'info';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !quotation) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            ← Back
          </Button>
          <Alert severity="error">
            {error || 'Quotation not found'}
          </Alert>
        </Box>
      </Container>
    );
  }

  const labourCost = parseFloat(quotation.labour_cost || 0);
  const materialsCost = parseFloat(quotation.materials_cost || 0);
  const travelCost = parseFloat(quotation.travel_cost || 0);
  const total = parseFloat(quotation.total || 0);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button onClick={() => navigate(-1)} sx={{ mb: 2 }} startIcon={<BackIcon />}>
          Back to Job
        </Button>
        <Typography variant="h4" gutterBottom>
          Quotation Review
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {quotation.quotation_number}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Quotation Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Quotation Details
                </Typography>
                <Chip
                  label={quotation.status}
                  color={getStatusColor(quotation.status) as any}
                  size="medium"
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Labour Cost
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    GHS {labourCost.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Materials Cost
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    GHS {materialsCost.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Travel Cost
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    GHS {travelCost.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Experience Factor
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {quotation.experience_factor}x
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Complexity Factor
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {quotation.complexity_factor}x
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Urgency Factor
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {quotation.urgency_factor}x
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total Amount
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  GHS {total.toFixed(2)}
                </Typography>
              </Box>

              {quotation.notes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Notes:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {quotation.notes}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                AI-Powered Insights
              </Typography>
              <Typography variant="body2" color="textSecondary">
                This quotation was generated using AI analysis based on job complexity, market rates, and provider experience.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  • Price includes Ghana regional adjustments
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Based on current market rates for {quotation.category || 'this service'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Accounts for urgency and complexity factors
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Actions
              </Typography>
              
              {quotation.status === 'draft' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    startIcon={<AcceptIcon />}
                    onClick={handleAccept}
                    disabled={isProcessing}
                  >
                    Accept Quotation
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<RejectIcon />}
                    onClick={() => setShowRevisionForm(true)}
                    disabled={isProcessing}
                  >
                    Request Revision
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<RejectIcon />}
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    Reject Quotation
                  </Button>
                </Box>
              )}

              {quotation.status === 'approved' && (
                <Alert severity="success">
                  This quotation has been accepted. The job will proceed with the quoted amount.
                </Alert>
              )}

              {quotation.status === 'rejected' && (
                <Alert severity="error">
                  This quotation has been rejected. You can request a new quotation.
                </Alert>
              )}
            </CardContent>
          </Card>

          {showRevisionForm && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Request Revision
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Revision Request"
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Describe what changes you'd like to the quotation..."
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Reason for Revision (Optional)"
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="Why do you need this revision?"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleRequestRevision}
                    disabled={isProcessing || !revisionNotes}
                    startIcon={<ReviseIcon />}
                  >
                    Submit Revision
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowRevisionForm(false);
                      setRevisionNotes('');
                      setRevisionReason('');
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Important Information
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                • Quotations are valid for 7 days
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                • Accepting quotes the final price
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                • Payment is due upon job completion
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Contact support for questions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default QuotationReview;