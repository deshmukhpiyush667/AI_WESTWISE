import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PredictionCard from '../components/classify/PredictionCard';

describe('PredictionCard Component', () => {
  it('renders confident prediction correctly', () => {
    const mockPrediction = {
      predicted_class: 'Plastic',
      confidence: 0.945,
      is_uncertain: false,
      probabilities: {
        Plastic: 0.945,
        Organic: 0.02,
        Paper: 0.015,
        Metal: 0.01,
        Glass: 0.005,
        'E-Waste': 0.005,
      },
    };

    render(<PredictionCard prediction={mockPrediction} />);

    expect(screen.getByText('Plastic')).toBeInTheDocument();
    expect(screen.getByText('95% Confident')).toBeInTheDocument();
    expect(screen.queryByText(/Low Confidence/i)).not.toBeInTheDocument();
  });

  it('renders uncertain prediction alert when confidence is low', () => {
    const mockUncertain = {
      predicted_class: 'Paper',
      confidence: 0.42,
      is_uncertain: true,
      probabilities: {
        Paper: 0.42,
        Plastic: 0.38,
      },
    };

    render(<PredictionCard prediction={mockUncertain} />);

    expect(screen.getByText('Paper')).toBeInTheDocument();
    expect(screen.getByText(/Low Confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/Uncertain Prediction:/i)).toBeInTheDocument();
  });
});
