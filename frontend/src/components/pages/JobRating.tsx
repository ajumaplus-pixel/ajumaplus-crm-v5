import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, CircularProgress, Alert, Rating, TextField, Paper, Grid, Chip } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ratingService, CreateRatingData } from '../../services/ratingService';
import { jobService } from '../../services/jobService';
import { Job } from '../../types';
import {
  Star as StarIcon,
  ArrowBack as BackIcon,
  Send as SubmitIcon,
} from '@mui/icons-material';

const JobRating: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const [ratings, setRatings] = useState({
    quality_rating: 0,
    timeliness_rating: 0,
    professionalism_rating: 0,
    communication_rating: 0,
  });

  const [review, setReview] = useState('');

  const loadJobDetails = async () => {
    if (!jobId) return;

    try {
      setIsLoading(true);
      setError('');
      
      const jobData = await jobService.getJobById(jobId);
      
      // Check if job is completed
      if (jobData.status !== 'completed') {
        setError('You can only rate completed jobs.');
        return;
      }

      setJob(jobData);
    } catch (err: any) {
      console.error('Failed to load job details:', err);
      setError(err.response?.data?.message || 'Failed to load job details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const handleRatingChange = (field: keyof typeof ratings, value: number | null) => {
    setRatings(prev => ({
      ...prev,
      [field]: value || 0,
    }));
  };

  const calculateOverallRating = () => {
    const { quality_rating, timeliness_rating, professionalism_rating, communication_rating } = ratings;
    const total = quality_rating + timeliness_rating + professionalism_rating + communication_rating;
    return total > 0 ? (total / 4).toFixed(1) : '0.0';
  };

  const validateForm = () => {
    if (ratings.quality_rating === 0) {
      setError('Please provide a quality rating');
      return false;
    }
    if (ratings.timeliness_rating === 0) {
      setError('Please provide a timeliness rating');
      return false;
    }
    if (ratings.professionalism_rating === 0) {
      setError('Please provide a professionalism rating');
      return false;
    }
    if (ratings.communication_rating === 0) {
      setError('Please provide a communication rating');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!job || !validateForm()) return;

    try {
      setIsSubmitting(true);
      setError('');

      const ratingData: CreateRatingData = {
        job_id: job.id,
        quality_rating: ratings.quality_rating,
        timeliness_rating: ratings.timeliness_rating,
        professionalism_rating: ratings.professionalism_rating,
        communication_rating: ratings.communication_rating,
        review: review || undefined,
      };

      await ratingService.createRating(ratingData);
      
      setSuccess(true);
      
      // Redirect to job details after 2 seconds
      setTimeout(() => {
        navigate(`/customer/jobs/${job.id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
      setError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !job) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            ← Back
          </Button>
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button onClick={() => navigate(-1)} sx={{ mb: 2 }} startIcon={<BackIcon />}>
          Back to Job
        </Button>
        <Typography variant="h4" gutterBottom>
          Rate Service Provider
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Job: {job?.job_number}
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Thank you for your feedback! Your rating has been submitted successfully.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Rate Your Experience
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Please rate the service provider on the following criteria (1-5 stars):
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Quality of Work
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                How satisfied are you with the quality of work performed?
              </Typography>
              <Rating
                value={ratings.quality_rating}
                onChange={(_, value) => handleRatingChange('quality_rating', value)}
                size="large"
                icon={<StarIcon fontSize="inherit" />}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Timeliness
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Was the service provider punctual and completed the work on time?
              </Typography>
              <Rating
                value={ratings.timeliness_rating}
                onChange={(_, value) => handleRatingChange('timeliness_rating', value)}
                size="large"
                icon={<StarIcon fontSize="inherit" />}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Professionalism
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                How professional was the service provider's conduct and behavior?
              </Typography>
              <Rating
                value={ratings.professionalism_rating}
                onChange={(_, value) => handleRatingChange('professionalism_rating', value)}
                size="large"
                icon={<StarIcon fontSize="inherit" />}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Communication
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                How responsive and clear was the service provider's communication?
              </Typography>
              <Rating
                value={ratings.communication_rating}
                onChange={(_, value) => handleRatingChange('communication_rating', value)}
                size="large"
                icon={<StarIcon fontSize="inherit" />}
              />
            </Box>
          </Grid>
        </Grid>

        <Card sx={{ mt: 4, bgcolor: 'primary.light' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Overall Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={`${calculateOverallRating()}/5`}
                  color="primary"
                  size="large"
                  sx={{ fontSize: '1.2rem', fontWeight: 700 }}
                />
                <Rating
                  value={parseFloat(calculateOverallRating())}
                  readOnly
                  size="large"
                  icon={<StarIcon fontSize="inherit" />}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Written Review (Optional)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Share your experience with this service provider to help other customers make informed decisions.
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Your Review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Describe your experience with the service provider..."
          helperText={`${review.length}/500 characters`}
          inputProps={{ maxLength: 500 }}
        />
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={<SubmitIcon />}
          size="large"
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Submit Rating'}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Note:</strong> You can edit your rating within 24 hours of submission. After that, ratings become permanent.
        </Typography>
      </Alert>
    </Container>
  );
};

export default JobRating;