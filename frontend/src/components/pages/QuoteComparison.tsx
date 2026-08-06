import React, { useEffect, useState, useCallback } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Chip, Grid, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const QuoteComparison: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadQuotes = useCallback(async () => {
    try {
      const response = await api.get(`/api/jobs/${jobId}/quotes`);
      setJob(response.data.data.job);
      setQuotes(response.data.data.quotes);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load quotes');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await api.post(`/api/jobs/quotations/${quoteId}/accept`);
      navigate(`/customer/jobs/${jobId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept quote');
    }
  };

  const getTierColor = (tier: string): any => {
    switch (tier) {
      case 'budget': return 'success';
      case 'standard': return 'info';
      case 'premium': return 'warning';
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Compare Your Quotes
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Choose the option that best fits your needs and budget
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {job && job.quote_expires_at && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Quotes expire: {new Date(job.quote_expires_at).toLocaleString()}
          </Alert>
        )}

        <Grid container spacing={3}>
          {quotes.map((quote) => (
            <Grid item xs={12} md={4} key={quote.id}>
              <Card sx={{ height: '100%', border: quote.tier === 'standard' ? 2 : 1, borderColor: quote.tier === 'standard' ? 'primary.main' : 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip label={quote.tier.toUpperCase()} color={getTierColor(quote.tier)} />
                    <Typography variant="caption" color="textSecondary">
                      Match: {quote.match_score?.toFixed(0)}/100
                    </Typography>
                  </Box>

                  <Typography variant="h5" sx={{ mb: 2, color: 'primary.main' }}>
                    GHS {quote.total?.toFixed(2)}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Service Provider:</strong> {quote.isp_name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Rating:</strong> {quote.isp_rating?.toFixed(1)}/5.0
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Distance:</strong> {quote.distance?.toFixed(1)} km
                  </Typography>

                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" color="textSecondary">
                      Labour: GHS {quote.labour_cost?.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Materials: GHS {quote.materials_cost?.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Travel: GHS {quote.travel_cost?.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleAcceptQuote(quote.id)}
                    sx={{ 
                      bgcolor: quote.tier === 'standard' ? '#FFD400' : '#E6BE00',
                      color: '#000',
                      '&:hover': { bgcolor: quote.tier === 'standard' ? '#E6BE00' : '#CCAA00' }
                    }}
                  >
                    Accept This Quote
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default QuoteComparison;
